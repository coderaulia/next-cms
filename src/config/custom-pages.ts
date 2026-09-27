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
    title: 'Vanaila Studio',
    navLabel: 'Vanaila Studio',
    seo: {
      metaTitle: 'Vanaila Studio | In-Browser Document & Creator Suite',
      metaDescription:
        'Documents, CVs, image and PDF conversions, OCR, and social content — all running in your browser with 100% client-side privacy.',
      socialImage: '/atelier/atelier-home.png',
      noIndex: false,
      keywords: ['vanaila studio', 'atelier', 'browser tools', 'pdf tools', 'client-side ocr', 'document studio', 'cv builder'],
    },
    loadView: () =>
      import('@/components/pages/AtelierPageView').then((m) => m.AtelierPageView),
  },
  {
    id: 'lms',
    slug: 'lms',
    title: 'Vanaila LMS',
    navLabel: 'Vanaila LMS',
    seo: {
      metaTitle: 'Vanaila LMS | Online Learning & Academy Platform',
      metaDescription:
        'Next-generation LMS for educators, training providers, and corporate academies. Deliver video courses, manage curricula, and award verifiable certificates.',
      socialImage: '/lms/lms-marketing.png',
      noIndex: false,
      keywords: ['vanaila lms', 'learning management system', 'online academy', 'course platform', 'edtech indonesia'],
    },
    loadView: () =>
      import('@/components/pages/LmsPageView').then((m) => m.LmsPageView),
  },
  {
    id: 'muzikplayer',
    slug: 'muzikplayer',
    title: 'MuzikPlayer',
    navLabel: 'MuzikPlayer',
    seo: {
      metaTitle: 'MuzikPlayer | Pure Hi-Fi Sound & Libadwaita Slate Design',
      metaDescription:
        'A modern desktop music player for local libraries, built with Compose Desktop (Kotlin/JVM). Features bit-perfect PipeWire direct streaming and synchronized lyrics.',
      socialImage: '/muzikplayer/muzikplayer-hero.png',
      noIndex: false,
      keywords: ['muzikplayer', 'linux audio player', 'pipewire direct', 'compose desktop', 'hi-fi music player', 'flac player', 'bit-perfect audio'],
    },
    loadView: () =>
      import('@/components/pages/MuzikPlayerPageView').then((m) => m.MuzikPlayerPageView),
  },
];

export const customPageIds = customPageRegistry.map((e) => e.id);
