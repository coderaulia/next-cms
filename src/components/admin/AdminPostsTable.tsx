import Link from 'next/link';

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
  onToggleSelectAll
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
              <th>Title</th>
              <th>Author</th>
              <th>Categories</th>
              <th>Date</th>
              <th>Status</th>
              <th />
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
                    <strong>{post.title}</strong>
                    <span className="admin-subtle">ID: {post.id.slice(0, 8)}</span>
                  </td>
                  <td>{post.author}</td>
                  <td>
                    <div className="admin-actions">
                      {post.tags.map((tag) => (
                        <span className="admin-chip admin-chip-muted" key={tag}>
                          {tag}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
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
                        <span className={`admin-chip ${chipClass}`}>
                          {publicationLabel}
                        </span>
                      );
                    })()}
                  </td>
                  <td>
                    <Link href={`/admin/blog/${post.id}`}>Edit</Link>
                  </td>
                </tr>
              ))}
            </tbody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={7} className="admin-subtle">
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
