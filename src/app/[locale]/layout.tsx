import { notFound } from 'next/navigation';
import { headers } from 'next/headers';
import { Suspense } from 'react';
import { setRequestLocale } from 'next-intl/server';
import { hasLocale } from 'next-intl';
import { preconnect, preload } from 'react-dom';

import { AnalyticsTracker } from '@/components/AnalyticsTracker';
import { AppShell } from '@/components/AppShell';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { siteProfile } from '@/config/site-profile';
import { getPublishedPages, getSiteSettings } from '@/features/cms/publicApi';
import { routing } from '@/i18n/routing';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }
  // Enable static rendering for this locale segment.
  setRequestLocale(locale);

  const nonce = (await headers()).get('x-nonce') || undefined;
  const [settings, pages] = await Promise.all([getSiteSettings(), getPublishedPages()]);

  // The header logo is the LCP element on most pages. Warm up its origin and
  // start fetching it before the parser reaches the <img> deep in the body.
  const brandLogo = settings.branding.headerLogo || settings.organizationLogo;
  if (brandLogo) {
    try {
      const logoOrigin = new URL(brandLogo, settings.general.baseUrl).origin;
      if (logoOrigin !== new URL(settings.general.baseUrl).origin) {
        preconnect(logoOrigin);
      }
    } catch {
      // Malformed logo URL — skip the hint, the <img> will still load.
    }
    preload(brandLogo, { as: 'image', fetchPriority: 'high' });
  }

  const pageNavMap = new Map(
    pages.map((page) => [
      page.id,
      {
        href: page.seo.slug ? `/${page.seo.slug}` : '/',
        label: page.navLabel
      }
    ])
  );

  const baseNavItems = siteProfile.navigation.primaryPageOrder
    .map((id) => pageNavMap.get(id))
    .filter((item): item is { href: string; label: string } => Boolean(item));

  const productsGroup = {
    href: '#products',
    label: 'Products',
    children: [
      { href: '/hris', label: 'Vanaila HRIS' },
      { href: '/psikotest', label: 'Psikotest' },
      { href: '/flowraze', label: 'Flowraze' },
      { href: '/atelier', label: 'Atelier Studio' }
    ]
  };

  const svcIdx = baseNavItems.findIndex((item) => /\/service/.test(item.href));
  const navItems =
    svcIdx >= 0
      ? [...baseNavItems.slice(0, svcIdx + 1), productsGroup, ...baseNavItems.slice(svcIdx + 1)]
      : [...baseNavItems.slice(0, 3), productsGroup, ...baseNavItems.slice(3)];

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
    <>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <SeoJsonLd data={[orgSchema, siteSchema]} nonce={nonce} />
      <AppShell siteName={settings.general.siteName} navItems={navItems} settings={settings}>
        {children}
      </AppShell>
    </>
  );
}
