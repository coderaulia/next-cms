import type {
  BlogPost,
  Category,
  ContactSubmission,
  ContactSubmissionStatus,
  CtaStyleToken,
  HomeBlock,
  HomeBlockType,
  HomeThemeToken,
  LandingPage,
  MediaAsset,
  PageId,
  PortfolioProject,
  PortfolioStatus,
  SiteSettings
} from './types';
import { isServiceDetailPageId } from './servicePages';

const PAGE_IDS: PageId[] = [
  'home',
  'about',
  'service',
  'product-hris',
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
const CONTACT_SUBMISSION_STATUSES: ContactSubmissionStatus[] = ['new', 'in_review', 'closed'];
const PORTFOLIO_STATUSES: PortfolioStatus[] = ['draft', 'published'];
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

const asKeywords = (value: unknown): string[] => {
  const values = Array.isArray(value)
    ? value
    : typeof value === 'string'
      ? value.split(',')
      : [];

  return values
    .map((entry) => asString(entry).trim().toLowerCase())
    .filter((entry) => entry.length > 0)
    .filter((entry, index, list) => list.indexOf(entry) === index);
};

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

const asNullableIso = (value: unknown) => {
  const candidate = asString(value).trim();
  if (!candidate) return null;
  const parsed = new Date(candidate);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
};

const isHomeTheme = (value: string): value is HomeThemeToken =>
  HOME_THEMES.includes(value as HomeThemeToken);

const isCtaStyle = (value: string): value is CtaStyleToken =>
  CTA_STYLES.includes(value as CtaStyleToken);

const isContactSubmissionStatus = (value: string): value is ContactSubmissionStatus =>
  CONTACT_SUBMISSION_STATUSES.includes(value as ContactSubmissionStatus);

const isPortfolioStatus = (value: string): value is PortfolioStatus =>
  PORTFOLIO_STATUSES.includes(value as PortfolioStatus);

const normalizeSlugValue = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

const isSafeAbsoluteUrl = (value: string, allowedProtocols: string[]) => {
  try {
    const parsed = new URL(value);
    return allowedProtocols.includes(parsed.protocol);
  } catch {
    return false;
  }
};

const asSafeHref = (value: unknown) => {
  const trimmed = asString(value).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/') || trimmed.startsWith('#')) return trimmed;
  return isSafeAbsoluteUrl(trimmed, ['http:', 'https:', 'mailto:', 'tel:']) ? trimmed : '';
};

const asSafeAssetUrl = (value: unknown) => {
  const trimmed = asString(value).trim();
  if (!trimmed) return '';
  if (trimmed.startsWith('/')) return trimmed;
  return isSafeAbsoluteUrl(trimmed, ['http:', 'https:']) ? trimmed : '';
};

const asSafeBaseUrl = (value: unknown) => {
  const trimmed = asString(value).trim();
  return isSafeAbsoluteUrl(trimmed, ['http:', 'https:']) ? trimmed : '';
};

const asTheme = (value: unknown): HomeThemeToken => {
  const token = asString(value);
  return isHomeTheme(token) ? token : 'light';
};

const asCtaStyle = (value: unknown, fallback: CtaStyleToken = 'primary'): CtaStyleToken => {
  const token = asString(value);
  return isCtaStyle(token) ? token : fallback;
};

const asContactSubmissionStatus = (
  value: unknown,
  fallback: ContactSubmissionStatus = 'new'
): ContactSubmissionStatus => {
  const token = asString(value);
  return isContactSubmissionStatus(token) ? token : fallback;
};

const asPortfolioStatus = (
  value: unknown,
  fallback: PortfolioStatus = 'draft'
): PortfolioStatus => {
  const token = asString(value);
  return isPortfolioStatus(token) ? token : fallback;
};

const asStringArray = (value: unknown): string[] => {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => asString(entry).trim())
    .filter((entry) => entry.length > 0);
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
    const animatedWords = Array.isArray(input.animatedWords)
      ? input.animatedWords
          .map((word) => asString(word))
          .filter((word) => word.length > 0)
      : undefined;

    return {
      ...common,
      type: 'hero',
      badge: asString(input.badge),
      titlePrimary: asString(input.titlePrimary),
      titleAccent: asString(input.titleAccent),
      description: asString(input.description),
      primaryCtaLabel: asString(input.primaryCtaLabel),
      primaryCtaHref: asSafeHref(input.primaryCtaHref),
      primaryCtaStyle: asCtaStyle(input.primaryCtaStyle, 'primary'),
      secondaryCtaLabel: asString(input.secondaryCtaLabel),
      secondaryCtaHref: asSafeHref(input.secondaryCtaHref),
      secondaryCtaStyle: asCtaStyle(input.secondaryCtaStyle, 'secondary'),
      animatedWords
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
            ctaHref: asSafeHref(row.ctaHref)
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
      mediaImage: asSafeAssetUrl(input.mediaImage),
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
      primaryCtaHref: asSafeHref(input.primaryCtaHref),
      secondaryCtaLabel: asString(input.secondaryCtaLabel),
      secondaryCtaHref: asSafeHref(input.secondaryCtaHref)
    };
  }

  return {
    ...common,
    type: 'primary_cta',
    heading: asString(input.heading),
    accentText: asString(input.accentText),
    description: asString(input.description),
    ctaLabel: asString(input.ctaLabel),
    ctaHref: asSafeHref(input.ctaHref),
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
      ctaHref: asSafeHref(section.ctaHref),
      mediaImage: asSafeAssetUrl(section.mediaImage),
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
    scheduledPublishAt: asNullableIso(payload.scheduledPublishAt),
    scheduledUnpublishAt: asNullableIso(payload.scheduledUnpublishAt),
    seo: {
      metaTitle: asString(rawSeo.metaTitle),
      metaDescription: asString(rawSeo.metaDescription),
      slug: asString(rawSeo.slug),
      canonical: asSafeBaseUrl(rawSeo.canonical),
      socialImage: asSafeAssetUrl(rawSeo.socialImage),
      noIndex: asBoolean(rawSeo.noIndex),
      keywords: asKeywords(rawSeo.keywords)
    },
    sections,
    homeBlocks,
    updatedAt: asString(payload.updatedAt)
  };
}

export function validateBlogPost(payload: unknown): BlogPost | null {
  if (!isObject(payload)) return null;

  const id = asString(payload.id).trim();
  const title = asString(payload.title).trim();
  // Require both id and title — an empty post cannot be meaningfully stored.
  if (!id || !title) return null;

  const rawSeo = isObject(payload.seo) ? payload.seo : {};
  const tags = Array.isArray(payload.tags)
    ? payload.tags.map((tag) => asString(tag)).filter((tag) => tag.length > 0)
    : [];

  const status = asString(payload.status) === 'published' ? 'published' : 'draft';

  return {
    id,
    title,
    excerpt: asString(payload.excerpt),
    content: asString(payload.content),
    author: asString(payload.author),
    tags,
    coverImage: asSafeAssetUrl(payload.coverImage),
    status,
    publishedAt: payload.publishedAt ? asString(payload.publishedAt) : null,
    scheduledPublishAt: asNullableIso(payload.scheduledPublishAt),
    scheduledUnpublishAt: asNullableIso(payload.scheduledUnpublishAt),
    updatedAt: asString(payload.updatedAt),
    seo: {
      metaTitle: asString(rawSeo.metaTitle),
      metaDescription: asString(rawSeo.metaDescription),
      slug: asString(rawSeo.slug),
      canonical: asSafeBaseUrl(rawSeo.canonical),
      socialImage: asSafeAssetUrl(rawSeo.socialImage),
      noIndex: asBoolean(rawSeo.noIndex),
      keywords: asKeywords(rawSeo.keywords)
    }
  };
}

export function validatePortfolioProject(payload: unknown): PortfolioProject | null {
  if (!isObject(payload)) return null;

  const rawSeo = isObject(payload.seo) ? payload.seo : {};
  const title = asString(payload.title).trim();
  if (!title) return null;

  const status = asPortfolioStatus(payload.status, 'draft');
  const normalizedSlug = normalizeSlugValue(asString(rawSeo.slug)) || normalizeSlugValue(title) || 'portfolio-project';

  const gallery = asStringArray(payload.gallery)
    .map((entry) => asSafeAssetUrl(entry))
    .filter((entry) => entry.length > 0);

  const tags = asStringArray(payload.tags)
    .map((tag) => normalizeSlugValue(tag))
    .filter((tag) => tag.length > 0)
    .filter((tag, index, list) => list.indexOf(tag) === index);

  const relatedServicePageIds = asStringArray(payload.relatedServicePageIds)
    .filter((id): id is PortfolioProject['relatedServicePageIds'][number] => isServiceDetailPageId(id))
    .filter((id, index, list) => list.indexOf(id) === index);

  return {
    id: asString(payload.id) || crypto.randomUUID(),
    title,
    summary: asString(payload.summary),
    challenge: asString(payload.challenge),
    solution: asString(payload.solution),
    outcome: asString(payload.outcome),
    clientName: asString(payload.clientName),
    serviceType: asString(payload.serviceType),
    industry: asString(payload.industry),
    projectUrl: asSafeHref(payload.projectUrl),
    relatedServicePageIds,
    coverImage: asSafeAssetUrl(payload.coverImage),
    gallery,
    tags,
    featured: asBoolean(payload.featured),
    status,
    sortOrder: asIntegerClamp(payload.sortOrder, 0, 0, 10000),
    publishedAt: status === 'published' ? asString(payload.publishedAt) || new Date().toISOString() : null,
    scheduledPublishAt: asNullableIso(payload.scheduledPublishAt),
    scheduledUnpublishAt: asNullableIso(payload.scheduledUnpublishAt),
    updatedAt: asString(payload.updatedAt) || new Date().toISOString(),
    seo: {
      metaTitle: asString(rawSeo.metaTitle) || title,
      metaDescription: asString(rawSeo.metaDescription),
      slug: normalizedSlug,
      canonical: asSafeBaseUrl(rawSeo.canonical),
      socialImage: asSafeAssetUrl(rawSeo.socialImage),
      noIndex: asBoolean(rawSeo.noIndex),
      keywords: asKeywords(rawSeo.keywords)
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
  const url = asSafeAssetUrl(payload.url);
  const mimeType = asString(payload.mimeType) || 'image/png';
  const altText = asString(payload.altText).trim();
  if (!title || !url) {
    return null;
  }
  if (mimeType.toLowerCase().startsWith('image/') && !altText) {
    return null;
  }

  const asNullableInteger = (value: unknown) => {
    if (value === null || typeof value === 'undefined' || value === '') return null;
    const candidate = Math.round(asNumber(value, Number.NaN));
    return Number.isFinite(candidate) ? candidate : null;
  };

  const storageKey = asString(payload.storageKey).trim();

  return {
    id: asString(payload.id) || crypto.randomUUID(),
    title,
    url,
    altText,
    mimeType,
    width: asNullableInteger(payload.width),
    height: asNullableInteger(payload.height),
    sizeBytes: asNullableInteger(payload.sizeBytes),
    checksumSha256: asString(payload.checksumSha256).trim() || null,
    storageProvider: asString(payload.storageProvider) || 'external-url',
    storageKey: storageKey || null,
    createdAt: asString(payload.createdAt) || new Date().toISOString(),
    updatedAt: asString(payload.updatedAt) || new Date().toISOString()
  };
}

export function validateContactSubmission(payload: unknown): ContactSubmission | null {
  if (!isObject(payload)) return null;

  const name = asString(payload.name).trim();
  const email = asString(payload.email).trim().toLowerCase();
  const serviceCategory = asString(payload.serviceCategory).trim();
  const projectOverview = asString(payload.projectOverview).trim();

  const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  if (!name || !emailOk || !serviceCategory || !projectOverview) {
    return null;
  }

  return {
    id: asString(payload.id) || crypto.randomUUID(),
    name,
    company: asString(payload.company).trim(),
    email,
    serviceCategory,
    projectOverview,
    status: asContactSubmissionStatus(payload.status, 'new'),
    createdAt: asString(payload.createdAt) || new Date().toISOString()
  };
}

export function validateContactSubmissionStatus(value: unknown): ContactSubmissionStatus | null {
  const status = asString(value);
  return isContactSubmissionStatus(status) ? status : null;
}

function asNavigationLinks(
  value: unknown,
  fallbackPrefix: string
): SiteSettings['navigation']['headerLinks'] {
  if (!Array.isArray(value)) return [];

  return value
    .map((entry, index) => {
      const item = isObject(entry) ? entry : {};
      const label = asString(item.label).trim();
      const href = asSafeHref(item.href);
      const enabled = typeof item.enabled === 'boolean' ? item.enabled : true;
      if (!label || !href) return null;

      const children = Array.isArray(item.children) 
        ? asNavigationLinks(item.children, `${fallbackPrefix}-${index + 1}-child`) 
        : undefined;

      return {
        id: asString(item.id).trim() || `${fallbackPrefix}-${index + 1}`,
        label,
        href,
        enabled,
        ...(children && children.length > 0 ? { children } : {})
      };
    })
    .filter((entry): entry is SiteSettings['navigation']['headerLinks'][number] => Boolean(entry));
}

export function validateSiteSettings(payload: unknown): SiteSettings | null {
  if (!isObject(payload)) return null;

  const general = isObject(payload.general) ? payload.general : {};
  const navigation = isObject(payload.navigation) ? payload.navigation : {};
  const contact = isObject(payload.contact) ? payload.contact : {};
  const social = isObject(payload.social) ? payload.social : {};
  const branding = isObject(payload.branding) ? payload.branding : {};
  const writing = isObject(payload.writing) ? payload.writing : {};
  const reading = isObject(payload.reading) ? payload.reading : {};
  const discussion = isObject(payload.discussion) ? payload.discussion : {};
  const media = isObject(payload.media) ? payload.media : {};
  const permalinks = isObject(payload.permalinks) ? payload.permalinks : {};
  const seo = isObject(payload.seo) ? payload.seo : {};
  const sitemap = isObject(payload.sitemap) ? payload.sitemap : {};

  const siteName = asString(general.siteName) || asString(payload.siteName);
  const baseUrl = asSafeBaseUrl(general.baseUrl) || asSafeBaseUrl(payload.baseUrl);
  const defaultOgImage = asSafeAssetUrl(seo.defaultOgImage) || asSafeAssetUrl(payload.defaultOgImage);

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
    navigation: {
      headerLinks: asNavigationLinks(navigation.headerLinks, 'header-link'),
      headerCtaLabel: asString(navigation.headerCtaLabel) || 'Book Consultation',
      headerCtaHref: asSafeHref(navigation.headerCtaHref) || '/contact',
      footerNavigatorLinks: asNavigationLinks(navigation.footerNavigatorLinks, 'footer-nav'),
      footerServiceLinks: asNavigationLinks(navigation.footerServiceLinks, 'footer-service')
    },
    contact: {
      companyName: asString(contact.companyName),
      addressLine1: asString(contact.addressLine1),
      addressLine2: asString(contact.addressLine2),
      globalReachLabel: asString(contact.globalReachLabel),
      globalReachText: asString(contact.globalReachText),
      emailLabel: asString(contact.emailLabel) || 'Email us',
      emailValue: asString(contact.emailValue),
      emailHref: asSafeHref(contact.emailHref),
      whatsappLabel: asString(contact.whatsappLabel) || 'WhatsApp Business',
      whatsappValue: asString(contact.whatsappValue),
      whatsappHref: asSafeHref(contact.whatsappHref),
      instagramLabel: asString(contact.instagramLabel) || 'Instagram',
      instagramValue: asString(contact.instagramValue),
      instagramHref: asSafeHref(contact.instagramHref)
    },
    social: {
      chatHref: asSafeHref(social.chatHref),
      instagramHref: asSafeHref(social.instagramHref),
      websiteHref: asSafeHref(social.websiteHref),
      emailHref: asSafeHref(social.emailHref)
    },
    branding: {
      headerLogo: asSafeAssetUrl(branding.headerLogo),
      footerLogo: asSafeAssetUrl(branding.footerLogo),
      siteIcon: asSafeAssetUrl(branding.siteIcon),
      footerTagline: asString(branding.footerTagline),
      footerBadgePrimary: asString(branding.footerBadgePrimary),
      footerBadgeSecondary: asString(branding.footerBadgeSecondary),
      copyrightText: asString(branding.copyrightText)
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
      includePortfolio: asBoolean(sitemap.includePortfolio),
      includeLastModified: asBoolean(sitemap.includeLastModified)
    },
    siteName,
    baseUrl,
    organizationName: asString(payload.organizationName),
    organizationLogo: asSafeAssetUrl(payload.organizationLogo),
    defaultOgImage
  };
}
