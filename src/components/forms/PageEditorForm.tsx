'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { CtaStyleToken, HomeBlock, HomeBlockType, LandingPage, PageSection } from '@/features/cms/types';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { formatSavedAtLabel, toFieldErrorMap, validatePageEditor } from '@/features/cms/editorValidation';
import { getLandingPagePublicationLabel } from '@/features/cms/publicationState';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
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

function extractBlockPayload(block: HomeBlock) {
  return Object.fromEntries(
    Object.entries(block).filter(([key]) => !['id', 'type', 'enabled', 'theme'].includes(key))
  );
}

export function PageEditorForm({ initialPage, canPublish = true }: PageEditorFormProps) {
  const [page, setPage] = useState(initialPage);
  const [baseline, setBaseline] = useState(initialPage);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [nextType, setNextType] = useState<HomeBlockType>('hero');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialPage.updatedAt ?? null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle');

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
        headers: { 'Content-Type': 'application/json' },
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

    return <p className="admin-subtle">Tip: use JSON payload below to edit list items and advanced fields.</p>;
  };

  return (
    <div className="admin-form-wrap">
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <h2>{page.title}</h2>
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

      <section className="admin-card">
        <h2>Page settings</h2>
        <div className="admin-grid-2">
          <label>
            Title
            <input
              className={fieldErrors.title ? 'admin-input-error' : ''}
              value={page.title}
              onChange={(event) => setPage({ ...page, title: event.target.value })}
            />
            {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
          </label>
          <label>
            Nav label
            <input
              className={fieldErrors.navLabel ? 'admin-input-error' : ''}
              value={page.navLabel}
              onChange={(event) => setPage({ ...page, navLabel: event.target.value })}
            />
            {fieldErrors.navLabel ? <span className="admin-error-text">{fieldErrors.navLabel}</span> : null}
          </label>
        </div>
        <label>
          Published
          <input
            type="checkbox"
            checked={page.published}
            disabled={!canPublish}
            onChange={(event) => setPage({ ...page, published: event.target.checked })}
          />
        </label>
        <div className="admin-grid-2">
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
              <span className="admin-subtle">Set this when a page should go live automatically.</span>
            )}
          </label>
          <label>
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
              <span className="admin-subtle">Useful for temporary campaign pages or limited-time offers.</span>
            )}
          </label>
        </div>
        {!canPublish ? <p className="admin-subtle">Your role can edit content but cannot change page publication timing.</p> : null}
      </section>

      <section className="admin-card">
        <h2>SEO</h2>
        <div className="admin-grid-2">
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
            Slug
            <input
              className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
              value={page.seo.slug}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, slug: event.target.value } })}
            />
            {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
          </label>
          <label>
            Canonical
            <input
              value={page.seo.canonical}
              onChange={(event) => setPage({ ...page, seo: { ...page.seo, canonical: event.target.value } })}
            />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <MediaPickerField
              label="Social image"
              value={page.seo.socialImage}
              onChange={(value) => setPage({ ...page, seo: { ...page.seo, socialImage: value } })}
              helperText="Optional Open Graph/Twitter image used when this page is shared."
              aspectRatioHint="1200x630 (1.91:1) for Open Graph and X cards."
            />
          </div>
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
            className={fieldErrors['seo.metaDescription'] ? 'admin-input-error' : ''}
            value={page.seo.metaDescription}
            onChange={(event) => setPage({ ...page, seo: { ...page.seo, metaDescription: event.target.value } })}
          />
          <span className="admin-subtle">{page.seo.metaDescription.length}/160 recommended</span>
          {fieldErrors['seo.metaDescription'] ? (
            <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span>
          ) : null}
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
          {fieldErrors.homeBlocks ? <p className="admin-error-text">{fieldErrors.homeBlocks}</p> : null}

          {blocks.map((block, index) => {
            const payload = JSON.stringify(extractBlockPayload(block), null, 2);
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

                <div className="admin-grid-3">
                  <label>
                    ID
                    <input
                      className={fieldErrors[`homeBlocks.${index}.id`] ? 'admin-input-error' : ''}
                      value={block.id}
                      onChange={(event) => updateBlock(index, { id: event.target.value })}
                    />
                    {fieldErrors[`homeBlocks.${index}.id`] ? (
                      <span className="admin-error-text">{fieldErrors[`homeBlocks.${index}.id`]}</span>
                    ) : null}
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
                {blockIssues.length > 0 ? <p className="admin-error-text">{blockIssues[0].message}</p> : null}
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
                  Section ID
                  <input value={section.id} onChange={(event) => updateSection(index, { id: event.target.value })} />
                </label>
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
    </div>
  );
}
