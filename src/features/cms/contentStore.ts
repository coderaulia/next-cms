import { env } from '@/services/env';

import * as dbCollectionsStore from './dbCollectionsStore';
import * as dbStore from './dbStore';
import type { BlogPost, Category, CmsContent, LandingPage, MediaAsset, PageId, SiteSettings } from './types';
import type { BlogQueryInput } from './storeTypes';

const isDatabaseMode = () => Boolean(env.databaseUrl);

const loadFileStore = () => import('./fileStore');
const loadFileCollectionsStore = () => import('./fileCollectionsStore');

export async function readContent(): Promise<CmsContent> {
  if (!isDatabaseMode()) {
    return (await loadFileStore()).readContent();
  }

  const [settings, pages, blogPosts, categories, mediaAssets] = await Promise.all([
    dbStore.getSettings(),
    dbStore.getPages(),
    dbStore.getBlogPosts(true),
    dbCollectionsStore.getCategories(),
    dbCollectionsStore.getMediaAssets()
  ]);

  return {
    settings,
    pages,
    blogPosts,
    categories,
    mediaAssets
  };
}

export async function writeContent(content: CmsContent): Promise<void> {
  if (!isDatabaseMode()) {
    await (await loadFileStore()).writeContent(content);
    return;
  }

  await dbStore.replaceAllCmsContent(content);
}

export async function getSettings() {
  return isDatabaseMode() ? dbStore.getSettings() : (await loadFileStore()).getSettings();
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  return isDatabaseMode() ? dbStore.updateSettings(settings) : (await loadFileStore()).updateSettings(settings);
}

export async function getPages() {
  return isDatabaseMode() ? dbStore.getPages() : (await loadFileStore()).getPages();
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  return isDatabaseMode() ? dbStore.getPageById(id) : (await loadFileStore()).getPageById(id);
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  return isDatabaseMode() ? dbStore.upsertPage(page) : (await loadFileStore()).upsertPage(page);
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  return isDatabaseMode() ? dbStore.getBlogPosts(includeDrafts) : (await loadFileStore()).getBlogPosts(includeDrafts);
}

export type { BlogQueryInput } from './storeTypes';

export async function queryBlogPosts(input: BlogQueryInput) {
  return isDatabaseMode() ? dbStore.queryBlogPosts(input) : (await loadFileStore()).queryBlogPosts(input);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.getBlogPostById(id) : (await loadFileStore()).getBlogPostById(id);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.getBlogPostBySlug(slug) : (await loadFileStore()).getBlogPostBySlug(slug);
}

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  return isDatabaseMode() ? dbStore.createBlogPost(payload) : (await loadFileStore()).createBlogPost(payload);
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.updateBlogPost(id, payload) : (await loadFileStore()).updateBlogPost(id, payload);
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  return isDatabaseMode() ? dbStore.deleteBlogPost(id) : (await loadFileStore()).deleteBlogPost(id);
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.setPostStatus(id, status) : (await loadFileStore()).setPostStatus(id, status);
}

export async function getCategories(): Promise<Category[]> {
  return isDatabaseMode()
    ? dbCollectionsStore.getCategories()
    : (await loadFileCollectionsStore()).getCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return isDatabaseMode()
    ? dbCollectionsStore.getCategoryById(id)
    : (await loadFileCollectionsStore()).getCategoryById(id);
}

export async function createCategory(payload: Category): Promise<Category> {
  return isDatabaseMode()
    ? dbCollectionsStore.createCategory(payload)
    : (await loadFileCollectionsStore()).createCategory(payload);
}

export async function updateCategory(id: string, payload: Category): Promise<Category | null> {
  return isDatabaseMode()
    ? dbCollectionsStore.updateCategory(id, payload)
    : (await loadFileCollectionsStore()).updateCategory(id, payload);
}

export async function deleteCategory(id: string): Promise<boolean> {
  return isDatabaseMode()
    ? dbCollectionsStore.deleteCategory(id)
    : (await loadFileCollectionsStore()).deleteCategory(id);
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  return isDatabaseMode()
    ? dbCollectionsStore.getMediaAssets()
    : (await loadFileCollectionsStore()).getMediaAssets();
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  return isDatabaseMode()
    ? dbCollectionsStore.getMediaAssetById(id)
    : (await loadFileCollectionsStore()).getMediaAssetById(id);
}

export async function createMediaAsset(payload: MediaAsset): Promise<MediaAsset> {
  return isDatabaseMode()
    ? dbCollectionsStore.createMediaAsset(payload)
    : (await loadFileCollectionsStore()).createMediaAsset(payload);
}

export async function updateMediaAsset(id: string, payload: MediaAsset): Promise<MediaAsset | null> {
  return isDatabaseMode()
    ? dbCollectionsStore.updateMediaAsset(id, payload)
    : (await loadFileCollectionsStore()).updateMediaAsset(id, payload);
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  return isDatabaseMode()
    ? dbCollectionsStore.deleteMediaAsset(id)
    : (await loadFileCollectionsStore()).deleteMediaAsset(id);
}
