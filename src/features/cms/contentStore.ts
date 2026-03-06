import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { defaultContent } from './defaultContent';
import type { BlogPost, CmsContent, HomeBlock, LandingPage, PageId, SiteSettings } from './types';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');

const nowIso = () => new Date().toISOString();

const safeParse = (raw: string): CmsContent | null => {
  try {
    return JSON.parse(raw) as CmsContent;
  } catch {
    return null;
  }
};

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function normalizeSettings(input: unknown): SiteSettings {
  const defaults = structuredClone(defaultContent.settings);
  const source = isObject(input) ? input : {};

  const general = isObject(source.general) ? source.general : {};
  const writing = isObject(source.writing) ? source.writing : {};
  const reading = isObject(source.reading) ? source.reading : {};
  const discussion = isObject(source.discussion) ? source.discussion : {};
  const media = isObject(source.media) ? source.media : {};
  const permalinks = isObject(source.permalinks) ? source.permalinks : {};
  const seo = isObject(source.seo) ? source.seo : {};
  const sitemap = isObject(source.sitemap) ? source.sitemap : {};

  const next: SiteSettings = {
    ...defaults,
    ...source,
    general: { ...defaults.general, ...general },
    writing: {
      ...defaults.writing,
      ...writing,
      pingServices: Array.isArray(writing.pingServices)
        ? writing.pingServices.map((service) => String(service).trim()).filter(Boolean)
        : defaults.writing.pingServices
    },
    reading: { ...defaults.reading, ...reading },
    discussion: { ...defaults.discussion, ...discussion },
    media: { ...defaults.media, ...media },
    permalinks: { ...defaults.permalinks, ...permalinks },
    seo: { ...defaults.seo, ...seo },
    sitemap: { ...defaults.sitemap, ...sitemap }
  } as SiteSettings;

  // Bridge legacy keys and grouped settings.
  if (typeof source.siteName === 'string' && source.siteName.trim().length > 0) {
    next.general.siteName = source.siteName.trim();
  }
  if (typeof source.baseUrl === 'string' && source.baseUrl.trim().length > 0) {
    next.general.baseUrl = source.baseUrl.trim();
  }
  if (typeof source.defaultOgImage === 'string' && source.defaultOgImage.trim().length > 0) {
    next.seo.defaultOgImage = source.defaultOgImage.trim();
  }

  next.siteName = next.general.siteName;
  next.baseUrl = next.general.baseUrl;
  next.defaultOgImage = next.seo.defaultOgImage;

  return next;
}

const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const reservedPageSlugs = new Set(['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt']);

async function ensureDataFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf-8');
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(defaultContent, null, 2), 'utf-8');
  }
}

const normalizeHomeBlocks = (blocks: HomeBlock[] | undefined): HomeBlock[] | undefined => {
  if (!blocks) return undefined;
  return blocks.map((block, index) => ({
    ...block,
    id: block.id || `home-block-${index + 1}`
  }));
};

function mergeWithDefaults(content: CmsContent): CmsContent {
  return {
    settings: normalizeSettings(content.settings),
    pages: {
      ...structuredClone(defaultContent.pages),
      ...content.pages
    },
    blogPosts: Array.isArray(content.blogPosts) ? content.blogPosts : structuredClone(defaultContent.blogPosts)
  };
}

export async function readContent(): Promise<CmsContent> {
  await ensureDataFile();
  const raw = await readFile(DATA_FILE, 'utf-8');
  const parsed = safeParse(raw);
  if (!parsed) {
    await writeFile(DATA_FILE, JSON.stringify(defaultContent, null, 2), 'utf-8');
    return structuredClone(defaultContent);
  }

  const merged = mergeWithDefaults(parsed);
  const hasAllPages = Object.keys(defaultContent.pages).every(
    (id) => id in (parsed.pages as Record<string, unknown>)
  );

  if (!hasAllPages) {
    await writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  }

  return merged;
}

export async function writeContent(content: CmsContent): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
}

export async function getSettings() {
  const content = await readContent();
  return normalizeSettings(content.settings);
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  const content = await readContent();
  const next = normalizeSettings(settings);
  content.settings = next;
  await writeContent(content);
  return next;
}

export async function getPages() {
  const content = await readContent();
  return content.pages;
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  const content = await readContent();
  return content.pages[id] ?? null;
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  const content = await readContent();
  const candidateSlug =
    page.id === 'home' ? '' : normalizeSlug(page.seo.slug || page.id) || page.id;
  let slug = candidateSlug;
  if (reservedPageSlugs.has(slug)) {
    slug = `${slug}-${page.id}`;
  }
  const duplicate = Object.values(content.pages).find(
    (entry) => entry.id !== page.id && entry.seo.slug === slug
  );
  if (duplicate) {
    slug = `${slug}-${page.id}`;
  }
  const nextPage: LandingPage = {
    ...page,
    homeBlocks:
      page.id === 'home'
        ? normalizeHomeBlocks(page.homeBlocks ?? content.pages.home.homeBlocks ?? [])
        : page.homeBlocks,
    seo: {
      ...page.seo,
      slug
    },
    updatedAt: nowIso()
  };
  content.pages[page.id] = nextPage;
  await writeContent(content);
  return nextPage;
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const content = await readContent();
  const filtered = includeDrafts
    ? content.blogPosts
    : content.blogPosts.filter((post) => post.status === 'published');
  return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export type BlogQueryInput = {
  includeDrafts: boolean;
  q?: string;
  status?: 'all' | 'draft' | 'published';
  category?: string;
  dateSort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
};

export async function queryBlogPosts(input: BlogQueryInput) {
  const content = await readContent();
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
      content.blogPosts
        .flatMap((post) => post.tags)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0)
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  let posts = content.blogPosts.filter((post) => {
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

  posts = posts.sort((a, b) => {
    if (dateSort === 'oldest') return a.updatedAt > b.updatedAt ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const total = posts.length;
  const start = (page - 1) * pageSize;
  const paginated = posts.slice(start, start + pageSize);

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
  const content = await readContent();
  return content.blogPosts.find((post) => post.id === id) ?? null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const normalized = normalizeSlug(slug);
  const content = await readContent();
  return (
    content.blogPosts.find(
      (post) => post.seo.slug === normalized && post.status === 'published'
    ) ?? null
  );
}

const isSlugTaken = (content: CmsContent, slug: string, ignoreId?: string) => {
  return content.blogPosts.some((post) => post.seo.slug === slug && post.id !== ignoreId);
};

const uniquePostSlug = (content: CmsContent, title: string, requestedSlug?: string, ignoreId?: string) => {
  const source = requestedSlug && requestedSlug.length > 0 ? requestedSlug : title;
  const base = normalizeSlug(source) || 'post';
  if (!isSlugTaken(content, base, ignoreId)) return base;
  let i = 2;
  while (isSlugTaken(content, `${base}-${i}`, ignoreId)) {
    i += 1;
  }
  return `${base}-${i}`;
};

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  const content = await readContent();
  const id = crypto.randomUUID();
  const title = payload?.title?.trim() || 'Untitled post';
  const slug = uniquePostSlug(content, title, payload?.seo?.slug);
  const writing = normalizeSettings(content.settings).writing;
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
  content.blogPosts.unshift(post);
  await writeContent(content);
  return post;
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  const content = await readContent();
  const index = content.blogPosts.findIndex((post) => post.id === id);
  if (index === -1) return null;
  const slug = uniquePostSlug(content, payload.title, payload.seo.slug, id);
  const current = content.blogPosts[index];
  const next: BlogPost = {
    ...payload,
    id,
    seo: {
      ...payload.seo,
      slug
    },
    publishedAt:
      payload.status === 'published'
        ? current.publishedAt ?? nowIso()
        : payload.publishedAt ?? null,
    updatedAt: nowIso()
  };
  content.blogPosts[index] = next;
  await writeContent(content);
  return next;
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const content = await readContent();
  const nextPosts = content.blogPosts.filter((post) => post.id !== id);
  if (nextPosts.length === content.blogPosts.length) return false;
  content.blogPosts = nextPosts;
  await writeContent(content);
  return true;
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  const content = await readContent();
  const index = content.blogPosts.findIndex((post) => post.id === id);
  if (index === -1) return null;
  const existing = content.blogPosts[index];
  const next: BlogPost = {
    ...existing,
    status,
    publishedAt: status === 'published' ? existing.publishedAt ?? nowIso() : null,
    updatedAt: nowIso()
  };
  content.blogPosts[index] = next;
  await writeContent(content);
  return next;
}
