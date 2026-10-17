'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

function normalizeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}
import { useRouter } from 'next/navigation';

import type { LandingPage, PortfolioProject, ServiceDetailPageId } from '@/features/cms/types';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { toFieldErrorMap, validatePortfolioEditor } from '@/features/cms/editorValidation';
import { getPortfolioProjectPublicationLabel } from '@/features/cms/publicationState';
import { getFallbackServiceHref, getServiceLabel, isServiceDetailPageId, serviceDetailPageIds } from '@/features/cms/servicePages';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { ContentRevisionPanel } from '@/components/admin/ContentRevisionPanel';
import { MediaGalleryField, MediaPickerField } from '@/components/admin/MediaPickerField';

type PortfolioEditorFormProps = {
  initialProject: PortfolioProject;
  isNew?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
};

type ServiceOption = {
  id: ServiceDetailPageId;
  label: string;
  href: string;
};

const fallbackServiceOptions: ServiceOption[] = serviceDetailPageIds.map((id) => ({
  id,
  label: getServiceLabel(id),
  href: getFallbackServiceHref(id)
}));

function normalizePreviewHref(project: PortfolioProject) {
  const slug = project.seo.slug.trim();
  if (!slug) return '/portfolio';
  return `/portfolio/${slug.replace(/^\/+/, '')}`;
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

function normalizeProjectShape(project: PortfolioProject): PortfolioProject {
  return {
    ...project,
    relatedServicePageIds: Array.isArray(project.relatedServicePageIds) ? project.relatedServicePageIds : []
  };
}

export function PortfolioEditorForm({
  initialProject,
  isNew = false,
  canPublish = true,
  canDelete = true
}: PortfolioEditorFormProps) {
  const [project, setProject] = useState(normalizeProjectShape(initialProject));
  const [baseline, setBaseline] = useState(normalizeProjectShape(initialProject));
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialProject.updatedAt ?? null);
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);
  const [serviceOptions, setServiceOptions] = useState<ServiceOption[]>(fallbackServiceOptions);
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const router = useRouter();

  useEffect(() => {
    const normalized = normalizeProjectShape(initialProject);
    setProject(normalized);
    setBaseline(normalized);
    setLastSavedAt(initialProject.updatedAt ?? null);
    setSlugTouched(!isNew);
  }, [initialProject, isNew]);

  useEffect(() => {
    let cancelled = false;

    async function loadServiceOptions() {
      const response = await csrfFetch('/api/admin/pages');
      if (!response.ok) return;
      const payload = (await response.json()) as { pages: LandingPage[] };
      const servicePages = payload.pages.filter(
        (page): page is LandingPage & { id: ServiceDetailPageId } => isServiceDetailPageId(page.id)
      );
      const nextOptions = servicePages.map((page) => ({
        id: page.id,
        label: page.title || page.navLabel || getServiceLabel(page.id),
        href: page.seo.slug ? `/${page.seo.slug}` : getFallbackServiceHref(page.id)
      }));

      if (!cancelled && nextOptions.length > 0) {
        setServiceOptions(nextOptions);
      }
    }

    void loadServiceOptions();
    return () => {
      cancelled = true;
    };
  }, []);

  const isDirty = useMemo(() => JSON.stringify(project) !== JSON.stringify(baseline), [project, baseline]);
  const previewHref = normalizePreviewHref(project);
  const previewModePath = previewModeHref(previewHref);
  const publicationLabel = getPortfolioProjectPublicationLabel(project);
  const validationIssues = useMemo(() => validatePortfolioEditor(project), [project]);
  const fieldErrors = useMemo(() => toFieldErrorMap(validationIssues), [validationIssues]);
  const canSave = validationIssues.length === 0;

  const handleTitleChange = (title: string) => {
    const next: PortfolioProject = { ...project, title };
    if (!slugTouched) next.seo = { ...project.seo, slug: normalizeSlug(title) };
    setProject(next);
  };

  const handleSlugChange = (slug: string) => {
    setSlugTouched(true);
    setProject({ ...project, seo: { ...project.seo, slug } });
  };

  const saveProject = useCallback(async () => {
    if (!canSave) {
      setNotice(`Fix ${validationIssues.length} validation issue(s) before saving.`);
      return;
    }

    setSaving(true);
    setNotice('');

    const response = await csrfFetch(`/api/admin/portfolio/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'x-cms-save-mode': 'manual'
      },
      body: JSON.stringify(project)
    });

    setSaving(false);

    if (!response.ok) {
      setNotice('Failed to save project');
      return;
    }

    const payload = (await response.json()) as { project: PortfolioProject };
    const normalized = normalizeProjectShape(payload.project);
    setProject(normalized);
    setBaseline(normalized);
    setLastSavedAt(payload.project.updatedAt ?? null);
    setNotice('Project saved');
    setRevisionReloadKey((current) => current + 1);

    if (isNew) {
      router.replace(`/admin/portfolio/${normalized.id}`);
    }
  }, [canSave, isNew, project, router, validationIssues.length]);

  const publish = async () => {
    if (!canSave) {
      setNotice('Resolve validation issues before publishing.');
      return;
    }

    const response = await csrfFetch(`/api/admin/portfolio/${project.id}/publish`, {
      method: 'POST'
    });

    if (!response.ok) {
      setNotice('Failed to publish project');
      return;
    }

    const payload = (await response.json()) as { project: PortfolioProject };
    const normalized = normalizeProjectShape(payload.project);
    setProject(normalized);
    setBaseline(normalized);
    setLastSavedAt(payload.project.updatedAt ?? null);
    setNotice('Project published');
    setRevisionReloadKey((current) => current + 1);
  };

  const unpublish = async () => {
    const response = await csrfFetch(`/api/admin/portfolio/${project.id}/unpublish`, {
      method: 'POST'
    });

    if (!response.ok) {
      setNotice('Failed to move project to draft');
      return;
    }

    const payload = (await response.json()) as { project: PortfolioProject };
    const normalized = normalizeProjectShape(payload.project);
    setProject(normalized);
    setBaseline(normalized);
    setLastSavedAt(payload.project.updatedAt ?? null);
    setNotice('Project moved to draft');
    setRevisionReloadKey((current) => current + 1);
  };

  const deleteProject = async () => {
    if (!confirm('Delete this portfolio project?')) return;

    const response = await csrfFetch(`/api/admin/portfolio/${project.id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      setNotice('Failed to delete project');
      return;
    }

    router.replace('/admin/portfolio');
    router.refresh();
  };

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
        void saveProject();
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [saveProject, saving]);

  return (
    <div className="admin-form-wrap">
      {/* Sticky Editor Toolbar */}
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <h2 style={{ margin: 0 }}>{project.title || 'Untitled project'}</h2>
              <span className={`admin-chip ${project.status === 'published' ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                {publicationLabel}
              </span>
            </div>
            <p className="admin-subtle">
              Ctrl/Cmd + S to save. Status: {publicationLabel}. Last saved{' '}
              {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : 'not yet'}.
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
            <AdminActionButton icon="sync_alt" variant="ghost" disabled={!isDirty || saving} onClick={() => setProject(baseline)}>
              Reset edits
            </AdminActionButton>
            <AdminActionButton icon="save" variant="primary" onClick={saveProject} disabled={saving || !canSave}>
              {saving ? 'Saving...' : 'Save project'}
            </AdminActionButton>
            {canPublish ? (
              project.status === 'draft' ? (
                <AdminActionButton icon="publish" variant="primary" onClick={publish} disabled={!canSave}>
                  Publish now
                </AdminActionButton>
              ) : (
                <AdminActionButton icon="schedule" variant="secondary" onClick={unpublish}>
                  Move to draft
                </AdminActionButton>
              )
            ) : (
              <span className="admin-chip admin-chip-muted">No publish access</span>
            )}
            {canDelete ? (
              <AdminActionButton icon="delete" variant="danger" onClick={deleteProject}>
                Delete project
              </AdminActionButton>
            ) : null}
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
        {validationIssues.length > 0 ? <p className="admin-error-text">{validationIssues[0].message}</p> : null}
        <p className="admin-subtle">Draft preview opens the current saved version in preview mode. Save first if you changed the slug or content.</p>
      </section>

      {/* Modern 2-Column Portfolio Workspace */}
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
        {/* Left Main Column: Project Title, Summary, Narrative Fields, Gallery, SEO */}
        <div className="admin-main-column" style={{ display: 'flex', flexDirection: 'column', gap: 24, minWidth: 0 }}>
          {/* Narrative Fields Card */}
          <section className="admin-card">
            <h2>Project Overview & Narrative</h2>
            <label>
              Title
              <input
                className={fieldErrors.title ? 'admin-input-error' : ''}
                value={project.title}
                onChange={(e) => handleTitleChange(e.target.value)}
                placeholder="Project case study title..."
              />
              {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
            </label>
            <label>
              Summary
              <textarea
                className={fieldErrors.summary ? 'admin-input-error' : ''}
                rows={3}
                value={project.summary}
                onChange={(event) => setProject({ ...project, summary: event.target.value })}
                placeholder="High-level project summary..."
              />
              {fieldErrors.summary ? <span className="admin-error-text">{fieldErrors.summary}</span> : null}
            </label>
            <label>
              Challenge
              <textarea
                className={fieldErrors.challenge ? 'admin-input-error' : ''}
                rows={4}
                value={project.challenge}
                onChange={(event) => setProject({ ...project, challenge: event.target.value })}
                placeholder="What challenges did the client face?"
              />
              {fieldErrors.challenge ? <span className="admin-error-text">{fieldErrors.challenge}</span> : null}
            </label>
            <label>
              Solution
              <textarea
                className={fieldErrors.solution ? 'admin-input-error' : ''}
                rows={4}
                value={project.solution}
                onChange={(event) => setProject({ ...project, solution: event.target.value })}
                placeholder="How was the problem solved?"
              />
              {fieldErrors.solution ? <span className="admin-error-text">{fieldErrors.solution}</span> : null}
            </label>
            <label>
              Outcome
              <textarea
                className={fieldErrors.outcome ? 'admin-input-error' : ''}
                rows={4}
                value={project.outcome}
                onChange={(event) => setProject({ ...project, outcome: event.target.value })}
                placeholder="Measurable results, KPIs, and deliverables..."
              />
              {fieldErrors.outcome ? <span className="admin-error-text">{fieldErrors.outcome}</span> : null}
            </label>
          </section>

          {/* Project Gallery Card */}
          <section className="admin-card">
            <h2 className="admin-section-heading">Project Gallery</h2>
            <p className="admin-subtle">
              Add showcase images from your media library. The first image is optional if your cover image serves as the hero.
            </p>
            <div style={{ marginTop: 12 }}>
              <MediaGalleryField
                label="Gallery images"
                values={project.gallery}
                onChange={(gallery) => setProject({ ...project, gallery })}
                helperText="Upload or select showcase screenshots, design mocks, and photos."
              />
            </div>
          </section>

          {/* SEO & Social Card */}
          <section className="admin-card">
            <div className="admin-inline-header">
              <h2>SEO & Social Preview</h2>
              <span className="admin-chip admin-chip-muted">Google SERP & OpenGraph</span>
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
                  <strong>Vanaila</strong> <span style={{ color: '#94a3b8' }}>›</span> portfolio <span style={{ color: '#94a3b8' }}>›</span> /{project.seo.slug || 'slug'}
                </span>
              </div>
              <div className="serp-title">
                {project.seo.metaTitle || project.title || 'Untitled project'}
              </div>
              <p className="serp-snippet">
                {project.seo.metaDescription || project.summary || 'Add a meta description or summary to see how this project appears in search results.'}
              </p>
            </div>

            <label>
              Meta title
              <input
                className={fieldErrors['seo.metaTitle'] ? 'admin-input-error' : ''}
                value={project.seo.metaTitle}
                onChange={(event) =>
                  setProject({
                    ...project,
                    seo: { ...project.seo, metaTitle: event.target.value }
                  })
                }
              />
              <span className="admin-subtle">{project.seo.metaTitle.length}/60 recommended</span>
              {fieldErrors['seo.metaTitle'] ? <span className="admin-error-text">{fieldErrors['seo.metaTitle']}</span> : null}
            </label>
            <label>
              Meta description
              <textarea
                className={fieldErrors['seo.metaDescription'] ? 'admin-input-error' : ''}
                rows={3}
                value={project.seo.metaDescription}
                onChange={(event) =>
                  setProject({
                    ...project,
                    seo: { ...project.seo, metaDescription: event.target.value }
                  })
                }
              />
              <span className="admin-subtle">{project.seo.metaDescription.length}/160 recommended</span>
              {fieldErrors['seo.metaDescription'] ? (
                <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span>
              ) : null}
            </label>
            <label>
              Slug
              <div className="slug-field-row">
                <input
                  className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
                  value={project.seo.slug}
                  onChange={(e) => handleSlugChange(e.target.value)}
                />
                {!slugTouched ? (
                  <span className="slug-lock-btn" style={{ cursor: 'default', background: '#eef5ff', borderColor: '#93c5fd', color: '#1d4ed8' }}>
                    Auto
                  </span>
                ) : isNew ? (
                  <button
                    type="button"
                    className="slug-lock-btn"
                    onClick={() => { setSlugTouched(false); setProject({ ...project, seo: { ...project.seo, slug: normalizeSlug(project.title) } }); }}
                    title="Re-enable auto-generation from title"
                  >
                    Reset to auto
                  </button>
                ) : null}
              </div>
              {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
              <span className="admin-subtle">URL: /portfolio/{project.seo.slug || '…'}</span>
            </label>
            <label>
              Canonical URL
              <input
                value={project.seo.canonical}
                onChange={(event) =>
                  setProject({
                    ...project,
                    seo: { ...project.seo, canonical: event.target.value }
                  })
                }
                placeholder="https://vanaila.com/portfolio/..."
              />
            </label>
            <MediaPickerField
              label="Social image"
              value={project.seo.socialImage}
              onChange={(value) =>
                setProject({
                  ...project,
                  seo: { ...project.seo, socialImage: value }
                })
              }
              helperText={
                project.seo.socialImage
                  ? 'Custom social image set.'
                  : project.coverImage
                    ? 'Not set — will use cover image for social sharing.'
                    : 'Not set — will use site default OG image.'
              }
              aspectRatioHint="1200x630 (1.91:1) for Open Graph and X cards."
            />
            <label>
              Keywords (comma separated)
              <input
                value={toKeywordInput(project.seo.keywords)}
                onChange={(event) =>
                  setProject({
                    ...project,
                    seo: {
                      ...project.seo,
                      keywords: fromKeywordInput(event.target.value)
                    }
                  })
                }
              />
            </label>
            <label className="admin-checkbox-row">
              <input
                type="checkbox"
                checked={project.seo.noIndex}
                onChange={(event) =>
                  setProject({
                    ...project,
                    seo: { ...project.seo, noIndex: event.target.checked }
                  })
                }
              />
              <span>Disallow search engines from indexing this project (noindex)</span>
            </label>
          </section>
        </div>

        {/* Right Sticky Inspector: Publication & Schedule, Client & Meta, Cover Image, Related Services, Revisions */}
        <aside className="admin-inspector">
          {/* Publication & Schedule Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Publication & Status</h3>
            <div style={{ marginTop: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                <span className="admin-subtle">Status</span>
                <span className={`admin-chip ${project.status === 'published' ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                  {publicationLabel}
                </span>
              </div>
              <label>
                Scheduled publish time
                <input
                  className={fieldErrors.scheduledPublishAt ? 'admin-input-error' : ''}
                  type="datetime-local"
                  value={toDatetimeLocalValue(project.scheduledPublishAt)}
                  disabled={!canPublish}
                  onChange={(event) =>
                    setProject({
                      ...project,
                      scheduledPublishAt: fromDatetimeLocalValue(event.target.value)
                    })
                  }
                />
                {fieldErrors.scheduledPublishAt ? (
                  <span className="admin-error-text">{fieldErrors.scheduledPublishAt}</span>
                ) : (
                  <span className="admin-subtle">Publish automatically at date/time.</span>
                )}
              </label>
              <label style={{ marginTop: 12 }}>
                Scheduled unpublish time
                <input
                  className={fieldErrors.scheduledUnpublishAt ? 'admin-input-error' : ''}
                  type="datetime-local"
                  value={toDatetimeLocalValue(project.scheduledUnpublishAt)}
                  disabled={!canPublish}
                  onChange={(event) =>
                    setProject({
                      ...project,
                      scheduledUnpublishAt: fromDatetimeLocalValue(event.target.value)
                    })
                  }
                />
                {fieldErrors.scheduledUnpublishAt ? (
                  <span className="admin-error-text">{fieldErrors.scheduledUnpublishAt}</span>
                ) : (
                  <span className="admin-subtle">Unpublish automatically when expired.</span>
                )}
              </label>
              <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
                <label style={{ flex: 1, margin: 0 }}>
                  Sort order
                  <input
                    type="number"
                    min={0}
                    value={project.sortOrder}
                    onChange={(event) => setProject({ ...project, sortOrder: Number(event.target.value) || 0 })}
                  />
                </label>
                <label className="admin-checkbox-row" style={{ marginTop: 16 }}>
                  <input
                    type="checkbox"
                    checked={project.featured}
                    onChange={(event) => setProject({ ...project, featured: event.target.checked })}
                  />
                  <span>Featured</span>
                </label>
              </div>
              {!canPublish ? <p className="admin-subtle" style={{ marginTop: 8 }}>Your role can edit case-study content but cannot change publishing timing.</p> : null}
            </div>
          </section>

          {/* Client & Metadata Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Client & Service Details</h3>
            <div style={{ marginTop: 12 }}>
              <label>
                Client name
                <input
                  className={fieldErrors.clientName ? 'admin-input-error' : ''}
                  value={project.clientName}
                  onChange={(event) => setProject({ ...project, clientName: event.target.value })}
                  placeholder="e.g. Acme Corp"
                />
                {fieldErrors.clientName ? <span className="admin-error-text">{fieldErrors.clientName}</span> : null}
              </label>
              <label style={{ marginTop: 12 }}>
                Service type
                <select
                  className={fieldErrors.serviceType ? 'admin-input-error' : ''}
                  value={project.serviceType}
                  onChange={(event) => setProject({ ...project, serviceType: event.target.value })}
                >
                  <option value="">Select a service...</option>
                  {serviceOptions.map((option) => (
                    <option key={option.id} value={option.label}>
                      {option.label}
                    </option>
                  ))}
                  {project.serviceType && !serviceOptions.some((option) => option.label === project.serviceType) ? (
                    <option value={project.serviceType}>{project.serviceType} (custom)</option>
                  ) : null}
                </select>
                {fieldErrors.serviceType ? <span className="admin-error-text">{fieldErrors.serviceType}</span> : null}
              </label>
              <label style={{ marginTop: 12 }}>
                Industry
                <input
                  value={project.industry}
                  onChange={(event) => setProject({ ...project, industry: event.target.value })}
                  placeholder="e.g. Fintech, Healthcare, SaaS"
                />
              </label>
              <label style={{ marginTop: 12 }}>
                Project / Case Study URL
                <input
                  value={project.projectUrl}
                  onChange={(event) => setProject({ ...project, projectUrl: event.target.value })}
                  placeholder="https://example.com"
                />
                <span className="admin-subtle">External live project link or demo URL.</span>
              </label>
              <label style={{ marginTop: 12 }}>
                Tags (comma separated)
                <input
                  value={project.tags.join(', ')}
                  onChange={(event) =>
                    setProject({
                      ...project,
                      tags: fromKeywordInput(event.target.value)
                    })
                  }
                  placeholder="react, typescript, nextjs"
                />
              </label>
            </div>
          </section>

          {/* Cover Image Card */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Cover Image</h3>
            <div style={{ marginTop: 12 }}>
              <MediaPickerField
                label="Cover image"
                value={project.coverImage}
                onChange={(value) => setProject({ ...project, coverImage: value })}
                helperText="Use an uploaded file or external image URL."
                aspectRatioHint="4:3 or 16:9 for cards and portfolio headers."
              />
            </div>
          </section>

          {/* Related Service Pages */}
          <section className="admin-card">
            <h3 className="admin-section-heading">Related Services</h3>
            <p className="admin-subtle" style={{ marginTop: 4, marginBottom: 12 }}>
              Service pages that display this project in their portfolio section.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {serviceOptions.map((option) => {
                const checked = (project.relatedServicePageIds ?? []).includes(option.id);
                return (
                  <label key={option.id} className="admin-checkbox-row">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={(event) =>
                        setProject({
                          ...project,
                          relatedServicePageIds: event.target.checked
                            ? [...(project.relatedServicePageIds ?? []), option.id]
                            : (project.relatedServicePageIds ?? []).filter((value) => value !== option.id)
                        })
                      }
                    />
                    <span style={{ fontSize: '0.85rem' }}>
                      <strong>{option.label}</strong>
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          {/* Content Revision History */}
          <ContentRevisionPanel<PortfolioProject>
            entityType="portfolio_project"
            entityId={project.id}
            reloadKey={revisionReloadKey}
            emptyMessage="Manual saves and publishing changes for this project will appear here."
            onRestore={(restoredProject) => {
              const normalized = normalizeProjectShape(restoredProject);
              setProject(normalized);
              setBaseline(normalized);
              setLastSavedAt(restoredProject.updatedAt ?? null);
              setNotice('Project restored from revision history.');
            }}
          />
        </aside>
      </div>
    </div>
  );
}
