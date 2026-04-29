import { describe, expect, it } from 'vitest';

import { formatSavedAtLabel, validateBlogEditor, validatePageEditor } from '@/features/cms/editorValidation';
import type { BlogPost, LandingPage } from '@/features/cms/types';

function makeBlogPost(overrides: Partial<BlogPost> = {}): BlogPost {
  return {
    id: 'post-1',
    title: 'Title',
    excerpt: 'Excerpt',
    content: 'Body content',
    author: 'Admin',
    categoryId: null,
    tags: ['engineering'],
    coverImage: '',
    status: 'draft',
    publishedAt: null,
    updatedAt: new Date().toISOString(),
    seo: {
      metaTitle: 'Meta title',
      metaDescription: 'Meta description',
      slug: 'title',
      canonical: '',
      socialImage: '',
      noIndex: false
    },
    ...overrides
  };
}

function makeHomePage(): LandingPage {
  return {
    id: 'home',
    title: 'Home',
    navLabel: 'Home',
    published: true,
    updatedAt: new Date().toISOString(),
    sections: [],
    seo: {
      metaTitle: 'Home',
      metaDescription: 'Home description',
      slug: '',
      canonical: '',
      socialImage: '',
      noIndex: false
    },
    homeBlocks: [
      {
        id: 'hero-1',
        type: 'hero',
        enabled: true,
        theme: 'light',
        badge: '',
        titlePrimary: 'Primary',
        titleAccent: 'Accent',
        description: 'Description',
        primaryCtaLabel: 'Call',
        primaryCtaHref: '/contact',
        primaryCtaStyle: 'primary',
        secondaryCtaLabel: 'More',
        secondaryCtaHref: '/service',
        secondaryCtaStyle: 'secondary',
        animatedWords: ['better']
      }
    ]
  };
}

describe('editorValidation', () => {
  it('returns validation issues for missing blog required fields', () => {
    const issues = validateBlogEditor(
      makeBlogPost({
        title: '',
        author: '',
        content: '',
        seo: {
          metaTitle: '',
          metaDescription: '',
          slug: 'Bad Slug',
          canonical: '',
          socialImage: '',
          noIndex: false
        }
      })
    );

    const paths = issues.map((issue) => issue.path);
    expect(paths).toContain('title');
    expect(paths).toContain('author');
    expect(paths).toContain('content');
    expect(paths).toContain('seo.metaTitle');
    expect(paths).toContain('seo.metaDescription');
    expect(paths).toContain('seo.slug');
  });

  it('validates home block required fields', () => {    const page = makeHomePage();
    const hero = page.homeBlocks?.[0];
    if (!hero || hero.type !== 'hero') {
      throw new Error('Expected hero block');
    }

    page.homeBlocks = [
      {
        ...hero,
        id: 'hero-1',
        titlePrimary: '',
        primaryCtaHref: ''
      },
      {
        ...hero,
        id: 'hero-1'
      }
    ];

    const issues = validatePageEditor(page);
    const paths = issues.map((issue) => issue.path);

    expect(paths).toContain('homeBlocks.0.titlePrimary');
    expect(paths).toContain('homeBlocks.0.primaryCtaHref');
    expect(paths).toContain('homeBlocks.1.id');
  });

  it('formats saved time labels', () => {
    expect(formatSavedAtLabel(null)).toBe('Not saved yet');
    expect(formatSavedAtLabel('not-a-date')).toBe('Not saved yet');
    expect(formatSavedAtLabel('2026-01-01T10:00:00.000Z')).toContain('Saved at');
  });
});

