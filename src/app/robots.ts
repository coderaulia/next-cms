import type { MetadataRoute } from 'next';

import { getSiteSettings } from '@/features/cms/publicApi';

export default async function robots(): Promise<MetadataRoute.Robots> {
  const settings = await getSiteSettings();
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/api/admin']
      }
    ],
    sitemap: `${settings.baseUrl}/sitemap.xml`
  };
}
