'use client';

import { useEffect, useState } from 'react';
import {
  AlertOctagon,
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Filter,
  Link2,
  ShieldAlert,
  ShieldCheck
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { AdminLoading } from '@/components/admin/AdminLoading';

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
  const isError = item.severity === 'error';

  return (
    <div
      className={`p-4 rounded-xl border transition-all ${
        isError ? 'bg-rose-50/40 border-rose-200' : 'bg-amber-50/40 border-amber-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <span
            className={`admin-chip ${
              isError ? 'admin-chip-danger' : 'admin-chip-warning'
            } inline-flex items-center gap-1.5 text-[10px]`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
            {item.severity}
          </span>
          <span className="admin-chip admin-chip-muted text-[10px] uppercase font-semibold">
            {item.category}
          </span>
        </div>
        <a
          href={item.href}
          className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
        >
          <span>Open in editor</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
      <strong className="block text-sm text-slate-900 mb-1">{item.label}</strong>
      <p className="admin-subtle text-xs m-0 leading-relaxed text-slate-600">{item.detail}</p>
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

  if (loading) return <AdminLoading label="Checking content health..." />;
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
      {/* KPI Cards */}
      <section className="admin-kpi-grid">
        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-slate-600">
              <Link2 className="w-4 h-4 text-slate-500" />
              <span>Issues detected</span>
            </p>
            <p className="admin-kpi-value text-slate-900">{totalShowing}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Filter className="w-5 h-5" />
          </div>
        </article>

        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-rose-700">
              <AlertOctagon className="w-4 h-4 text-rose-600" />
              <span>Errors</span>
            </p>
            <p className="admin-kpi-value text-rose-600">{totalErrors}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
            <ShieldAlert className="w-5 h-5" />
          </div>
        </article>

        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-amber-700">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <span>Warnings</span>
            </p>
            <p className="admin-kpi-value text-amber-600">{totalWarnings}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <AlertTriangle className="w-5 h-5" />
          </div>
        </article>
      </section>

      {/* Filter Toolbar Card */}
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-blue-600" />
              <h2 className="m-0 text-base font-bold text-slate-900">Health Audit Filters</h2>
            </div>
            <p className="admin-subtle text-xs mt-0.5">
              {report.checkedAt ? `Last checked: ${new Date(report.checkedAt).toLocaleString()}` : 'Never checked'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span>Severity:</span>
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value as typeof filter)}
                className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg"
              >
                <option value="all">All severities</option>
                <option value="error">Errors only</option>
                <option value="warning">Warnings only</option>
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-700 flex items-center gap-2">
              <span>Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value as typeof categoryFilter)}
                className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg"
              >
                <option value="all">All categories</option>
                <option value="links">Broken links</option>
                <option value="slugs">Slug issues</option>
                <option value="seo">SEO issues</option>
                <option value="media">Media issues</option>
              </select>
            </label>
          </div>
        </div>
      </section>

      {/* Issues List or Empty State */}
      {totalShowing === 0 ? (
        <section className="admin-card flex flex-col items-center justify-center py-12 text-center">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mb-3">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-base font-bold text-slate-900 m-0">Content health is clean</h3>
          <p className="admin-subtle text-sm max-w-md mt-1">
            {filter === 'all' && categoryFilter === 'all'
              ? 'No broken links, missing media, duplicate slugs, or SEO issues found across your content.'
              : 'No issues match the selected severity or category filter.'}
          </p>
        </section>
      ) : (
        <div className="space-y-4">
          {grouped.pages.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Pages ({grouped.pages.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.pages.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.posts.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Blog Posts ({grouped.posts.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.posts.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.portfolio.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Portfolio ({grouped.portfolio.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.portfolio.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.settings.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Settings ({grouped.settings.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.settings.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.media.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Media ({grouped.media.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.media.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}

          {grouped.other.length > 0 && (
            <section className="admin-card">
              <h3 className="text-sm font-bold text-slate-900 mb-3">Other ({grouped.other.length})</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {grouped.other.map((item) => (
                  <IssueCard key={item.id} item={item} />
                ))}
              </div>
            </section>
          )}
        </div>
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
