'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import type { BlogPost } from '@/features/cms/types';

type BlogListPayload = {
  posts: BlogPost[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    categories: string[];
  };
};

function parsePositiveInt(value: string | null, fallback: number) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function BlogList({ token }: { token: string }) {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const router = useRouter();

  const [q, setQ] = useState(searchParams.get('q') ?? '');
  const [status, setStatus] = useState(searchParams.get('status') ?? 'all');
  const [category, setCategory] = useState(searchParams.get('category') ?? '');
  const [dateSort, setDateSort] = useState(searchParams.get('dateSort') ?? 'newest');
  const [page, setPage] = useState(parsePositiveInt(searchParams.get('page'), 1));
  const [pageSize, setPageSize] = useState(parsePositiveInt(searchParams.get('pageSize'), 10));

  const [data, setData] = useState<BlogListPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const params = new URLSearchParams();
    if (q) params.set('q', q);
    if (status !== 'all') params.set('status', status);
    if (category) params.set('category', category);
    if (dateSort !== 'newest') params.set('dateSort', dateSort);
    if (page !== 1) params.set('page', String(page));
    if (pageSize !== 10) params.set('pageSize', String(pageSize));
    const next = params.toString();
    router.replace(next ? `${pathname}?${next}` : pathname, { scroll: false });
  }, [q, status, category, dateSort, page, pageSize, pathname, router]);

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const params = new URLSearchParams({
          includeDrafts: '1',
          q,
          status,
          category,
          dateSort,
          page: String(page),
          pageSize: String(pageSize)
        });
        const response = await fetch(`/api/admin/blog?${params.toString()}`, {
          headers: { 'x-admin-token': token }
        });
        if (!response.ok) {
          setError('Failed to load posts.');
          return;
        }
        const payload = (await response.json()) as BlogListPayload;
        setData(payload);
        setError('');
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token, q, status, category, dateSort, page, pageSize]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize));
  }, [data]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-filter-bar">
          <label>
            Search
            <input
              placeholder="Search by title or author"
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
            Category
            <select
              value={category}
              onChange={(event) => {
                setCategory(event.target.value);
                setPage(1);
              }}
            >
              <option value="">All categories</option>
              {data.meta.categories.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
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
        <AdminPostsTable
          posts={data.posts}
          total={data.meta.total}
          page={page}
          pageSize={data.meta.pageSize}
          totalPages={totalPages}
          onPrev={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminShell
      title="Posts"
      description="Search, filter, and manage editorial content."
      actions={
        <Link href="/admin/blog/new" className="v2-btn v2-btn-primary">
          + New post
        </Link>
      }
    >
      {(token) => <BlogList token={token} />}
    </AdminShell>
  );
}
