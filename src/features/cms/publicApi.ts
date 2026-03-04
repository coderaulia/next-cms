import { getBlogPostBySlug, getBlogPosts, getPageById, getPages, getSettings } from './contentStore';
import type { LandingPage, PageId } from './types';

export async function getSiteSettings() {
  return getSettings();
}

export async function getPublishedPage(id: PageId): Promise<LandingPage | null> {
  const page = await getPageById(id);
  if (!page || !page.published) return null;
  return page;
}

export async function getPublishedPages() {
  const pages = await getPages();
  return Object.values(pages).filter((page) => page.published);
}

export async function getPublishedBlogPosts() {
  return getBlogPosts(false);
}

export async function getPublishedBlogPostBySlug(slug: string) {
  return getBlogPostBySlug(slug);
}
