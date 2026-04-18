import { defaultContent } from './defaultContent';
import { captureContentRevision } from './contentRevisions';
import { readRawCmsContent, writeRawCmsContent } from './storeAdapter';
import type {
  BlogPost,
  Category,
  CmsContent,
  LandingPage,
  MediaAsset,
  PageId
} from './types';
import {
  validateBlogPost,
  validateCategory,
  validateLandingPage,
  validateMediaAsset,
  validatePortfolioProject,
  validateSiteSettings
} from './validators';
import { reservedPageSlugs } from './storeShared';

export const CMS_JSON_SCHEMA_VERSION = 1;

export type CmsImportCollection = 'pages' | 'blogPosts' | 'portfolioProjects' | 'settings' | 'fullSite';
export type CmsImportMode = 'merge' | 'replace';

export type CmsCollectionExport = {
  collection: CmsImportCollection;
  exportedAt: string;
  schemaVersion: number;
  data: unknown;
};

export type CmsImportResult = {
  collection: CmsImportCollection;
  mode: CmsImportMode;
  importedCount: number;
  totals: {
    pages: number;
    blogPosts: number;
    portfolioProjects: number;
    categories: number;
    mediaAssets: number;
  };
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function cloneContent(content: CmsContent): CmsContent {
  return structuredClone(content);
}

function nowIso() {
  return new Date().toISOString();
}

function unwrapEnvelope(payload: unknown) {
  if (!isRecord(payload)) return payload;
  if ('data' in payload) {
    return payload.data;
  }
  return payload;
}

function extractCollectionSource(payload: unknown, collection: CmsImportCollection) {
  const unwrapped = unwrapEnvelope(payload);
  if (!isRecord(unwrapped)) {
    return unwrapped;
  }

  if (collection === 'pages' && 'pages' in unwrapped) return unwrapped.pages;
  if (collection === 'blogPosts' && 'blogPosts' in unwrapped) return unwrapped.blogPosts;
  if (collection === 'portfolioProjects' && 'portfolioProjects' in unwrapped) return unwrapped.portfolioProjects;
  if (collection === 'settings' && 'settings' in unwrapped) return unwrapped.settings;

  return unwrapped;
}

function mergeById<T extends { id: string }>(current: T[], imported: T[]) {
  const next = new Map(current.map((item) => [item.id, item]));
  for (const item of imported) {
    next.set(item.id, item);
  }
  return Array.from(next.values());
}

function normalizePagesInput(payload: unknown) {
  const source = extractCollectionSource(payload, 'pages');
  const pages: Partial<Record<PageId, LandingPage>> = {};

  const candidates = Array.isArray(source)
    ? source
    : isRecord(source)
      ? Object.values(source)
      : [];

  if (candidates.length === 0) {
    throw new Error('Pages import must contain an array of pages or a pages object keyed by page ID.');
  }

  for (const candidate of candidates) {
    const page = validateLandingPage(candidate);
    if (!page) {
      throw new Error('Pages import contains an invalid page payload.');
    }
    pages[page.id] = page;
  }

  return pages;
}

function normalizeBlogPostsInput(payload: unknown) {
  const source = extractCollectionSource(payload, 'blogPosts');
  if (!Array.isArray(source)) {
    throw new Error('Posts import must contain an array of blog posts.');
  }

  return source.map((candidate) => {
    const post = validateBlogPost(candidate);
    if (!post) {
      throw new Error('Posts import contains an invalid blog post payload.');
    }

    return {
      ...post,
      id: post.id || crypto.randomUUID()
    } satisfies BlogPost;
  });
}

function normalizePortfolioProjectsInput(payload: unknown) {
  const source = extractCollectionSource(payload, 'portfolioProjects');
  if (!Array.isArray(source)) {
    throw new Error('Portfolio import must contain an array of projects.');
  }

  return source.map((candidate) => {
    const project = validatePortfolioProject(candidate);
    if (!project) {
      throw new Error('Portfolio import contains an invalid project payload.');
    }
    return project;
  });
}

function normalizeSettingsInput(payload: unknown) {
  const source = extractCollectionSource(payload, 'settings');
  const settings = validateSiteSettings(source);
  if (!settings) {
    throw new Error('Settings import contains an invalid site settings payload.');
  }
  return settings;
}

function normalizeCategoriesInput(payload: unknown) {
  if (!Array.isArray(payload)) {
    throw new Error('Categories import must contain an array of categories.');
  }

  return payload.map((candidate) => {
    const category = validateCategory(candidate);
    if (!category) {
      throw new Error('Full-site import contains an invalid category payload.');
    }
    return category as Category;
  });
}

function normalizeMediaAssetsInput(payload: unknown) {
  if (!Array.isArray(payload)) {
    throw new Error('Media import must contain an array of media assets.');
  }

  return payload.map((candidate) => {
    const media = validateMediaAsset(candidate);
    if (!media) {
      throw new Error('Full-site import contains an invalid media asset payload.');
    }
    return media as MediaAsset;
  });
}

function assertFullSiteReplaceShape(source: Record<string, unknown>) {
  const requiredKeys = ['settings', 'pages', 'blogPosts', 'portfolioProjects', 'categories', 'mediaAssets'];
  const missing = requiredKeys.filter((key) => !(key in source));
  if (missing.length > 0) {
    throw new Error(
      `Full-site replace requires a complete CMS backup payload. Missing: ${missing.join(', ')}.`
    );
  }
}

function normalizeFullSiteInput(
  payload: unknown,
  baseContent: CmsContent,
  mode: CmsImportMode
): CmsContent {
  const source = extractCollectionSource(payload, 'fullSite');
  if (!isRecord(source)) {
    throw new Error('Full-site import must contain a CMS content object.');
  }
  if (mode === 'replace') {
    assertFullSiteReplaceShape(source);
  }

  const next = cloneContent(baseContent);

  if ('settings' in source) {
    next.settings = normalizeSettingsInput({ settings: source.settings });
  }
  if ('pages' in source) {
    next.pages = normalizePagesInput({ pages: source.pages }) as CmsContent['pages'];
  }
  if ('blogPosts' in source) {
    next.blogPosts = normalizeBlogPostsInput({ blogPosts: source.blogPosts });
  }
  if ('portfolioProjects' in source) {
    next.portfolioProjects = normalizePortfolioProjectsInput({ portfolioProjects: source.portfolioProjects });
  }
  if ('categories' in source) {
    next.categories = normalizeCategoriesInput(source.categories);
  }
  if ('mediaAssets' in source) {
    next.mediaAssets = normalizeMediaAssetsInput(source.mediaAssets);
  }

  return next;
}

function totals(content: CmsContent) {
  return {
    pages: Object.keys(content.pages).length,
    blogPosts: content.blogPosts.length,
    portfolioProjects: content.portfolioProjects.length,
    categories: content.categories.length,
    mediaAssets: content.mediaAssets.length
  };
}

function assertUniqueLabels(values: string[], label: string) {
  const seen = new Set<string>();
  const duplicates = new Set<string>();

  for (const value of values) {
    const normalized = value.trim().toLowerCase();
    if (!normalized) continue;
    if (seen.has(normalized)) {
      duplicates.add(normalized);
      continue;
    }
    seen.add(normalized);
  }

  if (duplicates.size > 0) {
    throw new Error(`${label} must be unique. Duplicate values: ${Array.from(duplicates).join(', ')}.`);
  }
}

function assertImportSafety(content: CmsContent) {
  const pageSlugs = Object.values(content.pages).map((page) => page.seo.slug.trim());
  const reserved = pageSlugs.filter((slug) => slug && reservedPageSlugs.has(slug));
  if (reserved.length > 0) {
    throw new Error(`Pages import uses reserved slugs: ${Array.from(new Set(reserved)).join(', ')}.`);
  }

  assertUniqueLabels(pageSlugs, 'Page slugs');
  assertUniqueLabels(content.blogPosts.map((post) => post.seo.slug.trim()), 'Blog slugs');
  assertUniqueLabels(content.portfolioProjects.map((project) => project.seo.slug.trim()), 'Portfolio slugs');
}

function countImportedCollection(collection: CmsImportCollection, imported: unknown) {
  if (collection === 'pages' && isRecord(imported)) return Object.keys(imported).length;
  if ((collection === 'blogPosts' || collection === 'portfolioProjects') && Array.isArray(imported)) return imported.length;
  if (collection === 'settings') return 1;
  if (collection === 'fullSite' && isRecord(imported)) {
    let count = 0;
    if ('settings' in imported) count += 1;
    if ('pages' in imported && isRecord(imported.pages)) count += Object.keys(imported.pages).length;
    if ('blogPosts' in imported && Array.isArray(imported.blogPosts)) count += imported.blogPosts.length;
    if ('portfolioProjects' in imported && Array.isArray(imported.portfolioProjects)) {
      count += imported.portfolioProjects.length;
    }
    if ('categories' in imported && Array.isArray(imported.categories)) count += imported.categories.length;
    if ('mediaAssets' in imported && Array.isArray(imported.mediaAssets)) count += imported.mediaAssets.length;
    return count;
  }
  return 0;
}

export async function exportCmsJson(collection: CmsImportCollection): Promise<CmsCollectionExport> {
  const content = await readRawCmsContent();

  const data =
    collection === 'pages'
      ? content.pages
      : collection === 'blogPosts'
        ? content.blogPosts
        : collection === 'portfolioProjects'
          ? content.portfolioProjects
          : collection === 'settings'
            ? content.settings
            : content;

  return {
    collection,
    exportedAt: nowIso(),
    schemaVersion: CMS_JSON_SCHEMA_VERSION,
    data
  };
}

export async function importCmsJson(
  collection: CmsImportCollection,
  payload: unknown,
  mode: CmsImportMode
): Promise<CmsImportResult> {
  const current = await readRawCmsContent();
  const replaceBase = cloneContent(defaultContent);
  let next = cloneContent(current);
  let importedCount = 0;

  if (collection === 'pages') {
    const importedPages = normalizePagesInput(payload);
    importedCount = countImportedCollection(collection, importedPages);
    next.pages = (mode === 'replace' ? importedPages : { ...current.pages, ...importedPages }) as CmsContent['pages'];
  } else if (collection === 'blogPosts') {
    const importedPosts = normalizeBlogPostsInput(payload);
    importedCount = countImportedCollection(collection, importedPosts);
    next.blogPosts = mode === 'replace' ? importedPosts : mergeById(current.blogPosts, importedPosts);
  } else if (collection === 'portfolioProjects') {
    const importedProjects = normalizePortfolioProjectsInput(payload);
    importedCount = countImportedCollection(collection, importedProjects);
    next.portfolioProjects =
      mode === 'replace' ? importedProjects : mergeById(current.portfolioProjects, importedProjects);
  } else if (collection === 'settings') {
    next.settings = normalizeSettingsInput(payload);
    importedCount = 1;
  } else {
    const baseContent = mode === 'replace' ? replaceBase : current;
    next = normalizeFullSiteInput(payload, baseContent, mode);
    importedCount = countImportedCollection(collection, unwrapEnvelope(payload));
  }

  assertImportSafety(next);
  await captureContentRevision({
    entityType: 'full_site',
    entityId: 'cms',
    label: `Backup before ${collection} ${mode} import`,
    payload: current
  });
  await writeRawCmsContent(next);

  return {
    collection,
    mode,
    importedCount,
    totals: totals(next)
  };
}
