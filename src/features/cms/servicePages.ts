import type { PageId, ServiceDetailPageId } from './types';

export const serviceDetailPageIds: ServiceDetailPageId[] = [
  'service-website-development',
  'service-custom-business-tools',
  'service-secure-online-shops',
  'service-mobile-business-app',
  'service-official-business-email'
];

export const serviceDetailDefaults: Record<
  ServiceDetailPageId,
  { label: string; fallbackHref: string }
> = {
  'service-website-development': {
    label: 'Website Development',
    fallbackHref: '/website-development'
  },
  'service-custom-business-tools': {
    label: 'Custom Business Tools',
    fallbackHref: '/custom-business-tools'
  },
  'service-secure-online-shops': {
    label: 'Secure Online Shops',
    fallbackHref: '/secure-online-shops'
  },
  'service-mobile-business-app': {
    label: 'Mobile Business App',
    fallbackHref: '/mobile-business-app'
  },
  'service-official-business-email': {
    label: 'Official Business Email',
    fallbackHref: '/official-business-email'
  }
};

export function isServiceDetailPageId(id: PageId | string): id is ServiceDetailPageId {
  return serviceDetailPageIds.includes(id as ServiceDetailPageId);
}

export function getFallbackServiceHref(id: ServiceDetailPageId) {
  return serviceDetailDefaults[id].fallbackHref;
}

export function getServiceLabel(id: ServiceDetailPageId) {
  return serviceDetailDefaults[id].label;
}
