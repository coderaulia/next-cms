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
  animatedWords?: string[];
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

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  createdAt: string;
  updatedAt: string;
};

export type MediaAsset = {
  id: string;
  title: string;
  url: string;
  altText: string;
  mimeType: string;
  width: number | null;
  height: number | null;
  sizeBytes: number | null;
  storageProvider: string;
  storageKey: string | null;
  createdAt: string;
  updatedAt: string;
};

export type ContactSubmissionStatus = 'new' | 'in_review' | 'closed';

export type ContactSubmission = {
  id: string;
  name: string;
  company: string;
  email: string;
  serviceCategory: string;
  projectOverview: string;
  status: ContactSubmissionStatus;
  createdAt: string;
};

export type GeneralSettings = {
  siteName: string;
  siteTagline: string;
  baseUrl: string;
  adminEmail: string;
  timezone: string;
  language: string;
  dateFormat: string;
  timeFormat: string;
  weekStartsOn: 0 | 1 | 2 | 3 | 4 | 5 | 6;
};

export type WritingSettings = {
  defaultPostCategory: string;
  defaultPostFormat: 'standard' | 'aside' | 'gallery' | 'video';
  defaultPostStatus: BlogStatus;
  defaultPostAuthor: string;
  convertEmoticons: boolean;
  requireReviewBeforePublish: boolean;
  pingServices: string[];
};

export type ReadingSettings = {
  homepageDisplay: 'latest_posts' | 'static_page';
  homepagePageId: PageId | '';
  postsPageId: PageId | '';
  postsPerPage: number;
  feedItems: number;
  feedSummary: 'full' | 'excerpt';
  discourageSearchEngines: boolean;
};

export type DiscussionSettings = {
  commentsEnabled: boolean;
  commentRegistrationRequired: boolean;
  closeCommentsAfterDays: number;
  threadedCommentsEnabled: boolean;
  threadDepth: number;
  requireCommentApproval: boolean;
  notifyOnComment: boolean;
};

export type MediaSettings = {
  uploadOrganizeByMonth: boolean;
  thumbnailWidth: number;
  thumbnailHeight: number;
  mediumMaxWidth: number;
  mediumMaxHeight: number;
  largeMaxWidth: number;
  largeMaxHeight: number;
};

export type PermalinkSettings = {
  postPermalinkStructure: string;
  categoryBase: string;
  tagBase: string;
};

export type SeoGlobalSettings = {
  titleTemplate: string;
  defaultMetaDescription: string;
  defaultOgImage: string;
  defaultNoIndex: boolean;
};

export type SitemapSettings = {
  enabled: boolean;
  includePages: boolean;
  includePosts: boolean;
  includeLastModified: boolean;
};

export type SiteSettings = {
  general: GeneralSettings;
  writing: WritingSettings;
  reading: ReadingSettings;
  discussion: DiscussionSettings;
  media: MediaSettings;
  permalinks: PermalinkSettings;
  seo: SeoGlobalSettings;
  sitemap: SitemapSettings;

  // Legacy aliases retained for backward compatibility in existing renderers.
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
  categories: Category[];
  mediaAssets: MediaAsset[];
};



