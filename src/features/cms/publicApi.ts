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
import * as contentStore from './contentStore';
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

export async function getPreviewPageBySlug(slug: string): Promise<LandingPage | null> {
  const normalized = slug.trim().replace(/^\/+/, '').toLowerCase();
  const pages = Object.values(await contentStore.getPages());
  return pages.find((page) => page.seo.slug.toLowerCase() === normalized) ?? null;
}

export async function getPreviewBlogPostBySlug(slug: string) {
  const normalized = slug.trim().replace(/^\/+/, '').toLowerCase();
  const posts = await contentStore.getBlogPosts(true);
  return posts.find((post) => post.seo.slug.toLowerCase() === normalized) ?? null;
}

export async function getPreviewPortfolioProjectBySlug(slug: string) {
  const normalized = slug.trim().replace(/^\/+/, '').toLowerCase();
  const projects = await contentStore.getPortfolioProjects(true);
  return projects.find((project) => project.seo.slug.toLowerCase() === normalized) ?? null;
}

export async function getPreviewPages() {
  return Object.values(await contentStore.getPages());
}

export async function getPreviewBlogPosts() {
  return contentStore.getBlogPosts(true);
}

export async function getPreviewPortfolioProjects() {
  return contentStore.getPortfolioProjects(true);
}
