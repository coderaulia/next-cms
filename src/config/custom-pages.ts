/**
 * Custom TSX-rendered pages registry.
 *
 * Add one entry here to:
 *   1. Auto-upsert a DB row (with editable SEO fields) on next app start
 *   2. Wire the route in [slug]/page.tsx
 *
 * Never edit [slug]/page.tsx, types.ts, or default-content.json for custom pages.
 */
import type { SeoFields } from '@/features/cms/types';

export type CustomPageEntry = {
  id: string;
  slug: string;
  title: string;
  navLabel: string;
  seo: Omit<SeoFields, 'slug' | 'canonical'>;
  loadView: () => Promise<React.ComponentType>;
};

export const customPageRegistry: CustomPageEntry[] = [
  {
    id: 'flowraze',
    slug: 'flowraze',
    title: 'Flowraze',
    navLabel: 'Flowraze',
    seo: {
      metaTitle: 'Flowraze | Simple CRM for Growing Sales Teams',
      metaDescription:
        'Flowraze helps sales teams manage leads, track deals, and close more business with a clean visual pipeline and zero learning curve.',
      socialImage: '',
      noIndex: false,
      keywords: ['crm software', 'sales pipeline', 'lead management', 'flowraze'],
    },
    loadView: () =>
      import('@/components/pages/FlowrazePageView').then((m) => m.FlowrazePageView),
  },
  {
    id: 'atelier',
    slug: 'atelier',
    title: 'Atelier',
    navLabel: 'Atelier',
    seo: {
      metaTitle: 'Atelier | Premium Creative Studio',
      metaDescription:
        'Atelier is a premium creative studio offering bespoke design services for brands that demand distinction.',
      socialImage: '',
      noIndex: false,
      keywords: ['atelier', 'creative studio', 'bespoke design', 'brand design'],
    },
    loadView: () =>
      import('@/components/pages/AtelierPageView').then((m) => m.AtelierPageView),
  },
];

export const customPageIds = customPageRegistry.map((e) => e.id);
