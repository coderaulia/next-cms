import { revalidatePath, revalidateTag, unstable_cache } from 'next/cache';

import type { LandingPage, PageId } from './types';
import * as contentStore from './contentStore';
import { isPageLive } from './publicationState';

export const cmsPublicCacheTags = {
  all: 'cms-public',
  settings: 'cms-public:settings',
  pages: 'cms-public:pages',
  blog: 'cms-public:blog',
  portfolio: 'cms-public:portfolio',
  media: 'cms-public:media'
} as const;

function withCommonTags(...tags: string[]) {
  return Array.from(new Set([cmsPublicCacheTags.all, ...tags]));
}

function isCacheRuntimeUnavailable(error: unknown) {
  return (
    error instanceof Error &&
    /incrementalCache missing|static generation store missing/i.test(error.message)
  );
}

async function withCacheFallback<T>(cached: () => Promise<T>, uncached: () => Promise<T>) {
  try {
    return await cached();
  } catch (error) {
    if (isCacheRuntimeUnavailable(error)) {
      return uncached();
    }
    throw error;
  }
}

function safelyRevalidate(action: () => void) {
  try {
    action();
  } catch (error) {
    if (!isCacheRuntimeUnavailable(error)) {
      throw error;
    }
  }
}

async function readPublishedPages() {
  const pages = await contentStore.getPages();
  return Object.values(pages).filter((page) => isPageLive(page));
}

async function readPublishedPageById(id: PageId): Promise<LandingPage | null> {
  const page = await contentStore.getPageById(id);
  if (!page || !isPageLive(page)) return null;
  return page;
}

async function readPublishedPageBySlug(slug: string): Promise<LandingPage | null> {
  const normalized = slug.trim().replace(/^\/+/, '').toLowerCase();
  const pages = await readPublishedPages();
  return pages.find((page) => page.seo.slug.toLowerCase() === normalized) ?? null;
}

// 60-second TTL ensures scheduled publish/unpublish takes effect without a
// cron job — content is re-checked at most once per minute automatically.
const SCHEDULED_CONTENT_TTL = 60;

const getCachedSiteSettings = unstable_cache(
  async () => contentStore.getSettings(),
  ['cms-public-settings'],
  {
    tags: withCommonTags(cmsPublicCacheTags.settings, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedPages = unstable_cache(
  readPublishedPages,
  ['cms-public-pages'],
  {
    tags: withCommonTags(cmsPublicCacheTags.pages, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedPageById = unstable_cache(
  readPublishedPageById,
  ['cms-public-page-by-id'],
  {
    tags: withCommonTags(cmsPublicCacheTags.pages, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedPageBySlug = unstable_cache(
  readPublishedPageBySlug,
  ['cms-public-page-by-slug'],
  {
    tags: withCommonTags(cmsPublicCacheTags.pages, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedBlogPosts = unstable_cache(
  async () => contentStore.getBlogPosts(false),
  ['cms-public-blog-posts'],
  {
    tags: withCommonTags(cmsPublicCacheTags.blog, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedBlogPostBySlug = unstable_cache(
  async (slug: string) => contentStore.getBlogPostBySlug(slug),
  ['cms-public-blog-post-by-slug'],
  {
    tags: withCommonTags(cmsPublicCacheTags.blog, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedPortfolioProjects = unstable_cache(
  async () => contentStore.getPortfolioProjects(false),
  ['cms-public-portfolio-projects'],
  {
    tags: withCommonTags(cmsPublicCacheTags.portfolio, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

const getCachedPublishedPortfolioProjectBySlug = unstable_cache(
  async (slug: string) => contentStore.getPortfolioProjectBySlug(slug),
  ['cms-public-portfolio-project-by-slug'],
  {
    tags: withCommonTags(cmsPublicCacheTags.portfolio, cmsPublicCacheTags.media),
    revalidate: SCHEDULED_CONTENT_TTL
  }
);

export function getCachedPublicSiteSettings() {
  return withCacheFallback(getCachedSiteSettings, () => contentStore.getSettings());
}

export function getCachedPublicPages() {
  return withCacheFallback(getCachedPublishedPages, readPublishedPages);
}

export function getCachedPublicPageById(id: PageId) {
  return withCacheFallback(() => getCachedPublishedPageById(id), () => readPublishedPageById(id));
}

export function getCachedPublicPageBySlug(slug: string) {
  return withCacheFallback(() => getCachedPublishedPageBySlug(slug), () => readPublishedPageBySlug(slug));
}

export function getCachedPublicBlogPosts() {
  return withCacheFallback(getCachedPublishedBlogPosts, () => contentStore.getBlogPosts(false));
}

export function getCachedPublicBlogPostBySlug(slug: string) {
  return withCacheFallback(() => getCachedPublishedBlogPostBySlug(slug), () => contentStore.getBlogPostBySlug(slug));
}

export function getCachedPublicPortfolioProjects() {
  return withCacheFallback(
    getCachedPublishedPortfolioProjects,
    () => contentStore.getPortfolioProjects(false)
  );
}

export function getCachedPublicPortfolioProjectBySlug(slug: string) {
  return withCacheFallback(
    () => getCachedPublishedPortfolioProjectBySlug(slug),
    () => contentStore.getPortfolioProjectBySlug(slug)
  );
}

/** Scoped revalidation helpers — prefer these over revalidatePublicCmsCache for targeted mutations. */
export function revalidateBlogCache() {
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.blog));
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.all));
  safelyRevalidate(() => revalidatePath('/blog'));
  safelyRevalidate(() => revalidatePath('/blog/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/sitemap.xml'));
}

export function revalidatePortfolioCache() {
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.portfolio));
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.all));
  safelyRevalidate(() => revalidatePath('/portfolio'));
  safelyRevalidate(() => revalidatePath('/portfolio/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/sitemap.xml'));
}

export function revalidatePagesCache() {
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.pages));
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.all));
  safelyRevalidate(() => revalidatePath('/', 'layout'));
  safelyRevalidate(() => revalidatePath('/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/sitemap.xml'));
  safelyRevalidate(() => revalidatePath('/robots.txt'));
}

export function revalidateSettingsCache() {
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.settings));
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.media));
  safelyRevalidate(() => revalidateTag(cmsPublicCacheTags.all));
  safelyRevalidate(() => revalidatePath('/', 'layout'));
  safelyRevalidate(() => revalidatePath('/sitemap.xml'));
  safelyRevalidate(() => revalidatePath('/robots.txt'));
}

/** Full-site blast — use only for import/restore operations that touch all content. */
export function revalidatePublicCmsCache() {
  for (const tag of Object.values(cmsPublicCacheTags)) {
    safelyRevalidate(() => revalidateTag(tag));
  }

  safelyRevalidate(() => revalidatePath('/', 'layout'));
  safelyRevalidate(() => revalidatePath('/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/blog/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/portfolio/[slug]', 'page'));
  safelyRevalidate(() => revalidatePath('/'));
  safelyRevalidate(() => revalidatePath('/blog'));
  safelyRevalidate(() => revalidatePath('/portfolio'));
  safelyRevalidate(() => revalidatePath('/sitemap.xml'));
  safelyRevalidate(() => revalidatePath('/robots.txt'));
}
