import {
  resolveBlogPostAssetUrls,
  resolveCmsContentAssetUrls,
  resolveLandingPageAssetUrls,
  resolveMediaAssetUrls,
  resolvePortfolioProjectAssetUrls,
  resolveSettingsAssetUrls
} from './assetUrls';
import { loadCmsStoreModules, readRawCmsContent, writeRawCmsContent } from './storeAdapter';
import type {
  BlogPost,
  Category,
  CmsContent,
  LandingPage,
  MediaAsset,
  PageId,
  PortfolioProject,
  SiteSettings
} from './types';
import type { BlogQueryInput, PortfolioQueryInput } from './storeTypes';

export async function readContent(): Promise<CmsContent> {
  return resolveCmsContentAssetUrls(await readRawCmsContent());
}

export async function writeContent(content: CmsContent): Promise<void> {
  await writeRawCmsContent(content);
}

export async function getSettings() {
  const { contentStore } = await loadCmsStoreModules();
  const settings = await contentStore.getSettings();
  return resolveSettingsAssetUrls(settings);
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.updateSettings(settings);
}

export async function getPages() {
  const { contentStore } = await loadCmsStoreModules();
  const pages = await contentStore.getPages();
  return Object.fromEntries(
    Object.entries(pages).map(([id, page]) => [id, resolveLandingPageAssetUrls(page)])
  ) as Record<PageId, LandingPage>;
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  const { contentStore } = await loadCmsStoreModules();
  const page = await contentStore.getPageById(id);
  return page ? resolveLandingPageAssetUrls(page) : null;
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.upsertPage(page);
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const { contentStore } = await loadCmsStoreModules();
  const posts = await contentStore.getBlogPosts(includeDrafts);
  return posts.map(resolveBlogPostAssetUrls);
}

export type { BlogQueryInput, PortfolioQueryInput } from './storeTypes';

export async function queryBlogPosts(input: BlogQueryInput) {
  const { contentStore } = await loadCmsStoreModules();
  const payload = await contentStore.queryBlogPosts(input);
  return {
    ...payload,
    posts: payload.posts.map(resolveBlogPostAssetUrls)
  };
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const { contentStore } = await loadCmsStoreModules();
  const post = await contentStore.getBlogPostById(id);
  return post ? resolveBlogPostAssetUrls(post) : null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const { contentStore } = await loadCmsStoreModules();
  const post = await contentStore.getBlogPostBySlug(slug);
  return post ? resolveBlogPostAssetUrls(post) : null;
}

export async function createBlogPost(payload?: Partial<BlogPost>): Promise<BlogPost> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.createBlogPost(payload);
}

export async function updateBlogPost(id: string, payload: BlogPost): Promise<BlogPost | null> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.updateBlogPost(id, payload);
}

export async function deleteBlogPost(id: string): Promise<boolean> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.deleteBlogPost(id);
}

export async function setPostStatus(id: string, status: 'draft' | 'published'): Promise<BlogPost | null> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.setPostStatus(id, status);
}

export async function getPortfolioProjects(includeDrafts = false): Promise<PortfolioProject[]> {
  const { contentStore } = await loadCmsStoreModules();
  const projects = await contentStore.getPortfolioProjects(includeDrafts);
  return projects.map(resolvePortfolioProjectAssetUrls);
}

export async function queryPortfolioProjects(input: PortfolioQueryInput) {
  const { contentStore } = await loadCmsStoreModules();
  const payload = await contentStore.queryPortfolioProjects(input);
  return {
    ...payload,
    projects: payload.projects.map(resolvePortfolioProjectAssetUrls)
  };
}

export async function getPortfolioProjectById(id: string): Promise<PortfolioProject | null> {
  const { contentStore } = await loadCmsStoreModules();
  const project = await contentStore.getPortfolioProjectById(id);
  return project ? resolvePortfolioProjectAssetUrls(project) : null;
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const { contentStore } = await loadCmsStoreModules();
  const project = await contentStore.getPortfolioProjectBySlug(slug);
  return project ? resolvePortfolioProjectAssetUrls(project) : null;
}

export async function createPortfolioProject(
  payload?: Partial<PortfolioProject>
): Promise<PortfolioProject> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.createPortfolioProject(payload);
}

export async function updatePortfolioProject(
  id: string,
  payload: PortfolioProject
): Promise<PortfolioProject | null> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.updatePortfolioProject(id, payload);
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.deletePortfolioProject(id);
}

export async function setPortfolioProjectStatus(
  id: string,
  status: 'draft' | 'published'
): Promise<PortfolioProject | null> {
  const { contentStore } = await loadCmsStoreModules();
  return contentStore.setPortfolioProjectStatus(id, status);
}

export async function getCategories(): Promise<Category[]> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.getCategories();
}

export async function getCategoryById(id: string): Promise<Category | null> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.getCategoryById(id);
}

export async function createCategory(payload: Category): Promise<Category> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.createCategory(payload);
}

export async function updateCategory(id: string, payload: Category): Promise<Category | null> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.updateCategory(id, payload);
}

export async function deleteCategory(id: string): Promise<boolean> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.deleteCategory(id);
}

export async function getMediaAssets(): Promise<MediaAsset[]> {
  const { collectionsStore } = await loadCmsStoreModules();
  const mediaAssets = await collectionsStore.getMediaAssets();
  return mediaAssets.map(resolveMediaAssetUrls);
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  const { collectionsStore } = await loadCmsStoreModules();
  const mediaAsset = await collectionsStore.getMediaAssetById(id);
  return mediaAsset ? resolveMediaAssetUrls(mediaAsset) : null;
}

export async function createMediaAsset(payload: MediaAsset): Promise<MediaAsset> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.createMediaAsset(payload);
}

export async function updateMediaAsset(id: string, payload: MediaAsset): Promise<MediaAsset | null> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.updateMediaAsset(id, payload);
}

export async function deleteMediaAsset(id: string): Promise<boolean> {
  const { collectionsStore } = await loadCmsStoreModules();
  return collectionsStore.deleteMediaAsset(id);
}
