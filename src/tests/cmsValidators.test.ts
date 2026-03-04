import { describe, expect, it } from 'vitest';

import { validateBlogPost, validateLandingPage } from '@/features/cms/validators';

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
});
