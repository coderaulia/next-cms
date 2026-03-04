import type { CmsContent, LandingPage, PageId, PageSection, SeoFields } from './types';

const nowIso = () => new Date().toISOString();

const section = (
  id: string,
  heading: string,
  body: string,
  options?: Partial<PageSection>
): PageSection => ({
  id,
  heading,
  body,
  ctaLabel: options?.ctaLabel ?? 'Learn more',
  ctaHref: options?.ctaHref ?? '#',
  mediaImage: options?.mediaImage ?? 'https://placehold.co/960x640/png',
  mediaAlt: options?.mediaAlt ?? heading,
  layout: options?.layout ?? 'split',
  theme: {
    background: options?.theme?.background ?? '#f9fafb',
    text: options?.theme?.text ?? '#111827',
    accent: options?.theme?.accent ?? '#0f766e'
  }
});

const seo = (slug: string, title: string, description: string): SeoFields => ({
  metaTitle: title,
  metaDescription: description,
  slug,
  canonical: '',
  socialImage: 'https://placehold.co/1200x630/png',
  noIndex: false
});

const page = (
  id: PageId,
  title: string,
  navLabel: string,
  description: string,
  sections: PageSection[]
): LandingPage => ({
  id,
  title,
  navLabel,
  published: true,
  seo: seo(id === 'home' ? '' : id, `${title} | Vanaila Digital`, description),
  sections,
  updatedAt: nowIso()
});

const home = page(
  'home',
  'Your Business Online. Faster, Smarter, and Built To Scale.',
  'Home',
  'Engineering-led digital solutions for ambitious modern businesses.',
  []
);
home.homeBlocks = [
  {
    id: 'home-hero',
    type: 'hero',
    enabled: true,
    theme: 'light',
    badge: 'Vanaila Digital Consultancy',
    titlePrimary: 'Your Business Online.',
    titleAccent: 'Faster, Smarter, and Built To Scale.',
    description:
      'Vanaila Digital helps you move your ideas to production with strategic design, engineering, and SEO.',
    primaryCtaLabel: 'Book free consultation',
    primaryCtaHref: '/contact',
    primaryCtaStyle: 'primary',
    secondaryCtaLabel: 'See our work',
    secondaryCtaHref: '/service',
    secondaryCtaStyle: 'secondary'
  },
  {
    id: 'home-values',
    type: 'value_triplet',
    enabled: true,
    theme: 'light',
    items: [
      {
        id: 'value-speed',
        icon: '⚡',
        title: 'Speed',
        text: 'Lightweight engineering and practical workflows that reduce time to launch.'
      },
      {
        id: 'value-simplicity',
        icon: '◎',
        title: 'Simplicity',
        text: 'Clear implementation choices with maintainable structures for long-term teams.'
      },
      {
        id: 'value-value',
        icon: '⎈',
        title: 'Value',
        text: 'Focused execution and measured outcomes for every delivery cycle.'
      }
    ]
  },
  {
    id: 'home-solutions',
    type: 'solutions_grid',
    enabled: true,
    theme: 'mist',
    heading: 'Our Solutions',
    subheading:
      'Engineering solutions for modern business infrastructure. Build for performance, scale, and clarity.',
    items: [
      {
        id: 'solution-01',
        number: '01',
        title: 'Professional Business Website',
        text: 'Conversion-focused websites that are fast, secure, and easy to maintain.',
        ctaLabel: 'Learn more',
        ctaHref: '/service'
      },
      {
        id: 'solution-02',
        number: '02',
        title: 'Custom Business Tools',
        text: 'Internal tools and workflow platforms to remove operational friction.',
        ctaLabel: 'Explore',
        ctaHref: '/service'
      },
      {
        id: 'solution-03',
        number: '03',
        title: 'Store Online Shops',
        text: 'Commerce-ready storefronts with reliable performance and clean UX.',
        ctaLabel: 'View service',
        ctaHref: '/service'
      },
      {
        id: 'solution-04',
        number: '04',
        title: 'Mobile Business Apps',
        text: 'Responsive product experiences with focused feature sets.',
        ctaLabel: 'Discuss',
        ctaHref: '/contact'
      },
      {
        id: 'solution-05',
        number: '05',
        title: 'Official Business Email',
        text: 'Professional communication infrastructure for brand trust.',
        ctaLabel: 'Professionalize',
        ctaHref: '/contact'
      }
    ]
  },
  {
    id: 'home-why',
    type: 'why_split',
    enabled: true,
    theme: 'blue-soft',
    heading: 'Why Vanaila Digital?',
    description: 'We engineer digital systems that balance precision, speed, and business outcomes.',
    bullets: [
      {
        id: 'why-1',
        title: 'Innovative Focused R&D',
        text: 'Practical experimentation with measurable impact.'
      },
      {
        id: 'why-2',
        title: '8 Years of Hands-On Practice',
        text: 'Cross-industry delivery experience with strong execution standards.'
      },
      {
        id: 'why-3',
        title: 'Premium Quality, Best-Price Guarantee',
        text: 'A reliable balance of quality and cost efficiency.'
      }
    ],
    mediaImage: 'https://placehold.co/560x420/png',
    mediaAlt: 'Vanaila digital engineering visual'
  },
  {
    id: 'home-logos',
    type: 'logo_cloud',
    enabled: true,
    theme: 'light',
    heading: 'Trusted by Innovators',
    logos: [
      { id: 'logo-1', name: 'TechWave' },
      { id: 'logo-2', name: 'GlobalCom' },
      { id: 'logo-3', name: 'ApexRetail' },
      { id: 'logo-4', name: 'InnovaHealth' },
      { id: 'logo-5', name: 'Quantum' }
    ],
    primaryCtaLabel: 'View our portfolio',
    primaryCtaHref: '/blog',
    secondaryCtaLabel: "Let's talk growth",
    secondaryCtaHref: '/contact'
  },
  {
    id: 'home-cta',
    type: 'primary_cta',
    enabled: true,
    theme: 'blue-soft',
    heading: 'Ready to Grow?',
    accentText: 'Join the organizations that trust Vanaila Digital.',
    description: "Let's build something that works hard for your goals.",
    ctaLabel: 'Claim free consultation call',
    ctaHref: '/contact',
    ctaStyle: 'primary'
  }
];

export const defaultContent: CmsContent = {
  settings: {
    siteName: 'vanaila.',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    organizationName: process.env.CMS_ORG_NAME ?? 'Vanaila Digital',
    organizationLogo: process.env.CMS_ORG_LOGO ?? 'https://placehold.co/120x120/png',
    defaultOgImage: 'https://placehold.co/1200x630/png'
  },
  pages: {
    home,
    about: page(
      'about',
      'About Our Team',
      'About',
      'Meet the team behind your website growth system.',
      [
        section(
          'about-story',
          'A practical team focused on execution',
          'We combine content, engineering, and SEO to deliver compounding results for service businesses.',
          {
            ctaLabel: 'Read our blog',
            ctaHref: '/blog'
          }
        )
      ]
    ),
    service: page(
      'service',
      'Services',
      'Service',
      'Website and growth services built for modern marketing teams.',
      [
        section(
          'service-offers',
          'Services built for measurable growth',
          'We provide page strategy, CMS implementation, technical SEO, and analytics reporting.',
          {
            ctaLabel: 'Start a project',
            ctaHref: '/contact'
          }
        )
      ]
    ),
    contact: page(
      'contact',
      'Contact',
      'Contact',
      'Get in touch to discuss your next campaign or website project.',
      [
        section(
          'contact-form',
          'Let us know your goals',
          'Share your current website, timeline, and business target. We will respond with a practical plan.',
          {
            ctaLabel: 'Send inquiry',
            ctaHref: 'mailto:hello@example.com'
          }
        )
      ]
    )
  },
  blogPosts: [
    {
      id: 'post-1',
      title: 'How to Structure a High-Converting Service Landing Page',
      excerpt:
        'A practical structure for hero sections, proof blocks, and conversion paths that increase lead quality.',
      content: `# Why structure matters

High-converting pages are clear, specific, and fast.

## Recommended flow

1. Hero with clear value proposition
2. Social proof
3. Service detail with outcomes
4. CTA with low friction

Keep sections simple and measurable.`,
      author: 'Editorial Team',
      tags: ['engineering', 'performance', 'seo'],
      coverImage: 'https://placehold.co/1200x630/png',
      status: 'published',
      publishedAt: nowIso(),
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'How to Structure a High-Converting Service Landing Page',
        metaDescription:
          'Use this framework to build service pages that improve conversion and organic visibility.',
        slug: 'high-converting-service-landing-page',
        canonical: '',
        socialImage: 'https://placehold.co/1200x630/png',
        noIndex: false
      }
    },
    {
      id: 'post-2',
      title: 'Editorial Workflow Checklist for Marketing Teams',
      excerpt:
        'Set up a draft-to-publish workflow in your CMS so non-technical teams can ship content confidently.',
      content: `# Editorial workflow

Use statuses, approvals, and clear owners.

Draft quickly, review carefully, then publish with SEO checks.`,
      author: 'Editorial Team',
      tags: ['workflow', 'cms'],
      coverImage: 'https://placehold.co/1200x630/png',
      status: 'draft',
      publishedAt: null,
      updatedAt: nowIso(),
      seo: {
        metaTitle: 'Editorial Workflow Checklist for Marketing Teams',
        metaDescription: 'A clear CMS workflow that supports consistent publishing quality.',
        slug: 'editorial-workflow-checklist',
        canonical: '',
        socialImage: 'https://placehold.co/1200x630/png',
        noIndex: false
      }
    }
  ]
};
