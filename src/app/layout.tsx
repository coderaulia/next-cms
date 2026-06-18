import type { Metadata } from 'next';
import { Sora, Playfair_Display, Inter_Tight, Instrument_Serif, JetBrains_Mono } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getLocale } from 'next-intl/server';
import { headers } from 'next/headers';

import { ChunkRecoveryScript } from '@/components/ChunkRecoveryScript';
import { siteProfile } from '@/config/site-profile';
import { getSiteSettings } from '@/features/cms/publicApi';

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

const fontTight = Inter_Tight({
  subsets: ['latin'],
  variable: '--font-tight',
  weight: ['400', '500', '600', '700'],
  display: 'swap'
});

const fontSerif = Instrument_Serif({
  subsets: ['latin'],
  variable: '--font-serif',
  style: ['normal', 'italic'],
  weight: '400',
  display: 'swap'
});

const fontMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
  weight: ['400', '500'],
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
      : undefined,
    alternates: {
      types: {
        'application/rss+xml': [{ url: '/feed.xml', title: `${settings.general.siteName} — Insights` }]
      }
    }
  };
}

// Next requires the root layout to render <html>/<body>. The active locale
// (from next-intl) drives <html lang>; non-localized routes (admin) resolve to
// the default locale. Locale-aware chrome lives in app/[locale]/layout.tsx.
export default async function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  const nonce = (await headers()).get('x-nonce') || undefined;
  const locale = await getLocale();

  return (
    <html lang={locale} className={`${fontBody.variable} ${fontAccent.variable} ${fontTight.variable} ${fontSerif.variable} ${fontMono.variable}`}>
      <body className="v2-site">
        <ChunkRecoveryScript nonce={nonce} />
        <NextIntlClientProvider locale={locale}>{children}</NextIntlClientProvider>
      </body>
    </html>
  );
}
