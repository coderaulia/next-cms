import Link from 'next/link';
import { PenSquare } from 'lucide-react';

import { getBlogPostPublicationLabel } from '@/features/cms/publicationState';
import type { BlogPost } from '@/features/cms/types';

type AdminPostsTableProps = {
  posts: BlogPost[];
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  onPrev: () => void;
  onNext: () => void;
  selectedIds?: string[];
  onToggleSelect?: (id: string, checked: boolean) => void;
  onToggleSelectAll?: (checked: boolean) => void;
  viewCounts?: Record<string, number>;
};

export function AdminPostsTable({
  posts,
  total,
  page,
  pageSize,
  totalPages,
  onPrev,
  onNext,
  selectedIds = [],
  onToggleSelect,
  onToggleSelectAll,
  viewCounts
}: AdminPostsTableProps) {
  const hasPosts = posts.length > 0;
  const selectedSet = new Set(selectedIds);
  const allSelected = hasPosts && posts.every((post) => selectedSet.has(post.id));

  return (
    <>
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th className="admin-selection-cell">
                <input
                  type="checkbox"
                  checked={allSelected}
                  aria-label="Select all posts"
                  onChange={(event) => onToggleSelectAll?.(event.target.checked)}
                />
              </th>
              <th>Post</th>
              <th>Author</th>
              <th>Categories</th>
              <th>Date</th>
              <th>Status</th>
              <th>Views</th>
              <th className="text-right">Actions</th>
            </tr>
          </thead>
          {hasPosts ? (
            <tbody>
              {posts.map((post) => (
                <tr key={post.id}>
                  <td className="admin-selection-cell">
                    <input
                      type="checkbox"
                      checked={selectedSet.has(post.id)}
                      aria-label={`Select post ${post.title}`}
                      onChange={(event) => onToggleSelect?.(post.id, event.target.checked)}
                    />
                  </td>
                  <td>
                    <strong className="text-slate-900">{post.title}</strong>
                    <div className="flex flex-wrap items-center gap-1.5 mt-1">
                      <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                        /{post.seo.slug}
                      </code>
                      <span className="admin-subtle text-[11px]">ID: {post.id.slice(0, 8)}</span>
                    </div>
                  </td>
                  <td className="text-slate-600 text-sm">{post.author}</td>
                  <td>
                    <div className="admin-actions">
                      {post.tags.map((tag) => (
                        <span className="admin-chip admin-chip-muted text-[11px]" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="text-slate-600 text-sm" title={`Last updated: ${new Date(post.updatedAt).toLocaleDateString()}`}>
                    {post.publishedAt ? new Date(post.publishedAt).toLocaleDateString() : '—'}
                  </td>
                  <td>
                    {(() => {
                      const publicationLabel = getBlogPostPublicationLabel(post);
                      const chipClass =
                        publicationLabel === 'published'
                          ? 'admin-chip-success'
                          : publicationLabel === 'scheduled' || publicationLabel === 'scheduled-unpublish'
                            ? 'admin-chip-warning'
                            : 'admin-chip-muted';
                      return (
                        <span className={`admin-chip ${chipClass} inline-flex items-center gap-1.5`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                          {publicationLabel}
                        </span>
                      );
                    })()}
                  </td>
                  <td className="text-slate-600 text-sm">{viewCounts?.[`/blog/${post.seo.slug}`]?.toLocaleString() ?? '—'}</td>
                  <td className="text-right">
                    <Link
                      href={`/admin/blog/${post.id}`}
                      className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                    >
                      <PenSquare className="w-3.5 h-3.5" />
                      <span>Edit</span>
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={8} className="admin-subtle py-8 text-center">
                  No posts match the current filters. Clear filters or create the first post from the Posts screen.
                </td>
              </tr>
            </tbody>
          )}
        </table>
      </div>
      <div className="admin-table-pagination">
        <p>
          Showing {total === 0 ? 0 : (page - 1) * pageSize + 1}
          -{Math.min(page * pageSize, total)} of {total} posts
        </p>
        <div className="admin-pagination-controls">
          <button type="button" disabled={page <= 1} onClick={onPrev}>
            Prev
          </button>
          <span>
            Page {page} / {totalPages}
          </span>
          <button type="button" disabled={page >= totalPages} onClick={onNext}>
            Next
          </button>
        </div>
      </div>
    </>
  );
}
