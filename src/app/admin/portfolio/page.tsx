'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { ArrowDown, ArrowLeft, ArrowUp, ArrowUpDown, ExternalLink, GripVertical, PenSquare, Plus } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { getPortfolioProjectPublicationLabel } from '@/features/cms/publicationState';
import type { PortfolioProject } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

type PortfolioListPayload = {
  projects: PortfolioProject[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    tags: string[];
  };
};

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

/* ─── Reorder Panel ─── */

type ReorderPanelProps = {
  user: AdminSessionUser;
  onClose: () => void;
  onSaved: () => void;
};

function ReorderPanel({ user, onClose, onSaved }: ReorderPanelProps) {
  const [projects, setProjects] = useState<PortfolioProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [dirty, setDirty] = useState(false);
  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const canEdit = user.permissions.includes('content:edit');

  useEffect(() => {
    async function load() {
      setLoading(true);
      try {
        const params = new URLSearchParams({ includeDrafts: '1', pageSize: '200' });
        const response = await fetch(`/api/admin/portfolio?${params.toString()}`);
        if (!response.ok) {
          setError('Failed to load projects for reordering.');
          return;
        }
        const payload = (await response.json()) as PortfolioListPayload;
        setProjects(payload.projects);
      } finally {
        setLoading(false);
      }
    }
    void load();
  }, []);

  const handleDragStart = (index: number) => {
    dragItem.current = index;
  };

  const handleDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const handleDragEnd = () => {
    if (dragItem.current === null || dragOverItem.current === null) return;
    if (dragItem.current === dragOverItem.current) {
      dragItem.current = null;
      dragOverItem.current = null;
      return;
    }

    const reordered = [...projects];
    const [removed] = reordered.splice(dragItem.current, 1);
    reordered.splice(dragOverItem.current, 0, removed);
    setProjects(reordered);
    setDirty(true);
    dragItem.current = null;
    dragOverItem.current = null;
  };

  const moveItem = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= projects.length) return;
    const reordered = [...projects];
    const [removed] = reordered.splice(fromIndex, 1);
    reordered.splice(toIndex, 0, removed);
    setProjects(reordered);
    setDirty(true);
  };

  const handleSave = async () => {
    if (!dirty || !canEdit) return;
    setSaving(true);
    setError('');
    setNotice('');

    try {
      const response = await csrfFetch('/api/admin/portfolio/reorder', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderedIds: projects.map((p) => p.id) })
      });

      if (!response.ok) {
        const payload = (await response.json().catch(() => null)) as { error?: string } | null;
        setError(payload?.error || 'Failed to save order.');
        return;
      }

      setDirty(false);
      setNotice('Order saved successfully.');
      onSaved();
    } catch {
      setError('Failed to save order.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <AdminLoading label="Loading projects..." />;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <div>
            <h3>Reorder Portfolio Projects</h3>
            <p className="admin-subtle">
              Drag and drop to set the display order. Featured items always appear first on the landing page regardless of sort order.
            </p>
          </div>
          <div className="admin-actions">
            <button type="button" onClick={onClose} className="inline-flex items-center gap-1.5">
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to list</span>
            </button>
            <button
              type="button"
              disabled={!dirty || saving || !canEdit}
              onClick={() => void handleSave()}
              className="v2-btn v2-btn-primary"
            >
              {saving ? 'Saving...' : 'Save order'}
            </button>
          </div>
        </div>
        {error ? <p className="error">{error}</p> : null}
        {notice ? <p className="admin-subtle" style={{ color: '#16a34a' }}>{notice}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-reorder-list" role="list" aria-label="Reorder portfolio projects">
          {projects.map((project, index) => (
            <div
              key={project.id}
              role="listitem"
              draggable={canEdit}
              onDragStart={() => handleDragStart(index)}
              onDragEnter={() => handleDragEnter(index)}
              onDragEnd={handleDragEnd}
              onDragOver={(e) => e.preventDefault()}
              className="admin-reorder-item"
            >
              <span className="admin-reorder-handle inline-flex items-center text-slate-400" aria-hidden="true">
                <GripVertical className="w-4 h-4" />
              </span>
              <span className="admin-reorder-position">{index + 1}</span>
              <div className="admin-reorder-info">
                <strong>{project.title}</strong>
                <span className="admin-subtle">
                  {project.clientName || 'No client'} · {project.serviceType || 'No service'}
                </span>
              </div>
              <div className="admin-reorder-badges">
                {project.featured ? (
                  <span className="admin-chip admin-chip-success">featured</span>
                ) : null}
                <span className={`admin-chip ${project.status === 'published' ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                  {project.status}
                </span>
              </div>
              <div className="admin-reorder-arrows">
                <button
                  type="button"
                  disabled={index === 0 || !canEdit}
                  onClick={() => moveItem(index, index - 1)}
                  aria-label={`Move ${project.title} up`}
                  title="Move up"
                  className="flex items-center justify-center"
                >
                  <ArrowUp className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  disabled={index === projects.length - 1 || !canEdit}
                  onClick={() => moveItem(index, index + 1)}
                  aria-label={`Move ${project.title} down`}
                  title="Move down"
                  className="flex items-center justify-center"
                >
                  <ArrowDown className="w-3 h-3" />
                </button>
              </div>
            </div>
          ))}
          {projects.length === 0 ? (
            <p className="admin-subtle">No portfolio projects to reorder.</p>
          ) : null}
        </div>
      </section>
    </div>
  );
}

/* ─── Portfolio List ─── */

type PortfolioListProps = {
  user: AdminSessionUser;
  onReorder: () => void;
};

function PortfolioList({ user, onReorder }: PortfolioListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const [tag, setTag] = useState(searchParams.get('tag') ?? '');
  const [featured, setFeatured] = useState(searchParams.get('featured') ?? 'all');
  const [dateSort, setDateSort] = useState(searchParams.get('dateSort') ?? 'newest');
  const [page, setPage] = useState(parsePositiveInt(searchParams.get('page'), 1));
  const [pageSize, setPageSize] = useState(parsePositiveInt(searchParams.get('pageSize'), 10));

  const [data, setData] = useState<PortfolioListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bulkPending, setBulkPending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (tag) params.set('tag', tag);
    if (featured !== 'all') params.set('featured', featured);
    if (dateSort !== 'newest') params.set('dateSort', dateSort);
    if (page !== 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('pageSize', String(pageSize));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [q, status, tag, featured, dateSort, page, pageSize, pathname, router]);

  const loadProjects = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({
        includeDrafts: '1',
        q,
        status,
        tag,
        featured,
        dateSort,
        page: String(page),
        pageSize: String(pageSize)
      });
      const response = await fetch(`/api/admin/portfolio?${params.toString()}`);
      if (!response.ok) {
        setError('Failed to load portfolio projects.');
        return;
      }
      const payload = (await response.json()) as PortfolioListPayload;
      setData(payload);
      setError('');
    } finally {
      setLoading(false);
    }
  }, [dateSort, featured, page, pageSize, q, status, tag]);

  useEffect(() => {
    void loadProjects();
  }, [loadProjects]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize));
  }, [data]);

  useEffect(() => {
    if (!data) return;
    const visible = new Set(data.projects.map((project) => project.id));
    setSelectedIds((current) => current.filter((id) => visible.has(id)));
  }, [data]);

  const canEdit = user.permissions.includes('content:edit');
  const canPublish = user.permissions.includes('content:publish');

  const applyBulkStatus = async (target: 'published' | 'draft') => {
    if (!data || selectedIds.length === 0 || !canPublish) return;

    setBulkPending(true);
    setNotice('');
    setError('');

    const suffix = target === 'published' ? 'publish' : 'unpublish';
    const responses = await Promise.all(
      selectedIds.map((id) =>
        csrfFetch(`/api/admin/portfolio/${id}/${suffix}`, {
          method: 'POST'
        })
      )
    );

    const failed = responses.filter((response) => !response.ok).length;
    if (failed > 0) {
      setError(`Updated ${selectedIds.length - failed}/${selectedIds.length} projects. ${failed} failed.`);
    } else {
      setNotice(`Updated ${selectedIds.length} project(s) to ${target}.`);
    }

    setSelectedIds([]);
    setBulkPending(false);
    await loadProjects();
  };

  const applyBulkFeatured = async (target: boolean) => {
    if (!data || selectedIds.length === 0 || !canEdit) return;

    setBulkPending(true);
    setNotice('');
    setError('');

    const projectMap = new Map(data.projects.map((project) => [project.id, project]));
    const responses = await Promise.all(
      selectedIds.map((id) => {
        const project = projectMap.get(id);
        if (!project) return Promise.resolve(null);
        return csrfFetch(`/api/admin/portfolio/${id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-cms-save-mode': 'manual'
          },
          body: JSON.stringify({
            ...project,
            featured: target
          })
        });
      })
    );

    const failed = responses.filter((response) => response && !response.ok).length;
    if (failed > 0) {
      setError(`Updated ${selectedIds.length - failed}/${selectedIds.length} projects. ${failed} failed.`);
    } else {
      setNotice(`${target ? 'Marked' : 'Unmarked'} ${selectedIds.length} project(s) as featured.`);
    }

    setSelectedIds([]);
    setBulkPending(false);
    await loadProjects();
  };

  if (loading) return <AdminLoading label="Loading projects..." />;
  if (error && !data) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="admin-form-wrap">
      {data.meta.total === 0 ? (
        <section className="admin-card admin-empty-state">
          <h2>No portfolio projects yet</h2>
          <p className="admin-subtle">Create the first case study, add a managed cover image, and use scheduling when launches need a specific date.</p>
          {user.permissions.includes('content:edit') ? (
            <Link href="/admin/portfolio/new" className="v2-btn v2-btn-primary inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create first project</span>
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="admin-card">
        <div className="admin-filter-bar mb-4">
          <label>
            Search
            <input
              placeholder="Search by title/client/service"
              value={q}
              onChange={(event) => {
                setQ(event.target.value);
                setPage(1);
              }}
            />
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="draft">Draft</option>
              <option value="published">Published</option>
            </select>
          </label>
          <label>
            Tag
            <select
              value={tag}
              onChange={(event) => {
                setTag(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All tags</option>
              {data.meta.tags.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </label>
          <label>
            Featured
            <select
              value={featured}
              onChange={(event) => {
                setFeatured(event.target.value);
                setPage(1);
              }}
            >
              <option value="all">All</option>
              <option value="featured">Featured only</option>
              <option value="standard">Standard only</option>
            </select>
          </label>
          <label>
            Sort by date
            <select
              value={dateSort}
              onChange={(event) => {
                setDateSort(event.target.value);
                setPage(1);
              }}
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </label>
          <label>
            Page size
            <select
              value={String(pageSize)}
              onChange={(event) => {
                setPageSize(Number(event.target.value));
                setPage(1);
              }}
            >
              <option value="10">10</option>
              <option value="20">20</option>
              <option value="30">30</option>
            </select>
          </label>
        </div>

        {selectedIds.length > 0 ? (
          <div className="admin-bulk-bar flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-blue-900">{selectedIds.length} selected</span>
              <span className="text-xs text-blue-700">of {data.meta.total} projects</span>
            </div>
            <div className="admin-actions">
              <button
                type="button"
                disabled={bulkPending || !canPublish}
                onClick={() => void applyBulkStatus('published')}
              >
                Publish selected
              </button>
              <button
                type="button"
                disabled={bulkPending || !canPublish}
                onClick={() => void applyBulkStatus('draft')}
              >
                Move selected to draft
              </button>
              <button
                type="button"
                disabled={bulkPending || !canEdit}
                onClick={() => void applyBulkFeatured(true)}
              >
                Feature selected
              </button>
              <button
                type="button"
                disabled={bulkPending || !canEdit}
                onClick={() => void applyBulkFeatured(false)}
              >
                Unfeature selected
              </button>
              <button
                type="button"
                disabled={bulkPending}
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 py-1 mb-3">
            <span>{data.meta.total} total {data.meta.total === 1 ? 'project' : 'projects'}</span>
            {canEdit ? (
              <button
                type="button"
                onClick={onReorder}
                className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span>Reorder projects</span>
              </button>
            ) : null}
          </div>
        )}

        {!canPublish ? <p className="admin-subtle text-xs mb-2">Your role can review projects but cannot change publish status.</p> : null}
        {notice ? <p className="admin-subtle text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mb-3">{notice}</p> : null}
        {error ? <p className="error text-sm text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">{error}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-selection-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all projects"
                    checked={data.projects.length > 0 && selectedIds.length === data.projects.length}
                    onChange={(event) => setSelectedIds(event.target.checked ? data.projects.map((project) => project.id) : [])}
                  />
                </th>
                <th>Project</th>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Updated</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {data.projects.length > 0 ? (
                data.projects.map((project) => {
                  const publicationLabel = getPortfolioProjectPublicationLabel(project);
                  const chipClass =
                    publicationLabel === 'published'
                      ? 'admin-chip-success'
                      : publicationLabel === 'scheduled' || publicationLabel === 'scheduled-unpublish'
                        ? 'admin-chip-warning'
                        : 'admin-chip-muted';

                  return (
                    <tr key={project.id}>
                      <td className="admin-selection-cell">
                        <input
                          type="checkbox"
                          aria-label={`Select ${project.title}`}
                          checked={selectedIds.includes(project.id)}
                          onChange={(event) =>
                            setSelectedIds((current) =>
                              event.target.checked
                                ? (current.includes(project.id) ? current : [...current, project.id])
                                : current.filter((id) => id !== project.id)
                            )
                          }
                        />
                      </td>
                      <td>
                        <strong className="text-slate-900">{project.title}</strong>
                        <div className="flex flex-wrap items-center gap-1.5 mt-1">
                          <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                            /portfolio/{project.seo.slug}
                          </code>
                        </div>
                      </td>
                      <td className="text-slate-600 text-sm">{project.clientName || '—'}</td>
                      <td className="text-slate-600 text-sm">{project.serviceType || '—'}</td>
                      <td>
                        <span className={`admin-chip ${chipClass} inline-flex items-center gap-1.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                          {publicationLabel}
                        </span>
                      </td>
                      <td>
                        <span className={`admin-chip ${project.featured ? 'admin-chip-success' : 'admin-chip-muted'} inline-flex items-center gap-1.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                          {project.featured ? 'featured' : 'standard'}
                        </span>
                      </td>
                      <td className="text-slate-600 text-sm">{new Date(project.updatedAt).toLocaleDateString()}</td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link
                            href={`/admin/portfolio/${project.id}`}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          >
                            <PenSquare className="w-3.5 h-3.5" />
                            <span>Edit</span>
                          </Link>
                          <a
                            href={`/portfolio/${project.seo.slug}`}
                            target="_blank"
                            rel="noreferrer"
                            title="View live project"
                            className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan={8} className="admin-subtle py-8 text-center">
                    No portfolio projects match the current filters. Clear filters or create a new case study.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="admin-table-pagination">
          <p>
            Showing {data.meta.total === 0 ? 0 : (page - 1) * pageSize + 1}
            -{Math.min(page * pageSize, data.meta.total)} of {data.meta.total} projects
          </p>
          <div className="admin-pagination-controls">
            <button type="button" disabled={page <= 1} onClick={() => setPage((current) => current - 1)}>
              Prev
            </button>
            <span>
              Page {page} / {totalPages}
            </span>
            <button type="button" disabled={page >= totalPages} onClick={() => setPage((current) => current + 1)}>
              Next
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}

export default function AdminPortfolioPage() {
  const [mode, setMode] = useState<'list' | 'reorder'>('list');

  return (
    <AdminShell
      title="Portfolio"
      description="Manage case studies and portfolio project publishing."
      actions={(user) =>
        user.permissions.includes('content:edit') ? (
          <Link href="/admin/portfolio/new" className="v2-btn v2-btn-primary inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New project</span>
          </Link>
        ) : null
      }
    >
      {(user) =>
        mode === 'reorder' ? (
          <ReorderPanel
            user={user}
            onClose={() => setMode('list')}
            onSaved={() => setMode('list')}
          />
        ) : (
          <PortfolioList user={user} onReorder={() => setMode('reorder')} />
        )
      }
    </AdminShell>
  );
}
