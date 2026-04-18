import { eq, sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import {
  blogPostsTable,
  categoriesTable,
  mediaAssetsTable,
  pagesTable,
  portfolioProjectTagsTable,
  portfolioProjectsTable,
  portfolioTagsTable,
  postCategoriesTable,
  siteSettingsTable
} from '@/db/schema';

import { defaultContent } from './defaultContent';
import {
  deleteBlogPostCategoryLinks,
  deletePortfolioProjectTagLinks,
  mapBlogPostCategorySlugs,
  mapPortfolioProjectTags,
  syncBlogPostCategoryLinks,
  syncPortfolioProjectTagLinks
} from './dbTaxonomy';
import type {
  BlogPost,
  CmsContent,
  LandingPage,
  PageId,
  PortfolioProject,
  SiteSettings
} from './types';
import type { BlogQueryInput, PortfolioQueryInput } from './storeTypes';
import {
  isBlogPostLive,
  isPortfolioProjectLive
} from './publicationState';
import {
  mergeWithDefaults,
  normalizePageForWrite,
  normalizeSettings,
  normalizeSlug,
  nowIso,
  uniquePortfolioSlug,
  uniquePostSlug
} from './storeShared';

let bootstrapPromise: Promise<void> | null = null;
let warnedMissingPortfolioTable = false;
let warnedMissingScheduleColumns = false;
let warnedMissingPortfolioRelationsColumn = false;
let portfolioRelationsColumnPromise: Promise<boolean> | null = null;
let warnedSkippedBuildBootstrap = false;

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; cause?: unknown };
  if (typeof record.code === 'string') return record.code;
  if (record.cause) return extractErrorCode(record.cause);
  return undefined;
}

function isMissingRelationError(error: unknown) {
  return extractErrorCode(error) === '42P01';
}

function isMissingColumnError(error: unknown) {
  return extractErrorCode(error) === '42703';
}

function warnMissingPortfolioTable() {
  if (warnedMissingPortfolioTable) return;
  warnedMissingPortfolioTable = true;
  // Keep build/runtime resilient while migration is rolling out.
  console.warn('portfolio_projects table not found; portfolio features are temporarily disabled.');
}

function warnMissingScheduleColumns() {
  if (warnedMissingScheduleColumns) return;
  warnedMissingScheduleColumns = true;
  console.warn('Scheduled publish columns are not available yet; falling back to legacy content queries.');
}

function warnMissingPortfolioRelationsColumn() {
  if (warnedMissingPortfolioRelationsColumn) return;
  warnedMissingPortfolioRelationsColumn = true;
  console.warn('related_service_page_ids column is not available yet; falling back to legacy portfolio queries.');
}

function isBuildPhase() {
  return (
    process.env.NEXT_PHASE === 'phase-production-build' ||
    process.env.npm_lifecycle_event === 'build'
  );
}

function warnSkippedBuildBootstrap() {
  if (warnedSkippedBuildBootstrap) return;
  warnedSkippedBuildBootstrap = true;
  console.warn('Skipping CMS database bootstrap during build; build should not mutate production content.');
}

async function withPortfolioTableFallback<T>(task: () => Promise<T>, fallback: T): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (isMissingRelationError(error)) {
      warnMissingPortfolioTable();
      return fallback;
    }
    throw error;
  }
}

async function withLegacyScheduleFallback<T>(task: () => Promise<T>, fallbackTask: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (isMissingColumnError(error)) {
      warnMissingScheduleColumns();
      return fallbackTask();
    }
    throw error;
  }
}

async function withPortfolioRelationsFallback<T>(task: () => Promise<T>, fallbackTask: () => Promise<T>): Promise<T> {
  try {
    return await task();
  } catch (error) {
    if (isMissingColumnError(error)) {
      portfolioRelationsColumnPromise = Promise.resolve(false);
      warnMissingPortfolioRelationsColumn();
      return fallbackTask();
    }
    throw error;
  }
}

type LegacyPageRow = {
  id: PageId;
  title: string;
  navLabel: string;
  slug: string;
  published: boolean;
  seo: LandingPage['seo'];
  sections: LandingPage['sections'];
  homeBlocks: LandingPage['homeBlocks'] | null;
  updatedAt: string;
};

type LegacyPostRow = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  coverImage: string;
  status: BlogPost['status'];
  publishedAt: string | null;
  updatedAt: string;
  seo: BlogPost['seo'];
};

type LegacyPortfolioRow = {
  id: string;
  title: string;
  slug: string;
  summary: string;
  challenge: string;
  solution: string;
  outcome: string;
  clientName: string;
  serviceType: string;
  industry: string;
  projectUrl: string;
  relatedServicePageIds?: PortfolioProject['relatedServicePageIds'];
  coverImage: string;
  gallery: string[];
  tags: string[];
  featured: boolean;
  status: PortfolioProject['status'];
  sortOrder: number;
  publishedAt: string | null;
  updatedAt: string;
  seo: PortfolioProject['seo'];
};

function pageToLegacyRow(page: LandingPage) {
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

function rowToLegacyPage(row: LegacyPageRow): LandingPage {
  return {
    id: row.id,
    title: row.title,
    navLabel: row.navLabel,
    published: row.published,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    seo: {
      ...row.seo,
      slug: row.slug
    },
    sections: row.sections,
    homeBlocks: row.homeBlocks ?? undefined,
    updatedAt: row.updatedAt
  };
}

function postToLegacyRow(post: BlogPost) {
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

function rowToLegacyPost(row: LegacyPostRow, tags = row.tags): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    tags,
    coverImage: row.coverImage,
    status: row.status,
    publishedAt: row.publishedAt,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  };
}

function portfolioToLegacyRow(project: PortfolioProject) {
  return {
    id: project.id,
    title: project.title,
    slug: project.seo.slug,
    summary: project.summary,
    challenge: project.challenge,
    solution: project.solution,
    outcome: project.outcome,
    clientName: project.clientName,
    serviceType: project.serviceType,
    industry: project.industry,
    projectUrl: project.projectUrl,
    coverImage: project.coverImage,
    gallery: project.gallery,
    tags: project.tags,
    featured: project.featured,
    status: project.status,
    sortOrder: project.sortOrder,
    publishedAt: project.publishedAt,
    updatedAt: project.updatedAt,
    seo: project.seo
  };
}

function rowToLegacyPortfolio(row: LegacyPortfolioRow, tags = row.tags): PortfolioProject {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    challenge: row.challenge,
    solution: row.solution,
    outcome: row.outcome,
    clientName: row.clientName,
    serviceType: row.serviceType,
    industry: row.industry,
    projectUrl: row.projectUrl,
    relatedServicePageIds: Array.isArray(row.relatedServicePageIds) ? row.relatedServicePageIds : [],
    coverImage: row.coverImage,
    gallery: row.gallery,
    tags,
    featured: row.featured,
    status: row.status,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt,
    scheduledPublishAt: null,
    scheduledUnpublishAt: null,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  };
}

async function readLegacyPages() {
  const result = await getDb().execute<LegacyPageRow>(sql`
    select id, title, nav_label as "navLabel", slug, published, seo, sections, home_blocks as "homeBlocks", updated_at as "updatedAt"
    from pages
  `);
  return result.rows.map(rowToLegacyPage);
}

async function readLegacyPosts() {
  const result = await getDb().execute<LegacyPostRow>(sql`
    select id, title, slug, excerpt, content, author, tags, cover_image as "coverImage", status, published_at as "publishedAt", updated_at as "updatedAt", seo
    from blog_posts
  `);
  const tagMap = await mapBlogPostCategorySlugs(result.rows.map((row) => row.id));
  return result.rows.map((row) => rowToLegacyPost(row, tagMap.get(row.id) ?? row.tags));
}

async function readLegacyPortfolioProjects() {
  return withPortfolioTableFallback(async () => {
    const result = await getDb().execute<LegacyPortfolioRow>(sql`
      select id, title, slug, summary, challenge, solution, outcome, client_name as "clientName", service_type as "serviceType",
        industry, project_url as "projectUrl", cover_image as "coverImage", gallery, tags, featured, status, sort_order as "sortOrder",
        published_at as "publishedAt", updated_at as "updatedAt", seo
      from portfolio_projects
    `);
    const tagMap = await mapPortfolioProjectTags(result.rows.map((row) => row.id));
    return result.rows.map((row) => rowToLegacyPortfolio(row, tagMap.get(row.id) ?? row.tags));
  }, []);
}

function pageToRow(page: LandingPage) {
  return {
    id: page.id,
    title: page.title,
    navLabel: page.navLabel,
    slug: page.seo.slug,
    published: page.published,
    scheduledPublishAt: page.scheduledPublishAt ?? null,
    scheduledUnpublishAt: page.scheduledUnpublishAt ?? null,
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
    scheduledPublishAt: row.scheduledPublishAt ?? null,
    scheduledUnpublishAt: row.scheduledUnpublishAt ?? null,
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
    scheduledPublishAt: post.scheduledPublishAt ?? null,
    scheduledUnpublishAt: post.scheduledUnpublishAt ?? null,
    updatedAt: post.updatedAt,
    seo: post.seo
  };
}

function rowToPost(row: typeof blogPostsTable.$inferSelect, tags = row.tags): BlogPost {
  return {
    id: row.id,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    author: row.author,
    tags,
    coverImage: row.coverImage,
    status: row.status,
    publishedAt: row.publishedAt,
    scheduledPublishAt: row.scheduledPublishAt ?? null,
    scheduledUnpublishAt: row.scheduledUnpublishAt ?? null,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  };
}

function portfolioToRow(project: PortfolioProject) {
  return {
    id: project.id,
    title: project.title,
    slug: project.seo.slug,
    summary: project.summary,
    challenge: project.challenge,
    solution: project.solution,
    outcome: project.outcome,
    clientName: project.clientName,
    serviceType: project.serviceType,
    industry: project.industry,
    projectUrl: project.projectUrl,
    coverImage: project.coverImage,
    gallery: project.gallery,
    tags: project.tags,
    featured: project.featured,
    status: project.status,
    sortOrder: project.sortOrder,
    publishedAt: project.publishedAt,
    scheduledPublishAt: project.scheduledPublishAt ?? null,
    scheduledUnpublishAt: project.scheduledUnpublishAt ?? null,
    updatedAt: project.updatedAt,
    seo: project.seo
  };
}

type PortfolioInsertRow = typeof portfolioProjectsTable.$inferInsert;
type PortfolioRowShape = ReturnType<typeof portfolioToLegacyRow> & {
  relatedServicePageIds?: PortfolioProject['relatedServicePageIds'];
  scheduledPublishAt?: string | null;
  scheduledUnpublishAt?: string | null;
};

function portfolioWriteRow(project: PortfolioProject, includeRelations: boolean): PortfolioInsertRow {
  return (includeRelations ? portfolioToRow(project) : portfolioToLegacyRow(project)) as PortfolioInsertRow;
}

function portfolioSelectShape(includeRelations: boolean, includeSchedule = true) {
  return {
    id: portfolioProjectsTable.id,
    title: portfolioProjectsTable.title,
    slug: portfolioProjectsTable.slug,
    summary: portfolioProjectsTable.summary,
    challenge: portfolioProjectsTable.challenge,
    solution: portfolioProjectsTable.solution,
    outcome: portfolioProjectsTable.outcome,
    clientName: portfolioProjectsTable.clientName,
    serviceType: portfolioProjectsTable.serviceType,
    industry: portfolioProjectsTable.industry,
    projectUrl: portfolioProjectsTable.projectUrl,
    ...(includeRelations ? { relatedServicePageIds: portfolioProjectsTable.relatedServicePageIds } : {}),
    coverImage: portfolioProjectsTable.coverImage,
    gallery: portfolioProjectsTable.gallery,
    tags: portfolioProjectsTable.tags,
    featured: portfolioProjectsTable.featured,
    status: portfolioProjectsTable.status,
    sortOrder: portfolioProjectsTable.sortOrder,
    publishedAt: portfolioProjectsTable.publishedAt,
    ...(includeSchedule ? {
      scheduledPublishAt: portfolioProjectsTable.scheduledPublishAt,
      scheduledUnpublishAt: portfolioProjectsTable.scheduledUnpublishAt,
    } : {}),
    updatedAt: portfolioProjectsTable.updatedAt,
    seo: portfolioProjectsTable.seo
  };
}

function rowToPortfolio(
  row: PortfolioRowShape,
  tags = row.tags
): PortfolioProject {
  return {
    id: row.id,
    title: row.title,
    summary: row.summary,
    challenge: row.challenge,
    solution: row.solution,
    outcome: row.outcome,
    clientName: row.clientName,
    serviceType: row.serviceType,
    industry: row.industry,
    projectUrl: row.projectUrl,
    relatedServicePageIds: Array.isArray(row.relatedServicePageIds) ? row.relatedServicePageIds : [],
    coverImage: row.coverImage,
    gallery: row.gallery,
    tags,
    featured: row.featured,
    status: row.status,
    sortOrder: row.sortOrder,
    publishedAt: row.publishedAt,
    scheduledPublishAt: row.scheduledPublishAt ?? null,
    scheduledUnpublishAt: row.scheduledUnpublishAt ?? null,
    updatedAt: row.updatedAt,
    seo: {
      ...row.seo,
      slug: row.slug
    }
  };
}

async function supportsPortfolioRelationsColumn() {
  if (portfolioRelationsColumnPromise) {
    return portfolioRelationsColumnPromise;
  }

  portfolioRelationsColumnPromise = (async () => {
    const result = await getDb().execute(sql`
      select 1
      from information_schema.columns
      where table_name = 'portfolio_projects'
        and column_name = 'related_service_page_ids'
      limit 1
    `);

    return result.rows.length > 0;
  })();

  return portfolioRelationsColumnPromise;
}

async function ensureDbBootstrap() {
  if (isBuildPhase()) {
    warnSkippedBuildBootstrap();
    return;
  }

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
      await withLegacyScheduleFallback(
        () => db.insert(pagesTable).values(Object.values(defaultContent.pages).map(pageToRow)).onConflictDoNothing(),
        () => db.insert(pagesTable).values(Object.values(defaultContent.pages).map(pageToLegacyRow)).onConflictDoNothing()
      );
    }

    const existingPosts = await db.select({ id: blogPostsTable.id }).from(blogPostsTable).limit(1);
    if (existingPosts.length === 0) {
      await withLegacyScheduleFallback(
        () => db.insert(blogPostsTable).values(defaultContent.blogPosts.map(postToRow)).onConflictDoNothing(),
        () => db.insert(blogPostsTable).values(defaultContent.blogPosts.map(postToLegacyRow)).onConflictDoNothing()
      );
    }

    await withPortfolioTableFallback(async () => {
      const existingPortfolio = await db
        .select({ id: portfolioProjectsTable.id })
        .from(portfolioProjectsTable)
        .limit(1);
      if (existingPortfolio.length === 0) {
        await withLegacyScheduleFallback(
          async () =>
            withPortfolioRelationsFallback(
              async () => {
                const includeRelations = await supportsPortfolioRelationsColumn();
                await db
                  .insert(portfolioProjectsTable)
                  .values(defaultContent.portfolioProjects.map((project) => portfolioWriteRow(project, includeRelations)))
                  .onConflictDoNothing();
              },
              async () => {
                await db
                  .insert(portfolioProjectsTable)
                  .values(defaultContent.portfolioProjects.map((project) => portfolioWriteRow(project, false)))
                  .onConflictDoNothing();
              }
            ),
          async () => {
            await db
              .insert(portfolioProjectsTable)
              .values(defaultContent.portfolioProjects.map((project) => portfolioWriteRow(project, false)))
              .onConflictDoNothing();
          }
        );
      }
    }, undefined);

    const existingCategories = await db.select({ id: categoriesTable.id }).from(categoriesTable).limit(1);
    if (existingCategories.length === 0) {
      await db.insert(categoriesTable).values(defaultContent.categories).onConflictDoNothing();
    }

    const existingMedia = await db.select({ id: mediaAssetsTable.id }).from(mediaAssetsTable).limit(1);
    if (existingMedia.length === 0) {
      await db.insert(mediaAssetsTable).values(defaultContent.mediaAssets).onConflictDoNothing();
    }

    const seededPosts = await withLegacyScheduleFallback(
      () => db.select().from(blogPostsTable).then((rows) => rows.map((row) => rowToPost(row))),
      () => readLegacyPosts()
    );
    await syncBlogPostCategoryLinks(seededPosts);

    await withPortfolioTableFallback(async () => {
      const seededPortfolio = await withPortfolioRelationsFallback(
        () =>
          withLegacyScheduleFallback(
            async () => {
              const includeRelations = await supportsPortfolioRelationsColumn();
              const rows = await db.select(portfolioSelectShape(includeRelations)).from(portfolioProjectsTable);
              return rows.map((row) => rowToPortfolio(row as PortfolioRowShape));
            },
            () => readLegacyPortfolioProjects()
          ),
        async () => {
          const rows = await db.select(portfolioSelectShape(false, false)).from(portfolioProjectsTable);
          return rows.map((row) => rowToPortfolio(row as PortfolioRowShape));
        }
      );
      await syncPortfolioProjectTagLinks(seededPortfolio);
    }, undefined);
  })();

  try {
    await bootstrapPromise;
  } catch (error) {
    bootstrapPromise = null;
    throw error;
  }
}

async function loadAllPages() {
  return withLegacyScheduleFallback(async () => {
    await ensureDbBootstrap();
    const rows = await getDb().select().from(pagesTable);
    return rows.map(rowToPage);
  }, async () => {
    await ensureDbBootstrap();
    return readLegacyPages();
  });
}

async function loadAllPosts() {
  return withLegacyScheduleFallback(async () => {
    await ensureDbBootstrap();
    const rows = await getDb().select().from(blogPostsTable);
    const tagMap = await mapBlogPostCategorySlugs(rows.map((row) => row.id));
    return rows.map((row) => rowToPost(row, tagMap.get(row.id) ?? row.tags));
  }, async () => {
    await ensureDbBootstrap();
    return readLegacyPosts();
  });
}

async function loadAllPortfolioProjects() {
  return withPortfolioTableFallback(async () => {
    return withPortfolioRelationsFallback(async () => {
      return withLegacyScheduleFallback(async () => {
        await ensureDbBootstrap();
        const includeRelations = await supportsPortfolioRelationsColumn();
        const rows = await getDb().select(portfolioSelectShape(includeRelations)).from(portfolioProjectsTable);
        const tagMap = await mapPortfolioProjectTags(rows.map((row) => row.id));
        return rows.map((row) => rowToPortfolio(row as PortfolioRowShape, tagMap.get(row.id) ?? row.tags));
      }, async () => {
        await ensureDbBootstrap();
        return readLegacyPortfolioProjects();
      });
    }, async () => {
      await ensureDbBootstrap();
      const rows = await getDb().select(portfolioSelectShape(false, false)).from(portfolioProjectsTable);
      const tagMap = await mapPortfolioProjectTags(rows.map((row) => row.id));
      return rows.map((row) => rowToPortfolio(row as PortfolioRowShape, tagMap.get(row.id) ?? row.tags));
    });
  }, []);
}

export async function replaceAllCmsContent(content: CmsContent) {
  const db = getDb();
  const normalized = mergeWithDefaults(content);

  await db.transaction(async (tx) => {
    await tx.delete(postCategoriesTable);
    await withPortfolioTableFallback(async () => {
      await tx.delete(portfolioProjectTagsTable);
      await tx.delete(portfolioTagsTable);
    }, undefined);
    await tx.delete(blogPostsTable);
    await withPortfolioTableFallback(async () => {
      await tx.delete(portfolioProjectsTable);
    }, undefined);
    await tx.delete(categoriesTable);
    await tx.delete(mediaAssetsTable);
    await tx.delete(pagesTable);
    await tx.delete(siteSettingsTable);

    await tx.insert(siteSettingsTable).values({
      id: 'default',
      payload: normalizeSettings(normalized.settings),
      updatedAt: nowIso()
    });

    await tx.insert(pagesTable).values(Object.values(normalized.pages).map(pageToRow));
    await tx.insert(categoriesTable).values(normalized.categories);
    await tx.insert(blogPostsTable).values(normalized.blogPosts.map(postToRow));
    await withPortfolioTableFallback(async () => {
      await withPortfolioRelationsFallback(
        async () => {
          const includeRelations = await supportsPortfolioRelationsColumn();
          await tx
            .insert(portfolioProjectsTable)
            .values(normalized.portfolioProjects.map((project) => portfolioWriteRow(project, includeRelations)));
        },
        async () => {
          await tx
            .insert(portfolioProjectsTable)
            .values(normalized.portfolioProjects.map((project) => portfolioWriteRow(project, false)));
        }
      );
    }, undefined);
    await tx.insert(mediaAssetsTable).values(normalized.mediaAssets);
  });

  await syncBlogPostCategoryLinks(normalized.blogPosts);
  await withPortfolioTableFallback(async () => {
    await syncPortfolioProjectTagLinks(normalized.portfolioProjects);
  }, undefined);
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
  return withLegacyScheduleFallback(async () => {
    await ensureDbBootstrap();
    const row = await getDb().select().from(pagesTable).where(eq(pagesTable.id, id)).limit(1);
    return row[0] ? rowToPage(row[0]) : null;
  }, async () => {
    await ensureDbBootstrap();
    const result = await getDb().execute<LegacyPageRow>(sql`
      select id, title, nav_label as "navLabel", slug, published, seo, sections, home_blocks as "homeBlocks", updated_at as "updatedAt"
      from pages
      where id = ${id}
      limit 1
    `);
    return result.rows[0] ? rowToLegacyPage(result.rows[0]) : null;
  });
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
  const filtered = includeDrafts ? posts : posts.filter((post) => isBlogPostLive(post));
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
    if (!input.includeDrafts && !isBlogPostLive(post)) return false;
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
  return withLegacyScheduleFallback(async () => {
    await ensureDbBootstrap();
    const row = await getDb().select().from(blogPostsTable).where(eq(blogPostsTable.id, id)).limit(1);
    if (!row[0]) return null;
    const tagMap = await mapBlogPostCategorySlugs([id]);
    return rowToPost(row[0], tagMap.get(id) ?? row[0].tags);
  }, async () => {
    await ensureDbBootstrap();
    const result = await getDb().execute<LegacyPostRow>(sql`
      select id, title, slug, excerpt, content, author, tags, cover_image as "coverImage", status, published_at as "publishedAt", updated_at as "updatedAt", seo
      from blog_posts
      where id = ${id}
      limit 1
    `);
    if (!result.rows[0]) return null;
    const tagMap = await mapBlogPostCategorySlugs([id]);
    return rowToLegacyPost(result.rows[0], tagMap.get(id) ?? result.rows[0].tags);
  });
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = normalizeSlug(slug);
  return withLegacyScheduleFallback(async () => {
    await ensureDbBootstrap();
    const row = await getDb().select().from(blogPostsTable).where(eq(blogPostsTable.slug, normalized)).limit(1);
    if (!row[0]) return null;
    if (!isBlogPostLive(rowToPost(row[0]))) return null;
    const tagMap = await mapBlogPostCategorySlugs([row[0].id]);
    return rowToPost(row[0], tagMap.get(row[0].id) ?? row[0].tags);
  }, async () => {
    await ensureDbBootstrap();
    const result = await getDb().execute<LegacyPostRow>(sql`
      select id, title, slug, excerpt, content, author, tags, cover_image as "coverImage", status, published_at as "publishedAt", updated_at as "updatedAt", seo
      from blog_posts
      where slug = ${normalized}
      limit 1
    `);
    if (!result.rows[0]) return null;
    const tagMap = await mapBlogPostCategorySlugs([result.rows[0].id]);
    return rowToLegacyPost(result.rows[0], tagMap.get(result.rows[0].id) ?? result.rows[0].tags);
  });
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
    scheduledPublishAt: payload?.scheduledPublishAt ?? null,
    scheduledUnpublishAt: payload?.scheduledUnpublishAt ?? null,
    updatedAt: nowIso(),
    seo: {
      metaTitle: payload?.seo?.metaTitle || title,
      metaDescription: payload?.seo?.metaDescription || '',
      slug,
      canonical: payload?.seo?.canonical || '',
      socialImage: payload?.seo?.socialImage || '',
      noIndex: payload?.seo?.noIndex ?? false,
      keywords: payload?.seo?.keywords ?? []
    }
  };

  await getDb().insert(blogPostsTable).values(postToRow(post));
  await syncBlogPostCategoryLinks([post]);
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
  await syncBlogPostCategoryLinks([next]);
  return next;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const existing = await getBlogPostById(id);
  if (!existing) return false;
  await deleteBlogPostCategoryLinks([id]);
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
    scheduledPublishAt: status === 'published' ? null : existing.scheduledPublishAt ?? null,
    scheduledUnpublishAt: status === 'draft' ? null : existing.scheduledUnpublishAt ?? null,
    updatedAt: nowIso()
  };

  await getDb().update(blogPostsTable).set(postToRow(next)).where(eq(blogPostsTable.id, id));
  return next;
}

export async function getPortfolioProjects(includeDrafts = false): Promise<PortfolioProject[]> {
  const projects = await loadAllPortfolioProjects();
  const filtered = includeDrafts ? projects : projects.filter((project) => isPortfolioProjectLive(project));

  return filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });
}

export async function queryPortfolioProjects(input: PortfolioQueryInput) {
  const projects = await loadAllPortfolioProjects();
  const query = (input.q ?? '').trim().toLowerCase();
  const tag = (input.tag ?? '').trim().toLowerCase();
  const status =
    input.status === 'draft' || input.status === 'published' || input.status === 'all'
      ? input.status
      : 'all';
  const featured =
    input.featured === 'featured' || input.featured === 'standard' || input.featured === 'all'
      ? input.featured
      : 'all';
  const dateSort = input.dateSort === 'oldest' ? 'oldest' : 'newest';
  const page = Number.isFinite(input.page) && (input.page ?? 0) > 0 ? Number(input.page) : 1;
  const pageSize =
    Number.isFinite(input.pageSize) && (input.pageSize ?? 0) > 0
      ? Math.min(Number(input.pageSize), 50)
      : 10;

  const tags = Array.from(
    new Set(
      projects
        .flatMap((project) => project.tags)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  let filtered = projects.filter((project) => {
    if (!input.includeDrafts && !isPortfolioProjectLive(project)) return false;
    if (status !== 'all' && project.status !== status) return false;
    if (featured === 'featured' && !project.featured) return false;
    if (featured === 'standard' && project.featured) return false;

    if (query.length > 0) {
      const haystack = `${project.title} ${project.clientName} ${project.serviceType} ${project.industry}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }

    if (tag.length > 0) {
      const hasTag = project.tags.some((entry) => entry.toLowerCase() === tag);
      if (!hasTag) return false;
    }

    return true;
  });

  filtered = filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (dateSort === 'oldest') return a.updatedAt > b.updatedAt ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const total = filtered.length;
  const start = (page - 1) * pageSize;
  const paginated = filtered.slice(start, start + pageSize);

  return {
    projects: paginated,
    meta: {
      total,
      page,
      pageSize,
      tags
    }
  };
}

export async function getPortfolioProjectById(id: string): Promise<PortfolioProject | null> {
  return withPortfolioTableFallback(async () => {
    return withPortfolioRelationsFallback(async () => {
      return withLegacyScheduleFallback(async () => {
        await ensureDbBootstrap();
        const includeRelations = await supportsPortfolioRelationsColumn();
        const row = await getDb()
          .select(portfolioSelectShape(includeRelations))
          .from(portfolioProjectsTable)
          .where(eq(portfolioProjectsTable.id, id))
          .limit(1);
        if (!row[0]) return null;
        const tagMap = await mapPortfolioProjectTags([id]);
        return rowToPortfolio(row[0] as PortfolioRowShape, tagMap.get(id) ?? row[0].tags);
      }, async () => {
        await ensureDbBootstrap();
        const result = await getDb().execute<LegacyPortfolioRow>(sql`
          select id, title, slug, summary, challenge, solution, outcome, client_name as "clientName", service_type as "serviceType",
            industry, project_url as "projectUrl", cover_image as "coverImage", gallery, tags, featured, status, sort_order as "sortOrder",
            published_at as "publishedAt", updated_at as "updatedAt", seo
          from portfolio_projects
          where id = ${id}
          limit 1
        `);
        if (!result.rows[0]) return null;
        const tagMap = await mapPortfolioProjectTags([id]);
        return rowToLegacyPortfolio(result.rows[0], tagMap.get(id) ?? result.rows[0].tags);
      });
    }, async () => {
      await ensureDbBootstrap();
      const row = await getDb()
        .select(portfolioSelectShape(false, false))
        .from(portfolioProjectsTable)
        .where(eq(portfolioProjectsTable.id, id))
        .limit(1);
      if (!row[0]) return null;
      const tagMap = await mapPortfolioProjectTags([id]);
      return rowToPortfolio(row[0] as PortfolioRowShape, tagMap.get(id) ?? row[0].tags);
    });
  }, null);
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  return withPortfolioTableFallback(async () => {
    const normalized = normalizeSlug(slug);
    return withPortfolioRelationsFallback(async () => {
      return withLegacyScheduleFallback(async () => {
        await ensureDbBootstrap();
        const includeRelations = await supportsPortfolioRelationsColumn();
        const row = await getDb()
          .select(portfolioSelectShape(includeRelations))
          .from(portfolioProjectsTable)
          .where(eq(portfolioProjectsTable.slug, normalized))
          .limit(1);
        if (!row[0]) return null;
        if (!isPortfolioProjectLive(rowToPortfolio(row[0] as PortfolioRowShape))) return null;
        const tagMap = await mapPortfolioProjectTags([row[0].id]);
        return rowToPortfolio(row[0] as PortfolioRowShape, tagMap.get(row[0].id) ?? row[0].tags);
      }, async () => {
        await ensureDbBootstrap();
        const result = await getDb().execute<LegacyPortfolioRow>(sql`
          select id, title, slug, summary, challenge, solution, outcome, client_name as "clientName", service_type as "serviceType",
            industry, project_url as "projectUrl", cover_image as "coverImage", gallery, tags, featured, status, sort_order as "sortOrder",
            published_at as "publishedAt", updated_at as "updatedAt", seo
          from portfolio_projects
          where slug = ${normalized}
          limit 1
        `);
        if (!result.rows[0]) return null;
        const tagMap = await mapPortfolioProjectTags([result.rows[0].id]);
        return rowToLegacyPortfolio(result.rows[0], tagMap.get(result.rows[0].id) ?? result.rows[0].tags);
      });
    }, async () => {
      await ensureDbBootstrap();
      const row = await getDb()
        .select(portfolioSelectShape(false, false))
        .from(portfolioProjectsTable)
        .where(eq(portfolioProjectsTable.slug, normalized))
        .limit(1);
      if (!row[0]) return null;
      if (!isPortfolioProjectLive(rowToPortfolio(row[0] as PortfolioRowShape))) return null;
      const tagMap = await mapPortfolioProjectTags([row[0].id]);
      return rowToPortfolio(row[0] as PortfolioRowShape, tagMap.get(row[0].id) ?? row[0].tags);
    });
  }, null);
}

export async function createPortfolioProject(
  payload?: Partial<PortfolioProject>
): Promise<PortfolioProject> {
  const projects = await loadAllPortfolioProjects();
  const id = crypto.randomUUID();
  const title = payload?.title?.trim() || 'Untitled project';
  const slug = uniquePortfolioSlug(projects, title, payload?.seo?.slug);
  const requestedStatus = payload?.status;
  const status = requestedStatus ?? 'draft';
  const maxSort = projects.reduce((acc, project) => Math.max(acc, project.sortOrder), 0);

  const project: PortfolioProject = {
    id,
    title,
    summary: payload?.summary?.trim() || '',
    challenge: payload?.challenge || '',
    solution: payload?.solution || '',
    outcome: payload?.outcome || '',
    clientName: payload?.clientName?.trim() || '',
    serviceType: payload?.serviceType?.trim() || '',
    industry: payload?.industry?.trim() || '',
    projectUrl: payload?.projectUrl || '',
    relatedServicePageIds: payload?.relatedServicePageIds ?? [],
    coverImage: payload?.coverImage || '',
    gallery: payload?.gallery ?? [],
    tags: payload?.tags ?? [],
    featured: payload?.featured ?? false,
    status,
    sortOrder: payload?.sortOrder ?? maxSort + 1,
    publishedAt: status === 'published' ? nowIso() : null,
    scheduledPublishAt: payload?.scheduledPublishAt ?? null,
    scheduledUnpublishAt: payload?.scheduledUnpublishAt ?? null,
    updatedAt: nowIso(),
    seo: {
      metaTitle: payload?.seo?.metaTitle || title,
      metaDescription: payload?.seo?.metaDescription || '',
      slug,
      canonical: payload?.seo?.canonical || '',
      socialImage: payload?.seo?.socialImage || '',
      noIndex: payload?.seo?.noIndex ?? false,
      keywords: payload?.seo?.keywords ?? []
    }
  };

  const includeRelations = await supportsPortfolioRelationsColumn();
  await withPortfolioRelationsFallback(
    () => getDb().insert(portfolioProjectsTable).values(portfolioWriteRow(project, includeRelations)),
    () => getDb().insert(portfolioProjectsTable).values(portfolioWriteRow(project, false))
  );
  await withPortfolioTableFallback(async () => {
    await syncPortfolioProjectTagLinks([project]);
  }, undefined);
  return project;
}

export async function updatePortfolioProject(
  id: string,
  payload: PortfolioProject
): Promise<PortfolioProject | null> {
  const existing = await getPortfolioProjectById(id);
  if (!existing) return null;

  const projects = await loadAllPortfolioProjects();
  const slug = uniquePortfolioSlug(projects, payload.title, payload.seo.slug, id);

  const next: PortfolioProject = {
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

  const includeRelations = await supportsPortfolioRelationsColumn();
  await withPortfolioRelationsFallback(
    () =>
      getDb()
        .update(portfolioProjectsTable)
        .set(portfolioWriteRow(next, includeRelations))
        .where(eq(portfolioProjectsTable.id, id)),
    () =>
      getDb()
        .update(portfolioProjectsTable)
        .set(portfolioWriteRow(next, false))
        .where(eq(portfolioProjectsTable.id, id))
  );
  await withPortfolioTableFallback(async () => {
    await syncPortfolioProjectTagLinks([next]);
  }, undefined);

  return next;
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  const existing = await getPortfolioProjectById(id);
  if (!existing) return false;

  await withPortfolioTableFallback(async () => {
    await deletePortfolioProjectTagLinks([id]);
  }, undefined);
  await getDb().delete(portfolioProjectsTable).where(eq(portfolioProjectsTable.id, id));
  return true;
}

export async function setPortfolioProjectStatus(
  id: string,
  status: 'draft' | 'published'
): Promise<PortfolioProject | null> {
  const existing = await getPortfolioProjectById(id);
  if (!existing) return null;

  const next: PortfolioProject = {
    ...existing,
    status,
    publishedAt: status === 'published' ? existing.publishedAt ?? nowIso() : null,
    scheduledPublishAt: status === 'published' ? null : existing.scheduledPublishAt ?? null,
    scheduledUnpublishAt: status === 'draft' ? null : existing.scheduledUnpublishAt ?? null,
    updatedAt: nowIso()
  };

  const includeRelations = await supportsPortfolioRelationsColumn();
  await withPortfolioRelationsFallback(
    () =>
      getDb()
        .update(portfolioProjectsTable)
        .set(portfolioWriteRow(next, includeRelations))
        .where(eq(portfolioProjectsTable.id, id)),
    () =>
      getDb()
        .update(portfolioProjectsTable)
        .set(portfolioWriteRow(next, false))
        .where(eq(portfolioProjectsTable.id, id))
  );

  return next;
}
