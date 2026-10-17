'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CtaStyleToken, HomeBlock, HomeBlockType, LandingPage, PageSection } from '@/features/cms/types';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { formatSavedAtLabel, toFieldErrorMap, validatePageEditor } from '@/features/cms/editorValidation';
import { getLandingPagePublicationLabel } from '@/features/cms/publicationState';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { ContentRevisionPanel } from '@/components/admin/ContentRevisionPanel';
import { MediaPickerField } from '@/components/admin/MediaPickerField';

type PageEditorFormProps = {
  initialPage: LandingPage;
  canPublish?: boolean;
};

type SaveMode = 'manual' | 'autosave';

type AutoSaveState = 'idle' | 'scheduled' | 'saving' | 'blocked';

const AUTO_SAVE_DELAY_MS = 30_000;

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

function previewModeHref(path: string) {
  return `/api/admin/preview?action=enable&path=${encodeURIComponent(path)}`;
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


export function PageEditorForm({ initialPage, canPublish = true }: PageEditorFormProps) {
  const [page, setPage] = useState(initialPage);
  const [baseline, setBaseline] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [nextType, setNextType] = useState<HomeBlockType>('hero');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialPage.updatedAt ?? null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle');
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);

  useEffect(() => {
    setPage(initialPage);
    setBaseline(initialPage);
    setLastSavedAt(initialPage.updatedAt ?? null);
    setAutoSaveState('idle');
  }, [initialPage]);

  const isHome = page.id === 'home';
  const blocks = useMemo(() => page.homeBlocks ?? [], [page.homeBlocks]);
  const isDirty = useMemo(() => JSON.stringify(page) !== JSON.stringify(baseline), [page, baseline]);
  const previewHref = normalizePreviewHref(page);
  const previewModePath = previewModeHref(previewHref);
  const publicationLabel = getLandingPagePublicationLabel(page);
  const validationIssues = useMemo(() => validatePageEditor(page), [page]);
  const fieldErrors = useMemo(() => toFieldErrorMap(validationIssues), [validationIssues]);
  const canSave = validationIssues.length === 0;

  const savePage = useCallback(
    async (mode: SaveMode = 'manual') => {
      if (!canSave) {
        if (mode === 'manual') {
          setNotice(`Fix ${validationIssues.length} validation issue(s) before saving.`);
        }
        setAutoSaveState('blocked');
        return false;
      }

      if (!isDirty && mode === 'autosave') {
        setAutoSaveState('idle');
        return true;
      }

      setSaving(true);
      if (mode === 'autosave') {
        setAutoSaveState('saving');
      }
      setNotice('');

      const response = await csrfFetch(`/api/admin/pages/${page.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-cms-save-mode': mode
        },
        body: JSON.stringify(page)
      });
      setSaving(false);

      if (!response.ok) {
        setNotice('Failed to save page');
        if (mode === 'autosave') {
          setAutoSaveState('blocked');
        }
        return false;
      }

      const payload = (await response.json()) as { page: LandingPage };
      setPage(payload.page);
      setBaseline(payload.page);
      setLastSavedAt(payload.page.updatedAt);
      setAutoSaveState('idle');

      if (mode === 'manual') {
        setNotice('Page saved');
        setRevisionReloadKey((current) => current + 1);
      }

      return true;
    },
    [canSave, isDirty, page, validationIssues.length]
  );

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
        void savePage('manual');
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [savePage, saving]);

  useEffect(() => {
    if (!isDirty) {
      setAutoSaveState('idle');
      return;
    }

    if (!canSave) {
      setAutoSaveState('blocked');
      return;
    }

    setAutoSaveState('scheduled');
    const timer = window.setTimeout(() => {
      if (!saving) {
        void savePage('autosave');
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canSave, isDirty, savePage, saving]);

  const updateBlock = (index: number, patch: Partial<HomeBlock>) => {
    const next = [...blocks];
    next[index] = { ...next[index], ...(patch as object) } as HomeBlock;
    setPage({ ...page, homeBlocks: next });
  };

  const updateSection = (index: number, patch: Partial<PageSection>) => {
    const next = [...page.sections];
    next[index] = { ...next[index], ...patch };
    setPage({ ...page, sections: next });
  };

  const renderHomeQuickFields = (block: HomeBlock, index: number) => {
    if (block.type === 'hero') {
      return (
        <div className="admin-grid-2">
          <label>
            Title primary
            <input
              className={fieldErrors[`homeBlocks.${index}.titlePrimary`] ? 'admin-input-error' : ''}
              value={String((block as Record<string, unknown>).titlePrimary ?? '')}
              onChange={(event) => updateBlock(index, { titlePrimary: event.target.value } as Partial<HomeBlock>)}
            />
            {fieldErrors[`homeBlocks.${index}.titlePrimary`] ? (
              <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.titlePrimary`]}</span>
            ) : null}
          </label>
          <label>
            Title accent
            <input
              className={fieldErrors[`homeBlocks.${index}.titleAccent`] ? 'admin-input-error' : ''}
              value={String((block as Record<string, unknown>).titleAccent ?? '')}
              onChange={(event) => updateBlock(index, { titleAccent: event.target.value } as Partial<HomeBlock>)}
            />
            {fieldErrors[`homeBlocks.${index}.titleAccent`] ? (
              <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.titleAccent`]}</span>
            ) : null}
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
              className={fieldErrors[`homeBlocks.${index}.heading`] ? 'admin-input-error' : ''}
              value={String((block as Record<string, unknown>).heading ?? '')}
              onChange={(event) => updateBlock(index, { heading: event.target.value } as Partial<HomeBlock>)}
            />
            {fieldErrors[`homeBlocks.${index}.heading`] ? (
              <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.heading`]}</span>
            ) : null}
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

    if (block.type === 'why_split') {
      return (
        <div className="admin-grid-2">
          <label>
            Heading
            <input
              className={fieldErrors[`homeBlocks.${index}.heading`] ? 'admin-input-error' : ''}
              value={String((block as Record<string, unknown>).heading ?? '')}
              onChange={(event) => updateBlock(index, { heading: event.target.value } as Partial<HomeBlock>)}
            />
            {fieldErrors[`homeBlocks.${index}.heading`] ? (
              <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.heading`]}</span>
            ) : null}
          </label>
          <label>
            Description
            <textarea
              value={String((block as Record<string, unknown>).description ?? '')}
              onChange={(event) => updateBlock(index, { description: event.target.value } as Partial<HomeBlock>)}
            />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <MediaPickerField
              label="Split media image"
              value={String((block as Record<string, unknown>).mediaImage ?? '')}
              onChange={(value) => updateBlock(index, { mediaImage: value } as Partial<HomeBlock>)}
              altLabel="Split media alt text"
              altValue={String((block as Record<string, unknown>).mediaAlt ?? '')}
              onAltChange={(value) => updateBlock(index, { mediaAlt: value } as Partial<HomeBlock>)}
              helperText="Used by the homepage why-split block."
              aspectRatioHint="4:3 or square crops work best in the homepage split layout."
            />
          </div>
        </div>
      );
    }

    if (block.type === 'logo_cloud' || block.type === 'primary_cta') {
      return (
        <div className="admin-grid-2">
          <label>
            Heading
            <input
              className={fieldErrors[`homeBlocks.${index}.heading`] ? 'admin-input-error' : ''}
              value={String((block as Record<string, unknown>).heading ?? '')}
              onChange={(event) => updateBlock(index, { heading: event.target.value } as Partial<HomeBlock>)}
            />
            {fieldErrors[`homeBlocks.${index}.heading`] ? (
              <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.heading`]}</span>
            ) : null}
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

    return null;
  };

  return (
    <div className="admin-form-wrap">
      {/* Sticky Editor Toolbar */}
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{page.title}</h2>
              <span className={`admin-chip ${page.published ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                {publicationLabel}
              </span>
            </div>
            <p className="admin-subtle">
              Ctrl/Cmd + S to save. Status: {publicationLabel}. {formatSavedAtLabel(lastSavedAt)}.
            </p>
            <p className="admin-subtle">
              Autosave: {autoSaveState === 'blocked' ? 'blocked by validation' : autoSaveState}
            </p>
          </div>
          <div className="admin-actions">
            <span className={`admin-chip ${isDirty ? 'admin-chip-warning' : 'admin-chip-success'}`}>
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
            {!canSave ? <span className="admin-chip admin-chip-warning">Validation required</span> : null}
            <AdminActionButton href={previewModePath} icon="visibility" rel="noreferrer" target="_blank" variant="secondary">
              Open preview
            </AdminActionButton>
            <AdminActionButton icon="sync_alt" variant="ghost" disabled={!isDirty || saving} onClick={() => setPage(baseline)}>
              Reset edits
            </AdminActionButton>
            <AdminActionButton icon="save" variant="primary" disabled={saving || !canSave} onClick={() => void savePage('manual')}>
              {saving ? 'Saving...' : 'Save page'}
            </AdminActionButton>
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
        {validationIssues.length > 0 ? (
          <p className="admin-error-text">{validationIssues[0].message}</p>
        ) : null}
        <p className="admin-subtle">Draft preview opens the current saved version in preview mode. Save first if you changed the slug or sections.</p>
      </section>

      {/* Modern 2-Column Page Builder Workspace */}
      <style>{`
        .admin-workspace-grid {
          display: grid;
          grid-template-columns: minmax(0, 1fr) 340px;
          gap: 24px;
          align-items: start;
        }
        .admin-inspector {
          position: sticky;
          top: 84px;
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 1024px) {
          .admin-workspace-grid {
            grid-template-columns: minmax(0, 1fr) !important;
          }
          .admin-inspector {
            position: static !important;
          }
        }
        .serp-card-preview {
          background: #ffffff;
          border: 1px solid #e2e8f0;
          border-radius: 10px;
          padding: 16px;
          margin-bottom: 20px;
          font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Arial, sans-serif;
        }
        .serp-card-preview .serp-url-row {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 12px;
          color: #475569;
          margin-bottom: 4px;
        }
        .serp-card-preview .serp-favicon {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          background: #e2e8f0;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 10px;
          font-weight: 700;
          color: #0f172a;
        }
        .serp-card-preview .serp-title {
          font-size: 18px;
          color: #1a0dab;
          font-weight: 500;
          line-height: 1.3;
          margin: 0 0 4px;
          text-decoration: none;
          cursor: pointer;
        }
        .serp-card-preview .serp-title:hover {
          text-decoration: underline;
        }
        .serp-card-preview .serp-snippet {
          font-size: 13px;
          line-height: 1.5;
          color: #4d5156;
          margin: 0;
        }
      `}</style>

      <div className="admin-workspace-grid">
        {/* Left Main Column: Page Title & Nav Label, Sections/Blocks Editor, and SEO with live SERP preview */}
        <div className="admin-main-column" style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          {/* Page Details Card */}
          <section className="admin-card">
            <h2>Page Details</h2>
            <div className="admin-grid-2">
              <label>
                Title
                <input
                  className={fieldErrors.title ? 'admin-input-error' : ''}
                  value={page.title}
                  onChange={(event) => setPage({ ...page, title: event.target.value })}
                  placeholder="Page title..."
                />
                {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
              </label>
              <label>
                Navigation label
                <input
                  className={fieldErrors.navLabel ? 'admin-input-error' : ''}
                  value={page.navLabel}
                  onChange={(event) => setPage({ ...page, navLabel: event.target.value })}
                  placeholder="Label in menus and breadcrumbs..."
                />
                {fieldErrors.navLabel ? <span className="admin-error-text">{fieldErrors.navLabel}</span> : null}
              </label>
            </div>
          </section>

          {/* Homepage Blocks Editor (when page.id === 'home') */}
          {isHome ? (
            <section className="admin-card">
              <div className="admin-inline-header">
                <h2>Homepage Blocks</h2>
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
                    className="v2-btn v2-btn-secondary"
                    onClick={() => setPage({ ...page, homeBlocks: [...blocks, createHomeBlock(nextType, blocks.length)] })}
                  >
                    Add block
                  </button>
                </div>
              </div>
              {fieldErrors.homeBlocks ? <p className="admin-error-text">{fieldErrors.homeBlocks}</p> : null}

              {blocks.map((block, index) => {
                const blockIssues = validationIssues.filter((issue) => issue.path.startsWith(`homeBlocks.${index}.`));

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

                    <div className="admin-grid-2">
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
                    {blockIssues.length > 0 ? <p className="admin-error-text">{blockIssues[0].message}</p> : null}
                  </article>
                );
              })}
            </section>
          ) : (
            /* Page Sections Editor (for standard pages) */
            <section className="admin-card">
              <div className="admin-inline-header">
                <h2>Page Sections</h2>
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  onClick={() => setPage({ ...page, sections: [...page.sections, createSection(page.sections.length)] })}
                >
                  Add section
                </button>
              </div>
              {fieldErrors.sections ? <p className="admin-error-text">{fieldErrors.sections}</p> : null}

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
                      Layout
                      <select value={section.layout} onChange={(event) => updateSection(index, { layout: event.target.value as PageSection['layout'] })}>
                        <option value="stacked">stacked</option>
                        <option value="split">split</option>
                      </select>
                    </label>
                    <label>
                      Heading
                      <input
                        className={fieldErrors[`sections.${index}.heading`] ? 'admin-input-error' : ''}
                        value={section.heading}
                        onChange={(event) => updateSection(index, { heading: event.target.value })}
                      />
                      {fieldErrors[`sections.${index}.heading`] ? (
                        <span className="admin-error-text">{fieldErrors[`sections.${index}.heading`]}</span>
                      ) : null}
                    </label>
                    <label>
                      CTA label
                      <input value={section.ctaLabel} onChange={(event) => updateSection(index, { ctaLabel: event.target.value })} />
                    </label>
                    <label>
                      CTA URL
                      <input
                        className={fieldErrors[`sections.${index}.ctaHref`] ? 'admin-input-error' : ''}
                        value={section.ctaHref}
                        onChange={(event) => updateSection(index, { ctaHref: event.target.value })}
                      />
                      {fieldErrors[`sections.${index}.ctaHref`] ? (
                        <span className="admin-error-text">{fieldErrors[`sections.${index}.ctaHref`]}</span>
                      ) : null}
                    </label>
                    <label>
                      Theme background
                      <input value={section.theme.background} onChange={(event) => updateSection(index, { theme: { ...section.theme, background: event.target.value } })} />
                    </label>
                    <label>
                      Theme text
                      <input value={section.theme.text} onChange={(event) => updateSection(index, { theme: { ...section.theme, text: event.target.value } })} />
                    </label>
                    <label>
                      Theme accent
                      <input value={section.theme.accent} onChange={(event) => updateSection(index, { theme: { ...section.theme, accent: event.target.value } })} />
                    </label>
                  </div>

                  <label>
                    Body
                    <textarea
                      className={fieldErrors[`sections.${index}.body`] ? 'admin-input-error' : ''}
                      rows={5}
                      value={section.body}
                      onChange={(event) => updateSection(index, { body: event.target.value })}
                    />
                    {fieldErrors[`sections.${index}.body`] ? (
                      <span className="admin-error-text">{fieldErrors[`sections.${index}.body`]}</span>
                    ) : null}
                  </label>

                  <MediaPickerField
                    label="Section image"
                    value={section.mediaImage}
                    onChange={(value) => updateSection(index, { mediaImage: value })}
                    altLabel="Section image alt text"
                    altValue={section.mediaAlt}
                    onAltChange={(value) => updateSection(index, { mediaAlt: value })}
                    helperText="Optional media shown in split or stacked page sections."
                    aspectRatioHint="16:9 for wide sections or 4:3 for editorial layouts."
                  />
                </article>
              ))}
            </section>
          )}

          {/* SEO & Social Card */}
          <section className="admin-card">
            <div className="admin-inline-header">
              <h2>SEO & Social Preview</h2>
              <span className="admin-chip admin-chip-muted">Google SERP</span>
            </div>

            {/* Live Google SERP snippet preview */}
            <div className="serp-card-preview">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, paddingBottom: 6, borderBottom: '1px solid #f1f5f9' }}>
                <span style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: '#64748b' }}>
                  Live Google SERP Snippet Preview
                </span>
                <span style={{ fontSize: 11, color: '#94a3b8' }}>Desktop View</span>
              </div>
              <div className="serp-url-row">
                <span className="serp-favicon">V</span>
                <span>
                  <strong>Vanaila</strong> <span style={{ color: '#94a3b8' }}>›</span> {page.seo.slug || (page.id === 'home' ? '' : page.id)}
                </span>
              </div>
              <div className="serp-title">
                {page.seo.metaTitle || page.title || 'Untitled page'}
              </div>
              <p className="serp-snippet">
                {page.seo.metaDescription || (page.sections[0]?.body ? page.sections[0].body.slice(0, 150) + '...' : 'Add a meta description to see how this page appears in search results.')}
              </p>
            </div>

            <label>
              Meta title
              <input
                className={fieldErrors['seo.metaTitle'] ? 'admin-input-error' : ''}
                value={page.seo.metaTitle}
                onChange={(event) => setPage({ ...page, seo: { ...page.seo, metaTitle: event.target.value } })}
              />
              <span className="admin-subtle">{page.seo.metaTitle.length}/60 recommended</span>
              {fieldErrors['seo.metaTitle'] ? <span className="admin-error-text">{fieldErrors['seo.metaTitle']}</span> : null}
            </label>
            <label>
              Meta description
              <textarea
                className={fieldErrors['seo.metaDescription'] ? 'admin-input-error' : ''}
                rows={3}
                value={page.seo.metaDescription}
                onChange={(event) => setPage({ ...page, seo: { ...page.seo, metaDescription: event.target.value } })}
              />
              <span className="admin-subtle">{page.seo.metaDescription.length}/160 recommended</span>
              {fieldErrors['seo.metaDescription'] ? (
                <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span>
              ) : null}
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
                placeholder="vanaila, digital agency, business software"
              />
            </label>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={page.seo.noIndex}
                onChange={(event) => setPage({ ...page, seo: { ...page.seo, noIndex: event.target.checked } })}
              />
              <span>Disallow search engines from indexing this page (noindex)</span>
            </label>
          </section>
        </div>

        {/* Right Sticky Inspector: Publication & Schedule, Slug & Canonical, Social Image, Revision History */}
        <aside className="admin-inspector">
          {/* Publication & Scheduling Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Publication & Schedule</h3>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="admin-subtle">Publication state</span>
                <span className={`admin-chip ${page.published ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                  {publicationLabel}
                </span>
              </div>
              <label className="admin-checkbox-row" style={{ marginBottom: 12 }}>
                <input
                  type="checkbox"
                  checked={page.published}
                  disabled={!canPublish}
                  onChange={(event) => setPage({ ...page, published: event.target.checked })}
                />
                <span>Published and live on website</span>
              </label>
              <label>
                Scheduled publish time
                <input
                  className={fieldErrors.scheduledPublishAt ? 'admin-input-error' : ''}
                  type="datetime-local"
                  value={toDatetimeLocalValue(page.scheduledPublishAt)}
                  disabled={!canPublish}
                  onChange={(event) =>
                    setPage({
                      ...page,
                      scheduledPublishAt: fromDatetimeLocalValue(event.target.value)
                    })
                  }
                />
                {fieldErrors.scheduledPublishAt ? (
                  <span className="admin-error-text">{fieldErrors.scheduledPublishAt}</span>
                ) : (
                  <span className="admin-subtle">Go live automatically at date/time.</span>
                )}
              </label>
              <label style={{ marginTop: 12 }}>
                Scheduled unpublish time
                <input
                  className={fieldErrors.scheduledUnpublishAt ? 'admin-input-error' : ''}
                  type="datetime-local"
                  value={toDatetimeLocalValue(page.scheduledUnpublishAt)}
                  disabled={!canPublish}
                  onChange={(event) =>
                    setPage({
                      ...page,
                      scheduledUnpublishAt: fromDatetimeLocalValue(event.target.value)
                    })
                  }
                />
                {fieldErrors.scheduledUnpublishAt ? (
                  <span className="admin-error-text">{fieldErrors.scheduledUnpublishAt}</span>
                ) : (
                  <span className="admin-subtle">Unpublish automatically when campaign ends.</span>
                )}
              </label>
              {!canPublish ? <p className="admin-subtle" style={{ marginTop: 8 }}>Your role can edit content but cannot change page publication timing.</p> : null}
            </div>
          </section>

          {/* Slug & Canonical Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">URL & Canonical</h3>
            <div style={{ marginTop: 12 }}>
              <label>
                Page URL slug
                <input
                  className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
                  value={page.seo.slug}
                  onChange={(event) => setPage({ ...page, seo: { ...page.seo, slug: event.target.value } })}
                  placeholder="e.g. services"
                />
                {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
                <span className="admin-subtle">URL path: /{page.seo.slug || page.id}</span>
              </label>
              <label style={{ marginTop: 12 }}>
                Canonical URL
                <input
                  value={page.seo.canonical}
                  onChange={(event) => setPage({ ...page, seo: { ...page.seo, canonical: event.target.value } })}
                  placeholder="https://vanaila.com/..."
                />
              </label>
            </div>
          </section>

          {/* Social Image Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Social Share Image</h3>
            <div style={{ marginTop: 12 }}>
              <MediaPickerField
                label="Social image"
                value={page.seo.socialImage}
                onChange={(value) => setPage({ ...page, seo: { ...page.seo, socialImage: value } })}
                helperText="Optional Open Graph image for social platforms."
                aspectRatioHint="1200x630 (1.91:1) for Open Graph cards."
              />
            </div>
          </section>

          {/* Revision History Card */}
          <ContentRevisionPanel<LandingPage>
            entityType="page"
            entityId={page.id}
            reloadKey={revisionReloadKey}
            emptyMessage="Manual saves and restore points for this page will appear here."
            onRestore={(restoredPage) => {
              setPage(restoredPage);
              setBaseline(restoredPage);
              setLastSavedAt(restoredPage.updatedAt ?? null);
              setNotice('Page restored from revision history.');
              setAutoSaveState('idle');
            }}
          />
        </aside>
      </div>
    </div>
  );
}
