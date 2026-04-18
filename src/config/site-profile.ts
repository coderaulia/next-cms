import type { PageId } from '@/features/cms/types';

export const siteProfile = {
  brand: {
    mark: 'V',
    wordmark: 'vanaila.'
  },
  navigation: {
    primaryPageOrder: ['home', 'about', 'service', 'product-hris', 'partnership', 'contact'] as const satisfies readonly PageId[],
    fallbackNavigator: [
      { href: '/', label: 'Home' },
      { href: '/about', label: 'About Us' },
      { href: '/service', label: 'Services' },
      { href: '/hris', label: 'HRIS' },
      { href: '/blog', label: 'Insights' },
      { href: '/partnership', label: 'Partnership' },
      { href: '/contact', label: 'Contact' }
    ],
    fallbackServices: [
      { href: '/hris', label: 'Vanaila HRIS' },
      { href: '/website-development', label: 'Website Development' },
      { href: '/secure-online-shops', label: 'Secure Online Shops' },
      { href: '/mobile-business-app', label: 'Mobile Business App' },
      { href: '/official-business-email', label: 'Official Business Email' },
      { href: '/custom-business-tools', label: 'Custom Business Tools' }
    ]
  },
  routing: {
    reservedSlugs: ['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt', 'portfolio'] as const,
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
