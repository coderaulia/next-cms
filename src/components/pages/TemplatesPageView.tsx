'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';
import type { TemplateMetadata } from '@/components/templates/registry';

type TemplatesPageViewProps = {
  templates: TemplateMetadata[];
};

const CATEGORY_ACCENT: Record<string, string> = {
  landing: '#0033FF',
  portfolio: '#C8E64B',
  saas: '#FF5B22',
  blog: '#8B5CF6',
  ecommerce: '#06B6D4',
  corporate: '#1a2d4c',
};

function categoryAccent(category: string) {
  return CATEGORY_ACCENT[category.toLowerCase()] ?? '#0033FF';
}

const MAX_QUERY_LEN = 100;

function sanitizeQuery(raw: string): string {
  return raw.slice(0, MAX_QUERY_LEN).trimStart();
}

function filterTemplates(
  templates: TemplateMetadata[],
  query: string,
  category: string | null,
  validCategories: Set<string>,
): TemplateMetadata[] {
  const safeCategory = category && validCategories.has(category) ? category : null;
  const q = query.trim().toLowerCase();

  return templates.filter((t) => {
    if (safeCategory && t.category !== safeCategory) return false;
    if (!q) return true;
    return (
      t.name.toLowerCase().includes(q) ||
      t.description.toLowerCase().includes(q) ||
      t.category.toLowerCase().includes(q) ||
      t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  });
}

function EmptyState() {
  return (
    <div className="v-tmpl-empty">
      <span className="v-tmpl-empty-glyph">◎</span>
      <h3>Templates are being crafted.</h3>
      <p>Vanaila Atelier is designing the first collection. Check back soon.</p>
    </div>
  );
}

function TemplateCard({ template }: { template: TemplateMetadata }) {
  const { setMode } = useCursorMode();
  const accent = categoryAccent(template.category);

  return (
    <StaggerItem>
      <Link
        href={`/templates/${template.slug}`}
        className="v-tmpl-card"
        onMouseEnter={() => setMode('link')}
        onMouseLeave={() => setMode('default')}
      >
        <div className="v-tmpl-card-preview" style={{ '--tmpl-accent': accent } as React.CSSProperties}>
          {template.previewImage ? (
            <img src={template.previewImage} alt={template.name} />
          ) : (
            <div className="v-tmpl-card-placeholder" aria-hidden>
              <span className="v-tmpl-card-glyph">◈</span>
            </div>
          )}
          <span className="v-tmpl-card-category">{template.category}</span>
        </div>
        <div className="v-tmpl-card-body">
          <h3 className="v-tmpl-card-name">{template.name}</h3>
          <p className="v-tmpl-card-desc">{template.description}</p>
          <div className="v-tmpl-card-tags">
            {template.tags.slice(0, 4).map((tag) => (
              <span key={tag} className="v-tmpl-tag">{tag}</span>
            ))}
          </div>
        </div>
        <div className="v-tmpl-card-cta">
          <span>View template</span>
          <span aria-hidden>→</span>
        </div>
      </Link>
    </StaggerItem>
  );
}

export function TemplatesPageView({ templates }: TemplatesPageViewProps) {
  const { setMode } = useCursorMode();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const validCategories = useMemo(
    () => new Set(templates.map((t) => t.category)),
    [templates],
  );

  const categories = useMemo(
    () => Array.from(validCategories).sort(),
    [validCategories],
  );

  const filtered = useMemo(
    () => filterTemplates(templates, searchQuery, activeCategory, validCategories),
    [templates, searchQuery, activeCategory, validCategories],
  );

  return (
    <main className="v-svc">
      {/* Hero */}
      <Reveal as="section" className="v-svc-hero">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <nav className="v-svc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
            Home
          </Link>
          <span>/</span>
          <span>Templates</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ TEMPLATES / VANAILA ATELIER ]</span>
          <span>DESIGN-FIRST / PRODUCTION-READY</span>
          <span className="v-svc-status">COLLECTION IN PROGRESS</span>
        </div>

        <h1 className="v-svc-h1">
          Ready-made sites,
          <br />
          <em>built to last.</em>
          <br />
          Not themes.
          <br />
          <em>Systems.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>
            Every Vanaila template is engineered with the full design system — motion, layout,
            and typography tuned for conversion and clarity. Pick a foundation. Own it completely.
          </p>
          <div className="v-svc-actions">
            <a
              href="#collection"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Browse collection</span>
              <span>-&gt;</span>
            </a>
            <Link
              href="/atelier"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              About Atelier
            </Link>
          </div>
        </div>
      </Reveal>

      {/* Stats bar */}
      <Reveal as="section" className="v-svc-block v-svc-block-cream">
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">01</span>
          <span className="v-svc-block-tag">What you get</span>
        </div>
        <div className="v-svc-block-head">
          <h2>Not a starter kit. A finished product.</h2>
          <span className="v-svc-block-sub">Built on the Vanaila design system</span>
        </div>
        <div className="v-svc-deliverables">
          {[
            { k: 'Design system', v: 'Every template ships with the full Vanaila token set — spacing, typography, motion, colour.' },
            { k: 'Scroll animations', v: 'Reveal and stagger primitives baked in. No external animation libraries.' },
            { k: 'Fully editable', v: 'Plain React and Tailwind. No black-box theme system. Your devs can change anything.' },
          ].map((item) => (
            <article className="v-svc-deliverable" key={item.k}>
              <div className="v-svc-deliverable-header">
                <span>◎</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{item.k}</h3>
              <p>{item.v}</p>
            </article>
          ))}
        </div>
      </Reveal>

      {/* Collection grid */}
      <Reveal as="section" className="v-svc-block v-svc-block-ink" id="collection">
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">02</span>
          <span className="v-svc-block-tag">Collection</span>
        </div>
        <div className="v-svc-block-head">
          <h2>
            {templates.length === 0
              ? 'The first drop is coming.'
              : `${templates.length} template${templates.length === 1 ? '' : 's'} available.`}
          </h2>
          <span className="v-svc-block-sub">Vanaila Atelier originals</span>
        </div>

        {templates.length > 0 && (
          <div className="v-tmpl-filters">
            <div className="v-tmpl-search-wrap">
              <span className="v-tmpl-search-icon" aria-hidden>⌕</span>
              <input
                className="v-tmpl-search"
                type="search"
                placeholder="Search templates…"
                value={searchQuery}
                maxLength={MAX_QUERY_LEN}
                autoComplete="off"
                spellCheck={false}
                onChange={(e) => setSearchQuery(sanitizeQuery(e.target.value))}
                aria-label="Search templates"
              />
              {searchQuery && (
                <button
                  className="v-tmpl-search-clear"
                  onClick={() => setSearchQuery('')}
                  aria-label="Clear search"
                  type="button"
                >
                  ×
                </button>
              )}
            </div>
            <div className="v-tmpl-cats" role="group" aria-label="Filter by category">
              <button
                className={`v-tmpl-cat${activeCategory === null ? ' is-active' : ''}`}
                onClick={() => setActiveCategory(null)}
                type="button"
              >
                All
              </button>
              {categories.map((cat) => (
                <button
                  key={cat}
                  className={`v-tmpl-cat${activeCategory === cat ? ' is-active' : ''}`}
                  onClick={() => setActiveCategory(cat)}
                  type="button"
                >
                  {cat}
                </button>
              ))}
            </div>
            {(searchQuery || activeCategory) && (
              <p className="v-tmpl-filter-count">
                {filtered.length === 0
                  ? 'No templates match.'
                  : `${filtered.length} of ${templates.length} shown`}
              </p>
            )}
          </div>
        )}

        {templates.length === 0 ? (
          <EmptyState />
        ) : filtered.length === 0 ? (
          <div className="v-tmpl-empty">
            <span className="v-tmpl-empty-glyph">◎</span>
            <h3>No match found.</h3>
            <p>Try a different search term or clear the category filter.</p>
          </div>
        ) : (
          <StaggerGroup className="v-tmpl-grid">
            {filtered.map((template) => (
              <TemplateCard key={template.slug} template={template} />
            ))}
          </StaggerGroup>
        )}
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="v-svc-cta">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        <span className="v-svc-cta-eye">[ CUSTOM BUILD ]</span>
        <h2>
          Need something
          <br />
          <span className="v-svc-cta-blue">bespoke?</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>
            Templates are a starting point. If your brief calls for something entirely custom,
            Vanaila Atelier builds from scratch.
          </p>
          <div className="v-svc-cta-actions">
            <Link
              href="/contact"
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start a project</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
