import type { Metadata } from 'next';

import { SeoJsonLd } from '@/components/SeoJsonLd';
import { SiteFooter } from '@/components/SiteFooter';
import { SiteHeader } from '@/components/SiteHeader';
import { getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';

import './globals.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: {
    default: 'React CMS',
    template: '%s'
  },
  description: 'Marketing CMS starter with landing pages, blog workflow, and technical SEO defaults.'
};

export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()]);
  const navItems = pages
    .map((page) => ({
      href: page.seo.slug ? `/${page.seo.slug}` : '/',
      label: page.navLabel
    }))
    .sort((a, b) => (a.href > b.href ? 1 : -1));
  navItems.push({ href: '/blog', label: 'Blog' });

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
    <html lang="en">
      <body>
        <SeoJsonLd data={[orgSchema, siteSchema]} />
        <SiteHeader siteName={settings.siteName} navItems={navItems} />
        {children}
        <SiteFooter siteName={settings.siteName} />
      </body>
    </html>
  );
}
