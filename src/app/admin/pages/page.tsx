'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { LandingPage } from '@/features/cms/types';

function PagesList() {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState<'all' | 'published' | 'draft'>(
    (searchParams.get('status') as 'all' | 'published' | 'draft') ?? 'all'
  );
  const [sortBy, setSortBy] = useState<'updated_desc' | 'updated_asc' | 'title_asc'>(
    (searchParams.get('sort') ?? 'title_asc') as 'updated_desc' | 'updated_asc' | 'title_asc'
  );

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/pages');
        if (!response.ok) {
          setError('Failed to load pages.');
          return;
        }
        const payload = (await response.json()) as { pages: LandingPage[] };
        setPages(payload.pages);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  useEffect(() => {
    const next = new URLSearchParams();
    if (q) next.set('q', q);
    if (status !== 'all') next.set('status', status);
    if (sortBy !== 'title_asc') next.set('sort', sortBy);
    const query = next.toString();
    router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false });
  }, [q, status, sortBy, pathname, router]);

  const visiblePages = useMemo(() => {
    const needle = q.trim().toLowerCase();

    const filtered = pages.filter((page) => {
      if (status === 'published' && !page.published) return false;
      if (status === 'draft' && page.published) return false;

      if (!needle) return true;
      const title = page.title.toLowerCase();
      const navLabel = page.navLabel.toLowerCase();
      const slug = page.seo.slug.toLowerCase();
      return title.includes(needle) || navLabel.includes(needle) || slug.includes(needle);
    });

    const next = [...filtered];

    if (sortBy === 'updated_desc') {
      next.sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
    } else if (sortBy === 'updated_asc') {
      next.sort((a, b) => new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime());
    } else {
      next.sort((a, b) => a.title.localeCompare(b.title));
    }

    return next;
  }, [pages, q, status, sortBy]);

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p className="error">{error}</p>;

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
              setStatus(event.target.value as 'all' | 'published' | 'draft');
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
              setSortBy(event.target.value as 'updated_desc' | 'updated_asc' | 'title_asc');
            }}
          >
            <option value="title_asc">Title (A → Z)</option>
            <option value="updated_desc">Updated (newest)</option>
            <option value="updated_asc">Updated (oldest)</option>
          </select>
        </label>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
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
                <td colSpan={5} className="admin-subtle">
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
