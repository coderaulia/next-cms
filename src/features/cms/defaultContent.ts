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
  seo: seo(id === 'home' ? '' : id, `${title} | Acme Marketing`, description),
  sections,
  updatedAt: nowIso()
});

export const defaultContent: CmsContent = {
  settings: {
    siteName: 'Acme Marketing',
    baseUrl: process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000',
    organizationName: process.env.CMS_ORG_NAME ?? 'Acme Marketing',
    organizationLogo: process.env.CMS_ORG_LOGO ?? 'https://placehold.co/240x80/png',
    defaultOgImage: 'https://placehold.co/1200x630/png'
  },
  pages: {
    home: page(
      'home',
      'Growth Marketing That Converts',
      'Home',
      'Performance-focused marketing website services for fast growing teams.',
      [
        section(
          'home-hero',
          'Launch campaigns faster with conversion-first pages',
          'Build SEO-friendly pages, test messaging quickly, and publish content through a simple CMS.',
          {
            ctaLabel: 'Book discovery call',
            ctaHref: '/contact',
            layout: 'split',
            theme: {
              background: '#eff6ff',
              text: '#0f172a',
              accent: '#1d4ed8'
            }
          }
        ),
        section(
          'home-services',
          'What we help you ship',
          'Landing pages, technical SEO, analytics setup, and editorial workflows that keep your content moving.',
          {
            ctaLabel: 'See services',
            ctaHref: '/service',
            layout: 'stacked',
            theme: {
              background: '#f0fdf4',
              text: '#052e16',
              accent: '#15803d'
            }
          }
        )
      ]
    ),
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
      tags: ['landing-page', 'conversion', 'seo'],
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
