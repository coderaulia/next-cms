import type { Metadata } from 'next';

import type { SeoFields, SiteSettings } from './types';

const absoluteUrl = (baseUrl: string, candidate: string) => {
  if (!candidate || candidate.trim().length === 0) return baseUrl;
  try {
    return new URL(candidate, baseUrl).toString();
  } catch {
    return baseUrl;
  }
};

export function buildCanonical(baseUrl: string, slug: string, explicitCanonical?: string) {
  if (explicitCanonical && explicitCanonical.trim().length > 0) {
    return absoluteUrl(baseUrl, explicitCanonical);
  }
  const path = slug ? `/${slug}` : '/';
  return absoluteUrl(baseUrl, path);
}

export function buildMetadata(
  site: SiteSettings,
  seo: SeoFields,
  fallbackTitle: string,
  fallbackDescription: string
): Metadata {
  const title = seo.metaTitle || fallbackTitle;
  const description = seo.metaDescription || fallbackDescription;
  const canonical = buildCanonical(site.baseUrl, seo.slug, seo.canonical);
  const ogImage = seo.socialImage || site.defaultOgImage;
  return {
    title,
    description,
    alternates: {
      canonical
    },
    robots: seo.noIndex ? { index: false, follow: false } : { index: true, follow: true },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: ogImage ? [{ url: ogImage }] : []
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ogImage ? [ogImage] : []
    }
  };
}
