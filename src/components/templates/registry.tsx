import type { ComponentType } from 'react';
import { HtmlTemplateViewer } from './HtmlTemplateViewer';

export type TemplateMetadata = {
  slug: string;
  name: string;
  category: string;
  description: string;
  tags: string[];
  previewImage?: string;
};

export type TemplateEntry = TemplateMetadata & {
  component?: ComponentType;
};

const MaritimCorp = () => (
  <HtmlTemplateViewer src="/templates-static/maritim-corp.html" title="Maritim Corp" />
);

const Vela = () => (
  <HtmlTemplateViewer src="/templates-static/vela.html" title="Vela" />
);

const KantorHukum = () => (
  <HtmlTemplateViewer src="/templates-static/kantor-hukum.html" title="Kantor Hukum" />
);

const Dcosta = () => (
  <HtmlTemplateViewer src="/templates-static/dcosta.html" title="D'costa" />
);

const AuraProperty = () => (
  <HtmlTemplateViewer src="/templates-static/aura-property.html" title="AURA. Property" />
);

const Javanesa = () => (
  <HtmlTemplateViewer src="/templates-static/javanesa.html" title="Javanesa." />
);

const BdoClth = () => (
  <HtmlTemplateViewer src="/templates-static/bdo-clth.html" title="BDO.CLTH" />
);

const PoBusBahariAlam = () => (
  <HtmlTemplateViewer src="/templates-static/po-bus-bahari-alam.html" title="PO Bus Bahari Alam" />
);

const NusaJayaHeritage = () => (
  <HtmlTemplateViewer src="/templates-static/nusa-jaya-heritage.html" title="Nusa Jaya Heritage" />
);

const NusaJayaModern = () => (
  <HtmlTemplateViewer src="/templates-static/nusa-jaya-modern.html" title="Nusa Jaya Modern" />
);

const BudiMobil = () => (
  <HtmlTemplateViewer src="/templates-static/budi-mobil.html" title="Budi Mobil Shop" />
);

const TokoMeubelRahayu = () => (
  <HtmlTemplateViewer src="/templates-static/toko-meubel-rahayu.html" title="Toko Meubel Rahayu" />
);

const SinarAgenTravel = () => (
  <HtmlTemplateViewer src="/templates-static/sinar-agen-travel.html" title="Sinar Agen Travel" />
);

const CateringMamaFadil = () => (
  <HtmlTemplateViewer src="/templates-static/catering-mama-fadil.html" title="Catering Mama Fadil" />
);

export const templateRegistry: TemplateEntry[] = [
  {
    slug: 'maritim-corp',
    previewImage: '/templates-static/previews/maritim-corp.jpg',
    name: 'Maritim Corp',
    category: 'Corporate',
    description:
      'Professional consulting & advisory firm. Animated wave hero, navy palette, services grid, stats counter, testimonial carousel.',
    tags: ['consulting', 'corporate', 'navy'],
    component: MaritimCorp,
  },
  {
    slug: 'vela',
    previewImage: '/templates-static/previews/vela.jpg',
    name: 'Vela',
    category: 'SaaS',
    description:
      'Modern workspace platform landing page. Dashboard hero mockup, feature cards, 3-tier pricing table with toggle, testimonials.',
    tags: ['saas', 'startup', 'violet'],
    component: Vela,
  },
  {
    slug: 'kantor-hukum',
    previewImage: '/templates-static/previews/kantor-hukum.jpg',
    name: 'Kantor Hukum',
    category: 'Law Firm',
    description:
      'Indonesian law firm in serif + dark navy. Practice area grid, attorney profiles, stats band, bilingual nav tweaks.',
    tags: ['law', 'corporate', 'gold'],
    component: KantorHukum,
  },
  {
    slug: 'dcosta',
    previewImage: '/templates-static/previews/dcosta.jpg',
    name: "D'costa",
    category: 'FMCG',
    description:
      'Beauty & personal care brand. Vibrant gradient hero, product category cards, sustainability section, distribution breakdown.',
    tags: ['beauty', 'fmcg', 'colorful'],
    component: Dcosta,
  },
  {
    slug: 'aura-property',
    previewImage: '/templates-static/previews/aura-property.jpg',
    name: 'AURA.',
    category: 'Real Estate',
    description:
      'Luxury property showcase. Full-screen hero with gold accent, architectural spotlight grid, dark/light mode, elegant Playfair Display typography.',
    tags: ['luxury', 'property', 'gold'],
    component: AuraProperty,
  },
  {
    slug: 'javanesa',
    previewImage: '/templates-static/previews/javanesa.jpg',
    name: 'Javanesa.',
    category: 'E-commerce',
    description:
      'Javanese organic skincare brand. Earthy green palette, organic shapes, product grid, hero with illustrated botanicals.',
    tags: ['skincare', 'organic', 'green'],
    component: Javanesa,
  },
  {
    slug: 'bdo-clth',
    previewImage: '/templates-static/previews/bdo-clth.jpg',
    name: 'BDO.CLTH',
    category: 'Streetwear',
    description:
      'Bandung streetwear apparel. Bold Inter + Oswald type, horizontal scroll product strip, dark hero, testimonials, local brand vibes.',
    tags: ['fashion', 'streetwear', 'local'],
    component: BdoClth,
  },
  {
    slug: 'po-bus-bahari-alam',
    previewImage: '/templates-static/previews/po-bus-bahari-alam.png',
    name: 'PO Bus Bahari Alam',
    category: 'Transportation',
    description:
      'Executive bus transportation service. Animated hero with route highlights, fleet showcase, ticket booking CTA, Plus Jakarta Sans + Work Sans typography.',
    tags: ['transportation', 'travel', 'blue'],
    component: PoBusBahariAlam,
  },
  {
    slug: 'nusa-jaya-heritage',
    previewImage: '/templates-static/previews/nusa-jaya-heritage.png',
    name: 'Nusa Jaya Heritage',
    category: 'Restaurant',
    description:
      'Heritage Indonesian fine dining. EB Garamond serif headlines, gold accent palette, dark refined aesthetic, menu showcase and reservation flow.',
    tags: ['restaurant', 'fine-dining', 'gold'],
    component: NusaJayaHeritage,
  },
  {
    slug: 'nusa-jaya-modern',
    previewImage: '/templates-static/previews/nusa-jaya-modern.png',
    name: 'Nusa Jaya Modern',
    category: 'Restaurant',
    description:
      'Modern Nusantara dining. Animated slide-up hero, vertical progress bar, warm amber accents, EB Garamond + Plus Jakarta Sans pairing.',
    tags: ['restaurant', 'modern', 'amber'],
    component: NusaJayaModern,
  },
  {
    slug: 'budi-mobil',
    previewImage: '/templates-static/previews/budi-mobil.png',
    name: 'Budi Mobil Shop',
    category: 'Automotive',
    description:
      'Modern automotive workshop. Bold Montserrat + JetBrains Mono, dark mechanical hero, services grid, red accent CTA, trust-badge section.',
    tags: ['automotive', 'workshop', 'dark'],
    component: BudiMobil,
  },
  {
    slug: 'toko-meubel-rahayu',
    previewImage: '/templates-static/previews/toko-meubel-rahayu.png',
    name: 'Toko Meubel Rahayu',
    category: 'Furniture',
    description:
      'Jakarta heritage furniture store. Source Serif 4 + Work Sans, warm walnut palette, editorial product grid, generous whitespace, Heritage Modernist design system.',
    tags: ['furniture', 'e-commerce', 'walnut'],
    component: TokoMeubelRahayu,
  },
  {
    slug: 'sinar-agen-travel',
    previewImage: '/templates-static/previews/sinar-agen-travel.png',
    name: 'Sinar Agen Travel',
    category: 'Travel Agency',
    description:
      'Adventure travel agency. Bold orange primary, destination cards, package pricing, Plus Jakarta Sans + Work Sans, energetic hero with search widget.',
    tags: ['travel', 'adventure', 'orange'],
    component: SinarAgenTravel,
  },
  {
    slug: 'catering-mama-fadil',
    previewImage: '/templates-static/previews/catering-mama-fadil.png',
    name: 'Catering Mama Fadil',
    category: 'Catering',
    description:
      "Bogor home catering service. Warm coral palette, Literata + Be Vietnam Pro, menu gallery, testimonials, WhatsApp order CTA, home-cooked tradition story.",
    tags: ['catering', 'food', 'coral'],
    component: CateringMamaFadil,
  },
];

export function getTemplate(slug: string): TemplateEntry | null {
  return templateRegistry.find((t) => t.slug === slug) ?? null;
}

export function getAllTemplates(): TemplateEntry[] {
  return templateRegistry;
}

export function getTemplateMetadata(slug: string): TemplateMetadata | null {
  const entry = templateRegistry.find((t) => t.slug === slug);
  if (!entry) return null;
  const { component: _, ...meta } = entry;
  return meta;
}

export function getAllTemplateMetadata(): TemplateMetadata[] {
  return templateRegistry.map(({ component: _, ...meta }) => meta);
}
