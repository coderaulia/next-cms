import type { MetadataRoute } from 'next';

import {
  getPublishedBlogPosts,
  getPublishedPages,
  getPublishedPortfolioProjects,
  getSiteSettings
} from '@/features/cms/publicApi';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [settings, pages, posts, portfolioProjects] = await Promise.all([
    getSiteSettings(),
    getPublishedPages(),
    getPublishedBlogPosts(),
    getPublishedPortfolioProjects()
  ]);

  const indexingBlocked =
    settings.reading.discourageSearchEngines || settings.seo.defaultNoIndex;

  if (!settings.sitemap.enabled || indexingBlocked) {
    return [];
  }

  const withLastModified = settings.sitemap.includeLastModified;

  const pageEntries: MetadataRoute.Sitemap = settings.sitemap.includePages
    ? pages.map((page) => ({
        url: `${settings.baseUrl}${page.seo.slug ? `/${page.seo.slug}` : ''}`,
        lastModified: withLastModified ? page.updatedAt : undefined,
        changeFrequency: 'weekly',
        priority: page.id === 'home' ? 1 : 0.7
      }))
    : [];

  const blogEntries: MetadataRoute.Sitemap = settings.sitemap.includePosts
    ? posts.map((post) => ({
        url: `${settings.baseUrl}/blog/${post.seo.slug}`,
        lastModified: withLastModified ? post.updatedAt : undefined,
        changeFrequency: 'weekly',
        priority: 0.6
      }))
    : [];

  const portfolioEntries: MetadataRoute.Sitemap = settings.sitemap.includePortfolio
    ? portfolioProjects.map((project) => ({
        url: `${settings.baseUrl}/portfolio/${project.seo.slug}`,
        lastModified: withLastModified ? project.updatedAt : undefined,
        changeFrequency: 'monthly',
        priority: project.featured ? 0.8 : 0.6
      }))
    : [];

  return [...pageEntries, ...blogEntries, ...portfolioEntries];
}
