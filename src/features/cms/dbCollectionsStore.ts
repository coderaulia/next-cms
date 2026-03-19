import { eq, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { blogPostsTable, categoriesTable, mediaAssetsTable, postCategoriesTable, siteSettingsTable } from '@/db/schema';

import {
  clearDefaultCategorySetting,
  ensureCategoryCoverage,
  normalizeCategoryRecord,
  normalizeMediaAssetRecord,
  removeCategorySlugFromPosts,
  replaceCategorySlugInPosts,
  sortCategories,
  sortMediaAssets,
  uniqueCategorySlug,
  updateDefaultCategorySetting
} from './collectionShared';
import { defaultContent } from './defaultContent';
import { mapBlogPostCategorySlugs, syncBlogPostCategoryLinks } from './dbTaxonomy';
import { normalizeSettings } from './storeShared';
import type { BlogPost, Category, MediaAsset } from './types';

let warnedMissingMediaChecksumColumn = false;

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; cause?: unknown };
  if (typeof record.code === 'string') return record.code;
  if (record.cause) return extractErrorCode(record.cause);
  return undefined;
}

function isMissingColumnError(error: unknown) {
  return extractErrorCode(error) === '42703';
}

function warnMissingMediaChecksumColumn() {
  if (warnedMissingMediaChecksumColumn) return;
  warnedMissingMediaChecksumColumn = true;
  console.warn('Media checksum column is not available yet; falling back to legacy media queries.');
}

async function withLegacyMediaFallback<T>(task: () => Promise<T>, fallbackTask: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (isMissingColumnError(error)) {
      warnMissingMediaChecksumColumn();
      return fallbackTask();
    }
    throw error;
  }
}

type LegacyMediaRow = {
  id: string;
  title: string;
  url: string;
  altText: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  storageProvider: string;
  storageKey: string | null;
  createdAt: string;
  updatedAt: string;
};

function rowToCategory(row: typeof categoriesTable.$inferSelect): Category {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    description: row.description,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function rowToMediaAsset(row: typeof mediaAssetsTable.$inferSelect): MediaAsset {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    altText: row.altText,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    checksumSha256: row.checksumSha256,
    storageProvider: row.storageProvider,
    storageKey: row.storageKey,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function rowToLegacyMediaAsset(row: LegacyMediaRow): MediaAsset {
  return {
    id: row.id,
    title: row.title,
    url: row.url,
    altText: row.altText,
    mimeType: row.mimeType,
    width: row.width,
    height: row.height,
    sizeBytes: row.sizeBytes,
    checksumSha256: null,
    storageProvider: row.storageProvider,
    storageKey: row.storageKey,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  };
}

function toLegacyMediaRow(mediaAsset: MediaAsset) {
  return {
    id: mediaAsset.id,
    title: mediaAsset.title,
    url: mediaAsset.url,
    altText: mediaAsset.altText,
    mimeType: mediaAsset.mimeType,
    width: mediaAsset.width,
    height: mediaAsset.height,
    sizeBytes: mediaAsset.sizeBytes,
    storageProvider: mediaAsset.storageProvider,
    storageKey: mediaAsset.storageKey,
    createdAt: mediaAsset.createdAt,
    updatedAt: mediaAsset.updatedAt
  };
}

async function readLegacyMediaAssets() {
  const result = await getDb().execute<LegacyMediaRow>(sql`
    select id, title, url, alt_text as "altText", mime_type as "mimeType", width, height, size_bytes as "sizeBytes",
      storage_provider as "storageProvider", storage_key as "storageKey", created_at as "createdAt", updated_at as "updatedAt"
    from media_assets
  `);
  return result.rows.map(rowToLegacyMediaAsset);
}

async function readAllPosts(): Promise<BlogPost[]> {
  const rows = await getDb().select().from(blogPostsTable);
  const tagMap = await mapBlogPostCategorySlugs(rows.map((row) => row.id));
  return rows.map((row) => ({
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    tags: tagMap.get(row.id) ?? row.tags,
    coverImage: row.coverImage,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  }));
}

async function writePosts(posts: BlogPost[]) {
  for (const post of posts) {
    await getDb()
      .update(blogPostsTable)
      .set({
        title: post.title,
        slug: post.seo.slug,
        excerpt: post.excerpt,
        content: post.content,
        author: post.author,
        tags: post.tags,
        coverImage: post.coverImage,
        status: post.status,
        publishedAt: post.publishedAt,
        updatedAt: post.updatedAt,
        seo: post.seo
      })
      .where(eq(blogPostsTable.id, post.id));
  }

  await syncBlogPostCategoryLinks(posts);
}

async function syncDbCategories() {
  const [categoryRows, posts] = await Promise.all([
    getDb().select().from(categoriesTable),
    readAllPosts()
  ]);

  const existing = categoryRows.map(rowToCategory);
  const seeded = existing.length > 0 ? existing : defaultContent.categories;
  const categories = ensureCategoryCoverage(seeded, posts);

  const existingBySlug = new Map(existing.map((category) => [category.slug, category]));
  const missing = categories.filter((category) => !existingBySlug.has(category.slug));
  if (missing.length > 0) {
    await getDb().insert(categoriesTable).values(missing).onConflictDoNothing();
  }

  return sortCategories(categories);
}

async function replaceSettingsCategory(previousSlug: string, nextSlug: string | null) {
  const rows = await getDb().select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 'default')).limit(1);
  const current = normalizeSettings(rows[0]?.payload ?? defaultContent.settings);
  const nextSettings = nextSlug
    ? updateDefaultCategorySetting(current, previousSlug, nextSlug)
    : clearDefaultCategorySetting(current, previousSlug);

  if (nextSettings === current) {
    return;
  }

  await getDb()
    .update(siteSettingsTable)
    .set({ payload: nextSettings, updatedAt: new Date().toISOString() })
    .where(eq(siteSettingsTable.id, 'default'));
}

export async function getCategories(): Promise<Category[]> {
  return syncDbCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const rows = await getDb().select().from(categoriesTable).where(eq(categoriesTable.id, id)).limit(1);
  return rows[0] ? rowToCategory(rows[0]) : null;
}

export async function createCategory(payload: Category): Promise<Category> {
  const categories = await syncDbCategories();
  const slug = uniqueCategorySlug(categories, payload.name, payload.slug);
  const next = normalizeCategoryRecord({ ...payload, slug });
  await getDb().insert(categoriesTable).values(next);
  return next;
}

export async function updateCategory(id: string, payload: Category): Promise<Category | null> {
  const categories = await syncDbCategories();
  const existing = categories.find((category) => category.id === id);
  if (!existing) return null;

  const nextSlug = uniqueCategorySlug(categories, payload.name, payload.slug, id);
  const next = normalizeCategoryRecord({
    ...existing,
    ...payload,
    id,
    slug: nextSlug,
    createdAt: existing.createdAt
  });

  await getDb().update(categoriesTable).set(next).where(eq(categoriesTable.id, id));

  if (existing.slug !== next.slug) {
    const posts = replaceCategorySlugInPosts(await readAllPosts(), existing.slug, next.slug);
    await writePosts(posts);
    await replaceSettingsCategory(existing.slug, next.slug);
  }

  return next;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const existing = await getCategoryById(id);
  if (!existing) return false;

  const posts = removeCategorySlugFromPosts(await readAllPosts(), existing.slug);
  await writePosts(posts);
  await getDb().delete(postCategoriesTable).where(eq(postCategoriesTable.categoryId, id));
  await getDb().delete(categoriesTable).where(eq(categoriesTable.id, id));
  await replaceSettingsCategory(existing.slug, null);
  return true;
}

async function ensureMediaBootstrap() {
  const rows = await withLegacyMediaFallback(
    () => getDb().select().from(mediaAssetsTable).limit(1),
    async () => {
      const result = await getDb().execute<LegacyMediaRow>(sql`
        select id, title, url, alt_text as "altText", mime_type as "mimeType", width, height, size_bytes as "sizeBytes",
          storage_provider as "storageProvider", storage_key as "storageKey", created_at as "createdAt", updated_at as "updatedAt"
        from media_assets
        limit 1
      `);
      return result.rows as unknown as typeof mediaAssetsTable.$inferSelect[];
    }
  );
  if (rows.length > 0) {
    return;
  }

  await withLegacyMediaFallback(
    () => getDb().insert(mediaAssetsTable).values(defaultContent.mediaAssets).onConflictDoNothing(),
    () => getDb().insert(mediaAssetsTable).values(defaultContent.mediaAssets.map(toLegacyMediaRow)).onConflictDoNothing()
  );
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  await ensureMediaBootstrap();
  return withLegacyMediaFallback(async () => {
    const rows = await getDb().select().from(mediaAssetsTable);
    return sortMediaAssets(rows.map(rowToMediaAsset));
  }, async () => sortMediaAssets(await readLegacyMediaAssets()));
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  await ensureMediaBootstrap();
  return withLegacyMediaFallback(async () => {
    const rows = await getDb().select().from(mediaAssetsTable).where(eq(mediaAssetsTable.id, id)).limit(1);
    return rows[0] ? rowToMediaAsset(rows[0]) : null;
  }, async () => {
    const result = await getDb().execute<LegacyMediaRow>(sql`
      select id, title, url, alt_text as "altText", mime_type as "mimeType", width, height, size_bytes as "sizeBytes",
        storage_provider as "storageProvider", storage_key as "storageKey", created_at as "createdAt", updated_at as "updatedAt"
      from media_assets
      where id = ${id}
      limit 1
    `);
    return result.rows[0] ? rowToLegacyMediaAsset(result.rows[0]) : null;
  });
}

export async function createMediaAsset(payload: MediaAsset): Promise<MediaAsset> {
  await ensureMediaBootstrap();
  const next = normalizeMediaAssetRecord(payload);
  await withLegacyMediaFallback(
    () => getDb().insert(mediaAssetsTable).values(next),
    () => getDb().insert(mediaAssetsTable).values(toLegacyMediaRow(next))
  );
  return next;
}

export async function updateMediaAsset(id: string, payload: MediaAsset): Promise<MediaAsset | null> {
  await ensureMediaBootstrap();
  const existing = await getMediaAssetById(id);
  if (!existing) return null;

  const next = normalizeMediaAssetRecord({
    ...existing,
    ...payload,
    id,
    createdAt: existing.createdAt
  });

  await withLegacyMediaFallback(
    () => getDb().update(mediaAssetsTable).set(next).where(eq(mediaAssetsTable.id, id)),
    () => getDb().update(mediaAssetsTable).set(toLegacyMediaRow(next)).where(eq(mediaAssetsTable.id, id))
  );
  return next;
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  await ensureMediaBootstrap();
  const existing = await getMediaAssetById(id);
  if (!existing) return false;
  await getDb().delete(mediaAssetsTable).where(eq(mediaAssetsTable.id, id));
  return true;
}
