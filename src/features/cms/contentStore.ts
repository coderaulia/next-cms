import { env } from '@/services/env';

import {
  resolveBlogPostAssetUrls,
  resolveCmsContentAssetUrls,
  resolveLandingPageAssetUrls,
  resolveMediaAssetUrls,
  resolvePortfolioProjectAssetUrls,
  resolveSettingsAssetUrls
} from './assetUrls';
import * as dbCollectionsStore from './dbCollectionsStore';
import * as dbStore from './dbStore';
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

const isDatabaseMode = () => Boolean(env.databaseUrl);

const loadFileStore = () => import('./fileStore');
const loadFileCollectionsStore = () => import('./fileCollectionsStore');

export async function readContent(): Promise<CmsContent> {
  if (!isDatabaseMode()) {
    return resolveCmsContentAssetUrls(await (await loadFileStore()).readContent());
  }

  const [settings, pages, blogPosts, portfolioProjects, categories, mediaAssets] = await Promise.all([
    dbStore.getSettings(),
    dbStore.getPages(),
    dbStore.getBlogPosts(true),
    dbStore.getPortfolioProjects(true),
    dbCollectionsStore.getCategories(),
    dbCollectionsStore.getMediaAssets()
  ]);

  return resolveCmsContentAssetUrls({
    settings,
    pages,
    blogPosts,
    portfolioProjects,
    categories,
    mediaAssets
  });
}

export async function writeContent(content: CmsContent): Promise<void> {
  if (!isDatabaseMode()) {
    await (await loadFileStore()).writeContent(content);
    return;
  }

  await dbStore.replaceAllCmsContent(content);
}

export async function getSettings() {
  const settings = isDatabaseMode() ? await dbStore.getSettings() : await (await loadFileStore()).getSettings();
  return resolveSettingsAssetUrls(settings);
}

export async function updateSettings(settings: SiteSettings): Promise<SiteSettings> {
  return isDatabaseMode() ? dbStore.updateSettings(settings) : (await loadFileStore()).updateSettings(settings);
}

export async function getPages() {
  const pages = isDatabaseMode() ? await dbStore.getPages() : await (await loadFileStore()).getPages();
  return Object.fromEntries(
    Object.entries(pages).map(([id, page]) => [id, resolveLandingPageAssetUrls(page)])
  ) as Record<PageId, LandingPage>;
}

export async function getPageById(id: PageId): Promise<LandingPage | null> {
  const page = isDatabaseMode() ? await dbStore.getPageById(id) : await (await loadFileStore()).getPageById(id);
  return page ? resolveLandingPageAssetUrls(page) : null;
}

export async function upsertPage(page: LandingPage): Promise<LandingPage> {
  return isDatabaseMode() ? dbStore.upsertPage(page) : (await loadFileStore()).upsertPage(page);
}

export async function getBlogPosts(includeDrafts = false): Promise<BlogPost[]> {
  const posts = isDatabaseMode()
    ? await dbStore.getBlogPosts(includeDrafts)
    : await (await loadFileStore()).getBlogPosts(includeDrafts);
  return posts.map(resolveBlogPostAssetUrls);
}

export type { BlogQueryInput, PortfolioQueryInput } from './storeTypes';

export async function queryBlogPosts(input: BlogQueryInput) {
  const payload = isDatabaseMode()
    ? await dbStore.queryBlogPosts(input)
    : await (await loadFileStore()).queryBlogPosts(input);
  return {
    ...payload,
    posts: payload.posts.map(resolveBlogPostAssetUrls)
  };
}

export async function getBlogPostById(id: string): Promise<BlogPost | null> {
  const post = isDatabaseMode() ? await dbStore.getBlogPostById(id) : await (await loadFileStore()).getBlogPostById(id);
  return post ? resolveBlogPostAssetUrls(post) : null;
}

export async function getBlogPostBySlug(slug: string): Promise<BlogPost | null> {
  const post = isDatabaseMode()
    ? await dbStore.getBlogPostBySlug(slug)
    : await (await loadFileStore()).getBlogPostBySlug(slug);
  return post ? resolveBlogPostAssetUrls(post) : null;
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

export async function getPortfolioProjects(includeDrafts = false): Promise<PortfolioProject[]> {
  const projects = isDatabaseMode()
    ? await dbStore.getPortfolioProjects(includeDrafts)
    : await (await loadFileStore()).getPortfolioProjects(includeDrafts);
  return projects.map(resolvePortfolioProjectAssetUrls);
}

export async function queryPortfolioProjects(input: PortfolioQueryInput) {
  const payload = isDatabaseMode()
    ? await dbStore.queryPortfolioProjects(input)
    : await (await loadFileStore()).queryPortfolioProjects(input);
  return {
    ...payload,
    projects: payload.projects.map(resolvePortfolioProjectAssetUrls)
  };
}

export async function getPortfolioProjectById(id: string): Promise<PortfolioProject | null> {
  const project = isDatabaseMode()
    ? await dbStore.getPortfolioProjectById(id)
    : await (await loadFileStore()).getPortfolioProjectById(id);
  return project ? resolvePortfolioProjectAssetUrls(project) : null;
}

export async function getPortfolioProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const project = isDatabaseMode()
    ? await dbStore.getPortfolioProjectBySlug(slug)
    : await (await loadFileStore()).getPortfolioProjectBySlug(slug);
  return project ? resolvePortfolioProjectAssetUrls(project) : null;
}

export async function createPortfolioProject(
  payload?: Partial<PortfolioProject>
): Promise<PortfolioProject> {
  return isDatabaseMode()
    ? dbStore.createPortfolioProject(payload)
    : (await loadFileStore()).createPortfolioProject(payload);
}

export async function updatePortfolioProject(
  id: string,
  payload: PortfolioProject
): Promise<PortfolioProject | null> {
  return isDatabaseMode()
    ? dbStore.updatePortfolioProject(id, payload)
    : (await loadFileStore()).updatePortfolioProject(id, payload);
}

export async function deletePortfolioProject(id: string): Promise<boolean> {
  return isDatabaseMode()
    ? dbStore.deletePortfolioProject(id)
    : (await loadFileStore()).deletePortfolioProject(id);
}

export async function setPortfolioProjectStatus(
  id: string,
  status: 'draft' | 'published'
): Promise<PortfolioProject | null> {
  return isDatabaseMode()
    ? dbStore.setPortfolioProjectStatus(id, status)
    : (await loadFileStore()).setPortfolioProjectStatus(id, status);
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
  const mediaAssets = isDatabaseMode()
    ? await dbCollectionsStore.getMediaAssets()
    : await (await loadFileCollectionsStore()).getMediaAssets();
  return mediaAssets.map(resolveMediaAssetUrls);
}

export async function getMediaAssetById(id: string): Promise<MediaAsset | null> {
  const mediaAsset = isDatabaseMode()
    ? await dbCollectionsStore.getMediaAssetById(id)
    : await (await loadFileCollectionsStore()).getMediaAssetById(id);
  return mediaAsset ? resolveMediaAssetUrls(mediaAsset) : null;
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
