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

function resolveTitle(site: SiteSettings, seoTitle: string, fallbackTitle: string) {
  const baseTitle = seoTitle.trim() || fallbackTitle.trim();
  if (!baseTitle) return site.siteName;

  // Respect explicit SEO title verbatim; apply template only for fallback-derived titles.
  if (seoTitle.trim().length > 0) return seoTitle.trim();

  const template = site.seo.titleTemplate?.trim() || '%page_title% | %site_name%';
  const resolved = template
    .replaceAll('%page_title%', baseTitle)
    .replaceAll('%site_name%', site.siteName)
    .trim();

  return resolved.length > 0 ? resolved : `${baseTitle} | ${site.siteName}`;
}

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
  const title = resolveTitle(site, seo.metaTitle, fallbackTitle);
  const description =
    seo.metaDescription || fallbackDescription || site.seo.defaultMetaDescription || '';
  const canonical = buildCanonical(site.baseUrl, seo.slug, seo.canonical);
  const ogImage = seo.socialImage || site.seo.defaultOgImage || site.defaultOgImage;
  const noIndex = seo.noIndex || site.seo.defaultNoIndex || site.reading.discourageSearchEngines;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    robots: noIndex ? { index: false, follow: false } : { index: true, follow: true },
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
