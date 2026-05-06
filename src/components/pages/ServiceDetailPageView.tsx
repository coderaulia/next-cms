'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import { isServiceDetailPageId } from '@/config/site-profile';
import type { LandingPage, PageSection, PortfolioProject } from '@/features/cms/types';

import { splitAccent } from './sectionContent';

function fallbackSection(partial: Partial<PageSection> & Pick<PageSection, 'id'>): PageSection {
  return {
    id: partial.id,
    heading: partial.heading ?? '',
    body: partial.body ?? '',
    ctaLabel: partial.ctaLabel ?? '',
    ctaHref: partial.ctaHref ?? '',
    mediaImage: partial.mediaImage ?? '',
    mediaAlt: partial.mediaAlt ?? '',
    layout: partial.layout ?? 'stacked',
    theme: {
      background: partial.theme?.background ?? '#f9fafb',
      text: partial.theme?.text ?? '#111827',
      accent: partial.theme?.accent ?? '#0f766e'
    }
  };
}

function mergeSection(base: PageSection, incoming: Partial<PageSection> | null | undefined): PageSection {
  if (!incoming) return base;
  return {
    ...base,
    ...incoming,
    theme: {
      ...base.theme,
      ...incoming.theme
    }
  };
}

function resolveSection(page: LandingPage, id: string, fallback: PageSection, fallbackIndex?: number): PageSection {
  const directMatch = page.sections.find((section) => section.id === id);
  if (directMatch) {
    return mergeSection(fallback, directMatch);
  }

  const indexMatch = typeof fallbackIndex === 'number' ? page.sections[fallbackIndex] : null;
  if (indexMatch) {
    return mergeSection(fallback, indexMatch);
  }

  return fallback;
}

function resolveCollection(page: LandingPage, prefix: string, fallbackRangeStart: number, fallbackRangeEnd: number) {
  const prefixed = page.sections.filter((section) => section.id.startsWith(prefix));
  if (prefixed.length > 0) {
    return prefixed;
  }

  return page.sections.slice(fallbackRangeStart, fallbackRangeEnd);
}

type ServiceDetailPageViewProps = {
  page: LandingPage;
  portfolioProjects?: PortfolioProject[];
};

const whyTones = ['ink', 'blue', 'lime', 'ink'] as const;
const planAccents = ['#0033FF', '#FF5B22', '#C8E64B'] as const;

export function ServiceDetailPageView({ page, portfolioProjects = [] }: ServiceDetailPageViewProps) {
  const { setMode } = useCursorMode();

  if (!isServiceDetailPageId(page.id)) {
    return null;
  }

  const servicePageId = page.id;
  const serviceHref = page.seo.slug ? `/${page.seo.slug}` : '/service';

  const hero = resolveSection(
    page,
    'hero',
    fallbackSection({
      id: 'hero',
      heading: `${page.title}|Delivered with technical clarity`,
      body: page.seo.metaDescription || 'A CMS-managed service page ready for package, process, and CTA editing.',
      ctaLabel: 'Service overview',
      ctaHref: serviceHref,
      layout: 'stacked'
    }),
    0
  );

  const plans = resolveCollection(page, 'plan-', 1, 4).map((section, index) =>
    mergeSection(
      fallbackSection({
        id: `plan-${index + 1}`,
        heading: section.heading || `Package ${index + 1}`,
        body: section.body,
        ctaLabel: section.ctaLabel,
        ctaHref: section.ctaHref || '/contact',
        mediaImage: section.mediaImage || 'Starting From',
        mediaAlt: section.mediaAlt,
        layout: section.layout,
        theme: section.theme
      }),
      section
    )
  );

  const whyIntro = resolveSection(
    page,
    'why-intro',
    fallbackSection({
      id: 'why-intro',
      heading: 'Why choose this service?',
      body: 'Differentiation',
      ctaLabel: 'Differentiation',
      layout: 'stacked'
    }),
    4
  );

  const whyItems = resolveCollection(page, 'why-', 5, 9)
    .filter((section) => section.id !== 'why-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `why-${index + 1}`,
          heading: section.heading || `Reason ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || `0${index + 1}`,
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const lifecycleIntro = resolveSection(
    page,
    'lifecycle-intro',
    fallbackSection({
      id: 'lifecycle-intro',
      heading: 'Delivery lifecycle',
      body: 'Methodology',
      ctaLabel: 'Methodology',
      layout: 'stacked'
    }),
    9
  );

  const lifecycleItems = resolveCollection(page, 'lifecycle-', 10, 15)
    .filter((section) => section.id !== 'lifecycle-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `lifecycle-${index + 1}`,
          heading: section.heading || `Step ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || `0${index + 1}`,
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const cta = resolveSection(
    page,
    'cta',
    fallbackSection({
      id: 'cta',
      heading: `Ready to move forward with|${page.title}?`,
      body: page.seo.metaDescription || 'Talk through the brief and next implementation steps.',
      ctaLabel: 'Book a Strategy Call',
      ctaHref: '/contact',
      mediaAlt: 'Get a Free Technical Audit',
      mediaImage: '/contact',
      layout: 'stacked'
    }),
    15
  );

  const relatedProjects = portfolioProjects
    .filter((project) => {
      const relatedIds = Array.isArray(project.relatedServicePageIds) ? project.relatedServicePageIds : [];
      if (relatedIds.includes(servicePageId)) {
        return true;
      }

      return project.projectUrl === serviceHref;
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    })
    .slice(0, 3);

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, page.title);
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, page.title);

  return (
    <main className="v-svc">
      <Reveal as="section" className="v-svc-hero">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <nav className="v-svc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
            Home
          </Link>
          <span>/</span>
          <Link href="/service" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
            Services
          </Link>
          <span>/</span>
          <span>{page.title}</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ SERVICE DETAIL / {page.title.toUpperCase()} ]</span>
          <span>{hero.ctaLabel || 'SERVICE OVERVIEW'}</span>
          <span className="v-svc-status">SCOPING AVAILABLE</span>
        </div>

        <h1 className="v-svc-h1">
          {heroPrimary}
          <br />
          <em>{heroAccent}</em>
          <br />
          without <del>guesswork.</del>
          <br />
          <em>technical clarity.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>{hero.body}</p>
          <div className="v-svc-actions">
            <Link
              href="#packages"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>See packages</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href="/service"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              All services
            </Link>
          </div>
        </div>
      </Reveal>

      {plans.length > 0 ? (
        <Reveal as="section" className="v-svc-block v-svc-block-cream" id="packages" style={{ '--accent': '#0033FF' } as CSSProperties}>
          <div className="v-svc-block-marker">
            <span className="v-svc-block-n">01</span>
            <span className="v-svc-block-tag">Packages</span>
          </div>
          <div className="v-svc-block-head">
            <h2>Choose the right entry point.</h2>
            <span className="v-svc-block-sub">Scope / Budget</span>
          </div>
          <div className="v-detail-plan-grid">
            {plans.map((plan, index) => {
              const features = plan.body
                .split(/\n+/)
                .map((row) => row.trim())
                .filter((row) => row.length > 0);
              const featured = plan.layout === 'split';
              const buttonLabel = plan.theme.accent && !plan.theme.accent.startsWith('#') ? plan.theme.accent : 'Select package';

              return (
                <article
                  className={`v-detail-plan-card${featured ? ' is-featured' : ''}`}
                  key={plan.id}
                  style={{ '--accent': planAccents[index % planAccents.length] } as CSSProperties}
                >
                  <span className="v-detail-plan-kicker">{plan.ctaLabel || `Package ${index + 1}`}</span>
                  <h3>{plan.heading}</h3>
                  <div className="v-detail-price">
                    <span>{plan.mediaImage || 'Starting From'}</span>
                    <strong>{plan.mediaAlt || '-'}</strong>
                  </div>
                  <ul>
                    {features.map((feature) => (
                      <li key={`${plan.id}-${feature}`}>{feature}</li>
                    ))}
                  </ul>
                  <Link
                    href={plan.ctaHref || '/contact'}
                    onMouseEnter={() => setMode('link')}
                    onMouseLeave={() => setMode('default')}
                  >
                    {buttonLabel} <span>-&gt;</span>
                  </Link>
                </article>
              );
            })}
          </div>
        </Reveal>
      ) : null}

      {whyItems.length > 0 ? (
        <Reveal as="section" className="v-svc-why">
          <div className="v-svc-why-head">
            <span className="v-svc-why-eyebrow">[ 02 ] {whyIntro.ctaLabel || 'Differentiation'}</span>
            <h2>
              {whyIntro.heading}
              <br />
              <em>with receipts.</em>
            </h2>
          </div>
          <div className="v-svc-why-grid">
            {whyItems.map((item, index) => (
              <article className={`v-svc-why-cell v-svc-why-${whyTones[index % whyTones.length]}`} key={item.id}>
                <span className="v-svc-why-n">{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
                <div className="v-svc-why-glyph" aria-hidden>
                  {index + 1}
                </div>
              </article>
            ))}
          </div>
        </Reveal>
      ) : null}

      {lifecycleItems.length > 0 ? (
        <Reveal as="section" className="v-svc-block v-svc-block-blue" style={{ '--accent': '#C8E64B' } as CSSProperties}>
          <div className="v-svc-block-marker">
            <span className="v-svc-block-n">03</span>
            <span className="v-svc-block-tag">{lifecycleIntro.ctaLabel || 'Methodology'}</span>
          </div>
          <div className="v-svc-block-head">
            <h2>{lifecycleIntro.heading}</h2>
            <span className="v-svc-block-sub">From brief to launch.</span>
          </div>
          <p className="v-svc-lede">{lifecycleIntro.body}</p>
          <div className="v-detail-process">
            {lifecycleItems.map((item, index) => (
              <article className="v-detail-process-step" key={item.id}>
                <span>{String(index + 1).padStart(2, '0')}</span>
                <h3>{item.heading}</h3>
                <p>{item.body}</p>
              </article>
            ))}
          </div>
        </Reveal>
      ) : null}

      {relatedProjects.length > 0 ? (
        <Reveal as="section" className="v-svc-block v-svc-block-ink" style={{ '--accent': '#FF5B22' } as CSSProperties}>
          <div className="v-svc-block-marker">
            <span className="v-svc-block-n">04</span>
            <span className="v-svc-block-tag">Delivered Work</span>
          </div>
          <div className="v-svc-block-head">
            <h2>Related projects for this service.</h2>
            <span className="v-svc-block-sub">Proof / Portfolio</span>
          </div>
          <div className="v-blog-grid v-detail-project-grid">
            {relatedProjects.map((project, index) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.seo.slug}`}
                className="v-blog-card"
                style={{ '--accent': planAccents[index % planAccents.length] } as CSSProperties}
                onMouseEnter={() => setMode('view')}
                onMouseLeave={() => setMode('default')}
              >
                <div className="v-blog-card-image">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} decoding="async" loading="lazy" />
                  ) : (
                    <span>{project.serviceType || 'Project'}</span>
                  )}
                </div>
                <div className="v-blog-card-body">
                  <span className="v-blog-card-kicker">{project.clientName || project.serviceType || 'Project'}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="v-blog-card-foot">
                    <span>View project</span>
                    <span>-&gt;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="v-svc-cta">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className="v-svc-cta-eye">[ NEXT STEP ]</span>
        <h2>
          {ctaPrimary}
          <br />
          <span className="v-svc-cta-blue">{ctaAccent}</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>{cta.body}</p>
          <div className="v-svc-cta-actions">
            <Link
              href={cta.ctaHref || '/contact'}
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{cta.ctaLabel || 'Book a Strategy Call'}</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href={cta.mediaImage || '/contact'}
              className="v-svc-cta-mail"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {cta.mediaAlt || 'Get a Free Technical Audit'}
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
