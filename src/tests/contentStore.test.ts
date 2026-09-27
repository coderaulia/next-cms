import { describe, expect, it } from 'vitest';

import { queryBlogPosts } from '@/features/cms/contentStore';
import { getDefaultContent } from '@/features/cms/defaultContent';

describe('content store defaults', () => {
  it('seeds homepage with typed blocks', () => {
    const home = getDefaultContent().pages.home;
    expect(home.homeBlocks?.length).toBeGreaterThan(0);
    expect(home.homeBlocks?.some((block) => block.type === 'hero')).toBe(true);
    expect(home.homeBlocks?.some((block) => block.type === 'primary_cta')).toBe(true);
  });

  it('keeps legacy sections for non-home pages', () => {
    const defaults = getDefaultContent();
    expect(defaults.pages.about.sections.length).toBeGreaterThan(0);
    expect(defaults.pages.service.sections.length).toBeGreaterThan(0);
    expect(defaults.pages.contact.sections.length).toBeGreaterThan(0);
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

describe('portfolio and template wiring', () => {
  it('includes BDO.CLTH in portfolio with Online Shop Development category', () => {
    const defaults = getDefaultContent();
    const bdo = defaults.portfolioProjects.find((p) => p.seo.slug === 'bdo-clth');
    expect(bdo).toBeDefined();
    expect(bdo?.serviceType).toBe('Online Shop Development');
    expect(bdo?.projectUrl).toBe('/templates/bdo-clth');
    expect(bdo?.relatedServicePageIds).toContain('service-secure-online-shops');
    expect(bdo?.featured).toBe(true);
  });

  it('includes templates in footer service links', () => {
    const defaults = getDefaultContent();
    const hasTemplates = defaults.settings.navigation.footerServiceLinks.some(
      (link) => link.href === '/templates' && link.enabled
    );
    expect(hasTemplates).toBe(true);
  });

  it('orders top featured projects: Vanaila Psikotest, Maza Adventure, BDO.CLTH, Greenretech', () => {
    const defaults = getDefaultContent();
    const featured = defaults.portfolioProjects
      .filter((p) => p.featured)
      .sort((a, b) => a.sortOrder - b.sortOrder);
    expect(featured.map((p) => p.title)).toEqual([
      'Vanaila Psikotest',
      'Maza Adventure',
      'BDO.CLTH',
      'Greenretech'
    ]);
  });

  it('includes products, atelier, and lms in footer navigation links', () => {
    const defaults = getDefaultContent();
    const serviceHrefs = defaults.settings.navigation.footerServiceLinks.map((l) => l.href);
    const navHrefs = defaults.settings.navigation.footerNavigatorLinks.map((l) => l.href);

    expect(serviceHrefs).toContain('/atelier');
    expect(serviceHrefs).toContain('/lms');
    expect(serviceHrefs).toContain('/psikotest');
    expect(serviceHrefs).toContain('/flowraze');
    expect(navHrefs).toContain('/products');
  });
});
