export type PageId =
  | 'home'
  | 'about'
  | 'service'
  | 'contact'
  | 'partnership'
  | 'service-website-development'
  | 'service-custom-business-tools'
  | 'service-secure-online-shops'
  | 'service-mobile-business-app'
  | 'service-official-business-email';

export type SectionLayout = 'stacked' | 'split';

export type BlogStatus = 'draft' | 'published';

export type HomeThemeToken = 'light' | 'blue-soft' | 'mist';

export type CtaStyleToken = 'primary' | 'secondary' | 'ghost';

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

export type HomeBlockType =
  | 'hero'
  | 'value_triplet'
  | 'solutions_grid'
  | 'why_split'
  | 'logo_cloud'
  | 'primary_cta';

export type HomeBlockBase = {
  id: string;
  type: HomeBlockType;
  enabled: boolean;
  theme: HomeThemeToken;
};

export type HeroBlock = HomeBlockBase & {
  type: 'hero';
  badge: string;
  titlePrimary: string;
  titleAccent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  primaryCtaStyle: CtaStyleToken;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  secondaryCtaStyle: CtaStyleToken;
};

export type ValueTripletBlock = HomeBlockBase & {
  type: 'value_triplet';
  items: Array<{
    id: string;
    icon: string;
    title: string;
    text: string;
  }>;
};

export type SolutionsGridBlock = HomeBlockBase & {
  type: 'solutions_grid';
  heading: string;
  subheading: string;
  items: Array<{
    id: string;
    number: string;
    title: string;
    text: string;
    ctaLabel: string;
    ctaHref: string;
  }>;
};

export type WhySplitBlock = HomeBlockBase & {
  type: 'why_split';
  heading: string;
  description: string;
  bullets: Array<{
    id: string;
    title: string;
    text: string;
  }>;
  mediaImage: string;
  mediaAlt: string;
};

export type LogoCloudBlock = HomeBlockBase & {
  type: 'logo_cloud';
  heading: string;
  logos: Array<{
    id: string;
    name: string;
  }>;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
};

export type PrimaryCtaBlock = HomeBlockBase & {
  type: 'primary_cta';
  heading: string;
  accentText: string;
  description: string;
  ctaLabel: string;
  ctaHref: string;
  ctaStyle: CtaStyleToken;
};

export type HomeBlock =
  | HeroBlock
  | ValueTripletBlock
  | SolutionsGridBlock
  | WhySplitBlock
  | LogoCloudBlock
  | PrimaryCtaBlock;

export type LandingPage = {
  id: PageId;
  title: string;
  navLabel: string;
  published: boolean;
  seo: SeoFields;
  sections: PageSection[];
  homeBlocks?: HomeBlock[];
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

