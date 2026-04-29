import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

import { defaultContent } from './defaultContent';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');

// In-process cache to avoid reading the entire file on every operation
let cachedContent: CmsContent | null = null;
let cacheTimestamp: number = 0;
const CACHE_TTL = 5000; // 5 seconds TTL for cache

// In-process write lock: serializes all mutations through writeContent to prevent
// concurrent read-modify-write races that silently clobber data (last-writer-wins).
let writeLock: Promise<void> = Promise.resolve();

async function withWriteLock<T>(fn: () => Promise<T>): Promise<T> {
  const prev = writeLock;
  let resolveLock!: () => void;
  writeLock = new Promise<void>((resolve) => { resolveLock = resolve; });
  await prev;
  try {
    return await fn();
  } finally {
    resolveLock();
  }
}

const safeParse = (raw: string): CmsContent | null => {
  try {
    return JSON.parse(raw) as CmsContent;
  } catch {
    return null;
  }
};

async function ensureDataFile(): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  try {
    await readFile(DATA_FILE, 'utf-8');
  } catch {
    await writeFile(DATA_FILE, JSON.stringify(defaultContent, null, 2), 'utf-8');
  }
}

export async function readContent(): Promise<CmsContent> {
  const now = Date.now();
  if (cachedContent && (now - cacheTimestamp) < CACHE_TTL) {
    return structuredClone(cachedContent);
  }

  await ensureDataFile();
  const raw = await readFile(DATA_FILE, 'utf-8');
  const parsed = safeParse(raw);
  if (!parsed) {
    await writeFile(DATA_FILE, JSON.stringify(defaultContent, null, 2), 'utf-8');
    cachedContent = structuredClone(defaultContent);
    cacheTimestamp = now;
    return cachedContent;
  }

  const merged = mergeWithDefaults(parsed);
  const hasAllPages = Object.keys(defaultContent.pages).every(
    (id) => id in (parsed.pages as Record<string, unknown>)
  );

  if (!hasAllPages) {
    await writeFile(DATA_FILE, JSON.stringify(merged, null, 2), 'utf-8');
  }

  cachedContent = merged;
  cacheTimestamp = now;
  return structuredClone(merged);
}

async function writeFileUnsafe(content: CmsContent): Promise<void> {
  await ensureDataFile();
  await writeFile(DATA_FILE, JSON.stringify(content, null, 2), 'utf-8');
  cachedContent = structuredClone(content);
  cacheTimestamp = Date.now();
}

export async function writeContent(content: CmsContent): Promise<void> {
  return withWriteLock(() => writeFileUnsafe(content));
}

export async function getSettings() {
  const content = await readContent();
  return normalizeSettings(content.settings);
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  return withWriteLock(async () => {
    const content = await readContent();
    const next = normalizeSettings(settings);
    content.settings = next;
    await writeFileUnsafe(content);
    return next;
  });
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
  return withWriteLock(async () => {
    const content = await readContent();
    const nextPage = normalizePageForWrite(page, Object.values(content.pages));
    content.pages[page.id] = nextPage;
    await writeFileUnsafe(content);
    return nextPage;
  });
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const content = await readContent();
  const filtered = includeDrafts
    ? content.blogPosts
    : content.blogPosts.filter((post) => isBlogPostLive(post));
  return filtered.sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

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

  const categories = content.categories.map((c) => c.name).sort((a, b) => (a > b ? 1 : -1));
  const categoryMap = new Map(content.categories.map((c) => [c.id, c]));
  const categorySlugMap = new Map(content.categories.map((c) => [c.slug.toLowerCase(), c]));

  let posts = content.blogPosts.filter((post) => {
    if (!input.includeDrafts && !isBlogPostLive(post)) return false;
    if (status !== 'all' && post.status !== status) return false;
    if (query.length > 0) {
      const haystack = `${post.title} ${post.author}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    if (category.length > 0) {
      // 1. Try matching by categoryId
      const postCategory = post.categoryId ? categoryMap.get(post.categoryId) : null;
      if (postCategory && (postCategory.name.toLowerCase() === category || postCategory.slug.toLowerCase() === category)) {
        return true;
      }

      // 2. Try matching by slug
      const targetCategory = categorySlugMap.get(category);
      if (targetCategory && post.categoryId === targetCategory.id) {
        return true;
      }

      // 3. Fallback to tags for backward compatibility
      const hasCategoryTag = post.tags.some((tag) => tag.toLowerCase() === category);
      if (!hasCategoryTag) return false;
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
      (post) => post.seo.slug === normalized && isBlogPostLive(post)
    ) ?? null
  );
}

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  return withWriteLock(async () => {
    const content = await readContent();
    const id = crypto.randomUUID();
    const title = payload?.title?.trim() || 'Untitled post';
    const slug = uniquePostSlug(content.blogPosts, title, payload?.seo?.slug);
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
      categoryId: payload?.categoryId ?? null,
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
    content.blogPosts.unshift(post);
    await writeFileUnsafe(content);
    return post;
  });
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  return withWriteLock(async () => {
    const content = await readContent();
    const index = content.blogPosts.findIndex((post) => post.id === id);
    if (index === -1) return null;
    const slug = uniquePostSlug(content.blogPosts, payload.title, payload.seo.slug, id);
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
    await writeFileUnsafe(content);
    return next;
  });
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const content = await readContent();
    const nextPosts = content.blogPosts.filter((post) => post.id !== id);
    if (nextPosts.length === content.blogPosts.length) return false;
    content.blogPosts = nextPosts;
    await writeFileUnsafe(content);
    return true;
  });
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  return withWriteLock(async () => {
    const content = await readContent();
    const index = content.blogPosts.findIndex((post) => post.id === id);
    if (index === -1) return null;
    const existing = content.blogPosts[index];
    const next: BlogPost = {
      ...existing,
      status,
      publishedAt: status === 'published' ? existing.publishedAt ?? nowIso() : null,
      scheduledPublishAt: status === 'published' ? null : existing.scheduledPublishAt ?? null,
      scheduledUnpublishAt: status === 'draft' ? null : existing.scheduledUnpublishAt ?? null,
      updatedAt: nowIso()
    };
    content.blogPosts[index] = next;
    await writeFileUnsafe(content);
    return next;
  });
}

export async function getPortfolioProjects(includeDrafts = false): Promise<PortfolioProject[]> {
  const content = await readContent();
  const filtered = includeDrafts
    ? content.portfolioProjects
    : content.portfolioProjects.filter((project) => isPortfolioProjectLive(project));

  return filtered.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });
}

export async function queryPortfolioProjects(input: PortfolioQueryInput) {
  const content = await readContent();
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
      content.portfolioProjects
        .flatMap((project) => project.tags)
        .map((entry) => entry.trim())
        .filter((entry) => entry.length > 0)
    )
  ).sort((a, b) => (a > b ? 1 : -1));

  let projects = content.portfolioProjects.filter((project) => {
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

  projects = projects.sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    if (dateSort === 'oldest') return a.updatedAt > b.updatedAt ? 1 : -1;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const total = projects.length;
  const start = (page - 1) * pageSize;
  const paginated = projects.slice(start, start + pageSize);

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
  const content = await readContent();
  return content.portfolioProjects.find((project) => project.id === id) ?? null;
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const normalized = normalizeSlug(slug);
  const content = await readContent();
  return (
    content.portfolioProjects.find(
      (project) => project.seo.slug === normalized && isPortfolioProjectLive(project)
    ) ?? null
  );
}

export async function createPortfolioProject(
  payload?: Partial<PortfolioProject>
): Promise<PortfolioProject> {
  return withWriteLock(async () => {
    const content = await readContent();
    const id = crypto.randomUUID();
    const title = payload?.title?.trim() || 'Untitled project';
    const slug = uniquePortfolioSlug(content.portfolioProjects, title, payload?.seo?.slug);
    const requestedStatus = payload?.status;
    const status = requestedStatus ?? 'draft';
    const maxSort = content.portfolioProjects.reduce((acc, project) => Math.max(acc, project.sortOrder), 0);

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

    content.portfolioProjects.unshift(project);
    await writeFileUnsafe(content);
    return project;
  });
}

export async function updatePortfolioProject(
  id: string,
  payload: PortfolioProject
): Promise<PortfolioProject | null> {
  return withWriteLock(async () => {
    const content = await readContent();
    const index = content.portfolioProjects.findIndex((project) => project.id === id);
    if (index === -1) return null;

    const slug = uniquePortfolioSlug(content.portfolioProjects, payload.title, payload.seo.slug, id);
    const current = content.portfolioProjects[index];

    const next: PortfolioProject = {
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

    content.portfolioProjects[index] = next;
    await writeFileUnsafe(content);
    return next;
  });
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  return withWriteLock(async () => {
    const content = await readContent();
    const next = content.portfolioProjects.filter((project) => project.id !== id);
    if (next.length === content.portfolioProjects.length) return false;

    content.portfolioProjects = next;
    await writeFileUnsafe(content);
    return true;
  });
}

export async function setPortfolioProjectStatus(
  id: string,
  status: 'draft' | 'published'
): Promise<PortfolioProject | null> {
  return withWriteLock(async () => {
    const content = await readContent();
    const index = content.portfolioProjects.findIndex((project) => project.id === id);
    if (index === -1) return null;

    const existing = content.portfolioProjects[index];
    const next: PortfolioProject = {
      ...existing,
      status,
      publishedAt: status === 'published' ? existing.publishedAt ?? nowIso() : null,
      scheduledPublishAt: status === 'published' ? null : existing.scheduledPublishAt ?? null,
      scheduledUnpublishAt: status === 'draft' ? null : existing.scheduledUnpublishAt ?? null,
      updatedAt: nowIso()
    };

    content.portfolioProjects[index] = next;
    await writeFileUnsafe(content);
    return next;
  });
}
