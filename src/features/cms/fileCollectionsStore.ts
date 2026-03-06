import { defaultContent } from './defaultContent';
import { readContent, writeContent } from './fileStore';
import {
  clearDefaultCategorySetting,
  ensureCategoryCoverage,
  normalizeCategoryRecord,
  normalizeMediaAssetRecord,
  removeCategorySlugFromPosts,
  replaceCategorySlugInPosts,
  sortMediaAssets,
  uniqueCategorySlug,
  updateDefaultCategorySetting
} from './collectionShared';
import { normalizeSlug } from './storeShared';
import type { Category, MediaAsset } from './types';

async function syncFileCategories() {
  const content = await readContent();
  const categories = ensureCategoryCoverage(content.categories, content.blogPosts);
  const changed =
    categories.length !== content.categories.length ||
    categories.some((category, index) => content.categories[index]?.slug !== category.slug);

  if (changed) {
    content.categories = categories;
    await writeContent(content);
  }

  return { content, categories };
}

export async function getCategories(): Promise<Category[]> {
  const { categories } = await syncFileCategories();
  return categories;
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const categories = await getCategories();
  return categories.find((category) => category.id === id) ?? null;
}

export async function createCategory(payload: Category): Promise<Category> {
  const { content, categories } = await syncFileCategories();
  const slug = uniqueCategorySlug(categories, payload.name, payload.slug);
  const next = normalizeCategoryRecord({ ...payload, slug });
  content.categories = [...categories, next];
  await writeContent(content);
  return next;
}

export async function updateCategory(id: string, payload: Category): Promise<Category | null> {
  const { content, categories } = await syncFileCategories();
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

  content.categories = categories.map((category) => (category.id === id ? next : category));

  const previousSlug = normalizeSlug(existing.slug);
  if (previousSlug !== next.slug) {
    content.blogPosts = replaceCategorySlugInPosts(content.blogPosts, previousSlug, next.slug);
    content.settings = updateDefaultCategorySetting(content.settings, previousSlug, next.slug);
  }

  await writeContent(content);
  return next;
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { content, categories } = await syncFileCategories();
  const existing = categories.find((category) => category.id === id);
  if (!existing) return false;

  const slug = normalizeSlug(existing.slug);
  content.categories = categories.filter((category) => category.id !== id);
  content.blogPosts = removeCategorySlugFromPosts(content.blogPosts, slug);
  content.settings = clearDefaultCategorySetting(content.settings, slug);
  await writeContent(content);
  return true;
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const content = await readContent();
  const mediaAssets = Array.isArray(content.mediaAssets) ? content.mediaAssets : defaultContent.mediaAssets;
  return sortMediaAssets(mediaAssets);
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  const mediaAssets = await getMediaAssets();
  return mediaAssets.find((asset) => asset.id === id) ?? null;
}

export async function createMediaAsset(payload: MediaAsset): Promise<MediaAsset> {
  const content = await readContent();
  const next = normalizeMediaAssetRecord(payload);
  content.mediaAssets = [next, ...(Array.isArray(content.mediaAssets) ? content.mediaAssets : [])];
  await writeContent(content);
  return next;
}

export async function updateMediaAsset(id: string, payload: MediaAsset): Promise<MediaAsset | null> {
  const content = await readContent();
  const currentAssets = Array.isArray(content.mediaAssets) ? content.mediaAssets : defaultContent.mediaAssets;
  const existing = currentAssets.find((asset) => asset.id === id);
  if (!existing) return null;

  const next = normalizeMediaAssetRecord({
    ...existing,
    ...payload,
    id,
    createdAt: existing.createdAt
  });

  content.mediaAssets = currentAssets.map((asset) => (asset.id === id ? next : asset));
  await writeContent(content);
  return next;
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  const content = await readContent();
  const currentAssets = Array.isArray(content.mediaAssets) ? content.mediaAssets : defaultContent.mediaAssets;
  const nextAssets = currentAssets.filter((asset) => asset.id !== id);
  if (nextAssets.length === currentAssets.length) return false;
  content.mediaAssets = nextAssets;
  await writeContent(content);
  return true;
}
