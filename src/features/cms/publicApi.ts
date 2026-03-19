import {
  getCachedPublicBlogPostBySlug,
  getCachedPublicBlogPosts,
  getCachedPublicPageById,
  getCachedPublicPageBySlug,
  getCachedPublicPages,
  getCachedPublicPortfolioProjectBySlug,
  getCachedPublicPortfolioProjects,
  getCachedPublicSiteSettings
} from './publicCache';
import type { LandingPage, PageId } from './types';

export async function getSiteSettings() {
  return getCachedPublicSiteSettings();
}

export async function getPublishedPage(id: PageId): Promise<LandingPage | null> {
  return getCachedPublicPageById(id);
}

export async function getPublishedPages() {
  return getCachedPublicPages();
}

export async function getPublishedPageBySlug(slug: string): Promise<LandingPage | null> {
  return getCachedPublicPageBySlug(slug);
}

export async function getPublishedBlogPosts() {
  return getCachedPublicBlogPosts();
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return getCachedPublicBlogPostBySlug(slug);
}

export async function getPublishedPortfolioProjects() {
  return getCachedPublicPortfolioProjects();
}

export async function getPublishedPortfolioProjectBySlug(slug: string) {
  return getCachedPublicPortfolioProjectBySlug(slug);
}
