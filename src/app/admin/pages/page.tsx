'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { filterAndSortPages, type PagesSortBy, type PagesStatusFilter } from '@/features/cms/adminPagesList';
import type { LandingPage, PageId } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

function PagesList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [pages, setPages] = useState<LandingPage[]>([]);
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
      const payload = (await response.json()) as { pages: LandingPage[] };
      setPages(payload.pages);
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

  const applyBulkPublishState = async (published: boolean) => {
    if (selectedIds.length === 0) return;

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

  if (loading) return <p>Loading pages...</p>;
  if (error && pages.length === 0) return <p className="error">{error}</p>;

  return (
    <section className="admin-card">
      <div className="admin-filter-bar">
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

      <div className="admin-inline-header" style={{ marginTop: 12 }}>
        <p className="admin-subtle">{selectedIds.length} selected</p>
        <div className="admin-actions">
          <button type="button" disabled={selectedIds.length === 0 || bulkPending} onClick={() => void applyBulkPublishState(true)}>
            Publish selected
          </button>
          <button type="button" disabled={selectedIds.length === 0 || bulkPending} onClick={() => void applyBulkPublishState(false)}>
            Move selected to draft
          </button>
          <button type="button" disabled={selectedIds.length === 0 || bulkPending} onClick={() => setSelectedIds([])}>
            Clear selection
          </button>
        </div>
      </div>
      {notice ? <p className="admin-subtle">{notice}</p> : null}
      {error ? <p className="error">{error}</p> : null}

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
              <th />
            </tr>
          </thead>
          <tbody>
            {visiblePages.map((page) => (
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
                  <strong>{page.navLabel}</strong>
                  <span className="admin-subtle">{page.title}</span>
                </td>
                <td>/{page.seo.slug || ''}</td>
                <td>
                  <span className={`admin-chip ${page.published ? 'admin-chip-success' : 'admin-chip-warning'}`}>
                    {page.published ? 'published' : 'draft'}
                  </span>
                </td>
                <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/pages/${page.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
            {visiblePages.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-subtle">
                  No pages match your filters.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminShell
      title="Pages"
      description="Manage landing pages and homepage block composition."
    >
      {() => <PagesList />}
    </AdminShell>
  );
}

