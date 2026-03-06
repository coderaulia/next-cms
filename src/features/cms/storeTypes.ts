export type BlogQueryInput = {
  includeDrafts: boolean;
  q?: string;
  status?: 'all' | 'draft' | 'published';
  category?: string;
  dateSort?: 'newest' | 'oldest';
  page?: number;
  pageSize?: number;
};
