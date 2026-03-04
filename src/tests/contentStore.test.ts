import { describe, expect, it } from 'vitest';

import { queryBlogPosts } from '@/features/cms/contentStore';
import { defaultContent } from '@/features/cms/defaultContent';

describe('content store defaults', () => {
  it('seeds homepage with typed blocks', () => {
    const home = defaultContent.pages.home;
    expect(home.homeBlocks?.length).toBeGreaterThan(0);
    expect(home.homeBlocks?.some((block) => block.type === 'hero')).toBe(true);
    expect(home.homeBlocks?.some((block) => block.type === 'primary_cta')).toBe(true);
  });

  it('keeps legacy sections for non-home pages', () => {
    expect(defaultContent.pages.about.sections.length).toBeGreaterThan(0);
    expect(defaultContent.pages.service.sections.length).toBeGreaterThan(0);
    expect(defaultContent.pages.contact.sections.length).toBeGreaterThan(0);
  });
});

describe('blog querying', () => {
  it('filters by status and category with pagination metadata', async () => {
    const result = await queryBlogPosts({
      includeDrafts: true,
      status: 'published',
      category: 'engineering',
      page: 1,
      pageSize: 1
    });

    expect(result.posts.length).toBe(1);
    expect(result.posts[0].status).toBe('published');
    expect(result.posts[0].tags).toContain('engineering');
    expect(result.meta.total).toBeGreaterThan(0);
    expect(result.meta.pageSize).toBe(1);
  });

  it('searches by title or author', async () => {
    const result = await queryBlogPosts({
      includeDrafts: true,
      q: 'editorial',
      status: 'all',
      dateSort: 'newest',
      page: 1,
      pageSize: 10
    });

    expect(result.posts.some((post) => post.title.toLowerCase().includes('editorial'))).toBe(true);
  });
});
