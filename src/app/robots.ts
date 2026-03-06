import type { MetadataRoute } from 'next';

import { getSiteSettings } from '@/features/cms/publicApi';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  const indexingBlocked =
    settings.reading.discourageSearchEngines || settings.seo.defaultNoIndex;

  return {
    rules: indexingBlocked
      ? [
          {
            userAgent: '*',
            disallow: '/'
          }
        ]
      : [
          {
            userAgent: '*',
            allow: '/',
            disallow: ['/admin', '/api/admin']
          }
        ],
    sitemap: settings.sitemap.enabled && !indexingBlocked ? `${settings.baseUrl}/sitemap.xml` : undefined
  };
}
