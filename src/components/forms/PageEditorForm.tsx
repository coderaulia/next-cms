
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CtaStyleToken, HomeBlock, HomeBlockType, LandingPage, PageSection } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type PageEditorFormProps = {
  initialPage: LandingPage;
};

const blockTypes: HomeBlockType[] = [
  'hero',
  'value_triplet',
  'solutions_grid',
  'why_split',
  'logo_cloud',
  'primary_cta'
];

const ctaStyleTokens: CtaStyleToken[] = ['primary', 'secondary', 'ghost'];

const defaultBlockPayload: Record<HomeBlockType, Record<string, unknown>> = {
  hero: {
    badge: '',
    titlePrimary: 'Primary title',
    titleAccent: 'Accent title',
    description: 'Hero description',
    primaryCtaLabel: 'Primary CTA',
    primaryCtaHref: '/contact',
    primaryCtaStyle: 'primary',
    secondaryCtaLabel: 'Secondary CTA',
    secondaryCtaHref: '/service',
    secondaryCtaStyle: 'secondary',
    animatedWords: ['amazing', 'new', 'wonderful']
  },
  value_triplet: {
    items: [{ id: 'item-1', icon: 'bolt', title: 'Speed', text: 'Value text' }]
  },
  solutions_grid: {
    heading: 'Solutions heading',
    subheading: 'Solutions subheading',
    items: [
      {
        id: 'item-1',
        number: '01',
        title: 'Solution',
        text: 'Description',
        ctaLabel: 'Learn',
        ctaHref: '/service'
      }
    ]
  },
  why_split: {
    heading: 'Why heading',
    description: 'Why description',
    bullets: [{ id: 'bullet-1', title: 'Bullet title', text: 'Bullet text' }],
    mediaImage: '',
    mediaAlt: ''
  },
  logo_cloud: {
    heading: 'Trusted by',
    logos: [{ id: 'logo-1', name: 'Client' }],
    primaryCtaLabel: 'Portfolio',
    primaryCtaHref: '/blog',
    secondaryCtaLabel: 'Talk',
    secondaryCtaHref: '/contact'
  },
  primary_cta: {
    heading: 'Ready to grow?',
    accentText: 'Start with Vanaila.',
    description: 'CTA description',
    ctaLabel: 'Contact',
    ctaHref: '/contact',
    ctaStyle: 'primary'
  }
};

function createHomeBlock(type: HomeBlockType, index: number): HomeBlock {
  return {
    id: `${type}-${index + 1}`,
    type,
    enabled: true,
    theme:
      type === 'why_split' || type === 'primary_cta'
        ? 'blue-soft'
        : type === 'solutions_grid'
          ? 'mist'
          : 'light',
    ...(defaultBlockPayload[type] as object)
  } as HomeBlock;
}

function createSection(index: number): PageSection {
  return {
    id: `section-${index + 1}`,
    heading: 'Section heading',
    body: 'Section body',
    ctaLabel: 'Learn more',
    ctaHref: '#',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked',
    theme: { background: '#f9fafb', text: '#111827', accent: '#0f766e' }
  };
}

function normalizePreviewHref(page: LandingPage) {
  if (page.id === 'home') {
    return '/';
  }

  const slug = page.seo.slug.trim();
  return slug ? `/${slug.replace(/^\/+/, '')}` : '/';
}

function toKeywordInput(items: string[] | undefined) {
  return (items ?? []).join(', ');
}

function fromKeywordInput(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function extractBlockPayload(block: HomeBlock) {
  return Object.fromEntries(
    Object.entries(block).filter(([key]) => !['id', 'type', 'enabled', 'theme'].includes(key))
  );
}

export function PageEditorForm({ initialPage }: PageEditorFormProps) {
  const [page, setPage] = useState(initialPage);
  const [baseline, setBaseline] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [nextType, setNextType] = useState<HomeBlockType>('hero');

  useEffect(() => {
    setPage(initialPage);
    setBaseline(initialPage);
  }, [initialPage]);

  const isHome = page.id === 'home';
  const blocks = useMemo(() => page.homeBlocks ?? [], [page.homeBlocks]);
  const isDirty = useMemo(() => JSON.stringify(page) !== JSON.stringify(baseline), [page, baseline]);
  const previewHref = normalizePreviewHref(page);

  const savePage = useCallback(async () => {
    setSaving(true);
    setNotice('');
    const response = await csrfFetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page)
    });
    setSaving(false);

    if (!response.ok) {
      setNotice('Failed to save page');
      return;
    }

    const payload = (await response.json()) as { page: LandingPage };
    setPage(payload.page);
    setBaseline(payload.page);
    setNotice('Page saved');
  }, [page]);

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      if (!saving) {
        void savePage();
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [savePage, saving]);

  const updateBlock = (index: number, patch: Partial<HomeBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...(patch as object) } as HomeBlock;
    setPage({ ...page, homeBlocks: next });
  };

  const renderHomeQuickFields = (block: HomeBlock, index: number) => {
    if (block.type === 'hero') {
      return (
        <div className="admin-grid-2">
          <label>
            Title primary
            <input
              value={String((block as Record<string, unknown>).titlePrimary ?? '')}
              onChange={(event) => updateBlock(index, { titlePrimary: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
          <label>
            Title accent
            <input
              value={String((block as Record<string, unknown>).titleAccent ?? '')}
              onChange={(event) => updateBlock(index, { titleAccent: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
          <label>
            Animated words (comma)
            <input
              value={toKeywordInput((block as { animatedWords?: string[] }).animatedWords)}
              onChange={(event) => updateBlock(index, { animatedWords: fromKeywordInput(event.target.value) } as Partial<HomeBlock>)}
            />
          </label>
          <label>
            Primary CTA style
            <select
              value={String((block as Record<string, unknown>).primaryCtaStyle ?? 'primary')}
              onChange={(event) => updateBlock(index, { primaryCtaStyle: event.target.value as CtaStyleToken } as Partial<HomeBlock>)}
            >
              {ctaStyleTokens.map((token) => (
                <option key={token} value={token}>
                  {token}
                </option>
              ))}
            </select>
          </label>
        </div>
      );
    }

    if (block.type === 'solutions_grid') {
      return (
        <div className="admin-grid-2">
          <label>
            Heading
            <input
              value={String((block as Record<string, unknown>).heading ?? '')}
              onChange={(event) => updateBlock(index, { heading: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
          <label>
            Subheading
            <input
              value={String((block as Record<string, unknown>).subheading ?? '')}
              onChange={(event) => updateBlock(index, { subheading: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
        </div>
      );
    }

    if (block.type === 'why_split' || block.type === 'logo_cloud' || block.type === 'primary_cta') {
      return (
        <div className="admin-grid-2">
          <label>
            Heading
            <input
              value={String((block as Record<string, unknown>).heading ?? '')}
              onChange={(event) => updateBlock(index, { heading: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
          {block.type === 'primary_cta' ? (
            <label>
              CTA style
              <select
                value={String((block as Record<string, unknown>).ctaStyle ?? 'primary')}
                onChange={(event) => updateBlock(index, { ctaStyle: event.target.value as CtaStyleToken } as Partial<HomeBlock>)}
              >
                {ctaStyleTokens.map((token) => (
                  <option key={token} value={token}>
                    {token}
                  </option>
                ))}
              </select>
            </label>
          ) : null}
        </div>
      );
    }

    return <p className="admin-subtle">Tip: use JSON payload below to edit list items and advanced fields.</p>;
  };

  return (
    <div className="admin-form-wrap">
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <h2>{page.title}</h2>
            <p className="admin-subtle">Ctrl/Cmd + S to save. {page.published ? 'Published' : 'Draft'} page.</p>
          </div>
          <div className="admin-actions">
            <span className={`admin-chip ${isDirty ? 'admin-chip-warning' : 'admin-chip-success'}`}>
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
            <a className="v2-btn v2-btn-secondary" href={previewHref} target="_blank" rel="noreferrer">
              Preview page
            </a>
            <button type="button" disabled={!isDirty || saving} onClick={() => setPage(baseline)}>
              Discard
            </button>
            <button type="button" disabled={saving} onClick={savePage}>
              {saving ? 'Saving...' : 'Save page'}
            </button>
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
      </section>

      <section className="admin-card">
        <h2>Page settings</h2>
        <div className="admin-grid-2">
          <label>
            Title
            <input value={page.title} onChange={(event) => setPage({ ...page, title: event.target.value })} />
          </label>
          <label>
            Nav label
            <input value={page.navLabel} onChange={(event) => setPage({ ...page, navLabel: event.target.value })} />
          </label>
        </div>
        <label>
          Published
          <input
            type="checkbox"
            checked={page.published}
            onChange={(event) => setPage({ ...page, published: event.target.checked })}
          />
        </label>
      </section>

      <section className="admin-card">
        <h2>SEO</h2>
        <div className="admin-grid-2">
          <label>
            Meta title
            <input
              value={page.seo.metaTitle}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, metaTitle: event.target.value } })}
            />
            <span className="admin-subtle">{page.seo.metaTitle.length}/60 recommended</span>
          </label>
          <label>
            Slug
            <input
              value={page.seo.slug}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, slug: event.target.value } })}
            />
          </label>
          <label>
            Canonical
            <input
              value={page.seo.canonical}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, canonical: event.target.value } })}
            />
          </label>
          <label>
            Social image
            <input
              value={page.seo.socialImage}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, socialImage: event.target.value } })}
            />
          </label>
          <label>
            Keywords (comma separated)
            <input
              value={toKeywordInput(page.seo.keywords)}
              onChange={(event) =>
                setPage({
                  ...page,
                  seo: {
                    ...page.seo,
                    keywords: fromKeywordInput(event.target.value)
                  }
                })
              }
            />
          </label>
        </div>
        <label>
          Meta description
          <textarea
            value={page.seo.metaDescription}
            onChange={(event) => setPage({ ...page, seo: { ...page.seo, metaDescription: event.target.value } })}
          />
          <span className="admin-subtle">{page.seo.metaDescription.length}/160 recommended</span>
        </label>
      </section>

      {isHome ? (
        <section className="admin-card">
          <div className="admin-inline-header">
            <h2>Homepage blocks</h2>
            <div className="admin-actions">
              <select value={nextType} onChange={(event) => setNextType(event.target.value as HomeBlockType)}>
                {blockTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() => setPage({ ...page, homeBlocks: [...blocks, createHomeBlock(nextType, blocks.length)] })}
              >
                Add block
              </button>
            </div>
          </div>

          {blocks.map((block, index) => {
            const payload = JSON.stringify(extractBlockPayload(block), null, 2);

            return (
              <article className="section-editor" key={block.id}>
                <div className="admin-inline-header">
                  <h3>
                    {index + 1}. {block.type}
                  </h3>
                  <div className="admin-actions">
                    <button
                      type="button"
                      disabled={index === 0}
                      onClick={() => {
                        const next = [...blocks];
                        [next[index - 1], next[index]] = [next[index], next[index - 1]];
                        setPage({ ...page, homeBlocks: next });
                      }}
                    >
                      Up
                    </button>
                    <button
                      type="button"
                      disabled={index === blocks.length - 1}
                      onClick={() => {
                        const next = [...blocks];
                        [next[index + 1], next[index]] = [next[index], next[index + 1]];
                        setPage({ ...page, homeBlocks: next });
                      }}
                    >
                      Down
                    </button>
                    <button type="button" onClick={() => setPage({ ...page, homeBlocks: blocks.filter((row) => row.id !== block.id) })}>
                      Remove
                    </button>
                  </div>
                </div>

                <div className="admin-grid-3">
                  <label>
                    ID
                    <input value={block.id} onChange={(event) => updateBlock(index, { id: event.target.value })} />
                  </label>
                  <label>
                    Enabled
                    <input type="checkbox" checked={block.enabled} onChange={(event) => updateBlock(index, { enabled: event.target.checked })} />
                  </label>
                  <label>
                    Theme
                    <select value={block.theme} onChange={(event) => updateBlock(index, { theme: event.target.value as HomeBlock['theme'] })}>
                      <option value="light">light</option>
                      <option value="blue-soft">blue-soft</option>
                      <option value="mist">mist</option>
                    </select>
                  </label>
                </div>

                {renderHomeQuickFields(block, index)}

                <label>
                  Block payload (JSON)
                  <textarea
                    rows={8}
                    value={payload}
                    onChange={(event) => {
                      try {
                        const parsed = JSON.parse(event.target.value) as Record<string, unknown>;
                        const next = [...blocks];
                        next[index] = { ...block, ...(parsed as object) } as HomeBlock;
                        setPage({ ...page, homeBlocks: next });
                        setNotice('');
                      } catch {
                        setNotice('Invalid JSON payload in one of the blocks.');
                      }
                    }}
                  />
                </label>
              </article>
            );
          })}
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-inline-header">
            <h2>Page sections</h2>
            <button type="button" onClick={() => setPage({ ...page, sections: [...page.sections, createSection(page.sections.length)] })}>
              Add section
            </button>
          </div>

          {page.sections.map((section, index) => (
            <article className="section-editor" key={section.id}>
              <div className="admin-inline-header">
                <h3>
                  {index + 1}. {section.id}
                </h3>
                <button
                  type="button"
                  onClick={() => setPage({ ...page, sections: page.sections.filter((row) => row.id !== section.id) })}
                >
                  Remove
                </button>
              </div>

              <div className="admin-grid-2">
                <label>
                  Heading
                  <input
                    value={section.heading}
                    onChange={(event) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], heading: event.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
                <label>
                  CTA URL
                  <input
                    value={section.ctaHref}
                    onChange={(event) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], ctaHref: event.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
              </div>

              <label>
                Body
                <textarea
                  rows={5}
                  value={section.body}
                  onChange={(event) => {
                    const next = [...page.sections];
                    next[index] = { ...next[index], body: event.target.value };
                    setPage({ ...page, sections: next });
                  }}
                />
              </label>
            </article>
          ))}
        </section>
      )}
    </div>
  );
}




