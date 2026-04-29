import { defaultContent } from './defaultContent';
import type {
  BlogPost,
  CmsContent,
  HomeBlock,
  LandingPage,
  PortfolioProject,
  SiteSettings
} from './types';

export const nowIso = () => new Date().toISOString();

export const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

function isPlaceholderAssetUrl(value: string) {
  try {
    const parsed = new URL(value);
    return /(^|\.)placehold\.co$/i.test(parsed.hostname) || /(^|\.)via\.placeholder\.com$/i.test(parsed.hostname);
  } catch {
    return false;
  }
}

function normalizeBrandAssetValue(value: unknown) {
  const candidate = String(value ?? '').trim();
  if (!candidate || isPlaceholderAssetUrl(candidate)) {
    return '';
  }
  return candidate;
}

function normalizeLinks(
  input: unknown,
  fallback: SiteSettings['navigation']['headerLinks']
): SiteSettings['navigation']['headerLinks'] {
  if (!Array.isArray(input)) return fallback;

  const links = input
    .map((entry, index) => {
      const row = isObject(entry) ? entry : {};
      const label = String(row.label ?? '').trim();
      const href = String(row.href ?? '').trim();
      if (!label || !href) return null;
      return {
        id: String(row.id ?? '').trim() || `link-${index + 1}`,
        label,
        href,
        enabled: typeof row.enabled === 'boolean' ? row.enabled : true
      };
    })
    .filter((entry): entry is SiteSettings['navigation']['headerLinks'][number] => Boolean(entry));

  return links;
}

export function normalizeSettings(input: unknown): SiteSettings {
  const defaults = structuredClone(defaultContent.settings);
  const source = isObject(input) ? input : {};

  const general = isObject(source.general) ? source.general : {};
  const navigation = isObject(source.navigation) ? source.navigation : {};
  const contact = isObject(source.contact) ? source.contact : {};
  const social = isObject(source.social) ? source.social : {};
  const branding = isObject(source.branding) ? source.branding : {};
  const writing = isObject(source.writing) ? source.writing : {};
  const reading = isObject(source.reading) ? source.reading : {};
  const discussion = isObject(source.discussion) ? source.discussion : {};
  const media = isObject(source.media) ? source.media : {};
  const permalinks = isObject(source.permalinks) ? source.permalinks : {};
  const seo = isObject(source.seo) ? source.seo : {};
  const sitemap = isObject(source.sitemap) ? source.sitemap : {};

  const next: SiteSettings = {
    ...defaults,
    general: { ...defaults.general, ...general },
    navigation: {
      ...defaults.navigation,
      ...navigation,
      headerLinks: normalizeLinks(navigation.headerLinks, defaults.navigation.headerLinks),
      footerNavigatorLinks: normalizeLinks(
        navigation.footerNavigatorLinks,
        defaults.navigation.footerNavigatorLinks
      ),
      footerServiceLinks: normalizeLinks(
        navigation.footerServiceLinks,
        defaults.navigation.footerServiceLinks
      )
    },
    contact: { ...defaults.contact, ...contact },
    social: { ...defaults.social, ...social },
    branding: { ...defaults.branding, ...branding },
    writing: {
      ...defaults.writing,
      ...writing,
      pingServices: Array.isArray(writing.pingServices)
        ? writing.pingServices.map((service) => String(service).trim()).filter(Boolean)
        : defaults.writing.pingServices
    },
    reading: { ...defaults.reading, ...reading },
    discussion: { ...defaults.discussion, ...discussion },
    media: { ...defaults.media, ...media },
    permalinks: { ...defaults.permalinks, ...permalinks },
    seo: { ...defaults.seo, ...seo },
    sitemap: { ...defaults.sitemap, ...sitemap }
  } as SiteSettings;

  if (typeof source.siteName === 'string' && source.siteName.trim().length > 0) {
    next.general.siteName = source.siteName.trim();
  }
  if (typeof source.baseUrl === 'string' && source.baseUrl.trim().length > 0) {
    next.general.baseUrl = source.baseUrl.trim();
  }
  if (typeof source.defaultOgImage === 'string' && source.defaultOgImage.trim().length > 0) {
    next.seo.defaultOgImage = source.defaultOgImage.trim();
  }

  next.branding.headerLogo = normalizeBrandAssetValue(next.branding.headerLogo);
  next.branding.footerLogo = normalizeBrandAssetValue(next.branding.footerLogo);
  next.branding.siteIcon = normalizeBrandAssetValue(next.branding.siteIcon);
  next.organizationLogo = normalizeBrandAssetValue(source.organizationLogo ?? next.organizationLogo);
  if (!next.organizationLogo && next.branding.headerLogo) {
    next.organizationLogo = next.branding.headerLogo;
  }

  next.siteName = next.general.siteName;
  next.baseUrl = next.general.baseUrl;
  next.defaultOgImage = next.seo.defaultOgImage;

  return next;
}

export const normalizeSlug = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');

export const reservedPageSlugs = new Set(['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt']);

export const normalizeHomeBlocks = (blocks: HomeBlock[] | undefined): HomeBlock[] | undefined => {
  if (!blocks) return undefined;
  return blocks.map((block, index) => ({
    ...block,
    id: block.id || `home-block-${index + 1}`
  }));
};

export function mergeWithDefaults(content: CmsContent): CmsContent {
  return {
    settings: normalizeSettings(content.settings),
    pages: {
      ...structuredClone(defaultContent.pages),
      ...content.pages
    },
    blogPosts: Array.isArray(content.blogPosts)
      ? content.blogPosts
      : structuredClone(defaultContent.blogPosts),
    portfolioProjects: Array.isArray(content.portfolioProjects)
      ? content.portfolioProjects
      : structuredClone(defaultContent.portfolioProjects),
    categories: Array.isArray(content.categories)
      ? content.categories
      : structuredClone(defaultContent.categories),
    mediaAssets: Array.isArray(content.mediaAssets)
      ? content.mediaAssets
      : structuredClone(defaultContent.mediaAssets)
  };
}

export function isPostSlugTaken(posts: BlogPost[], slug: string, ignoreId?: string) {
  return posts.some((post) => post.seo.slug === slug && post.id !== ignoreId);
}

export function uniquePostSlug(
  posts: BlogPost[],
  title: string,
  requestedSlug?: string,
  ignoreId?: string
) {
  const source = requestedSlug && requestedSlug.length > 0 ? requestedSlug : title;
  const base = normalizeSlug(source) || 'post';
  if (!isPostSlugTaken(posts, base, ignoreId)) return base;

  let i = 2;
  while (isPostSlugTaken(posts, `${base}-${i}`, ignoreId)) {
    i += 1;
  }

  return `${base}-${i}`;
}

export function isPortfolioSlugTaken(projects: PortfolioProject[], slug: string, ignoreId?: string) {
  return projects.some((project) => project.seo.slug === slug && project.id !== ignoreId);
}

export function uniquePortfolioSlug(
  projects: PortfolioProject[],
  title: string,
  requestedSlug?: string,
  ignoreId?: string
) {
  const source = requestedSlug && requestedSlug.length > 0 ? requestedSlug : title;
  const base = normalizeSlug(source) || 'project';
  if (!isPortfolioSlugTaken(projects, base, ignoreId)) return base;

  let i = 2;
  while (isPortfolioSlugTaken(projects, `${base}-${i}`, ignoreId)) {
    i += 1;
  }

  return `${base}-${i}`;
}

export function normalizePageForWrite(
  page: LandingPage,
  existingPages: LandingPage[]
): LandingPage {
  const candidateSlug = page.id === 'home' ? '' : normalizeSlug(page.seo.slug || page.id) || page.id;
  let slug = candidateSlug;

  if (reservedPageSlugs.has(slug)) {
    slug = `${slug}-${page.id}`;
  }

  const duplicate = existingPages.find((entry) => entry.id !== page.id && entry.seo.slug === slug);
  if (duplicate) {
    slug = `${slug}-${page.id}`;
  }

  return {
    ...page,
    homeBlocks:
      page.id === 'home'
        ? normalizeHomeBlocks(
            page.homeBlocks ?? existingPages.find((entry) => entry.id === 'home')?.homeBlocks ?? []
          )
        : page.homeBlocks,
    seo: {
      ...page.seo,
      slug
    },
    updatedAt: nowIso()
  };
}
