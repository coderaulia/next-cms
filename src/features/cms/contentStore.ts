import { env } from '@/services/env';

import * as dbCollectionsStore from './dbCollectionsStore';
import * as dbStore from './dbStore';
import * as fileCollectionsStore from './fileCollectionsStore';
import * as fileStore from './fileStore';
import type { BlogPost, Category, CmsContent, LandingPage, MediaAsset, PageId, SiteSettings } from './types';
import type { BlogQueryInput } from './storeTypes';

const isDatabaseMode = () => Boolean(env.databaseUrl);

export async function readContent(): Promise<CmsContent> {
  if (!isDatabaseMode()) {
    return fileStore.readContent();
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
    await fileStore.writeContent(content);
    return;
  }

  await dbStore.replaceAllCmsContent(content);
}

export async function getSettings() {
  return isDatabaseMode() ? dbStore.getSettings() : fileStore.getSettings();
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  return isDatabaseMode() ? dbStore.updateSettings(settings) : fileStore.updateSettings(settings);
}

export async function getPages() {
  return isDatabaseMode() ? dbStore.getPages() : fileStore.getPages();
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  return isDatabaseMode() ? dbStore.getPageById(id) : fileStore.getPageById(id);
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  return isDatabaseMode() ? dbStore.upsertPage(page) : fileStore.upsertPage(page);
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  return isDatabaseMode() ? dbStore.getBlogPosts(includeDrafts) : fileStore.getBlogPosts(includeDrafts);
}

export type { BlogQueryInput } from './storeTypes';

export async function queryBlogPosts(input: BlogQueryInput) {
  return isDatabaseMode() ? dbStore.queryBlogPosts(input) : fileStore.queryBlogPosts(input);
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.getBlogPostById(id) : fileStore.getBlogPostById(id);
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.getBlogPostBySlug(slug) : fileStore.getBlogPostBySlug(slug);
}

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  return isDatabaseMode() ? dbStore.createBlogPost(payload) : fileStore.createBlogPost(payload);
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.updateBlogPost(id, payload) : fileStore.updateBlogPost(id, payload);
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  return isDatabaseMode() ? dbStore.deleteBlogPost(id) : fileStore.deleteBlogPost(id);
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  return isDatabaseMode() ? dbStore.setPostStatus(id, status) : fileStore.setPostStatus(id, status);
}


export async function getCategories(): Promise<Category[]> {
  return isDatabaseMode() ? dbCollectionsStore.getCategories() : fileCollectionsStore.getCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  return isDatabaseMode() ? dbCollectionsStore.getCategoryById(id) : fileCollectionsStore.getCategoryById(id);
}

export async function createCategory(payload: Category): Promise<Category> {
  return isDatabaseMode() ? dbCollectionsStore.createCategory(payload) : fileCollectionsStore.createCategory(payload);
}

export async function updateCategory(id: string, payload: Category): Promise<Category | null> {
  return isDatabaseMode() ? dbCollectionsStore.updateCategory(id, payload) : fileCollectionsStore.updateCategory(id, payload);
}

export async function deleteCategory(id: string): Promise<boolean> {
  return isDatabaseMode() ? dbCollectionsStore.deleteCategory(id) : fileCollectionsStore.deleteCategory(id);
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  return isDatabaseMode() ? dbCollectionsStore.getMediaAssets() : fileCollectionsStore.getMediaAssets();
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  return isDatabaseMode() ? dbCollectionsStore.getMediaAssetById(id) : fileCollectionsStore.getMediaAssetById(id);
}

export async function createMediaAsset(payload: MediaAsset): Promise<MediaAsset> {
  return isDatabaseMode() ? dbCollectionsStore.createMediaAsset(payload) : fileCollectionsStore.createMediaAsset(payload);
}

export async function updateMediaAsset(id: string, payload: MediaAsset): Promise<MediaAsset | null> {
  return isDatabaseMode() ? dbCollectionsStore.updateMediaAsset(id, payload) : fileCollectionsStore.updateMediaAsset(id, payload);
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  return isDatabaseMode() ? dbCollectionsStore.deleteMediaAsset(id) : fileCollectionsStore.deleteMediaAsset(id);
}

