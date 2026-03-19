import type { BlogPost, Category, MediaAsset, SiteSettings } from './types';

import { nowIso, normalizeSlug } from './storeShared';

function slugToName(slug: string) {
  return slug
    .split('-')
    .filter(Boolean)
    .map((part) => part[0].toUpperCase() + part.slice(1))
    .join(' ');
}

export function sortCategories(categories: Category[]) {
  return [...categories].sort((a, b) => a.name.localeCompare(b.name));
}

export function sortMediaAssets(mediaAssets: MediaAsset[]) {
  return [...mediaAssets].sort((a, b) => (a.updatedAt < b.updatedAt ? 1 : -1));
}

export function normalizeCategoryRecord(input: Partial<Category> & Pick<Category, 'name' | 'slug'>): Category {
  const name = input.name.trim();
  const slug = normalizeSlug(input.slug || input.name) || 'category';
  const timestamp = nowIso();

  return {
    id: input.id?.trim() || crypto.randomUUID(),
    name,
    slug,
    description: input.description?.trim() || '',
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };
}

export function normalizeMediaAssetRecord(
  input: Partial<MediaAsset> & Pick<MediaAsset, 'title' | 'url'>
): MediaAsset {
  const timestamp = nowIso();
  const asNullableNumber = (value: number | null | undefined) =>
    typeof value === 'number' && Number.isFinite(value) ? Math.round(value) : null;

  return {
    id: input.id?.trim() || crypto.randomUUID(),
    title: input.title.trim(),
    url: input.url.trim(),
    altText: input.altText?.trim() || '',
    mimeType: input.mimeType?.trim() || 'image/png',
    width: asNullableNumber(input.width),
    height: asNullableNumber(input.height),
    sizeBytes: asNullableNumber(input.sizeBytes),
    checksumSha256: input.checksumSha256?.trim() || null,
    storageProvider: input.storageProvider?.trim() || 'external-url',
    storageKey: input.storageKey?.trim() || null,
    createdAt: input.createdAt || timestamp,
    updatedAt: timestamp
  };
}

export function uniqueCategorySlug(categories: Category[], requestedName: string, requestedSlug?: string, ignoreId?: string) {
  const base = normalizeSlug(requestedSlug || requestedName) || 'category';
  let slug = base;
  let index = 2;

  while (categories.some((category) => category.slug === slug && category.id !== ignoreId)) {
    slug = `${base}-${index}`;
    index += 1;
  }

  return slug;
}

export function ensureCategoryCoverage(categories: Category[], posts: BlogPost[]) {
  const bySlug = new Map(categories.map((category) => [category.slug, category]));

  for (const slug of new Set(posts.flatMap((post) => post.tags.map((tag) => normalizeSlug(tag)).filter(Boolean)))) {
    if (!bySlug.has(slug)) {
      bySlug.set(
        slug,
        normalizeCategoryRecord({
          id: `category-${slug}`,
          name: slugToName(slug),
          slug,
          description: ''
        })
      );
    }
  }

  return sortCategories(Array.from(bySlug.values()));
}

export function replaceCategorySlugInPosts(posts: BlogPost[], previousSlug: string, nextSlug: string) {
  return posts.map((post) => ({
    ...post,
    tags: post.tags.map((tag) => (normalizeSlug(tag) === previousSlug ? nextSlug : normalizeSlug(tag) || tag))
  }));
}

export function removeCategorySlugFromPosts(posts: BlogPost[], slug: string) {
  return posts.map((post) => ({
    ...post,
    tags: post.tags.filter((tag) => normalizeSlug(tag) !== slug)
  }));
}

export function updateDefaultCategorySetting(settings: SiteSettings, previousSlug: string, nextSlug: string) {
  if (normalizeSlug(settings.writing.defaultPostCategory) !== previousSlug) {
    return settings;
  }

  return {
    ...settings,
    writing: {
      ...settings.writing,
      defaultPostCategory: nextSlug
    }
  };
}

export function clearDefaultCategorySetting(settings: SiteSettings, slug: string) {
  if (normalizeSlug(settings.writing.defaultPostCategory) !== slug) {
    return settings;
  }

  return {
    ...settings,
    writing: {
      ...settings.writing,
      defaultPostCategory: 'general'
    }
  };
}
