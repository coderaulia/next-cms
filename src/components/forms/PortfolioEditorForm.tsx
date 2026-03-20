'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { PortfolioProject } from '@/features/cms/types';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { toFieldErrorMap, validatePortfolioEditor } from '@/features/cms/editorValidation';
import { getPortfolioProjectPublicationLabel } from '@/features/cms/publicationState';
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


export function PortfolioEditorForm({
  initialProject,
  isNew = false,
  canPublish = true,
  canDelete = true
}: PortfolioEditorFormProps) {
  const [project, setProject] = useState(initialProject);
  const [baseline, setBaseline] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialProject.updatedAt ?? null);
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setProject(initialProject);
    setBaseline(initialProject);
    setLastSavedAt(initialProject.updatedAt ?? null);
  }, [initialProject]);

  const isDirty = useMemo(
    () => JSON.stringify(project) !== JSON.stringify(baseline),
    [project, baseline]
  );
  const previewHref = normalizePreviewHref(project);
  const previewModePath = previewModeHref(previewHref);
  const publicationLabel = getPortfolioProjectPublicationLabel(project);
  const validationIssues = useMemo(() => validatePortfolioEditor(project), [project]);
  const fieldErrors = useMemo(() => toFieldErrorMap(validationIssues), [validationIssues]);
  const canSave = validationIssues.length === 0;

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
    setProject(payload.project);
    setBaseline(payload.project);
    setLastSavedAt(payload.project.updatedAt ?? null);
    setNotice('Project saved');
    setRevisionReloadKey((current) => current + 1);

    if (isNew) {
      router.replace(`/admin/portfolio/${payload.project.id}`);
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
    setProject(payload.project);
    setBaseline(payload.project);
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
    setProject(payload.project);
    setBaseline(payload.project);
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
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <h2>{project.title || 'Untitled project'}</h2>
            <p className="admin-subtle">Ctrl/Cmd + S to save. Status: {publicationLabel}. Last saved {lastSavedAt ? new Date(lastSavedAt).toLocaleString() : 'not yet'}.</p>
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

      <ContentRevisionPanel<PortfolioProject>
        entityType="portfolio_project"
        entityId={project.id}
        reloadKey={revisionReloadKey}
        emptyMessage="Manual saves and publishing changes for this project will appear here."
        onRestore={(restoredProject) => {
          setProject(restoredProject);
          setBaseline(restoredProject);
          setLastSavedAt(restoredProject.updatedAt ?? null);
          setNotice('Project restored from revision history.');
        }}
      />

      <section className="admin-card">
        <h2>Content</h2>
        <label>
          Title
          <input
            className={fieldErrors.title ? 'admin-input-error' : ''}
            value={project.title}
            onChange={(event) => setProject({ ...project, title: event.target.value })}
          />
          {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
        </label>
        <label>
          Summary
          <textarea
            className={fieldErrors.summary ? 'admin-input-error' : ''}
            rows={4}
            value={project.summary}
            onChange={(event) => setProject({ ...project, summary: event.target.value })}
          />
          {fieldErrors.summary ? <span className="admin-error-text">{fieldErrors.summary}</span> : null}
        </label>
        <label>
          Challenge
          <textarea
            className={fieldErrors.challenge ? 'admin-input-error' : ''}
            rows={5}
            value={project.challenge}
            onChange={(event) => setProject({ ...project, challenge: event.target.value })}
          />
          {fieldErrors.challenge ? <span className="admin-error-text">{fieldErrors.challenge}</span> : null}
        </label>
        <label>
          Solution
          <textarea
            className={fieldErrors.solution ? 'admin-input-error' : ''}
            rows={5}
            value={project.solution}
            onChange={(event) => setProject({ ...project, solution: event.target.value })}
          />
          {fieldErrors.solution ? <span className="admin-error-text">{fieldErrors.solution}</span> : null}
        </label>
        <label>
          Outcome
          <textarea
            className={fieldErrors.outcome ? 'admin-input-error' : ''}
            rows={5}
            value={project.outcome}
            onChange={(event) => setProject({ ...project, outcome: event.target.value })}
          />
          {fieldErrors.outcome ? <span className="admin-error-text">{fieldErrors.outcome}</span> : null}
        </label>
        <div className="admin-grid-2">
          <label>
            Client name
            <input
              className={fieldErrors.clientName ? 'admin-input-error' : ''}
              value={project.clientName}
              onChange={(event) => setProject({ ...project, clientName: event.target.value })}
            />
            {fieldErrors.clientName ? <span className="admin-error-text">{fieldErrors.clientName}</span> : null}
          </label>
          <label>
            Service type
            <input
              className={fieldErrors.serviceType ? 'admin-input-error' : ''}
              value={project.serviceType}
              onChange={(event) => setProject({ ...project, serviceType: event.target.value })}
            />
            {fieldErrors.serviceType ? <span className="admin-error-text">{fieldErrors.serviceType}</span> : null}
          </label>
          <label>
            Industry
            <input
              value={project.industry}
              onChange={(event) => setProject({ ...project, industry: event.target.value })}
            />
          </label>
          <label>
            Project URL
            <input
              value={project.projectUrl}
              onChange={(event) => setProject({ ...project, projectUrl: event.target.value })}
            />
          </label>
          <div style={{ gridColumn: '1 / -1' }}>
            <MediaPickerField
              label="Cover image"
              value={project.coverImage}
              onChange={(value) => setProject({ ...project, coverImage: value })}
              helperText="Use an uploaded file from the media library or paste an external image URL."
              aspectRatioHint="4:3 or 16:9 for case-study cards and portfolio headers."
            />
          </div>
          <label>
            Sort order
            <input
              type="number"
              min={0}
              value={project.sortOrder}
              onChange={(event) => setProject({ ...project, sortOrder: Number(event.target.value) || 0 })}
            />
          </label>
          <label>
            Featured project
            <input
              type="checkbox"
              checked={project.featured}
              onChange={(event) => setProject({ ...project, featured: event.target.checked })}
            />
          </label>
        </div>
        <label>
          Tags (comma separated)
          <input
            value={project.tags.join(', ')}
            onChange={(event) =>
              setProject({
                ...project,
                tags: fromKeywordInput(event.target.value)
              })
            }
          />
        </label>
        <MediaGalleryField
          label="Project gallery"
          values={project.gallery}
          onChange={(gallery) => setProject({ ...project, gallery })}
          helperText="Add gallery images from the media library. The first image is not required because the cover image is already used in cards and hero sections."
        />
      </section>

      <section className="admin-card">
        <h2>Publishing</h2>
        <div className="admin-grid-2">
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
              <span className="admin-subtle">Set this when a case study should go live automatically.</span>
            )}
          </label>
          <label>
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
              <span className="admin-subtle">Use this for time-boxed promotions or temporary portfolio highlights.</span>
            )}
          </label>
        </div>
        {!canPublish ? <p className="admin-subtle">Your role can edit case-study content but cannot change publishing timing.</p> : null}
      </section>

      <section className="admin-card">
        <h2>SEO</h2>
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
          {fieldErrors['seo.metaTitle'] ? <span className="admin-error-text">{fieldErrors['seo.metaTitle']}</span> : null}
        </label>
        <label>
          Meta description
          <textarea
            className={fieldErrors['seo.metaDescription'] ? 'admin-input-error' : ''}
            rows={4}
            value={project.seo.metaDescription}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, metaDescription: event.target.value }
              })
            }
          />
          {fieldErrors['seo.metaDescription'] ? (
            <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span>
          ) : null}
        </label>
        <label>
          Slug
          <input
            className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
            value={project.seo.slug}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, slug: event.target.value }
              })
            }
          />
          {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
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
          helperText="Optional image used for portfolio social sharing cards."
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
        <label>
          Noindex
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
        </label>
      </section>
    </div>
  );
}
