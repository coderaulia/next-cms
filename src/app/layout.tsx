import type { Metadata } from 'next';
import { Sora, Playfair_Display } from 'next/font/google';
import { Suspense } from 'react';
import { headers } from 'next/headers';

import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { AppShell } from '@/components/AppShell';
import { ChunkRecoveryScript } from '@/components/ChunkRecoveryScript';
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

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const icon = settings.branding.siteIcon || settings.branding.headerLogo || undefined;

  return {
    metadataBase: resolveMetadataBase(),
    title: {
      default: settings.general.siteName || siteProfile.brand.wordmark,
      template: '%s'
    },
    description:
      settings.seo.defaultMetaDescription ||
      'High-performance CMS starter with editable pages, blog, portfolio, and admin workflows.',
    icons: icon
      ? {
        icon,
        shortcut: icon,
        apple: icon
      }
      : undefined
  };
}

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || undefined;
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
    name: settings.general.siteName,
    url: settings.general.baseUrl,
    logo: settings.branding.headerLogo
  };

  const siteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: settings.general.siteName,
    url: settings.general.baseUrl,
    ...(settings.sitemap.includePosts
      ? {
        potentialAction: {
          '@type': 'SearchAction',
          target: `${settings.general.baseUrl}/blog?query={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      }
      : {})
  };

  return (
    <html lang={settings.general.language || 'en'} className={`${fontBody.variable} ${fontAccent.variable}`}>
      <body className="v2-site">
        <ChunkRecoveryScript nonce={nonce} />
        <Suspense fallback={null}>
          <AnalyticsTracker />
        </Suspense>
        <SeoJsonLd data={[orgSchema, siteSchema]} nonce={nonce} />
        <AppShell siteName={settings.general.siteName} navItems={navItems} settings={settings}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
