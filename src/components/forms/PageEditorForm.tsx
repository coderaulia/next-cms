'use client';

import { useMemo, useState } from 'react';

import type { HomeBlock, HomeBlockType, LandingPage, PageSection } from '@/features/cms/types';

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

const defaultBlockPayload: Record<HomeBlockType, Record<string, unknown>> = {
  hero: {
    badge: 'New badge',
    titlePrimary: 'Primary title',
    titleAccent: 'Accent title',
    description: 'Hero description',
    primaryCtaLabel: 'Primary CTA',
    primaryCtaHref: '/contact',
    primaryCtaStyle: 'primary',
    secondaryCtaLabel: 'Secondary CTA',
    secondaryCtaHref: '/service',
    secondaryCtaStyle: 'secondary',
    animatedWords: ['amazing', 'new', 'wonderful', 'beautiful', 'smart']
  },
  value_triplet: {
    items: [{ id: 'item-1', icon: '⚡', title: 'Speed', text: 'Value text' }]
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

export function PageEditorForm({ initialPage }: PageEditorFormProps) {
  const [page, setPage] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [nextType, setNextType] = useState<HomeBlockType>('hero');

  const isHome = page.id === 'home';
  const blocks = useMemo(() => page.homeBlocks ?? [], [page.homeBlocks]);

  const savePage = async () => {
    setSaving(true);
    setNotice('');
    const response = await fetch(`/api/admin/pages/${page.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(page)
    });
    setSaving(false);
    if (!response.ok) return setNotice('Failed to save page');
    const payload = (await response.json()) as { page: LandingPage };
    setPage(payload.page);
    setNotice('Page saved');
  };

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <h2>Page settings</h2>
        <div className="admin-grid-2">
          <label>
            Title
            <input value={page.title} onChange={(e) => setPage({ ...page, title: e.target.value })} />
          </label>
          <label>
            Nav label
            <input value={page.navLabel} onChange={(e) => setPage({ ...page, navLabel: e.target.value })} />
          </label>
        </div>
        <label>
          Published
          <input
            type="checkbox"
            checked={page.published}
            onChange={(e) => setPage({ ...page, published: e.target.checked })}
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
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, metaTitle: e.target.value } })}
            />
          </label>
          <label>
            Slug
            <input
              value={page.seo.slug}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, slug: e.target.value } })}
            />
          </label>
          <label>
            Canonical
            <input
              value={page.seo.canonical}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, canonical: e.target.value } })}
            />
          </label>
          <label>
            Social image
            <input
              value={page.seo.socialImage}
              onChange={(e) => setPage({ ...page, seo: { ...page.seo, socialImage: e.target.value } })}
            />
          </label>
        </div>
        <label>
          Meta description
          <textarea
            value={page.seo.metaDescription}
            onChange={(e) =>
              setPage({ ...page, seo: { ...page.seo, metaDescription: e.target.value } })
            }
          />
        </label>
      </section>

      {isHome ? (
        <section className="admin-card">
          <div className="admin-inline-header">
            <h2>Homepage blocks</h2>
            <div className="admin-actions">
              <select value={nextType} onChange={(e) => setNextType(e.target.value as HomeBlockType)}>
                {blockTypes.map((type) => (
                  <option key={type} value={type}>
                    {type}
                  </option>
                ))}
              </select>
              <button
                type="button"
                onClick={() =>
                  setPage({
                    ...page,
                    homeBlocks: [...blocks, createHomeBlock(nextType, blocks.length)]
                  })
                }
              >
                Add block
              </button>
            </div>
          </div>
          {blocks.map((block, index) => {
            const payload = JSON.stringify(
              Object.fromEntries(
                Object.entries(block).filter(
                  ([key]) => !['id', 'type', 'enabled', 'theme'].includes(key)
                )
              ),
              null,
              2
            );
            return (
              <div className="section-editor" key={block.id}>
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
                    <button
                      type="button"
                      onClick={() =>
                        setPage({
                          ...page,
                          homeBlocks: blocks.filter((row) => row.id !== block.id)
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                </div>
                <div className="admin-grid-3">
                  <label>
                    ID
                    <input
                      value={block.id}
                      onChange={(e) => {
                        const next = [...blocks];
                        next[index] = { ...block, id: e.target.value };
                        setPage({ ...page, homeBlocks: next });
                      }}
                    />
                  </label>
                  <label>
                    Enabled
                    <input
                      type="checkbox"
                      checked={block.enabled}
                      onChange={(e) => {
                        const next = [...blocks];
                        next[index] = { ...block, enabled: e.target.checked };
                        setPage({ ...page, homeBlocks: next });
                      }}
                    />
                  </label>
                  <label>
                    Theme
                    <select
                      value={block.theme}
                      onChange={(e) => {
                        const next = [...blocks];
                        next[index] = { ...block, theme: e.target.value as HomeBlock['theme'] };
                        setPage({ ...page, homeBlocks: next });
                      }}
                    >
                      <option value="light">light</option>
                      <option value="blue-soft">blue-soft</option>
                      <option value="mist">mist</option>
                    </select>
                  </label>
                </div>
                <label>
                  Block payload (JSON)
                  <textarea
                    rows={10}
                    value={payload}
                    onChange={(e) => {
                      try {
                        const parsed = JSON.parse(e.target.value) as Record<string, unknown>;
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
              </div>
            );
          })}
        </section>
      ) : (
        <section className="admin-card">
          <div className="admin-inline-header">
            <h2>Page sections</h2>
            <button
              type="button"
              onClick={() =>
                setPage({ ...page, sections: [...page.sections, createSection(page.sections.length)] })
              }
            >
              Add section
            </button>
          </div>
          {page.sections.map((section, index) => (
            <div className="section-editor" key={section.id}>
              <div className="admin-inline-header">
                <h3>
                  {index + 1}. {section.id}
                </h3>
                <div className="admin-actions">
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => {
                      const next = [...page.sections];
                      [next[index - 1], next[index]] = [next[index], next[index - 1]];
                      setPage({ ...page, sections: next });
                    }}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={index === page.sections.length - 1}
                    onClick={() => {
                      const next = [...page.sections];
                      [next[index + 1], next[index]] = [next[index], next[index + 1]];
                      setPage({ ...page, sections: next });
                    }}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setPage({
                        ...page,
                        sections: page.sections.filter((row) => row.id !== section.id)
                      })
                    }
                  >
                    Remove
                  </button>
                </div>
              </div>

              <div className="admin-grid-3">
                <label>
                  ID
                  <input
                    value={section.id}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], id: e.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
                <label>
                  Layout
                  <select
                    value={section.layout}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = {
                        ...next[index],
                        layout: e.target.value as PageSection['layout']
                      };
                      setPage({ ...page, sections: next });
                    }}
                  >
                    <option value="stacked">stacked</option>
                    <option value="split">split</option>
                  </select>
                </label>
                <label>
                  CTA URL
                  <input
                    value={section.ctaHref}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], ctaHref: e.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
              </div>

              <label>
                Heading
                <input
                  value={section.heading}
                  onChange={(e) => {
                    const next = [...page.sections];
                    next[index] = { ...next[index], heading: e.target.value };
                    setPage({ ...page, sections: next });
                  }}
                />
              </label>

              <label>
                Body
                <textarea
                  value={section.body}
                  rows={5}
                  onChange={(e) => {
                    const next = [...page.sections];
                    next[index] = { ...next[index], body: e.target.value };
                    setPage({ ...page, sections: next });
                  }}
                />
              </label>

              <div className="admin-grid-2">
                <label>
                  CTA Label / Meta Text
                  <input
                    value={section.ctaLabel}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], ctaLabel: e.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
                <label>
                  Media Alt / Secondary Text
                  <input
                    value={section.mediaAlt}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], mediaAlt: e.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
                <label>
                  Media Image
                  <input
                    value={section.mediaImage}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = { ...next[index], mediaImage: e.target.value };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
                <label>
                  Theme Accent
                  <input
                    value={section.theme.accent}
                    onChange={(e) => {
                      const next = [...page.sections];
                      next[index] = {
                        ...next[index],
                        theme: { ...next[index].theme, accent: e.target.value }
                      };
                      setPage({ ...page, sections: next });
                    }}
                  />
                </label>
              </div>
            </div>
          ))}
        </section>
      )}

      <div className="admin-actions">
        <button type="button" disabled={saving} onClick={savePage}>
          {saving ? 'Saving...' : 'Save page'}
        </button>
        {notice ? <p>{notice}</p> : null}
      </div>
    </div>
  );
}

