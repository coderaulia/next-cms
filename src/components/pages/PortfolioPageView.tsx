'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import type { PortfolioProject } from '@/features/cms/types';

import { formatDateLabel } from './sectionContent';

type PortfolioPageViewProps = {
  projects: PortfolioProject[];
  query: string;
  activeTag: string;
  page: number;
  pageSize?: number;
};

const defaultPageSize = 6;
const projectAccents = ['#0033FF', '#FF5B22', '#C8E64B', '#0A0E1A'] as const;

function urlForPortfolio(query: string, tag: string, page: number) {
  const params = new URLSearchParams();
  if (query.trim().length > 0) params.set('q', query.trim());
  if (tag !== 'all') params.set('tag', tag);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs.length > 0 ? `/portfolio?${qs}` : '/portfolio';
}

export function PortfolioPageView({ projects, query, activeTag, page, pageSize = defaultPageSize }: PortfolioPageViewProps) {
  const { setMode } = useCursorMode();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTag = activeTag.trim().toLowerCase() || 'all';

  const tags = Array.from(new Set(projects.flatMap((project) => project.tags.map((tag) => tag.trim())).filter(Boolean)));

  const filtered = projects.filter((project) => {
    if (normalizedTag !== 'all' && !project.tags.some((tag) => tag.toLowerCase() === normalizedTag)) {
      return false;
    }
    if (normalizedQuery.length === 0) return true;

    const haystack = `${project.title} ${project.summary} ${project.clientName} ${project.serviceType} ${project.industry}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const sorted = [...filtered].sort((a, b) => {
    if (a.featured !== b.featured) return a.featured ? -1 : 1;
    if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
    return a.updatedAt < b.updatedAt ? 1 : -1;
  });

  const featured = sorted.find((project) => project.featured) ?? sorted[0] ?? null;
  const collection = featured ? sorted.filter((project) => project.id !== featured.id) : sorted;

  const totalPages = Math.max(1, Math.ceil(collection.length / pageSize));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * pageSize;
  const visible = collection.slice(start, start + pageSize);
  const pageNumbers = Array.from({ length: totalPages }, (_, index) => index + 1);

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
          <span>Portfolio</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ PORTFOLIO / CASE STUDIES ]</span>
          <span>{projects.length} CMS PROJECTS</span>
          <span className="v-svc-status">RESULTS IN PRODUCTION</span>
        </div>

        <h1 className="v-svc-h1">
          Portfolio of
          <br />
          <em>delivered</em>
          <br />
          not <del>promised.</del>
          <br />
          <em>results.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>Real projects, measurable outcomes, and production-grade implementations delivered for growth-focused teams.</p>
          <div className="v-svc-actions">
            <a
              href="#projects"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Browse case studies</span>
              <span>-&gt;</span>
            </a>
            <Link
              href="/contact"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Start your project
            </Link>
          </div>
        </div>
      </Reveal>

      {featured ? (
        <Reveal as="section" className="v-svc-block v-svc-block-ink" style={{ '--accent': '#C8E64B' } as CSSProperties}>
          <div className="v-svc-block-marker">
            <span className="v-svc-block-n">01</span>
            <span className="v-svc-block-tag">Featured Project</span>
          </div>
          <Link
            href={`/portfolio/${featured.seo.slug}`}
            className="v-blog-featured"
            onMouseEnter={() => setMode('view')}
            onMouseLeave={() => setMode('default')}
          >
            <div className="v-blog-featured-image">
              {featured.coverImage ? (
                <img src={featured.coverImage} alt={featured.title} decoding="async" loading="lazy" />
              ) : (
                <span>{featured.serviceType || 'Case Study'}</span>
              )}
            </div>
            <div className="v-blog-featured-copy">
              <div className="v-svc-block-head">
                <h2>{featured.title}</h2>
                <span className="v-svc-block-sub">{featured.serviceType || 'Implementation'}</span>
              </div>
              <p className="v-svc-lede">{featured.summary}</p>
              <div className="v-svc-tags" aria-label={`${featured.title} tags`}>
                {featured.tags.map((tag) => (
                  <span key={`${featured.id}-${tag}`}>{tag}</span>
                ))}
              </div>
              <div className="v-blog-meta-row">
                <span>{featured.clientName || 'Confidential client'}</span>
                <span>{featured.industry || 'Digital infrastructure'}</span>
                <span>{formatDateLabel(featured.publishedAt || featured.updatedAt) || 'Recently delivered'}</span>
              </div>
            </div>
          </Link>
        </Reveal>
      ) : null}

      <Reveal as="section" className="v-svc-block v-svc-block-cream" id="projects" style={{ '--accent': '#0033FF' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">02</span>
          <span className="v-svc-block-tag">Archive</span>
        </div>
        <div className="v-svc-block-head">
          <h2>Selected work, filtered.</h2>
          <span className="v-svc-block-sub">{filtered.length} results</span>
        </div>

        <div className="v-blog-filter-row">
          <div className="v-blog-tags" aria-label="Portfolio categories">
            <Link
              href={urlForPortfolio(query, 'all', 1)}
              className={`v-blog-tag${normalizedTag === 'all' ? ' is-active' : ''}`}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              All Projects
            </Link>
            {tags.map((tag) => {
              const normalized = tag.toLowerCase();
              const active = normalizedTag === normalized;
              return (
                <Link
                  key={tag}
                  href={urlForPortfolio(query, normalized, 1)}
                  className={`v-blog-tag${active ? ' is-active' : ''}`}
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {tag}
                </Link>
              );
            })}
          </div>

          <form method="get" className="v-blog-search">
            {normalizedTag !== 'all' ? <input type="hidden" name="tag" value={normalizedTag} /> : null}
            <input type="text" id="portfolio-search" name="q" defaultValue={query} placeholder="Search projects" />
            <button type="submit" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
              Search
            </button>
          </form>
        </div>

        {visible.length > 0 ? (
          <div className="v-blog-grid">
            {visible.map((project, index) => (
              <Link
                key={project.id}
                href={`/portfolio/${project.seo.slug}`}
                className="v-blog-card"
                style={{ '--accent': projectAccents[index % projectAccents.length] } as CSSProperties}
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
                  <span className="v-blog-card-kicker">{project.serviceType || 'Implementation'}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                  <div className="v-svc-tags" aria-label={`${project.title} tags`}>
                    {project.tags.slice(0, 3).map((tag) => (
                      <span key={`${project.id}-${tag}`}>{tag}</span>
                    ))}
                  </div>
                  <div className="v-blog-card-foot">
                    <span>{project.clientName || 'Confidential'}</span>
                    <span>View -&gt;</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="v-blog-empty">No portfolio projects match your current filter.</div>
        )}

        {totalPages > 1 ? (
          <div className="v-blog-pagination" aria-label="Portfolio pagination">
            <Link
              href={urlForPortfolio(query, normalizedTag, Math.max(1, currentPage - 1))}
              aria-label="Previous page"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Prev
            </Link>

            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={urlForPortfolio(query, normalizedTag, pageNumber)}
                className={pageNumber === currentPage ? 'is-active' : ''}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                {pageNumber}
              </Link>
            ))}

            <Link
              href={urlForPortfolio(query, normalizedTag, Math.min(totalPages, currentPage + 1))}
              aria-label="Next page"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Next
            </Link>
          </div>
        ) : null}
      </Reveal>

      <Reveal as="section" className="v-svc-cta">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className="v-svc-cta-eye">[ YOUR TURN ]</span>
        <h2>
          Need work this
          <br />
          <span className="v-svc-cta-blue">reliable?</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>Bring us the business problem. We will map the technical path, timeline, and launch plan.</p>
          <div className="v-svc-cta-actions">
            <Link
              href="/contact"
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start your project brief</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
