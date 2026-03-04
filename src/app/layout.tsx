import type { Metadata } from 'next';
import { Playfair_Display, Sora } from 'next/font/google';

import { SeoJsonLd } from '@/components/SeoJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';

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
  const pageNavItems = pages.map((page) => ({
    href: page.seo.slug ? `/${page.seo.slug}` : '/',
    label: page.navLabel
  }));
  const allNavItems = [...pageNavItems, { href: '/blog', label: 'Insights' }];
  const navOrder = ['/', '/service', '/about', '/blog', '/contact'];
  const navItems = allNavItems.sort(
    (a, b) => navOrder.indexOf(a.href) - navOrder.indexOf(b.href)
  );

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
        <SiteHeader siteName={settings.siteName} navItems={navItems} />
        <div className="v2-page">{children}</div>
        <SiteFooter siteName={settings.siteName} />
      </body>
    </html>
  );
}
