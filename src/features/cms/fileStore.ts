import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

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

import { defaultContent } from './defaultContent';

const DATA_DIR = path.join(process.cwd(), 'data');
const DATA_FILE = path.join(DATA_DIR, 'content.json');

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
  const nextPage = normalizePageForWrite(page, Object.values(content.pages));
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

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
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
      noIndex: payload?.seo?.noIndex ?? false,
      keywords: payload?.seo?.keywords ?? []
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


