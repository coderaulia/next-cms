import type { Metadata } from 'next';
import { Playfair_Display, Sora } from 'next/font/google';

import { AppShell } from '@/components/AppShell';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';
import type { PageId } from '@/features/cms/types';

import './globals.css';

export const dynamic = 'force-dynamic';

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
  title: {
    default: 'vanaila.',
    template: '%s'
  },
  description: 'Engineering-led marketing CMS with dynamic landing blocks and editorial workflow.'
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

  const orderedTopLevel: PageId[] = ['home', 'about', 'service', 'partnership', 'contact'];
  const navItems = orderedTopLevel
    .map((id) => pageNavMap.get(id))
    .filter((item): item is { href: string; label: string } => Boolean(item));
  navItems.splice(3, 0, { href: '/blog', label: 'Insights' });

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
    potentialAction: {
      '@type': 'SearchAction',
      target: `${settings.baseUrl}/blog?query={search_term_string}`,
      'query-input': 'required name=search_term_string'
    }
  };

  return (
    <html lang="en" className={`${fontBody.variable} ${fontAccent.variable}`}>
      <body className="v2-site">
        <SeoJsonLd data={[orgSchema, siteSchema]} />
        <AppShell siteName={settings.siteName} navItems={navItems}>
          {children}
        </AppShell>
      </body>
    </html>
  );
}
