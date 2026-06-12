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

  const isLocalhost = /localhost|127\.0\.0\.1/i.test(settings.baseUrl);

  if (!settings.sitemap.enabled || indexingBlocked || isLocalhost) {
    return [];
  }

  const withLastModified = settings.sitemap.includeLastModified;

  // Store timestamps come back in Postgres format ("2026-06-12 08:05:00+00"),
  // which is not valid sitemap lastmod. Convert to Date so Next emits W3C ISO.
  const toLastModified = (value: string | null | undefined) => {
    if (!withLastModified || !value) return undefined;
    const date = new Date(value);
    return Number.isNaN(date.getTime()) ? undefined : date;
  };

  const pageEntries: MetadataRoute.Sitemap = settings.sitemap.includePages
    ? pages.map((page) => ({
        url: `${settings.baseUrl}${page.seo.slug ? `/${page.seo.slug}` : ''}`,
        lastModified: toLastModified(page.updatedAt),
        changeFrequency: 'weekly',
        priority: page.id === 'home' ? 1 : 0.7
      }))
    : [];

  const blogEntries: MetadataRoute.Sitemap = settings.sitemap.includePosts
    ? posts.map((post) => ({
        url: `${settings.baseUrl}/blog/${post.seo.slug}`,
        lastModified: toLastModified(post.updatedAt),
        changeFrequency: 'weekly',
        priority: 0.6
      }))
    : [];

  const portfolioEntries: MetadataRoute.Sitemap = settings.sitemap.includePortfolio
    ? portfolioProjects.map((project) => ({
        url: `${settings.baseUrl}/portfolio/${project.seo.slug}`,
        lastModified: toLastModified(project.updatedAt),
        changeFrequency: 'monthly',
        priority: project.featured ? 0.8 : 0.6
      }))
    : [];

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${settings.baseUrl}/products`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${settings.baseUrl}/templates`, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${settings.baseUrl}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${settings.baseUrl}/portfolio`, changeFrequency: 'weekly', priority: 0.7 }
  ];

  return [...pageEntries, ...staticEntries, ...blogEntries, ...portfolioEntries];
}
