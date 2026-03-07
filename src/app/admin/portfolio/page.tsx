'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { PortfolioProject } from '@/features/cms/types';

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

function PortfolioList() {
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

  useEffect(() => {
    async function load() {
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
    }
    load();
  }, [q, status, tag, featured, dateSort, page, pageSize]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize));
  }, [data]);

  if (loading) return <p>Loading projects...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-filter-bar">
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
      </section>

      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Project</th>
                <th>Client</th>
                <th>Service</th>
                <th>Status</th>
                <th>Featured</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {data.projects.length > 0 ? (
                data.projects.map((project) => (
                  <tr key={project.id}>
                    <td>
                      <strong>{project.title}</strong>
                      <span className="admin-subtle">/portfolio/{project.seo.slug}</span>
                    </td>
                    <td>{project.clientName || '-'}</td>
                    <td>{project.serviceType || '-'}</td>
                    <td>
                      <span
                        className={`admin-chip ${
                          project.status === 'published' ? 'admin-chip-success' : 'admin-chip-warning'
                        }`}
                      >
                        {project.status}
                      </span>
                    </td>
                    <td>
                      <span className={`admin-chip ${project.featured ? 'admin-chip-success' : 'admin-chip-muted'}`}>
                        {project.featured ? 'yes' : 'no'}
                      </span>
                    </td>
                    <td>{new Date(project.updatedAt).toLocaleDateString()}</td>
                    <td>
                      <Link href={`/admin/portfolio/${project.id}`}>Edit</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="admin-subtle">
                    No portfolio projects found for this filter.
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
  return (
    <AdminShell
      title="Portfolio"
      description="Manage case studies and portfolio project publishing."
      actions={
        <Link href="/admin/portfolio/new" className="v2-btn v2-btn-primary">
          + New project
        </Link>
      }
    >
      {() => <PortfolioList />}
    </AdminShell>
  );
}
