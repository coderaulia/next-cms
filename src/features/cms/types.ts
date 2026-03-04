export type PageId = 'home' | 'about' | 'service' | 'contact';

export type SectionLayout = 'stacked' | 'split';

export type BlogStatus = 'draft' | 'published';

export type SeoFields = {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  canonical: string;
  socialImage: string;
  noIndex: boolean;
};

export type SectionTheme = {
  background: string;
  text: string;
  accent: string;
};

export type PageSection = {
  id: string;
  heading: string;
  body: string;
  ctaLabel: string;
  ctaHref: string;
  mediaImage: string;
  mediaAlt: string;
  layout: SectionLayout;
  theme: SectionTheme;
};

export type LandingPage = {
  id: PageId;
  title: string;
  navLabel: string;
  published: boolean;
  seo: SeoFields;
  sections: PageSection[];
  updatedAt: string;
};

export type BlogPost = {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  author: string;
  tags: string[];
  coverImage: string;
  status: BlogStatus;
  publishedAt: string | null;
  updatedAt: string;
  seo: SeoFields;
};

export type SiteSettings = {
  siteName: string;
  baseUrl: string;
  organizationName: string;
  organizationLogo: string;
  defaultOgImage: string;
};

export type CmsContent = {
  settings: SiteSettings;
  pages: Record<PageId, LandingPage>;
  blogPosts: BlogPost[];
};

export type AdminSession = {
  token: string;
};
