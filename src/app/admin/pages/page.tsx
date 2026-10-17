'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { ExternalLink, PenSquare } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { filterAndSortPages, type PagesSortBy, type PagesStatusFilter } from '@/features/cms/adminPagesList';
import { getLandingPagePublicationLabel } from '@/features/cms/publicationState';
import type { LandingPage, PageId } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

type PagesListProps = {
  user: AdminSessionUser;
};

function PagesList({ user }: PagesListProps) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [pages, setPages] = useState<LandingPage[]>([]);
  const [viewCounts, setViewCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [bulkPending, setBulkPending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<PageId[]>([]);
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState<PagesStatusFilter>(
    (searchParams.get('status') as PagesStatusFilter) ?? 'all'
  );
  const [sortBy, setSortBy] = useState<PagesSortBy>(
    (searchParams.get('sort') as PagesSortBy) ?? 'title_asc'
  );

  const loadPages = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/admin/pages');
      if (!response.ok) {
        setError('Failed to load pages.');
        return;
      }
      const payload = (await response.json()) as { pages: LandingPage[]; viewCounts?: Record<string, number> };
      setPages(payload.pages);
      setViewCounts(payload.viewCounts ?? {});
      setError('');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadPages();
  }, [loadPages]);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (status !== 'all') next.set('status', status);
    if (sortBy !== 'title_asc') next.set('sort', sortBy);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [q, status, sortBy, pathname, router]);

  const visiblePages = useMemo(
    () =>
      filterAndSortPages(pages, {
        q,
        status,
        sortBy
      }),
    [pages, q, sortBy, status]
  );

  useEffect(() => {
    const visibleIds = new Set(visiblePages.map((page) => page.id));
    setSelectedIds((current) => current.filter((id) => visibleIds.has(id)));
  }, [visiblePages]);

  const allVisibleSelected = visiblePages.length > 0 && visiblePages.every((page) => selectedIds.includes(page.id));
  const canPublish = user.permissions.includes('content:publish');

  const applyBulkPublishState = async (published: boolean) => {
    if (selectedIds.length === 0 || !canPublish) return;

    const selectedPages = pages.filter((page) => selectedIds.includes(page.id));
    if (selectedPages.length === 0) return;

    setBulkPending(true);
    setError('');
    setNotice('');

    const responses = await Promise.all(
      selectedPages.map((page) =>
        csrfFetch(`/api/admin/pages/${page.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...page, published })
        })
      )
    );

    const failed = responses.filter((response) => !response.ok).length;
    if (failed > 0) {
      setError(`Updated ${selectedPages.length - failed}/${selectedPages.length} pages. ${failed} failed.`);
    } else {
      setNotice(`Updated ${selectedPages.length} page(s) to ${published ? 'published' : 'draft'}.`);
    }

    setSelectedIds([]);
    setBulkPending(false);
    await loadPages();
  };

  if (loading) return <AdminLoading label="Loading pages..." />;
  if (error && pages.length === 0) return <p className="error">{error}</p>;

  return (
    <div className="admin-form-wrap">
      {pages.length === 0 ? (
        <section className="admin-card admin-empty-state">
          <h2>No pages found</h2>
          <p className="admin-subtle">Seed or import the default landing pages before handing the CMS to content editors.</p>
        </section>
      ) : null}

      <section className="admin-card">
        <div className="admin-filter-bar mb-4">
          <label>
            Search
            <input
              placeholder="Search title, nav label, or slug"
              value={q}
              onChange={(event) => setQ(event.target.value)}
            />
          </label>
          <label>
            Status
            <select
              value={status}
              onChange={(event) => {
                setStatus(event.target.value as PagesStatusFilter);
              }}
            >
              <option value="all">All pages</option>
              <option value="published">Published</option>
              <option value="draft">Draft</option>
            </select>
          </label>
          <label>
            Sort
            <select
              value={sortBy}
              onChange={(event) => {
                setSortBy(event.target.value as PagesSortBy);
              }}
            >
              <option value="title_asc">Title (A to Z)</option>
              <option value="updated_desc">Updated (newest)</option>
              <option value="updated_asc">Updated (oldest)</option>
            </select>
          </label>
        </div>

        {selectedIds.length > 0 ? (
          <div className="admin-bulk-bar flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-blue-900">{selectedIds.length} selected</span>
              <span className="text-xs text-blue-700">of {pages.length} pages</span>
            </div>
            <div className="admin-actions">
              <button
                type="button"
                disabled={bulkPending || !canPublish}
                onClick={() => void applyBulkPublishState(true)}
              >
                Publish selected
              </button>
              <button
                type="button"
                disabled={bulkPending || !canPublish}
                onClick={() => void applyBulkPublishState(false)}
              >
                Move selected to draft
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
            <span>{visiblePages.length} {visiblePages.length === 1 ? 'page' : 'pages'} (of {pages.length} total)</span>
          </div>
        )}

        {!canPublish ? <p className="admin-subtle text-xs mb-2">Your role can review pages but cannot change publication status.</p> : null}
        {notice ? <p className="admin-subtle text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mb-3">{notice}</p> : null}
        {error ? <p className="error text-sm text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">{error}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th className="admin-selection-cell">
                  <input
                    type="checkbox"
                    aria-label="Select all pages"
                    checked={allVisibleSelected}
                    onChange={(event) => {
                      if (event.target.checked) {
                        setSelectedIds(visiblePages.map((page) => page.id));
                      } else {
                        setSelectedIds([]);
                      }
                    }}
                  />
                </th>
                <th>Page</th>
                <th>Slug</th>
                <th>Status</th>
                <th>Updated</th>
                <th>Views</th>
                <th className="text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {visiblePages.map((page) => {
                const publicationLabel = getLandingPagePublicationLabel(page);
                const chipClass =
                  publicationLabel === 'published'
                    ? 'admin-chip-success'
                    : publicationLabel === 'scheduled' || publicationLabel === 'scheduled-unpublish'
                      ? 'admin-chip-warning'
                      : 'admin-chip-muted';
                return (
                  <tr key={page.id}>
                    <td className="admin-selection-cell">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(page.id)}
                        onChange={(event) => {
                          setSelectedIds((current) => {
                            if (event.target.checked) {
                              return current.includes(page.id) ? current : [...current, page.id];
                            }
                            return current.filter((id) => id !== page.id);
                          });
                        }}
                        aria-label={`Select page ${page.navLabel}`}
                      />
                    </td>
                    <td>
                      <strong className="text-slate-900">{page.navLabel}</strong>
                      <span className="admin-subtle text-xs">{page.title}</span>
                    </td>
                    <td>
                      <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        /{page.seo.slug || page.id}
                      </code>
                    </td>
                    <td>
                      <span className={`admin-chip ${chipClass} inline-flex items-center gap-1.5`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                        {publicationLabel}
                      </span>
                    </td>
                    <td className="text-slate-600 text-sm">{new Date(page.updatedAt).toLocaleDateString()}</td>
                    <td className="text-slate-600 text-sm">{(viewCounts[page.id === 'home' ? '/' : `/${page.seo.slug || page.id}`] ?? 0).toLocaleString() || '—'}</td>
                    <td className="text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <Link
                          href={`/admin/pages/${page.id}`}
                          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                        >
                          <PenSquare className="w-3.5 h-3.5" />
                          <span>Edit</span>
                        </Link>
                        <a
                          href={page.id === 'home' ? '/' : `/${page.seo.slug || page.id}`}
                          target="_blank"
                          rel="noreferrer"
                          title="View live page"
                          className="p-1 text-slate-400 hover:text-slate-700 rounded transition-colors"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {visiblePages.length === 0 ? (
                <tr>
                  <td colSpan={7} className="admin-subtle py-8 text-center">
                    No pages match the current filters. Clear filters to see the full landing-page set.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminShell
      title="Pages"
      description="Manage landing pages and homepage block composition."
    >
      {(user) => <PagesList user={user} />}
    </AdminShell>
  );
}
