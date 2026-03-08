import type { LandingPage } from '@/features/cms/types';

export type PagesStatusFilter = 'all' | 'published' | 'draft';
export type PagesSortBy = 'updated_desc' | 'updated_asc' | 'title_asc';

export type PagesListQuery = {
  q: string;
  status: PagesStatusFilter;
  sortBy: PagesSortBy;
};

export function filterAndSortPages(pages: LandingPage[], query: PagesListQuery) {
  const needle = query.q.trim().toLowerCase();

  const filtered = pages.filter((page) => {
    if (query.status === 'published' && !page.published) return false;
    if (query.status === 'draft' && page.published) return false;

    if (!needle) return true;
    const title = page.title.toLowerCase();
    const navLabel = page.navLabel.toLowerCase();
    const slug = page.seo.slug.toLowerCase();
    return title.includes(needle) || navLabel.includes(needle) || slug.includes(needle);
  });

  const next = [...filtered];

  if (query.sortBy === 'updated_desc') {
    next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  } else if (query.sortBy === 'updated_asc') {
    next.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
  } else {
    next.sort((a, b) => a.title.localeCompare(b.title));
  }

  return next;
}
