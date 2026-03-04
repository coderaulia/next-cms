import type { BlogPost, LandingPage, PageId } from './types';

const PAGE_IDS: PageId[] = ['home', 'about', 'service', 'contact'];

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value);

const asString = (value: unknown) => (typeof value === 'string' ? value : '');

const asBoolean = (value: unknown) => Boolean(value);

export function isValidPageId(id: string): id is PageId {
  return PAGE_IDS.includes(id as PageId);
}

export function validateLandingPage(payload: unknown): LandingPage | null {
  if (!isObject(payload)) return null;
  if (!isValidPageId(asString(payload.id))) return null;

  const rawSeo = isObject(payload.seo) ? payload.seo : {};
  const rawSections = Array.isArray(payload.sections) ? payload.sections : [];

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
