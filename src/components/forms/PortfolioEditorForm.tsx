'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { PortfolioProject } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type PortfolioEditorFormProps = {
  initialProject: PortfolioProject;
  isNew?: boolean;
};

function normalizePreviewHref(project: PortfolioProject) {
  const slug = project.seo.slug.trim();
  if (!slug) return '/portfolio';
  return `/portfolio/${slug.replace(/^\/+/, '')}`;
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

function toGalleryInput(items: string[] | undefined) {
  return (items ?? []).join('\n');
}

function fromGalleryInput(value: string) {
  return value
    .split('\n')
    .map((item) => item.trim())
    .filter(Boolean);
}

export function PortfolioEditorForm({ initialProject, isNew = false }: PortfolioEditorFormProps) {
  const [project, setProject] = useState(initialProject);
  const [baseline, setBaseline] = useState(initialProject);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const router = useRouter();

  useEffect(() => {
    setProject(initialProject);
    setBaseline(initialProject);
  }, [initialProject]);

  const isDirty = useMemo(
    () => JSON.stringify(project) !== JSON.stringify(baseline),
    [project, baseline]
  );
  const previewHref = normalizePreviewHref(project);

  const saveProject = useCallback(async () => {
    setSaving(true);
    setNotice('');

    const response = await csrfFetch(`/api/admin/portfolio/${project.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
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
    setNotice('Project saved');

    if (isNew) {
      router.replace(`/admin/portfolio/${payload.project.id}`);
    }
  }, [isNew, project, router]);

  const publish = async () => {
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
    setNotice('Project published');
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
    setNotice('Project moved to draft');
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
            <p className="admin-subtle">Ctrl/Cmd + S to save. Status: {project.status}.</p>
          </div>
          <div className="admin-actions">
            <span className={`admin-chip ${isDirty ? 'admin-chip-warning' : 'admin-chip-success'}`}>
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
            <a className="v2-btn v2-btn-secondary" href={previewHref} target="_blank" rel="noreferrer">
              Preview project
            </a>
            <button type="button" disabled={!isDirty || saving} onClick={() => setProject(baseline)}>
              Discard
            </button>
            <button type="button" onClick={saveProject} disabled={saving}>
              {saving ? 'Saving...' : 'Save project'}
            </button>
            {project.status === 'draft' ? (
              <button type="button" onClick={publish}>
                Publish
              </button>
            ) : (
              <button type="button" onClick={unpublish}>
                Unpublish
              </button>
            )}
            <button type="button" onClick={deleteProject}>
              Delete
            </button>
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
      </section>

      <section className="admin-card">
        <h2>Content</h2>
        <label>
          Title
          <input value={project.title} onChange={(event) => setProject({ ...project, title: event.target.value })} />
        </label>
        <label>
          Summary
          <textarea
            rows={4}
            value={project.summary}
            onChange={(event) => setProject({ ...project, summary: event.target.value })}
          />
        </label>
        <label>
          Challenge
          <textarea
            rows={5}
            value={project.challenge}
            onChange={(event) => setProject({ ...project, challenge: event.target.value })}
          />
        </label>
        <label>
          Solution
          <textarea
            rows={5}
            value={project.solution}
            onChange={(event) => setProject({ ...project, solution: event.target.value })}
          />
        </label>
        <label>
          Outcome
          <textarea
            rows={5}
            value={project.outcome}
            onChange={(event) => setProject({ ...project, outcome: event.target.value })}
          />
        </label>
        <div className="admin-grid-2">
          <label>
            Client name
            <input
              value={project.clientName}
              onChange={(event) => setProject({ ...project, clientName: event.target.value })}
            />
          </label>
          <label>
            Service type
            <input
              value={project.serviceType}
              onChange={(event) => setProject({ ...project, serviceType: event.target.value })}
            />
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
          <label>
            Cover image URL
            <input
              value={project.coverImage}
              onChange={(event) => setProject({ ...project, coverImage: event.target.value })}
            />
          </label>
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
        <label>
          Gallery image URLs (one per line)
          <textarea
            rows={4}
            value={toGalleryInput(project.gallery)}
            onChange={(event) =>
              setProject({
                ...project,
                gallery: fromGalleryInput(event.target.value)
              })
            }
          />
        </label>
      </section>

      <section className="admin-card">
        <h2>SEO</h2>
        <label>
          Meta title
          <input
            value={project.seo.metaTitle}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, metaTitle: event.target.value }
              })
            }
          />
        </label>
        <label>
          Meta description
          <textarea
            rows={4}
            value={project.seo.metaDescription}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, metaDescription: event.target.value }
              })
            }
          />
        </label>
        <label>
          Slug
          <input
            value={project.seo.slug}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, slug: event.target.value }
              })
            }
          />
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
        <label>
          Social image URL
          <input
            value={project.seo.socialImage}
            onChange={(event) =>
              setProject({
                ...project,
                seo: { ...project.seo, socialImage: event.target.value }
              })
            }
          />
        </label>
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
