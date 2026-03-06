import { eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { blogPostsTable, categoriesTable, mediaAssetsTable, pagesTable, siteSettingsTable } from '@/db/schema';

import { defaultContent } from './defaultContent';
import type { BlogPost, CmsContent, LandingPage, PageId, SiteSettings } from './types';
import type { BlogQueryInput } from './storeTypes';
import {
  mergeWithDefaults,
  normalizePageForWrite,
  normalizeSettings,
  normalizeSlug,
  nowIso,
  uniquePostSlug
} from './storeShared';

let bootstrapPromise: Promise<void> | null = null;

function pageToRow(page: LandingPage) {
  return {
    id: page.id,
    title: page.title,
    navLabel: page.navLabel,
    slug: page.seo.slug,
    published: page.published,
    seo: page.seo,
    sections: page.sections,
    homeBlocks: page.homeBlocks ?? null,
    updatedAt: page.updatedAt
  };
}

function rowToPage(row: typeof pagesTable.$inferSelect): LandingPage {
  return {
    id: row.id,
    title: row.title,
    navLabel: row.navLabel,
    published: row.published,
    seo: {
      ...row.seo,
      slug: row.slug
    },
    sections: row.sections,
    homeBlocks: row.homeBlocks ?? undefined,
    updatedAt: row.updatedAt
  };
}

function postToRow(post: BlogPost) {
  return {
    id: post.id,
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
  };
}

function rowToPost(row: typeof blogPostsTable.$inferSelect): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    tags: row.tags,
    coverImage: row.coverImage,
    status: row.status,
    publishedAt: row.publishedAt,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  };
}

async function ensureDbBootstrap() {
  if (bootstrapPromise) {
    await bootstrapPromise;
    return;
  }

  bootstrapPromise = (async () => {
    const db = getDb();

    const existingSettings = await db.select({ id: siteSettingsTable.id }).from(siteSettingsTable).limit(1);
    if (existingSettings.length === 0) {
      await db
        .insert(siteSettingsTable)
        .values({
          id: 'default',
          payload: defaultContent.settings,
          updatedAt: nowIso()
        })
        .onConflictDoNothing();
    }

    const existingPages = await db.select({ id: pagesTable.id }).from(pagesTable).limit(1);
    if (existingPages.length === 0) {
      await db.insert(pagesTable).values(Object.values(defaultContent.pages).map(pageToRow)).onConflictDoNothing();
    }

    const existingPosts = await db.select({ id: blogPostsTable.id }).from(blogPostsTable).limit(1);
    if (existingPosts.length === 0) {
      await db.insert(blogPostsTable).values(defaultContent.blogPosts.map(postToRow)).onConflictDoNothing();
    }

    const existingCategories = await db.select({ id: categoriesTable.id }).from(categoriesTable).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(categoriesTable).values(defaultContent.categories).onConflictDoNothing();
    }

    const existingMedia = await db.select({ id: mediaAssetsTable.id }).from(mediaAssetsTable).limit(1);
    if (existingMedia.length === 0) {
      await db.insert(mediaAssetsTable).values(defaultContent.mediaAssets).onConflictDoNothing();
    }
  })();

  try {
    await bootstrapPromise;
  } finally {
    bootstrapPromise = null;
  }
}

async function loadAllPages() {
  await ensureDbBootstrap();
  const rows = await getDb().select().from(pagesTable);
  return rows.map(rowToPage);
}

async function loadAllPosts() {
  await ensureDbBootstrap();
  const rows = await getDb().select().from(blogPostsTable);
  return rows.map(rowToPost);
}

export async function replaceAllCmsContent(content: CmsContent) {
  const db = getDb();
  const normalized = mergeWithDefaults(content);

  await db.delete(blogPostsTable);
  await db.delete(categoriesTable);
  await db.delete(mediaAssetsTable);
  await db.delete(pagesTable);
  await db.delete(siteSettingsTable);

  await db.insert(siteSettingsTable).values({
    id: 'default',
    payload: normalizeSettings(normalized.settings),
    updatedAt: nowIso()
  });

  await db.insert(pagesTable).values(Object.values(normalized.pages).map(pageToRow));
  await db.insert(blogPostsTable).values(normalized.blogPosts.map(postToRow));
  await db.insert(categoriesTable).values(normalized.categories);
  await db.insert(mediaAssetsTable).values(normalized.mediaAssets);
}

export async function getSettings() {
  await ensureDbBootstrap();
  const row = await getDb().select().from(siteSettingsTable).where(eq(siteSettingsTable.id, 'default')).limit(1);
  return normalizeSettings(row[0]?.payload ?? defaultContent.settings);
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  await ensureDbBootstrap();
  const next = normalizeSettings(settings);
  await getDb()
    .insert(siteSettingsTable)
    .values({
      id: 'default',
      payload: next,
      updatedAt: nowIso()
    })
    .onConflictDoUpdate({
      target: siteSettingsTable.id,
      set: {
        payload: next,
        updatedAt: nowIso()
      }
    });

  return next;
}

export async function getPages() {
  const pages = await loadAllPages();
  const next = { ...structuredClone(defaultContent.pages) };
  for (const page of pages) {
    next[page.id] = page;
  }
  return next;
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  await ensureDbBootstrap();
  const row = await getDb().select().from(pagesTable).where(eq(pagesTable.id, id)).limit(1);
  return row[0] ? rowToPage(row[0]) : null;
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  const pages = await loadAllPages();
  const nextPage = normalizePageForWrite(page, pages);

  await getDb()
    .insert(pagesTable)
    .values(pageToRow(nextPage))
    .onConflictDoUpdate({
      target: pagesTable.id,
      set: pageToRow(nextPage)
    });

  return nextPage;
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const posts = await loadAllPosts();
  const filtered = includeDrafts ? posts : posts.filter((post) => post.status === 'published');
  return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export async function queryBlogPosts(input: BlogQueryInput) {
  const posts = await loadAllPosts();
  const query = (input.q ?? '').trim().toLowerCase();
  const category = (input.category ?? '').trim().toLowerCase();
  const status =
    input.status === 'draft' || input.status === 'published' || input.status === 'all'
      ? input.status
      : 'all';
  const dateSort = input.dateSort === 'oldest' ? 'oldest' : 'newest';
  const page = Number.isFinite(input.page) && (input.page ?? 0) > 0 ? Number(input.page) : 1;
  const pageSize =
    Number.isFinite(input.pageSize) && (input.pageSize ?? 0) > 0
      ? Math.min(Number(input.pageSize), 50)
      : 10;

  const categories = Array.from(
    new Set(
      posts
        .flatMap((post) => post.tags)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  let filtered = posts.filter((post) => {
    if (!input.includeDrafts && post.status !== 'published') return false;
    if (status !== 'all' && post.status !== status) return false;
    if (query.length > 0) {
      const haystack = `${post.title} ${post.author}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (category.length > 0) {
      const hasCategory = post.tags.some((tag) => tag.toLowerCase() === category);
      if (!hasCategory) return false;
    }
    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (dateSort === 'oldest') return a.updatedAt > b.updatedAt ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    posts: paginated,
    meta: {
      total,
      page,
      pageSize,
      categories
    }
  };
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  await ensureDbBootstrap();
  const row = await getDb().select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
  return row[0] ? rowToPost(row[0]) : null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  await ensureDbBootstrap();
  const normalized = normalizeSlug(slug);
  const row = await getDb().select().from(blogPostsTable).where(eq(blogPostsTable.slug, normalized)).limit(1);
  if (!row[0]) return null;
  if (row[0].status !== 'published') return null;
  return rowToPost(row[0]);
}

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  const posts = await loadAllPosts();
  const settings = await getSettings();
  const id = crypto.randomUUID();
  const title = payload?.title?.trim() || 'Untitled post';
  const slug = uniquePostSlug(posts, title, payload?.seo?.slug);
  const writing = settings.writing;
  const requestedStatus = payload?.status;
  const fallbackStatus = writing.requireReviewBeforePublish ? 'draft' : writing.defaultPostStatus;
  const status = requestedStatus ?? fallbackStatus;

  const post: BlogPost = {
    id,
    title,
    excerpt: payload?.excerpt?.trim() || '',
    content: payload?.content || '',
    author: payload?.author?.trim() || writing.defaultPostAuthor || 'Admin',
    tags:
      payload?.tags ??
      (writing.defaultPostCategory ? [writing.defaultPostCategory.toLowerCase()] : []),
    coverImage: payload?.coverImage || '',
    status,
    publishedAt: status === 'published' ? nowIso() : null,
    updatedAt: nowIso(),
    seo: {
      metaTitle: payload?.seo?.metaTitle || title,
      metaDescription: payload?.seo?.metaDescription || '',
      slug,
      canonical: payload?.seo?.canonical || '',
      socialImage: payload?.seo?.socialImage || '',
      noIndex: payload?.seo?.noIndex ?? false
    }
  };

  await getDb().insert(blogPostsTable).values(postToRow(post));
  return post;
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  const existing = await getBlogPostById(id);
  if (!existing) return null;

  const posts = await loadAllPosts();
  const slug = uniquePostSlug(posts, payload.title, payload.seo.slug, id);
  const next: BlogPost = {
    ...payload,
    id,
    seo: {
      ...payload.seo,
      slug
    },
    publishedAt:
      payload.status === 'published'
        ? existing.publishedAt ?? nowIso()
        : payload.publishedAt ?? null,
    updatedAt: nowIso()
  };

  await getDb().update(blogPostsTable).set(postToRow(next)).where(eq(blogPostsTable.id, id));
  return next;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const existing = await getBlogPostById(id);
  if (!existing) return false;
  await getDb().delete(blogPostsTable).where(eq(blogPostsTable.id, id));
  return true;
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  const existing = await getBlogPostById(id);
  if (!existing) return null;

  const next: BlogPost = {
    ...existing,
    status,
    publishedAt: status === 'published' ? existing.publishedAt ?? nowIso() : null,
    updatedAt: nowIso()
  };

  await getDb().update(blogPostsTable).set(postToRow(next)).where(eq(blogPostsTable.id, id));
  return next;
}



