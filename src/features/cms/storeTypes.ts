export type BlogQueryInput = {
  includeDrafts: boolean;
  q?: string;
  status?: 'all' | 'draft' | 'published';
  category?: string;
  dateSort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
};

export type PortfolioQueryInput = {
  includeDrafts: boolean;
  q?: string;
  status?: 'all' | 'draft' | 'published';
  tag?: string;
  featured?: 'all' | 'featured' | 'standard';
  dateSort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
};
