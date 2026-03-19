import type { CmsContent, NavigationLink, PageId } from '@/features/cms/types';

export const bootstrapModules = ['services', 'blog', 'portfolio', 'partnership'] as const;
export const bootstrapPages = ['about', 'service', 'partnership', 'contact'] as const;
export const bootstrapVariants = ['brochure', 'blog-seo', 'portfolio-case-studies', 'lead-gen'] as const;
export const bootstrapFixtures = ['full-service', ...bootstrapVariants] as const;

export type BootstrapModule = (typeof bootstrapModules)[number];
export type BootstrapPage = (typeof bootstrapPages)[number];
export type BootstrapVariant = (typeof bootstrapVariants)[number];
export type BootstrapFixtureName = (typeof bootstrapFixtures)[number];

export type BootstrapPalette = {
  dark: string;
  primary: string;
  secondary: string;
  accent: string;
  text: string;
};

export type BootstrapConfigInput = {
  outputDir?: string;
  siteName?: string;
  siteUrl?: string;
  adminEmail?: string;
  adminName?: string;
  brandMark?: string;
  brandWordmark?: string;
  variant?: BootstrapVariant;
  fixture?: BootstrapFixtureName;
  modules?: BootstrapModule[];
  pages?: BootstrapPage[];
  colors?: Partial<BootstrapPalette>;
};

export type BootstrapConfig = {
  outputDir: string;
  slug: string;
  packageName: string;
  siteName: string;
  organizationName: string;
  siteUrl: string;
  adminEmail: string;
  adminName: string;
  publicEmail: string;
  brandMark: string;
  brandWordmark: string;
  variant: BootstrapVariant | null;
  fixture: BootstrapFixtureName;
  modules: BootstrapModule[];
  pages: BootstrapPage[];
  colors: BootstrapPalette;
};

type BootstrapPreset = {
  modules: BootstrapModule[];
  pages: BootstrapPage[];
  fixture: BootstrapFixtureName;
};

type BootstrapFixturePreset = BootstrapConfigInput & {
  siteName: string;
};

type PackageLockLike = Record<string, unknown> & {
  name?: string;
  packages?: Record<string, unknown>;
};

type HrefAvailability = {
  about: boolean;
  contact: boolean;
  services: boolean;
  blog: boolean;
  portfolio: boolean;
  partnership: boolean;
};

const serviceDetailPages = [
  'service-website-development',
  'service-custom-business-tools',
  'service-secure-online-shops',
  'service-mobile-business-app',
  'service-official-business-email'
] as const satisfies readonly PageId[];

const serviceLinks = [
  { href: '/website-development', label: 'Website Development' },
  { href: '/secure-online-shops', label: 'Secure Online Shops' },
  { href: '/mobile-business-app', label: 'Mobile Business App' },
  { href: '/official-business-email', label: 'Official Business Email' },
  { href: '/custom-business-tools', label: 'Custom Business Tools' }
] as const;

const defaultColors: BootstrapPalette = {
  dark: '#1f314f',
  primary: '#3b82f6',
  secondary: '#6366f1',
  accent: '#06b6d4',
  text: '#111b31'
};

const variantPresets: Record<BootstrapVariant, BootstrapPreset> = {
  brochure: {
    modules: ['services'],
    pages: ['about', 'contact'],
    fixture: 'brochure'
  },
  'blog-seo': {
    modules: ['services', 'blog'],
    pages: ['about', 'contact'],
    fixture: 'blog-seo'
  },
  'portfolio-case-studies': {
    modules: ['services', 'portfolio'],
    pages: ['about', 'contact'],
    fixture: 'portfolio-case-studies'
  },
  'lead-gen': {
    modules: ['services', 'partnership'],
    pages: ['about', 'contact', 'partnership'],
    fixture: 'lead-gen'
  }
};

const fixturePresets: Record<BootstrapFixtureName, BootstrapFixturePreset> = {
  'full-service': {
    siteName: 'Studio Velocity',
    brandMark: 'S',
    brandWordmark: 'Studio Velocity.',
    modules: ['services', 'blog', 'portfolio', 'partnership'],
    pages: ['about', 'contact', 'partnership'],
    colors: {
      dark: '#1f314f',
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#0f766e',
      text: '#14213d'
    }
  },
  brochure: {
    siteName: 'Northline Advisory',
    brandMark: 'N',
    brandWordmark: 'Northline Advisory.',
    variant: 'brochure',
    modules: ['services'],
    pages: ['about', 'contact'],
    colors: {
      dark: '#20304a',
      primary: '#0f766e',
      secondary: '#14532d',
      accent: '#f59e0b',
      text: '#172033'
    }
  },
  'blog-seo': {
    siteName: 'Searchlane Studio',
    brandMark: 'S',
    brandWordmark: 'Searchlane Studio.',
    variant: 'blog-seo',
    modules: ['services', 'blog'],
    pages: ['about', 'contact'],
    colors: {
      dark: '#172554',
      primary: '#2563eb',
      secondary: '#7c3aed',
      accent: '#0ea5e9',
      text: '#0f172a'
    }
  },
  'portfolio-case-studies': {
    siteName: 'Frameforge Digital',
    brandMark: 'F',
    brandWordmark: 'Frameforge Digital.',
    variant: 'portfolio-case-studies',
    modules: ['services', 'portfolio'],
    pages: ['about', 'contact'],
    colors: {
      dark: '#2b1c3b',
      primary: '#e11d48',
      secondary: '#7c3aed',
      accent: '#f59e0b',
      text: '#221b29'
    }
  },
  'lead-gen': {
    siteName: 'Pipeline Works',
    brandMark: 'P',
    brandWordmark: 'Pipeline Works.',
    variant: 'lead-gen',
    modules: ['services', 'partnership'],
    pages: ['about', 'contact', 'partnership'],
    colors: {
      dark: '#1b365d',
      primary: '#0f766e',
      secondary: '#2563eb',
      accent: '#f97316',
      text: '#10243e'
    }
  }
};

const baseReservedSlugs = ['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt', 'portfolio'] as const;

function sortUnique<T extends string>(values: readonly T[], canonical: readonly T[]) {
  const set = new Set(values);
  return canonical.filter((value) => set.has(value));
}

function normalizeHex(value: string, field: string) {
  const trimmed = value.trim();
  const shortHex = /^#([0-9a-f]{3})$/i;
  const longHex = /^#([0-9a-f]{6})$/i;

  if (shortHex.test(trimmed)) {
    const [, digits] = trimmed.match(shortHex)!;
    return `#${digits
      .split('')
      .map((digit) => `${digit}${digit}`)
      .join('')
      .toLowerCase()}`;
  }

  if (longHex.test(trimmed)) {
    return trimmed.toLowerCase();
  }

  throw new Error(`Invalid ${field} color: ${value}`);
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .replace(/-{2,}/g, '-');
}

function ensureTrailingPeriod(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return trimmed;
  return /[.!?]$/.test(trimmed) ? trimmed : `${trimmed}.`;
}

function stripTrailingPeriod(value: string) {
  return value.trim().replace(/[.!?]+$/, '').trim();
}

function deriveBrandMark(value: string) {
  const match = stripTrailingPeriod(value).match(/[A-Za-z0-9]/);
  return (match?.[0] ?? 'A').toUpperCase();
}

function clampChannel(value: number) {
  return Math.min(255, Math.max(0, Math.round(value)));
}

function hexToRgb(hex: string) {
  const normalized = normalizeHex(hex, 'palette');
  return {
    r: Number.parseInt(normalized.slice(1, 3), 16),
    g: Number.parseInt(normalized.slice(3, 5), 16),
    b: Number.parseInt(normalized.slice(5, 7), 16)
  };
}

function rgbToHex(rgb: { r: number; g: number; b: number }) {
  return `#${[rgb.r, rgb.g, rgb.b]
    .map((channel) => clampChannel(channel).toString(16).padStart(2, '0'))
    .join('')}`;
}

function mixHex(base: string, mixWith: string, weight: number) {
  const left = hexToRgb(base);
  const right = hexToRgb(mixWith);
  const safeWeight = Math.min(1, Math.max(0, weight));

  return rgbToHex({
    r: left.r + (right.r - left.r) * safeWeight,
    g: left.g + (right.g - left.g) * safeWeight,
    b: left.b + (right.b - left.b) * safeWeight
  });
}

function buildNavigationLink(id: string, label: string, href: string): NavigationLink {
  return {
    id,
    label,
    href,
    enabled: true
  };
}

function portfolioLabel(config: BootstrapConfig) {
  return config.fixture === 'portfolio-case-studies' ? 'Case Studies' : 'Portfolio';
}

function blogLabel(config: BootstrapConfig) {
  return config.fixture === 'blog-seo' ? 'SEO Insights' : 'Insights';
}

function availabilityFor(config: BootstrapConfig): HrefAvailability {
  return {
    about: config.pages.includes('about'),
    contact: config.pages.includes('contact'),
    services: config.modules.includes('services'),
    blog: config.modules.includes('blog'),
    portfolio: config.modules.includes('portfolio'),
    partnership: config.modules.includes('partnership')
  };
}

function fallbackHref(config: BootstrapConfig) {
  const availability = availabilityFor(config);

  if (availability.contact) return '/contact';
  if (availability.services) return '/service';
  if (availability.portfolio) return '/portfolio';
  if (availability.blog) return '/blog';
  if (availability.about) return '/about';
  if (availability.partnership) return '/partnership';

  return '/';
}

function isDisabledHref(href: string, availability: HrefAvailability) {
  const normalized = href.trim();
  if (!normalized.startsWith('/')) return false;
  if (normalized === '/about') return !availability.about;
  if (normalized === '/contact') return !availability.contact;
  if (normalized === '/service') return !availability.services;
  if (normalized === '/partnership') return !availability.partnership;
  if (normalized === '/blog' || normalized.startsWith('/blog/')) return !availability.blog;
  if (normalized === '/portfolio' || normalized.startsWith('/portfolio/')) return !availability.portfolio;

  return serviceLinks.some((item) => item.href === normalized) && !availability.services;
}

function replaceBrandReferences(value: string, config: BootstrapConfig) {
  return value
    .replaceAll('Example Studio LLC', config.organizationName)
    .replaceAll('Example Studio.', ensureTrailingPeriod(config.siteName))
    .replaceAll('Example Studio', config.organizationName)
    .replaceAll('Vanaila', config.organizationName)
    .replaceAll('vanaila', config.slug.replace(/-/g, ' '));
}

function transformContentValue(value: unknown, config: BootstrapConfig): unknown {
  const availability = availabilityFor(config);

  if (typeof value === 'string') {
    return replaceBrandReferences(value, config);
  }

  if (Array.isArray(value)) {
    return value.map((entry) => transformContentValue(entry, config));
  }

  if (!value || typeof value !== 'object') {
    return value;
  }

  const next: Record<string, unknown> = {};

  for (const [key, current] of Object.entries(value)) {
    const transformed = transformContentValue(current, config);
    if (typeof transformed === 'string' && ['href', 'ctaHref', 'primaryCtaHref', 'secondaryCtaHref', 'projectUrl'].includes(key)) {
      next[key] = rewriteInternalHref(transformed, config, availability);
      continue;
    }

    next[key] = transformed;
  }

  return next;
}

function rewriteInternalHref(value: string, config: BootstrapConfig, availability = availabilityFor(config)) {
  const trimmed = value.trim();
  if (!trimmed || trimmed.startsWith('#') || /^[a-z]+:/i.test(trimmed)) {
    return trimmed;
  }

  if (!trimmed.startsWith('/')) {
    return trimmed;
  }

  if (!isDisabledHref(trimmed, availability)) {
    return trimmed;
  }

  if (trimmed.startsWith('/portfolio/') && availability.portfolio) {
    return '/portfolio';
  }

  if (trimmed.startsWith('/blog/') && availability.blog) {
    return '/blog';
  }

  return fallbackHref(config);
}

function buildHeaderLinks(config: BootstrapConfig) {
  const links: NavigationLink[] = [buildNavigationLink('nav-home', 'Home', '/')];

  if (config.pages.includes('about')) {
    links.push(buildNavigationLink('nav-about', 'About', '/about'));
  }
  if (config.modules.includes('services')) {
    links.push(buildNavigationLink('nav-services', 'Services', '/service'));
  }
  if (config.modules.includes('blog')) {
    links.push(buildNavigationLink('nav-insights', blogLabel(config), '/blog'));
  }
  if (config.modules.includes('partnership')) {
    links.push(buildNavigationLink('nav-partnership', 'Partnership', '/partnership'));
  }
  if (config.modules.includes('portfolio')) {
    links.push(buildNavigationLink('nav-portfolio', portfolioLabel(config), '/portfolio'));
  }

  return links;
}

function buildFooterNavigatorLinks(config: BootstrapConfig) {
  const links: NavigationLink[] = [buildNavigationLink('footer-nav-home', 'Home', '/')];

  if (config.pages.includes('about')) {
    links.push(buildNavigationLink('footer-nav-about', 'About Us', '/about'));
  }
  if (config.modules.includes('services')) {
    links.push(buildNavigationLink('footer-nav-services', 'Services', '/service'));
  }
  if (config.modules.includes('blog')) {
    links.push(buildNavigationLink('footer-nav-insights', blogLabel(config), '/blog'));
  }
  if (config.modules.includes('partnership')) {
    links.push(buildNavigationLink('footer-nav-partnership', 'Partnership', '/partnership'));
  }
  if (config.pages.includes('contact')) {
    links.push(buildNavigationLink('footer-nav-contact', 'Contact', '/contact'));
  }
  if (config.modules.includes('portfolio')) {
    links.push(buildNavigationLink('footer-nav-portfolio', portfolioLabel(config), '/portfolio'));
  }

  return links;
}

function buildFooterServiceLinks(config: BootstrapConfig) {
  if (!config.modules.includes('services')) {
    return [] as NavigationLink[];
  }

  return serviceLinks.map((item, index) =>
    buildNavigationLink(`footer-service-${index + 1}`, item.label, item.href)
  );
}

function createPlaceholderImage(size: string, label: string) {
  return `https://placehold.co/${size}/png?text=${encodeURIComponent(label)}`;
}

function createEnabledPageIds(config: BootstrapConfig) {
  const enabled = new Set<PageId>(['home']);

  if (config.pages.includes('about')) {
    enabled.add('about');
  }
  if (config.pages.includes('contact')) {
    enabled.add('contact');
  }
  if (config.modules.includes('partnership')) {
    enabled.add('partnership');
  }
  if (config.modules.includes('services')) {
    enabled.add('service');
    for (const pageId of serviceDetailPages) {
      enabled.add(pageId);
    }
  }

  return enabled;
}

function tuneHomeBlocks(content: CmsContent, config: BootstrapConfig) {
  const homePage = content.pages.home;
  const blocks = homePage.homeBlocks ?? [];

  homePage.homeBlocks = blocks.filter((block) => {
    if (block.type === 'solutions_grid' && !config.modules.includes('services')) {
      return false;
    }
    return true;
  });

  const heroBlock = homePage.homeBlocks.find((block) => block.type === 'hero');
  if (heroBlock && heroBlock.type === 'hero') {
    if (config.modules.includes('services')) {
      heroBlock.secondaryCtaLabel = 'Explore services';
      heroBlock.secondaryCtaHref = '/service';
    } else if (config.modules.includes('portfolio')) {
      heroBlock.secondaryCtaLabel = 'View portfolio';
      heroBlock.secondaryCtaHref = '/portfolio';
    } else if (config.modules.includes('blog')) {
      heroBlock.secondaryCtaLabel = 'Read insights';
      heroBlock.secondaryCtaHref = '/blog';
    } else {
      heroBlock.secondaryCtaLabel = 'Get in touch';
      heroBlock.secondaryCtaHref = fallbackHref(config);
    }
  }

  const logoBlock = homePage.homeBlocks.find((block) => block.type === 'logo_cloud');
  if (logoBlock && logoBlock.type === 'logo_cloud') {
    if (config.modules.includes('portfolio')) {
      logoBlock.primaryCtaLabel = 'View our portfolio';
      logoBlock.primaryCtaHref = '/portfolio';
    } else if (config.modules.includes('blog')) {
      logoBlock.primaryCtaLabel = 'Read insights';
      logoBlock.primaryCtaHref = '/blog';
    } else {
      logoBlock.primaryCtaLabel = 'Get in touch';
      logoBlock.primaryCtaHref = fallbackHref(config);
    }
    logoBlock.secondaryCtaHref = fallbackHref(config);
  }
}

function applyFixtureTuning(content: CmsContent, config: BootstrapConfig) {
  const homePage = content.pages.home;
  const heroBlock = homePage.homeBlocks?.find((block) => block.type === 'hero');
  const primaryCtaBlock = homePage.homeBlocks?.find((block) => block.type === 'primary_cta');

  content.settings.reading.homepageDisplay = 'static_page';
  content.settings.reading.homepagePageId = 'home';

  switch (config.fixture) {
    case 'brochure':
      content.settings.general.siteTagline = `Clear positioning and credible delivery for ${config.organizationName}.`;
      content.settings.branding.footerTagline = 'Brochure-first website starter for service businesses.';
      content.settings.navigation.headerCtaLabel = 'Request a proposal';
      content.settings.navigation.headerCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
      content.settings.seo.defaultMetaDescription = `${config.organizationName} brochure site starter with service pages, trust-building sections, and a clean contact path.`;
      if (heroBlock && heroBlock.type === 'hero') {
        heroBlock.badge = 'Brochure Site Starter';
        heroBlock.primaryCtaLabel = 'Request a proposal';
        heroBlock.primaryCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
        heroBlock.secondaryCtaLabel = 'Explore services';
        heroBlock.secondaryCtaHref = config.modules.includes('services') ? '/service' : fallbackHref(config);
      }
      if (primaryCtaBlock && primaryCtaBlock.type === 'primary_cta') {
        primaryCtaBlock.heading = 'Need a clean website launch path?';
        primaryCtaBlock.description =
          'Use this starter when the client needs a focused brochure site with fast editing and strong contact conversion.';
        primaryCtaBlock.ctaLabel = 'Talk to us';
        primaryCtaBlock.ctaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
      }
      break;
    case 'blog-seo':
      content.settings.general.siteTagline = `Editorial and SEO growth engine for ${config.organizationName}.`;
      content.settings.branding.footerTagline = 'Content-led marketing starter with blog, SEO defaults, and editorial workflows.';
      content.settings.writing.defaultPostCategory = 'seo';
      content.settings.reading.postsPageId = config.modules.includes('blog') ? 'home' : '';
      content.settings.seo.defaultMetaDescription = `${config.organizationName} content marketing starter with editorial publishing, technical SEO defaults, and reusable article templates.`;
      if (heroBlock && heroBlock.type === 'hero') {
        heroBlock.badge = 'Blog + SEO Starter';
        heroBlock.primaryCtaLabel = 'Read insights';
        heroBlock.primaryCtaHref = config.modules.includes('blog') ? '/blog' : fallbackHref(config);
        heroBlock.secondaryCtaLabel = 'Plan your growth stack';
        heroBlock.secondaryCtaHref = config.modules.includes('services') ? '/service' : fallbackHref(config);
      }
      if (primaryCtaBlock && primaryCtaBlock.type === 'primary_cta') {
        primaryCtaBlock.heading = 'Need consistent publishing velocity?';
        primaryCtaBlock.description =
          'This fixture keeps the editorial workflow active, with blog and SEO modules enabled by default.';
        primaryCtaBlock.ctaLabel = 'View insights';
        primaryCtaBlock.ctaHref = config.modules.includes('blog') ? '/blog' : fallbackHref(config);
      }
      break;
    case 'portfolio-case-studies':
      content.settings.general.siteTagline = `Proof-driven portfolio and case study starter for ${config.organizationName}.`;
      content.settings.branding.footerTagline = 'Case-study-first starter for agencies and product studios.';
      content.settings.navigation.headerCtaLabel = 'View case studies';
      content.settings.navigation.headerCtaHref = config.modules.includes('portfolio') ? '/portfolio' : fallbackHref(config);
      content.settings.seo.defaultMetaDescription = `${config.organizationName} portfolio starter focused on case studies, outcome-led proof, and reusable project storytelling.`;
      if (heroBlock && heroBlock.type === 'hero') {
        heroBlock.badge = 'Portfolio + Case Studies';
        heroBlock.primaryCtaLabel = 'View case studies';
        heroBlock.primaryCtaHref = config.modules.includes('portfolio') ? '/portfolio' : fallbackHref(config);
        heroBlock.secondaryCtaLabel = 'Talk about your next build';
        heroBlock.secondaryCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
      }
      if (primaryCtaBlock && primaryCtaBlock.type === 'primary_cta') {
        primaryCtaBlock.heading = 'Need stronger proof on the public site?';
        primaryCtaBlock.description =
          'This fixture pushes portfolio and case-study content to the front so future client work starts with proof assets in place.';
        primaryCtaBlock.ctaLabel = 'Browse case studies';
        primaryCtaBlock.ctaHref = config.modules.includes('portfolio') ? '/portfolio' : fallbackHref(config);
      }
      break;
    case 'lead-gen':
      content.settings.general.siteTagline = `Lead-generation starter with direct contact and qualification flows for ${config.organizationName}.`;
      content.settings.branding.footerTagline = 'Lead-gen starter optimized for contact capture and partnership intake.';
      content.settings.navigation.headerCtaLabel = 'Book discovery call';
      content.settings.navigation.headerCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
      content.settings.seo.defaultMetaDescription = `${config.organizationName} lead-generation starter with service pages, qualification paths, and contact-first calls to action.`;
      if (heroBlock && heroBlock.type === 'hero') {
        heroBlock.badge = 'Lead-Gen Starter';
        heroBlock.primaryCtaLabel = 'Book discovery call';
        heroBlock.primaryCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
        heroBlock.secondaryCtaLabel = config.modules.includes('partnership') ? 'Explore partnership' : 'Explore services';
        heroBlock.secondaryCtaHref = config.modules.includes('partnership')
          ? '/partnership'
          : config.modules.includes('services')
            ? '/service'
            : fallbackHref(config);
      }
      if (primaryCtaBlock && primaryCtaBlock.type === 'primary_cta') {
        primaryCtaBlock.heading = 'Need a qualified inquiry pipeline?';
        primaryCtaBlock.description =
          'This fixture biases the site toward contact conversion and keeps partnership workflows ready for client-specific qualification steps.';
        primaryCtaBlock.ctaLabel = 'Start a project';
        primaryCtaBlock.ctaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
      }
      break;
    default:
      break;
  }
}

export function normalizeBootstrapConfig(input: BootstrapConfigInput): BootstrapConfig {
  if (input.variant && !bootstrapVariants.includes(input.variant)) {
    throw new Error(`Invalid variant: ${input.variant}`);
  }
  if (input.fixture && !bootstrapFixtures.includes(input.fixture)) {
    throw new Error(`Invalid fixture: ${input.fixture}`);
  }

  const variant = input.variant ?? null;
  const variantPreset = variant ? variantPresets[variant] : null;
  const selectedFixture = input.fixture ?? variantPreset?.fixture ?? null;
  const fixture = selectedFixture ?? 'full-service';
  const fixturePreset = selectedFixture ? fixturePresets[selectedFixture] : null;
  const siteName = input.siteName?.trim() || fixturePreset?.siteName.trim() || '';
  if (!siteName) {
    throw new Error('siteName is required.');
  }

  const organizationName = stripTrailingPeriod(siteName);
  const slug = slugify(organizationName);
  if (!slug) {
    throw new Error('siteName must contain at least one letter or number.');
  }

  const normalizedModules = sortUnique(
    (
      input.modules && input.modules.length > 0
        ? input.modules
        : variantPreset?.modules ?? fixturePreset?.modules ?? bootstrapModules
    ),
    bootstrapModules
  );
  const normalizedPages = sortUnique(
    (
      input.pages && input.pages.length > 0
        ? input.pages
        : variantPreset?.pages ?? fixturePreset?.pages ?? (['about', 'contact'] as const)
    ),
    bootstrapPages
  );

  const moduleSet = new Set<BootstrapModule>(normalizedModules);
  const pageSet = new Set<BootstrapPage>(normalizedPages);

  if (pageSet.has('service')) {
    moduleSet.add('services');
  }
  if (pageSet.has('partnership')) {
    moduleSet.add('partnership');
  }
  if (moduleSet.has('services')) {
    pageSet.add('service');
  }
  if (moduleSet.has('partnership')) {
    pageSet.add('partnership');
  }

  const colors: BootstrapPalette = {
    dark: normalizeHex(input.colors?.dark ?? fixturePreset?.colors?.dark ?? defaultColors.dark, 'dark'),
    primary: normalizeHex(input.colors?.primary ?? fixturePreset?.colors?.primary ?? defaultColors.primary, 'primary'),
    secondary: normalizeHex(
      input.colors?.secondary ?? fixturePreset?.colors?.secondary ?? defaultColors.secondary,
      'secondary'
    ),
    accent: normalizeHex(input.colors?.accent ?? fixturePreset?.colors?.accent ?? defaultColors.accent, 'accent'),
    text: normalizeHex(input.colors?.text ?? fixturePreset?.colors?.text ?? defaultColors.text, 'text')
  };

  return {
    outputDir: input.outputDir?.trim() || '',
    slug,
    packageName: `${slug}-cms`,
    siteName,
    organizationName,
    siteUrl: input.siteUrl?.trim() || `https://${slug}.example.com`,
    adminEmail: input.adminEmail?.trim() || `admin@${slug}.local`,
    adminName: input.adminName?.trim() || `${organizationName} Admin`,
    publicEmail: `hello@${slug}.example.com`,
    brandMark: input.brandMark?.trim() || fixturePreset?.brandMark?.trim() || deriveBrandMark(organizationName),
    brandWordmark:
      input.brandWordmark?.trim() || fixturePreset?.brandWordmark?.trim() || ensureTrailingPeriod(organizationName),
    variant,
    fixture,
    modules: sortUnique(Array.from(moduleSet), bootstrapModules),
    pages: sortUnique(Array.from(pageSet), bootstrapPages),
    colors
  };
}

export function buildStarterContent(baseContent: CmsContent, config: BootstrapConfig): CmsContent {
  const content = transformContentValue(structuredClone(baseContent), config) as CmsContent;
  const enabledPageIds = createEnabledPageIds(config);
  const currentYear = new Date().getFullYear();
  const brandMarkImage = createPlaceholderImage('240x80', `${config.organizationName} mark`);
  const defaultOgImage = createPlaceholderImage('1200x630', config.organizationName);
  const footerServices = buildFooterServiceLinks(config);

  content.settings.general.siteName = config.siteName;
  content.settings.general.baseUrl = config.siteUrl;
  content.settings.general.adminEmail = config.adminEmail;
  content.settings.siteName = config.siteName;
  content.settings.baseUrl = config.siteUrl;
  content.settings.organizationName = config.organizationName;
  content.settings.organizationLogo = brandMarkImage;
  content.settings.defaultOgImage = defaultOgImage;
  content.settings.seo.defaultOgImage = defaultOgImage;
  content.settings.navigation.headerLinks = buildHeaderLinks(config);
  content.settings.navigation.footerNavigatorLinks = buildFooterNavigatorLinks(config);
  content.settings.navigation.footerServiceLinks = footerServices;
  content.settings.navigation.headerCtaHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
  content.settings.navigation.headerCtaLabel = config.pages.includes('contact') ? 'Contact' : 'Get Started';
  content.settings.contact.companyName = config.organizationName;
  content.settings.contact.emailValue = config.publicEmail;
  content.settings.contact.emailHref = `mailto:${config.publicEmail}`;
  content.settings.contact.instagramValue = `@${config.slug.replace(/-/g, '')}`;
  content.settings.contact.instagramHref = `https://instagram.com/${config.slug.replace(/-/g, '')}`;
  content.settings.social.emailHref = `mailto:${config.publicEmail}`;
  content.settings.social.websiteHref = config.siteUrl;
  content.settings.social.instagramHref = `https://instagram.com/${config.slug.replace(/-/g, '')}`;
  content.settings.social.chatHref = config.pages.includes('contact') ? '/contact' : fallbackHref(config);
  content.settings.branding.copyrightText = `(c) ${currentYear} ${config.organizationName}.`;
  content.settings.sitemap.includePosts = config.modules.includes('blog');
  content.settings.sitemap.includePortfolio = config.modules.includes('portfolio');
  content.settings.reading.postsPageId = '';

  content.pages = Object.fromEntries(
    Object.entries(content.pages).filter(([id]) => enabledPageIds.has(id as PageId))
  ) as CmsContent['pages'];

  tuneHomeBlocks(content, config);
  applyFixtureTuning(content, config);

  if (content.pages.about?.sections[0]) {
    content.pages.about.sections[0].ctaLabel = config.modules.includes('blog')
      ? 'Read our blog'
      : config.modules.includes('portfolio')
        ? 'View portfolio'
        : 'Get in touch';
  }

  content.blogPosts = config.modules.includes('blog') ? content.blogPosts : [];
  content.categories = config.modules.includes('blog') ? content.categories : [];
  content.portfolioProjects = config.modules.includes('portfolio') ? content.portfolioProjects : [];
  content.mediaAssets = content.mediaAssets
    .filter((asset) => {
      if (asset.id === 'media-blog-cover') {
        return config.modules.includes('blog');
      }
      return true;
    })
    .map((asset) => {
      if (asset.id === 'media-default-og') {
        asset.title = `${config.organizationName} Open Graph`;
        asset.url = defaultOgImage;
        asset.altText = `${config.organizationName} social sharing image`;
      }
      if (asset.id === 'media-brand-mark') {
        asset.title = `${config.organizationName} Brand Mark`;
        asset.url = brandMarkImage;
        asset.altText = `${config.organizationName} brand mark`;
      }
      return asset;
    });

  return content;
}

export function buildFixtureSeedContent(
  baseContent: CmsContent,
  fixture: BootstrapFixtureName,
  overrides: Partial<BootstrapConfigInput> = {}
) {
  const preset = fixturePresets[fixture];
  const config = normalizeBootstrapConfig({
    ...preset,
    ...overrides,
    siteName: overrides.siteName?.trim() || preset.siteName,
    fixture,
    variant: overrides.variant ?? preset.variant
  });

  return buildStarterContent(baseContent, config);
}

export function buildSiteProfileSource(config: BootstrapConfig) {
  const primaryPageOrder: PageId[] = ['home'];
  if (config.pages.includes('about')) {
    primaryPageOrder.push('about');
  }
  if (config.modules.includes('services')) {
    primaryPageOrder.push('service');
  }
  if (config.modules.includes('partnership')) {
    primaryPageOrder.push('partnership');
  }
  if (config.pages.includes('contact')) {
    primaryPageOrder.push('contact');
  }

  const fallbackNavigator = [
    { href: '/', label: 'Home' },
    ...(config.pages.includes('about') ? [{ href: '/about', label: 'About Us' }] : []),
    ...(config.modules.includes('services') ? [{ href: '/service', label: 'Services' }] : []),
    ...(config.modules.includes('blog') ? [{ href: '/blog', label: blogLabel(config) }] : []),
    ...(config.modules.includes('partnership') ? [{ href: '/partnership', label: 'Partnership' }] : []),
    ...(config.pages.includes('contact') ? [{ href: '/contact', label: 'Contact' }] : []),
    ...(config.modules.includes('portfolio') ? [{ href: '/portfolio', label: portfolioLabel(config) }] : [])
  ];

  const activeServicePages = config.modules.includes('services') ? serviceDetailPages : [];
  const fallbackServices = config.modules.includes('services') ? [...serviceLinks] : [];

  return `import type { PageId } from '@/features/cms/types';

export const siteProfile = {
  brand: {
    mark: ${JSON.stringify(config.brandMark)},
    wordmark: ${JSON.stringify(config.brandWordmark)}
  },
  navigation: {
    primaryPageOrder: ${JSON.stringify(primaryPageOrder)} as const satisfies readonly PageId[],
    fallbackNavigator: ${JSON.stringify(fallbackNavigator, null, 4)},
    fallbackServices: ${JSON.stringify(fallbackServices, null, 4)}
  },
  routing: {
    reservedSlugs: ${JSON.stringify(baseReservedSlugs)} as const,
    serviceDetailPageIds: ${JSON.stringify(activeServicePages)} as const satisfies readonly PageId[]
  }
} as const;

export type ServiceDetailPageId = (typeof siteProfile.routing.serviceDetailPageIds)[number];

export function isReservedPublicSlug(slug: string) {
  return siteProfile.routing.reservedSlugs.includes(slug as (typeof siteProfile.routing.reservedSlugs)[number]);
}

export function isServiceDetailPageId(id: PageId): id is ServiceDetailPageId {
  return siteProfile.routing.serviceDetailPageIds.includes(id as ServiceDetailPageId);
}
`;
}

export function buildEnvExample(config: BootstrapConfig) {
  return `# Generated client starter template for ${config.organizationName}.
# Replace placeholder values before production deployment.

# Public site base URL used for canonical links and sitemap entries.
NEXT_PUBLIC_SITE_URL=${config.siteUrl}

# Optional public URL used to rewrite \`/media/...\` and \`/portfolio/...\` asset paths to a CDN or Supabase bucket.
# If empty, uploaded local assets use NEXT_PUBLIC_SITE_URL.
MEDIA_PUBLIC_BASE_URL=
NEXT_PUBLIC_MEDIA_BASE_URL=

# Initial admin user bootstrap for database-backed auth.
# The first login will create this admin user if admin_users is empty.
CMS_ADMIN_EMAIL=${config.adminEmail}
CMS_ADMIN_PASSWORD=change-this-password
CMS_ADMIN_NAME=${config.adminName}

# Legacy fallback used only for compatibility and one-time bootstrap if no password is set.
CMS_ADMIN_TOKEN=

# Supabase Postgres runtime URL used by the app.
DATABASE_URL=

# Optional direct migration URL if you want to keep runtime and migration credentials separate.
DATABASE_URL_MIGRATION=

# Optional fixture preset for \`npm run db:seed:file\` when you want deterministic sample data.
CMS_SEED_FIXTURE=${config.fixture}

# Optional Supabase Storage configuration for media uploads.
# When set, admin media uploads are stored in Supabase instead of the local public/ folder.
SUPABASE_URL=
SUPABASE_SERVICE_ROLE_KEY=
SUPABASE_STORAGE_BUCKET=${config.slug}-media

# Optional fallback organization values for structured data.
CMS_ORG_NAME=${config.organizationName}
CMS_ORG_LOGO=${createPlaceholderImage('240x80', `${config.organizationName} mark`)}

# Optional webhook URL to receive contact form submissions.
CONTACT_NOTIFICATION_WEBHOOK_URL=
CONTACT_NOTIFICATION_WEBHOOK_METHOD=POST
CONTACT_NOTIFICATION_WEBHOOK_TOKEN=
`;
}

export function updateTailwindBrandColors(source: string, colors: BootstrapPalette) {
  return source
    .replace(/vanailaNavy: '#[0-9a-f]{6}'/i, `vanailaNavy: '${colors.dark}'`)
    .replace(/electricBlue: '#[0-9a-f]{6}'/i, `electricBlue: '${colors.primary}'`)
    .replace(/royalPurple: '#[0-9a-f]{6}'/i, `royalPurple: '${colors.secondary}'`)
    .replace(/vibrantCyan: '#[0-9a-f]{6}'/i, `vibrantCyan: '${colors.accent}'`)
    .replace(/deepSlate: '#[0-9a-f]{6}'/i, `deepSlate: '${colors.text}'`);
}

export function updateGlobalCssBrandColors(source: string, colors: BootstrapPalette) {
  const replacements: Record<string, string> = {
    '--bg': mixHex(colors.primary, '#ffffff', 0.92),
    '--bg-soft': mixHex(colors.primary, '#ffffff', 0.96),
    '--text': colors.text,
    '--text-muted': mixHex(colors.text, '#ffffff', 0.42),
    '--line': mixHex(colors.dark, '#ffffff', 0.82),
    '--line-strong': mixHex(colors.dark, '#ffffff', 0.72),
    '--primary': colors.dark,
    '--primary-hover': mixHex(colors.dark, '#000000', 0.15),
    '--accent': colors.primary,
    '--accent-soft': mixHex(colors.primary, '#ffffff', 0.6)
  };

  let next = source;

  for (const [token, value] of Object.entries(replacements)) {
    next = next.replace(new RegExp(`${token}:\\s*#[0-9a-f]{6};`, 'i'), `${token}: ${value};`);
  }

  return next;
}

export function updateGitIgnoreForStarter(source: string) {
  return source
    .split(/\r?\n/)
    .filter((line) => line.trim() !== 'data/content.json')
    .join('\n');
}

export function updatePackageManifest(manifest: Record<string, unknown>, config: BootstrapConfig) {
  return {
    ...manifest,
    name: config.packageName
  };
}

export function updatePackageLock(lockfile: Record<string, unknown>, config: BootstrapConfig) {
  const next = structuredClone(lockfile) as PackageLockLike;
  next.name = config.packageName;

  if (
    next.packages &&
    next.packages[''] &&
    typeof next.packages[''] === 'object' &&
    !Array.isArray(next.packages[''])
  ) {
    next.packages[''] = {
      ...next.packages[''],
      name: config.packageName
    };
  }

  return next;
}
