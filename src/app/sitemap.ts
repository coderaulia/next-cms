import type { MetadataRoute } from 'next';

import { getPublishedBlogPosts, getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, pages, posts] = await Promise.all([
    getSiteSettings(),
    getPublishedPages(),
    getPublishedBlogPosts()
  ]);

  const pageEntries: MetadataRoute.Sitemap = pages.map((page) => ({
    url: `${settings.baseUrl}${page.seo.slug ? `/${page.seo.slug}` : ''}`,
    lastModified: page.updatedAt,
    changeFrequency: 'weekly',
    priority: page.id === 'home' ? 1 : 0.7
  }));

  const blogEntries: MetadataRoute.Sitemap = posts.map((post) => ({
    url: `${settings.baseUrl}/blog/${post.seo.slug}`,
    lastModified: post.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6
  }));

  return [...pageEntries, ...blogEntries];
}
