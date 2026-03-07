import { describe, expect, it } from 'vitest';

import { validateBlogPost, validateLandingPage, validateMediaAsset } from '@/features/cms/validators';

describe('CMS validators', () => {
  it('validates a landing page payload', () => {
    const page = validateLandingPage({
      id: 'home',
      title: 'Home',
      navLabel: 'Home',
      published: true,
      seo: {
        metaTitle: 'Home',
        metaDescription: 'desc',
        slug: '',
        canonical: '',
        socialImage: '',
        noIndex: false
      },
      sections: [
        {
          id: 'hero',
          heading: 'Hero',
          body: 'Body',
          ctaLabel: 'CTA',
          ctaHref: '/contact',
          layout: 'split',
          theme: {
            background: '#fff',
            text: '#000',
            accent: '#00f'
          }
        }
      ]
    });
    expect(page).not.toBeNull();
    expect(page?.id).toBe('home');
    expect(page?.sections[0].layout).toBe('split');
  });

  it('validates typed home blocks for homepage payload', () => {
    const page = validateLandingPage({
      id: 'home',
      title: 'Home',
      navLabel: 'Home',
      published: true,
      seo: {
        metaTitle: 'Home',
        metaDescription: 'desc',
        slug: '',
        canonical: '',
        socialImage: '',
        noIndex: false
      },
      sections: [],
      homeBlocks: [
        {
          id: 'hero-1',
          type: 'hero',
          enabled: true,
          theme: 'light',
          badge: 'Badge',
          titlePrimary: 'Primary',
          titleAccent: 'Accent',
          description: 'Description',
          primaryCtaLabel: 'CTA 1',
          primaryCtaHref: '/contact',
          primaryCtaStyle: 'primary',
          secondaryCtaLabel: 'CTA 2',
          secondaryCtaHref: '/service',
          secondaryCtaStyle: 'secondary'
        }
      ]
    });

    expect(page).not.toBeNull();
    expect(page?.homeBlocks?.length).toBe(1);
    expect(page?.homeBlocks?.[0].type).toBe('hero');
  });

  it('rejects unknown home block type', () => {
    const page = validateLandingPage({
      id: 'home',
      title: 'Home',
      navLabel: 'Home',
      published: true,
      seo: {
        metaTitle: 'Home',
        metaDescription: 'desc',
        slug: '',
        canonical: '',
        socialImage: '',
        noIndex: false
      },
      sections: [],
      homeBlocks: [
        {
          id: 'bad',
          type: 'mystery'
        }
      ]
    });

    expect(page).toBeNull();
  });

  it('validates a blog post payload', () => {
    const post = validateBlogPost({
      id: 'p1',
      title: 'Title',
      excerpt: 'Excerpt',
      content: 'Body',
      author: 'Admin',
      tags: ['seo', 'cms'],
      status: 'draft',
      seo: {
        metaTitle: 'Title',
        metaDescription: 'Description',
        slug: 'title',
        canonical: '',
        socialImage: '',
        noIndex: false
      }
    });
    expect(post).not.toBeNull();
    expect(post?.status).toBe('draft');
    expect(post?.tags).toEqual(['seo', 'cms']);
  });

  it('sanitizes unsafe javascript URLs from CMS payloads', () => {
    const page = validateLandingPage({
      id: 'home',
      title: 'Home',
      navLabel: 'Home',
      published: true,
      seo: {
        metaTitle: 'Home',
        metaDescription: 'desc',
        slug: '',
        canonical: 'javascript:alert(1)',
        socialImage: 'javascript:alert(1)',
        noIndex: false
      },
      sections: [
        {
          id: 'hero',
          heading: 'Hero',
          body: 'Body',
          ctaLabel: 'CTA',
          ctaHref: 'javascript:alert(1)',
          mediaImage: 'javascript:alert(1)',
          layout: 'split',
          theme: {
            background: '#fff',
            text: '#000',
            accent: '#00f'
          }
        }
      ]
    });

    const media = validateMediaAsset({
      title: 'Asset',
      url: 'javascript:alert(1)'
    });

    expect(page?.seo.canonical).toBe('');
    expect(page?.seo.socialImage).toBe('');
    expect(page?.sections[0].ctaHref).toBe('');
    expect(page?.sections[0].mediaImage).toBe('');
    expect(media).toBeNull();
  });
});
