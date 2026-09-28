import type { PageId } from '@/features/cms/types';

export const siteProfile = {
  brand: {
    mark: 'V',
    wordmark: 'vanaila.'
  },
  navigation: {
    productsIndex: { href: '/products', label: 'All Products' },
    productLinks: [
      { href: '/vanailachat', label: 'VanailaChat' },
      { href: '/hris', label: 'Vanaila HRIS' },
      { href: '/psikotest', label: 'Psikotest' },
      { href: '/flowraze', label: 'Flowraze CRM' },
      { href: '/atelier', label: 'Vanaila Studio' },
      { href: '/lms', label: 'Vanaila LMS' },
      { href: '/muzikplayer', label: 'MuzikPlayer' }
    ],
    primaryPageOrder: ['home', 'about', 'service', 'product-hris', 'partnership', 'contact'] as const satisfies readonly PageId[],
    fallbackNavigator: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/service', label: 'Services' },
      { href: '/products', label: 'Products' },
      { href: '/blog', label: 'Insights' },
      { href: '/partnership', label: 'Partnership' },
      { href: '/contact', label: 'Contact' }
    ],
    fallbackServices: [
      { href: '/templates', label: 'Templates' },
      { href: '/website-development', label: 'Website Development' },
      { href: '/secure-online-shops', label: 'Secure Online Shops' },
      { href: '/mobile-business-app', label: 'Mobile Business App' },
      { href: '/official-business-email', label: 'Official Business Email' },
      { href: '/custom-business-tools', label: 'Custom Business Tools' }
    ]
  },
  routing: {
    reservedSlugs: ['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt', 'portfolio', 'privacy-policy', 'terms', 'data-collection', 'products', 'atelier', 'lms', 'templates', 'muzikplayer', 'vanailachat', 'vanaila-chat'] as const,
    serviceDetailPageIds: [
      'service-website-development',
      'service-custom-business-tools',
      'service-secure-online-shops',
      'service-mobile-business-app',
      'service-official-business-email'
    ] as const satisfies readonly PageId[]
  }
} as const;

export type ServiceDetailPageId = (typeof siteProfile.routing.serviceDetailPageIds)[number];

export function isReservedPublicSlug(slug: string) {
  return siteProfile.routing.reservedSlugs.includes(slug as (typeof siteProfile.routing.reservedSlugs)[number]);
}

export function isServiceDetailPageId(id: PageId): id is ServiceDetailPageId {
  return siteProfile.routing.serviceDetailPageIds.includes(id as ServiceDetailPageId);
}

type MenuLink = { href: string; label: string; enabled?: boolean; children?: MenuLink[] };

const isProductsLink = (link: MenuLink) =>
  link.href === '/products' || link.href === '#products' || link.label.trim().toLowerCase() === 'products';

// Guarantees a Products dropdown containing every product page, even when CMS nav settings predate a product.
// Links the CMS already lists (enabled or not) are left untouched.
export function withProductsMenu<T extends MenuLink>(links: readonly T[]): MenuLink[] {
  const { productsIndex, productLinks } = siteProfile.navigation;
  const index = links.findIndex(isProductsLink);
  const existing = index >= 0 ? links[index] : undefined;
  if (existing?.enabled === false) return [...links];

  const children: MenuLink[] = existing?.children ?? [];
  const known = new Set(children.map((child) => child.href));
  const group: MenuLink = {
    ...existing,
    href: existing?.href ?? '#products',
    label: existing?.label ?? 'Products',
    children: [
      ...(known.has(productsIndex.href) ? [] : [productsIndex]),
      ...children,
      ...productLinks.filter((product) => !known.has(product.href))
    ]
  };

  if (existing) return links.map((link, i) => (i === index ? group : link));
  const serviceIndex = links.findIndex((link) => /\/service/.test(link.href));
  const at = serviceIndex >= 0 ? serviceIndex + 1 : Math.min(3, links.length);
  return [...links.slice(0, at), group, ...links.slice(at)];
}

export function withProductLinks<T extends MenuLink>(links: readonly T[]): MenuLink[] {
  const known = new Set(links.map((link) => link.href));
  return [...siteProfile.navigation.productLinks.filter((product) => !known.has(product.href)), ...links];
}
