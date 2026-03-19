import type { Metadata } from 'next';
import { Playfair_Display, Sora } from 'next/font/google';
import { Suspense } from 'react';

import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { AppShell } from '@/components/AppShell';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { siteProfile } from '@/config/site-profile';
import { getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';

import './globals.css';

const fallbackMetadataBase = 'http://localhost:3000';

function resolveMetadataBase() {
  try {
    return new URL(process.env.NEXT_PUBLIC_SITE_URL || fallbackMetadataBase);
  } catch {
    return new URL(fallbackMetadataBase);
  }
}

const fontBody = Sora({
  subsets: ['latin'],
  variable: '--font-body',
  display: 'swap'
});

const fontAccent = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-accent',
  style: ['italic'],
  display: 'swap'
});

export const metadata: Metadata = {
  metadataBase: resolveMetadataBase(),
  title: {
    default: siteProfile.brand.wordmark,
    template: '%s'
  },
  description: 'High-performance CMS starter with editable pages, blog, portfolio, and admin workflows.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()]);

  const pageNavMap = new Map(
    pages.map((page) => [
      page.id,
      {
        href: page.seo.slug ? `/${page.seo.slug}` : '/',
        label: page.navLabel
      }
    ])
  );

  const navItems = siteProfile.navigation.primaryPageOrder
    .map((id) => pageNavMap.get(id))
    .filter((item): item is { href: string; label: string } => Boolean(item));

  const orgSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: settings.organizationName,
    url: settings.baseUrl,
    logo: settings.organizationLogo
  };

  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.siteName,
    url: settings.baseUrl,
    ...(settings.sitemap.includePosts
      ? {
          potentialAction: {
            '@type': 'SearchAction',
            target: `${settings.baseUrl}/blog?query={search_term_string}`,
            'query-input': 'required name=search_term_string'
          }
        }
      : {})
  };

  return (
    <html lang="en" className={`${fontBody.variable} ${fontAccent.variable}`}>
      <body className="v2-site">
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <SeoJsonLd data={[orgSchema, siteSchema]} />
        <AppShell siteName={settings.siteName} navItems={navItems} settings={settings}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
