'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

type ContentHealthItem = {
  id: string;
  severity: 'error' | 'warning';
  category: 'media' | 'links' | 'seo' | 'slugs';
  label: string;
  detail: string;
  href: string;
};

type ContentHealthReport = {
  checkedAt: string;
  errors: number;
  warnings: number;
  items: ContentHealthItem[];
};

type GroupedIssues = {
  pages: ContentHealthItem[];
  posts: ContentHealthItem[];
  portfolio: ContentHealthItem[];
  settings: ContentHealthItem[];
  media: ContentHealthItem[];
  other: ContentHealthItem[];
};

function groupIssuesByContent(items: ContentHealthItem[]): GroupedIssues {
  const groups: GroupedIssues = {
    pages: [],
    posts: [],
    portfolio: [],
    settings: [],
    media: [],
    other: []
  };

  for (const item of items) {
    if (item.href.includes('/admin/pages')) {
      groups.pages.push(item);
    } else if (item.href.includes('/admin/blog')) {
      groups.posts.push(item);
    } else if (item.href.includes('/admin/portfolio')) {
      groups.portfolio.push(item);
    } else if (item.href.includes('/admin/settings')) {
      groups.settings.push(item);
    } else if (item.href.includes('/admin/media')) {
      groups.media.push(item);
    } else {
      groups.other.push(item);
    }
  }

  return groups;
}

function IssueCard({ item }: { item: ContentHealthItem }) {
  return (
    <div className="link-checker-issue">
      <div className="link-checker-issue-header">
        <span className={`admin-chip ${item.severity === 'error' ? 'admin-chip-danger' : 'admin-chip-warning'}`}>
          {item.severity}
        </span>
        <span className="admin-chip admin-chip-muted">{item.category}</span>
      </div>
      <div className="link-checker-issue-label">{item.label}</div>
      <div className="link-checker-issue-detail">{item.detail}</div>
      <a href={item.href} className="link-checker-issue-action">
        Open in editor
      </a>
    </div>
  );
}

type LinkCheckerPanelProps = {
  user: AdminSessionUser;
};

function LinkCheckerPanel({ user }: LinkCheckerPanelProps) {
  const [report, setReport] = useState<ContentHealthReport | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState<'all' | 'error' | 'warning'>('all');
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'links' | 'slugs' | 'seo' | 'media'>('all');

  const canViewAnalytics = user.permissions.includes('analytics:view');

  useEffect(() => {
    const controller = new AbortController();

    fetch('/api/admin/health', { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load health report.');
        }
        return response.json();
      })
      .then((data: ContentHealthReport) => {
        setReport(data);
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (err instanceof Error && err.name === 'AbortError') return;
        setError(err instanceof Error ? err.message : 'Failed to load health report.');
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  if (!canViewAnalytics) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include access to link checking.</p>
      </section>
    );
  }

  if (loading) return <p>Checking for issues...</p>;
  if (error) return <p className="error">{error}</p>;
  if (!report) return null;

  const filteredItems = report.items.filter((item) => {
    if (filter !== 'all' && item.severity !== filter) return false;
    if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;
    return true;
  });

  const grouped = groupIssuesByContent(filteredItems);

  const totalShowing = filteredItems.length;
  const totalErrors = report.items.filter((i) => i.severity === 'error').length;
  const totalWarnings = report.items.filter((i) => i.severity === 'warning').length;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Link Checker</h2>
          <span className="admin-subtle">
            {report.checkedAt ? `Last checked: ${new Date(report.checkedAt).toLocaleString()}` : 'Never checked'}
          </span>
        </div>
        <p className="admin-subtle">
          Detects broken internal links, missing images, duplicate slugs, and SEO issues across your content.
        </p>
      </section>

      <section className="admin-card">
        <div className="link-checker-summary">
          <div className="link-checker-stat">
            <span className="link-checker-stat-value">{totalShowing}</span>
            <span className="link-checker-stat-label">Issues shown</span>
          </div>
          <div className="link-checker-stat">
            <span className="link-checker-stat-value error">{totalErrors}</span>
            <span className="link-checker-stat-label">Errors</span>
          </div>
          <div className="link-checker-stat">
            <span className="link-checker-stat-value warning">{totalWarnings}</span>
            <span className="link-checker-stat-label">Warnings</span>
          </div>
        </div>

        <div className="link-checker-filters">
          <div className="link-checker-filter-group">
            <label>Severity:</label>
            <select value={filter} onChange={(e) => setFilter(e.target.value as typeof filter)}>
              <option value="all">All</option>
              <option value="error">Errors only</option>
              <option value="warning">Warnings only</option>
            </select>
          </div>
          <div className="link-checker-filter-group">
            <label>Category:</label>
            <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}>
              <option value="all">All categories</option>
              <option value="links">Broken links</option>
              <option value="slugs">Slug issues</option>
              <option value="seo">SEO issues</option>
              <option value="media">Media issues</option>
            </select>
          </div>
        </div>
      </section>

      {totalShowing === 0 ? (
        <section className="admin-card">
          <p className="admin-subtle">
            {filter === 'all' && categoryFilter === 'all'
              ? 'No content health issues detected. Your content looks good!'
              : 'No issues match the selected filters.'}
          </p>
        </section>
      ) : (
        <>
          {grouped.pages.length > 0 && (
            <section className="admin-card">
              <h3>Pages ({grouped.pages.length})</h3>
              <div className="link-checker-group">
                {grouped.pages.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.posts.length > 0 && (
            <section className="admin-card">
              <h3>Blog Posts ({grouped.posts.length})</h3>
              <div className="link-checker-group">
                {grouped.posts.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.portfolio.length > 0 && (
            <section className="admin-card">
              <h3>Portfolio ({grouped.portfolio.length})</h3>
              <div className="link-checker-group">
                {grouped.portfolio.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.settings.length > 0 && (
            <section className="admin-card">
              <h3>Settings ({grouped.settings.length})</h3>
              <div className="link-checker-group">
                {grouped.settings.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.media.length > 0 && (
            <section className="admin-card">
              <h3>Media ({grouped.media.length})</h3>
              <div className="link-checker-group">
                {grouped.media.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.other.length > 0 && (
            <section className="admin-card">
              <h3>Other ({grouped.other.length})</h3>
              <div className="link-checker-group">
                {grouped.other.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  );
}

export default function AdminLinkCheckerPage() {
  return (
    <AdminShell
      title="Link Checker"
      description="Detect broken links, missing media, duplicate slugs, and SEO issues across your content."
    >
      {(user) => <LinkCheckerPanel user={user} />}
    </AdminShell>
  );
}
