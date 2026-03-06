import type {
  BlogPost,
  Category,
  CtaStyleToken,
  HomeBlock,
  HomeBlockType,
  HomeThemeToken,
  LandingPage,
  MediaAsset,
  PageId,
  SiteSettings
} from './types';

const PAGE_IDS: PageId[] = [
  'home',
  'about',
  'service',
  'contact',
  'partnership',
  'service-website-development',
  'service-custom-business-tools',
  'service-secure-online-shops',
  'service-mobile-business-app',
  'service-official-business-email'
];
const HOME_THEMES: HomeThemeToken[] = ['light', 'blue-soft', 'mist'];
const CTA_STYLES: CtaStyleToken[] = ['primary', 'secondary', 'ghost'];
const HOME_BLOCK_TYPES: HomeBlockType[] = [
  'hero',
  'value_triplet',
  'solutions_grid',
  'why_split',
  'logo_cloud',
  'primary_cta'
];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

const asBoolean = (value: unknown) => Boolean(value);

const asNumber = (value: unknown, fallback = 0) => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return parsed;
  }
  return fallback;
};

const asIntegerClamp = (value: unknown, fallback: number, min: number, max: number) => {
  const candidate = Math.round(asNumber(value, fallback));
  if (!Number.isFinite(candidate)) return fallback;
  return Math.min(max, Math.max(min, candidate));
};

const isHomeTheme = (value: string): value is HomeThemeToken =>
  HOME_THEMES.includes(value as HomeThemeToken);

const isCtaStyle = (value: string): value is CtaStyleToken =>
  CTA_STYLES.includes(value as CtaStyleToken);

const normalizeSlugValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const asTheme = (value: unknown): HomeThemeToken => {
  const token = asString(value);
  return isHomeTheme(token) ? token : 'light';
};

const asCtaStyle = (value: unknown, fallback: CtaStyleToken = 'primary'): CtaStyleToken => {
  const token = asString(value);
  return isCtaStyle(token) ? token : fallback;
};

function parseHomeBlock(input: unknown, index: number): HomeBlock | null {
  if (!isObject(input)) return null;
  const type = asString(input.type);
  if (!HOME_BLOCK_TYPES.includes(type as HomeBlockType)) {
    return null;
  }
  const common = {
    id: asString(input.id) || `home-block-${index + 1}`,
    type: type as HomeBlockType,
    enabled: asBoolean(input.enabled),
    theme: asTheme(input.theme)
  };

  if (type === 'hero') {
    return {
      ...common,
      type: 'hero',
      badge: asString(input.badge),
      titlePrimary: asString(input.titlePrimary),
      titleAccent: asString(input.titleAccent),
      description: asString(input.description),
      primaryCtaLabel: asString(input.primaryCtaLabel),
      primaryCtaHref: asString(input.primaryCtaHref),
      primaryCtaStyle: asCtaStyle(input.primaryCtaStyle, 'primary'),
      secondaryCtaLabel: asString(input.secondaryCtaLabel),
      secondaryCtaHref: asString(input.secondaryCtaHref),
      secondaryCtaStyle: asCtaStyle(input.secondaryCtaStyle, 'secondary')
    };
  }

  if (type === 'value_triplet') {
    const items = Array.isArray(input.items)
      ? input.items.map((item, itemIndex) => {
          const row = isObject(item) ? item : {};
          return {
            id: asString(row.id) || `value-item-${itemIndex + 1}`,
            icon: asString(row.icon),
            title: asString(row.title),
            text: asString(row.text)
          };
        })
      : [];
    return {
      ...common,
      type: 'value_triplet',
      items
    };
  }

  if (type === 'solutions_grid') {
    const items = Array.isArray(input.items)
      ? input.items.map((item, itemIndex) => {
          const row = isObject(item) ? item : {};
          return {
            id: asString(row.id) || `solution-item-${itemIndex + 1}`,
            number: asString(row.number) || String(itemIndex + 1).padStart(2, '0'),
            title: asString(row.title),
            text: asString(row.text),
            ctaLabel: asString(row.ctaLabel),
            ctaHref: asString(row.ctaHref)
          };
        })
      : [];
    return {
      ...common,
      type: 'solutions_grid',
      heading: asString(input.heading),
      subheading: asString(input.subheading),
      items
    };
  }

  if (type === 'why_split') {
    const bullets = Array.isArray(input.bullets)
      ? input.bullets.map((bullet, bulletIndex) => {
          const row = isObject(bullet) ? bullet : {};
          return {
            id: asString(row.id) || `why-bullet-${bulletIndex + 1}`,
            title: asString(row.title),
            text: asString(row.text)
          };
        })
      : [];
    return {
      ...common,
      type: 'why_split',
      heading: asString(input.heading),
      description: asString(input.description),
      bullets,
      mediaImage: asString(input.mediaImage),
      mediaAlt: asString(input.mediaAlt)
    };
  }

  if (type === 'logo_cloud') {
    const logos = Array.isArray(input.logos)
      ? input.logos.map((logo, logoIndex) => {
          const row = isObject(logo) ? logo : {};
          return {
            id: asString(row.id) || `logo-${logoIndex + 1}`,
            name: asString(row.name)
          };
        })
      : [];
    return {
      ...common,
      type: 'logo_cloud',
      heading: asString(input.heading),
      logos,
      primaryCtaLabel: asString(input.primaryCtaLabel),
      primaryCtaHref: asString(input.primaryCtaHref),
      secondaryCtaLabel: asString(input.secondaryCtaLabel),
      secondaryCtaHref: asString(input.secondaryCtaHref)
    };
  }

  return {
    ...common,
    type: 'primary_cta',
    heading: asString(input.heading),
    accentText: asString(input.accentText),
    description: asString(input.description),
    ctaLabel: asString(input.ctaLabel),
    ctaHref: asString(input.ctaHref),
    ctaStyle: asCtaStyle(input.ctaStyle, 'primary')
  };
}

export function isValidPageId(id: string): id is PageId {
  return PAGE_IDS.includes(id as PageId);
}

export function validateLandingPage(payload: unknown): LandingPage | null {
  if (!isObject(payload)) return null;
  if (!isValidPageId(asString(payload.id))) return null;

  const rawSeo = isObject(payload.seo) ? payload.seo : {};
  const rawSections = Array.isArray(payload.sections) ? payload.sections : [];
  const rawHomeBlocks = Array.isArray(payload.homeBlocks) ? payload.homeBlocks : undefined;

  const sections = rawSections.map((item, index) => {
    const section = isObject(item) ? item : {};
    const theme = isObject(section.theme) ? section.theme : {};
    const layoutCandidate = asString(section.layout);
    return {
      id: asString(section.id) || `section-${index + 1}`,
      heading: asString(section.heading),
      body: asString(section.body),
      ctaLabel: asString(section.ctaLabel),
      ctaHref: asString(section.ctaHref),
      mediaImage: asString(section.mediaImage),
      mediaAlt: asString(section.mediaAlt),
      layout: layoutCandidate === 'split' ? 'split' : 'stacked',
      theme: {
        background: asString(theme.background) || '#ffffff',
        text: asString(theme.text) || '#111827',
        accent: asString(theme.accent) || '#0f766e'
      }
    } as LandingPage['sections'][number];
  });

  let homeBlocks: LandingPage['homeBlocks'] | undefined;
  if (rawHomeBlocks) {
    const parsed = rawHomeBlocks.map(parseHomeBlock);
    if (parsed.some((block) => block === null)) return null;
    homeBlocks = parsed as HomeBlock[];
  }

  return {
    id: asString(payload.id) as PageId,
    title: asString(payload.title),
    navLabel: asString(payload.navLabel),
    published: asBoolean(payload.published),
    seo: {
      metaTitle: asString(rawSeo.metaTitle),
      metaDescription: asString(rawSeo.metaDescription),
      slug: asString(rawSeo.slug),
      canonical: asString(rawSeo.canonical),
      socialImage: asString(rawSeo.socialImage),
      noIndex: asBoolean(rawSeo.noIndex)
    },
    sections,
    homeBlocks,
    updatedAt: asString(payload.updatedAt)
  };
}

export function validateBlogPost(payload: unknown): BlogPost | null {
  if (!isObject(payload)) return null;
  const rawSeo = isObject(payload.seo) ? payload.seo : {};
  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => asString(tag)).filter((tag) => tag.length > 0)
    : [];

  const status = asString(payload.status) === 'published' ? 'published' : 'draft';

  return {
    id: asString(payload.id),
    title: asString(payload.title),
    excerpt: asString(payload.excerpt),
    content: asString(payload.content),
    author: asString(payload.author),
    tags,
    coverImage: asString(payload.coverImage),
    status,
    publishedAt: payload.publishedAt ? asString(payload.publishedAt) : null,
    updatedAt: asString(payload.updatedAt),
    seo: {
      metaTitle: asString(rawSeo.metaTitle),
      metaDescription: asString(rawSeo.metaDescription),
      slug: asString(rawSeo.slug),
      canonical: asString(rawSeo.canonical),
      socialImage: asString(rawSeo.socialImage),
      noIndex: asBoolean(rawSeo.noIndex)
    }
  };
}



export function validateCategory(payload: unknown): Category | null {
  if (!isObject(payload)) return null;

  const name = asString(payload.name).trim();
  const fallbackSlug = normalizeSlugValue(name) || 'category';
  const slug = normalizeSlugValue(asString(payload.slug)) || fallbackSlug;

  if (!name || !slug) {
    return null;
  }

  return {
    id: asString(payload.id) || crypto.randomUUID(),
    name,
    slug,
    description: asString(payload.description),
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    updatedAt: asString(payload.updatedAt) || new Date().toISOString()
  };
}

export function validateMediaAsset(payload: unknown): MediaAsset | null {
  if (!isObject(payload)) return null;

  const title = asString(payload.title).trim();
  const url = asString(payload.url).trim();
  if (!title || !url) {
    return null;
  }

  const asNullableInteger = (value: unknown) => {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    const candidate = Math.round(asNumber(value, NaN));
    return Number.isFinite(candidate) ? candidate : null;
  };

  return {
    id: asString(payload.id) || crypto.randomUUID(),
    title,
    url,
    altText: asString(payload.altText),
    mimeType: asString(payload.mimeType) || 'image/png',
    width: asNullableInteger(payload.width),
    height: asNullableInteger(payload.height),
    sizeBytes: asNullableInteger(payload.sizeBytes),
    storageProvider: asString(payload.storageProvider) || 'external-url',
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    updatedAt: asString(payload.updatedAt) || new Date().toISOString()
  };
}

export function validateSiteSettings(payload: unknown): SiteSettings | null {
  if (!isObject(payload)) return null;

  const general = isObject(payload.general) ? payload.general : {};
  const writing = isObject(payload.writing) ? payload.writing : {};
  const reading = isObject(payload.reading) ? payload.reading : {};
  const discussion = isObject(payload.discussion) ? payload.discussion : {};
  const media = isObject(payload.media) ? payload.media : {};
  const permalinks = isObject(payload.permalinks) ? payload.permalinks : {};
  const seo = isObject(payload.seo) ? payload.seo : {};
  const sitemap = isObject(payload.sitemap) ? payload.sitemap : {};

  const siteName = asString(general.siteName) || asString(payload.siteName);
  const baseUrl = asString(general.baseUrl) || asString(payload.baseUrl);
  const defaultOgImage = asString(seo.defaultOgImage) || asString(payload.defaultOgImage);

  const homepageDisplay = asString(reading.homepageDisplay) === 'latest_posts' ? 'latest_posts' : 'static_page';
  const homepagePageId = asString(reading.homepagePageId);
  const postsPageId = asString(reading.postsPageId);
  const feedSummary = asString(reading.feedSummary) === 'full' ? 'full' : 'excerpt';
  const defaultPostStatus = asString(writing.defaultPostStatus) === 'published' ? 'published' : 'draft';

  const defaultPostFormatCandidate = asString(writing.defaultPostFormat);
  const defaultPostFormat = ['standard', 'aside', 'gallery', 'video'].includes(defaultPostFormatCandidate)
    ? (defaultPostFormatCandidate as 'standard' | 'aside' | 'gallery' | 'video')
    : 'standard';

  const pingServices = Array.isArray(writing.pingServices)
    ? writing.pingServices.map((service) => asString(service)).filter((service) => service.length > 0)
    : [];

  return {
    general: {
      siteName,
      siteTagline: asString(general.siteTagline),
      baseUrl,
      adminEmail: asString(general.adminEmail),
      timezone: asString(general.timezone) || 'UTC',
      language: asString(general.language) || 'en-US',
      dateFormat: asString(general.dateFormat) || 'MMMM d, yyyy',
      timeFormat: asString(general.timeFormat) || 'HH:mm',
      weekStartsOn: asIntegerClamp(general.weekStartsOn, 1, 0, 6) as 0 | 1 | 2 | 3 | 4 | 5 | 6
    },
    writing: {
      defaultPostCategory: normalizeSlugValue(asString(writing.defaultPostCategory)) || 'general',
      defaultPostFormat,
      defaultPostStatus,
      defaultPostAuthor: asString(writing.defaultPostAuthor) || 'Admin',
      convertEmoticons: asBoolean(writing.convertEmoticons),
      requireReviewBeforePublish: asBoolean(writing.requireReviewBeforePublish),
      pingServices
    },
    reading: {
      homepageDisplay,
      homepagePageId: isValidPageId(homepagePageId) ? homepagePageId : '',
      postsPageId: isValidPageId(postsPageId) ? postsPageId : '',
      postsPerPage: asIntegerClamp(reading.postsPerPage, 10, 1, 100),
      feedItems: asIntegerClamp(reading.feedItems, 10, 1, 100),
      feedSummary,
      discourageSearchEngines: asBoolean(reading.discourageSearchEngines)
    },
    discussion: {
      commentsEnabled: asBoolean(discussion.commentsEnabled),
      commentRegistrationRequired: asBoolean(discussion.commentRegistrationRequired),
      closeCommentsAfterDays: asIntegerClamp(discussion.closeCommentsAfterDays, 30, 0, 365),
      threadedCommentsEnabled: asBoolean(discussion.threadedCommentsEnabled),
      threadDepth: asIntegerClamp(discussion.threadDepth, 3, 1, 10),
      requireCommentApproval: asBoolean(discussion.requireCommentApproval),
      notifyOnComment: asBoolean(discussion.notifyOnComment)
    },
    media: {
      uploadOrganizeByMonth: asBoolean(media.uploadOrganizeByMonth),
      thumbnailWidth: asIntegerClamp(media.thumbnailWidth, 300, 50, 2000),
      thumbnailHeight: asIntegerClamp(media.thumbnailHeight, 300, 50, 2000),
      mediumMaxWidth: asIntegerClamp(media.mediumMaxWidth, 768, 100, 4000),
      mediumMaxHeight: asIntegerClamp(media.mediumMaxHeight, 768, 100, 4000),
      largeMaxWidth: asIntegerClamp(media.largeMaxWidth, 1600, 200, 8000),
      largeMaxHeight: asIntegerClamp(media.largeMaxHeight, 1600, 200, 8000)
    },
    permalinks: {
      postPermalinkStructure: asString(permalinks.postPermalinkStructure) || '/blog/%postname%',
      categoryBase: asString(permalinks.categoryBase) || 'category',
      tagBase: asString(permalinks.tagBase) || 'tag'
    },
    seo: {
      titleTemplate: asString(seo.titleTemplate) || '%page_title% | %site_name%',
      defaultMetaDescription: asString(seo.defaultMetaDescription),
      defaultOgImage,
      defaultNoIndex: asBoolean(seo.defaultNoIndex)
    },
    sitemap: {
      enabled: asBoolean(sitemap.enabled),
      includePages: asBoolean(sitemap.includePages),
      includePosts: asBoolean(sitemap.includePosts),
      includeLastModified: asBoolean(sitemap.includeLastModified)
    },
    siteName,
    baseUrl,
    organizationName: asString(payload.organizationName),
    organizationLogo: asString(payload.organizationLogo),
    defaultOgImage
  };
}



