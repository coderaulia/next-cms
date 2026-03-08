import { describe, expect, it } from 'vitest';

import { filterAndSortPages } from '@/features/cms/adminPagesList';
import type { LandingPage } from '@/features/cms/types';

function makePage(input: Partial<LandingPage> & Pick<LandingPage, 'id' | 'title' | 'navLabel'>): LandingPage {
  return {
    id: input.id,
    title: input.title,
    navLabel: input.navLabel,
    published: input.published ?? false,
    updatedAt: input.updatedAt ?? new Date().toISOString(),
    sections: input.sections ?? [],
    homeBlocks: input.homeBlocks,
    seo: input.seo ?? {
      metaTitle: input.title,
      metaDescription: 'desc',
      slug: input.id,
      canonical: '',
      socialImage: '',
      noIndex: false
    }
  };
}

describe('adminPagesList', () => {
  const pages: LandingPage[] = [
    makePage({ id: 'about', title: 'About Us', navLabel: 'About', published: true, updatedAt: '2025-02-01T00:00:00.000Z' }),
    makePage({ id: 'contact', title: 'Contact', navLabel: 'Contact', published: false, updatedAt: '2025-02-03T00:00:00.000Z' }),
    makePage({ id: 'service', title: 'Services', navLabel: 'Services', published: true, updatedAt: '2025-02-02T00:00:00.000Z' })
  ];

  it('filters by status and search query', () => {
    const result = filterAndSortPages(pages, {
      q: 'serv',
      status: 'published',
      sortBy: 'title_asc'
    });

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('service');
  });

  it('sorts by updated date descending', () => {
    const result = filterAndSortPages(pages, {
      q: '',
      status: 'all',
      sortBy: 'updated_desc'
    });

    expect(result.map((page) => page.id)).toEqual(['contact', 'service', 'about']);
  });
});
