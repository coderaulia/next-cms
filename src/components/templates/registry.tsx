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
