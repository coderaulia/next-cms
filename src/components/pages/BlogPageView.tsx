'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import type { BlogPost } from '@/features/cms/types';

import { formatDateLabel } from './sectionContent';

type BlogPageViewProps = {
  posts: BlogPost[];
  query: string;
  activeTag: string;
  page: number;
  pageSize?: number;
};

const defaultPageSize = 6;
const cardAccents = ['#0033FF', '#FF5B22', '#C8E64B', '#0A0E1A'] as const;

function toMinutes(content: string) {
  const words = content.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / 220));
}

function urlForBlog(query: string, tag: string, page: number) {
  const params = new URLSearchParams();
  if (query.trim().length > 0) params.set('q', query.trim());
  if (tag !== 'all') params.set('tag', tag);
  if (page > 1) params.set('page', String(page));
  const qs = params.toString();
  return qs.length > 0 ? `/blog?${qs}` : '/blog';
}

export function BlogPageView({ posts, query, activeTag, page, pageSize = defaultPageSize }: BlogPageViewProps) {
  const { setMode } = useCursorMode();
  const normalizedQuery = query.trim().toLowerCase();
  const normalizedTag = activeTag.trim().toLowerCase() || 'all';

  const tags = Array.from(new Set(posts.flatMap((post) => post.tags.map((tag) => tag.trim())).filter(Boolean)));

  const filtered = posts.filter((post) => {
    if (normalizedTag !== 'all' && !post.tags.some((tag) => tag.toLowerCase() === normalizedTag)) {
      return false;
    }
    if (normalizedQuery.length === 0) {
      return true;
    }
    const haystack = `${post.title} ${post.excerpt} ${post.author} ${post.tags.join(' ')}`.toLowerCase();
    return haystack.includes(normalizedQuery);
  });

  const featured = filtered[0] ?? null;
  const collection = featured ? filtered.slice(1) : filtered;

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
          <span>Insights</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ BLOG / DIGITAL INTELLIGENCE ]</span>
          <span>{posts.length} PUBLISHED NOTES</span>
          <span className="v-svc-status">UPDATED FROM CMS</span>
        </div>

        <h1 className="v-svc-h1">
          Insights on
          <br />
          <em>engineering</em>
          <br />
          and <del>noise.</del>
          <br />
          <em>growth.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>Technical leadership, performance optimization, and digital strategy for the engineering-minded entrepreneur.</p>
          <div className="v-svc-actions">
            <a
              href="#feed"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Browse insights</span>
              <span>-&gt;</span>
            </a>
            <Link
              href="/contact"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Discuss a project
            </Link>
          </div>
        </div>
      </Reveal>

      {featured ? (
        <Reveal as="section" className="v-svc-block v-svc-block-ink" style={{ '--accent': '#C8E64B' } as CSSProperties}>
          <div className="v-svc-block-marker">
            <span className="v-svc-block-n">01</span>
            <span className="v-svc-block-tag">Featured Article</span>
          </div>
          <Link
            href={`/blog/${featured.seo.slug}`}
            className="v-blog-featured"
            onMouseEnter={() => setMode('view')}
            onMouseLeave={() => setMode('default')}
          >
            <div className="v-blog-featured-image">
              {featured.coverImage ? (
                <img src={featured.coverImage} alt={featured.title} decoding="async" loading="lazy" />
              ) : (
                <span>{featured.tags[0] || 'Insight'}</span>
              )}
            </div>
            <div className="v-blog-featured-copy">
              <div className="v-svc-block-head">
                <h2>{featured.title}</h2>
                <span className="v-svc-block-sub">{featured.tags[0] || 'Insight'}</span>
              </div>
              <p className="v-svc-lede">{featured.excerpt}</p>
              <div className="v-blog-meta-row">
                <span>{featured.author}</span>
                <span>{formatDateLabel(featured.publishedAt || featured.updatedAt) || 'Recently published'}</span>
                <span>{toMinutes(featured.content)} min read</span>
              </div>
            </div>
          </Link>
        </Reveal>
      ) : null}

      <Reveal as="section" className="v-svc-block v-svc-block-cream" id="feed" style={{ '--accent': '#0033FF' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">02</span>
          <span className="v-svc-block-tag">Archive</span>
        </div>
        <div className="v-svc-block-head">
          <h2>Latest thinking, filtered.</h2>
          <span className="v-svc-block-sub">{filtered.length} results</span>
        </div>

        <div className="v-blog-filter-row">
          <div className="v-blog-tags" aria-label="Blog categories">
            <Link
              href={urlForBlog(query, 'all', 1)}
              className={`v-blog-tag${normalizedTag === 'all' ? ' is-active' : ''}`}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              All Insights
            </Link>
            {tags.map((tag) => {
              const normalized = tag.toLowerCase();
              const active = normalizedTag === normalized;
              return (
                <Link
                  key={tag}
                  href={urlForBlog(query, normalized, 1)}
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
            <input type="text" id="blog-search" name="q" defaultValue={query} placeholder="Search insights" />
            <button type="submit" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
              Search
            </button>
          </form>
        </div>

        {visible.length > 0 ? (
          <div className="v-blog-grid">
            {visible.map((post, index) => (
              <Link
                key={post.id}
                href={`/blog/${post.seo.slug}`}
                className="v-blog-card"
                style={{ '--accent': cardAccents[index % cardAccents.length] } as CSSProperties}
                onMouseEnter={() => setMode('view')}
                onMouseLeave={() => setMode('default')}
              >
                <div className="v-blog-card-image">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} decoding="async" loading="lazy" />
                  ) : (
                    <span>{post.tags[0] || 'Insight'}</span>
                  )}
                </div>
                <div className="v-blog-card-body">
                  <span className="v-blog-card-kicker">{post.tags[0] || 'Insight'}</span>
                  <h3>{post.title}</h3>
                  <p>{post.excerpt}</p>
                  <div className="v-blog-card-foot">
                    <span>{formatDateLabel(post.publishedAt || post.updatedAt) || 'Recent'}</span>
                    <span>{toMinutes(post.content)} min</span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="v-blog-empty">No insights match your current filter.</div>
        )}

        {totalPages > 1 ? (
          <div className="v-blog-pagination" aria-label="Blog pagination">
            <Link
              href={urlForBlog(query, normalizedTag, Math.max(1, currentPage - 1))}
              aria-label="Previous page"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Prev
            </Link>

            {pageNumbers.map((pageNumber) => (
              <Link
                key={pageNumber}
                href={urlForBlog(query, normalizedTag, pageNumber)}
                className={pageNumber === currentPage ? 'is-active' : ''}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                {pageNumber}
              </Link>
            ))}

            <Link
              href={urlForBlog(query, normalizedTag, Math.min(totalPages, currentPage + 1))}
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
        <span className="v-svc-cta-eye">[ APPLY THE THINKING ]</span>
        <h2>
          Build your
          <br />
          <span className="v-svc-cta-blue">own success story.</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>Let us translate engineering insight into a practical roadmap for your business.</p>
          <div className="v-svc-cta-actions">
            <Link
              href="/contact"
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Claim free consultation</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
