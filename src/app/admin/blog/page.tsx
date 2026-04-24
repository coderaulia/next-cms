'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import { JsonImportExportCard } from '@/components/admin/JsonImportExportCard';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { BlogPost } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

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

type BlogListProps = {
  user: AdminSessionUser;
};

function BlogList({ user }: BlogListProps) {
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
  const [notice, setNotice] = useState('');
  const [bulkPending, setBulkPending] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

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

  const loadPosts = useCallback(async () => {
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
      const response = await fetch(`/api/admin/blog?${params.toString()}`);
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
  }, [category, dateSort, page, pageSize, q, status]);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  useEffect(() => {
    if (!data) return;
    const visible = new Set(data.posts.map((post) => post.id));
    setSelectedIds((current) => current.filter((id) => visible.has(id)));
  }, [data]);

  const totalPages = useMemo(() => {
    if (!data) return 1;
    return Math.max(1, Math.ceil(data.meta.total / data.meta.pageSize));
  }, [data]);

  const selectedCount = selectedIds.length;
  const canPublish = user.permissions.includes('content:publish');

  const applyBulkStatus = async (target: 'published' | 'draft') => {
    if (!data || selectedIds.length === 0 || !canPublish) return;

    setBulkPending(true);
    setNotice('');
    setError('');

    const suffix = target === 'published' ? 'publish' : 'unpublish';
    const responses = await Promise.all(
      selectedIds.map((id) =>
        csrfFetch(`/api/admin/blog/${id}/${suffix}`, {
          method: 'POST'
        })
      )
    );

    const failed = responses.filter((response) => !response.ok).length;

    if (failed > 0) {
      setError(`Updated ${selectedIds.length - failed}/${selectedIds.length} posts. ${failed} failed.`);
    } else {
      setNotice(`Updated ${selectedIds.length} post(s) to ${target}.`);
    }

    setSelectedIds([]);
    setBulkPending(false);
    await loadPosts();
  };

  if (loading) return <p>Loading posts...</p>;
  if (error && !data) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="admin-form-wrap">
      {data.meta.total === 0 ? (
        <section className="admin-card admin-empty-state">
          <h2>Start the blog workflow</h2>
          <p className="admin-subtle">Create the first post, assign categories, and use draft preview before publishing client-facing content.</p>
          {user.permissions.includes('content:edit') ? (
            <Link href="/admin/blog/new" className="v2-btn v2-btn-primary">
              Create first post
            </Link>
          ) : null}
        </section>
      ) : null}

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
        <div className="admin-inline-header">
          <p className="admin-subtle">{selectedCount} selected</p>
          <div className="admin-actions">
            <button type="button" disabled={selectedCount === 0 || bulkPending || !canPublish} onClick={() => void applyBulkStatus('published')}>
              Publish selected
            </button>
            <button type="button" disabled={selectedCount === 0 || bulkPending || !canPublish} onClick={() => void applyBulkStatus('draft')}>
              Move selected to draft
            </button>
            <button type="button" disabled={selectedCount === 0 || bulkPending} onClick={() => setSelectedIds([])}>
              Clear selection
            </button>
          </div>
        </div>
        {!canPublish ? <p className="admin-subtle">Your role can review posts but cannot change publication status.</p> : null}
        {notice ? <p className="admin-subtle">{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
        <AdminPostsTable
          posts={data.posts}
          total={data.meta.total}
          page={page}
          pageSize={data.meta.pageSize}
          totalPages={totalPages}
          selectedIds={selectedIds}
          onToggleSelect={(id, checked) => {
            setSelectedIds((current) => {
              if (checked) {
                return current.includes(id) ? current : [...current, id];
              }
              return current.filter((currentId) => currentId !== id);
            });
          }}
          onToggleSelectAll={(checked) => {
            if (checked) {
              setSelectedIds(data.posts.map((post) => post.id));
            } else {
              setSelectedIds([]);
            }
          }}
          onPrev={() => setPage((current) => current - 1)}
          onNext={() => setPage((current) => current + 1)}
        />
      </section>

      <JsonImportExportCard
        collection="blogPosts"
        title="Bulk import / export"
        description="Download the current post collection or import a JSON batch for draft and published blog content."
        onImported={async () => {
          setSelectedIds([]);
          await loadPosts();
        }}
      />
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminShell
      title="Posts"
      description="Search, filter, and manage editorial content."
      actions={(user) =>
        user.permissions.includes('content:edit') ? (
          <Link href="/admin/blog/new" className="v2-btn v2-btn-primary">
            + New post
          </Link>
        ) : null
      }
    >
      {(user) => <BlogList user={user} />}
    </AdminShell>
  );
}
