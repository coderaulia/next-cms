import type {
  BlogPost,
  CtaStyleToken,
  HomeBlock,
  HomeBlockType,
  HomeThemeToken,
  LandingPage,
  PageId
} from './types';

const PAGE_IDS: PageId[] = ['home', 'about', 'service', 'contact'];
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

const isHomeTheme = (value: string): value is HomeThemeToken =>
  HOME_THEMES.includes(value as HomeThemeToken);

const isCtaStyle = (value: string): value is CtaStyleToken =>
  CTA_STYLES.includes(value as CtaStyleToken);

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
