import { describe, expect, it } from 'vitest';

import { buildCanonical, buildMetadata } from '@/features/cms/seo';
import type { SeoFields, SiteSettings } from '@/features/cms/types';

const site: SiteSettings = {
  siteName: 'Acme Marketing',
  baseUrl: 'https://example.com',
  organizationName: 'Acme Marketing',
  organizationLogo: 'https://example.com/logo.png',
  defaultOgImage: 'https://example.com/og.png'
};

const seo: SeoFields = {
  metaTitle: 'Page title',
  metaDescription: 'Page description',
  slug: 'about',
  canonical: '',
  socialImage: '',
  noIndex: false
};

describe('SEO helpers', () => {
  it('builds canonical from slug when explicit canonical is empty', () => {
    expect(buildCanonical('https://example.com', 'about')).toBe('https://example.com/about');
  });

  it('prefers explicit canonical URL', () => {
    expect(
      buildCanonical('https://example.com', 'about', 'https://canonical.example.com/custom')
    ).toBe('https://canonical.example.com/custom');
  });

  it('builds metadata with OG and robots defaults', () => {
    const metadata = buildMetadata(site, seo, 'Fallback title', 'Fallback description');
    expect(metadata.title).toBe('Page title');
    expect(metadata.description).toBe('Page description');
    expect(metadata.alternates?.canonical).toBe('https://example.com/about');
    expect(metadata.openGraph?.url).toBe('https://example.com/about');
    expect(metadata.twitter).toBeTruthy();
  });

  it('sets noindex robots when requested', () => {
    const metadata = buildMetadata(
      site,
      {
        ...seo,
        noIndex: true
      },
      'Fallback title',
      'Fallback description'
    );
    expect(metadata.robots).toEqual({ index: false, follow: false });
  });
});
