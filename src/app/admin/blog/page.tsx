'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useState } from 'react';

import { Plus } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import { AdminPostsTable } from '@/components/admin/AdminPostsTable';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { BlogPost } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

type BlogListPayload = {
  posts: BlogPost[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    categories: string[];
  };
  viewCounts?: Record<string, number>;
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

  if (loading) return <AdminLoading label="Loading posts..." />;
  if (error && !data) return <p className="error">{error}</p>;
  if (!data) return null;

  return (
    <div className="admin-form-wrap">
      {data.meta.total === 0 ? (
        <section className="admin-card admin-empty-state">
          <h2>Start the blog workflow</h2>
          <p className="admin-subtle">Create the first post, assign categories, and use draft preview before publishing client-facing content.</p>
          {user.permissions.includes('content:edit') ? (
            <Link href="/admin/blog/new" className="v2-btn v2-btn-primary inline-flex items-center gap-1.5">
              <Plus className="w-4 h-4" />
              <span>Create first post</span>
            </Link>
          ) : null}
        </section>
      ) : null}

      <section className="admin-card">
        <div className="admin-filter-bar mb-4">
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

        {selectedCount > 0 ? (
          <div className="admin-bulk-bar flex flex-wrap items-center justify-between gap-3 p-3 bg-blue-50/80 border border-blue-200/80 rounded-xl mb-4">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-sm text-blue-900">{selectedCount} selected</span>
              <span className="text-xs text-blue-700">of {data.meta.total} posts</span>
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
                disabled={bulkPending}
                onClick={() => setSelectedIds([])}
              >
                Clear selection
              </button>
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-between text-xs text-slate-500 py-1 mb-3">
            <span>{data.meta.total} total {data.meta.total === 1 ? 'post' : 'posts'}</span>
          </div>
        )}

        {!canPublish ? <p className="admin-subtle text-xs mb-2">Your role can review posts but cannot change publication status.</p> : null}
        {notice ? <p className="admin-subtle text-sm text-emerald-700 bg-emerald-50 border border-emerald-200 p-2.5 rounded-lg mb-3">{notice}</p> : null}
        {error ? <p className="error text-sm text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">{error}</p> : null}

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
          viewCounts={data.viewCounts}
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
      actions={(user) =>
        user.permissions.includes('content:edit') ? (
          <Link href="/admin/blog/new" className="v2-btn v2-btn-primary inline-flex items-center gap-1.5">
            <Plus className="w-4 h-4" />
            <span>New post</span>
          </Link>
        ) : null
      }
    >
      {(user) => <BlogList user={user} />}
    </AdminShell>
  );
}
