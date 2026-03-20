'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { DashboardSummary } from '@/features/cms/dashboardSummary';
import {
  getBlogPostPublicationLabel,
  getLandingPagePublicationLabel,
  getPortfolioProjectPublicationLabel
} from '@/features/cms/publicationState';
import type { AdminPermission } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type DashboardPanelProps = {
  user: AdminSessionUser;
};

type DashboardPreferences = {
  widgetOrder: string[];
  hiddenWidgets: string[];
};

const WIDGET_IDS = ['kpi', 'checklist', 'quick-actions', 'scheduled', 'analytics', 'health', 'audit'] as const;
type WidgetId = (typeof WIDGET_IDS)[number];

const widgetLabels: Record<WidgetId, string> = {
  kpi: 'KPI Overview',
  checklist: 'First-run Checklist',
  'quick-actions': 'Quick Actions',
  scheduled: 'Scheduled Publishing',
  analytics: 'Analytics Snapshot',
  health: 'Content Health',
  audit: 'Recent Audit Activity'
};

const quickActions = [
  { href: '/admin/pages', label: 'Edit landing pages', permission: 'content:edit' },
  { href: '/admin/blog', label: 'Manage posts', permission: 'content:edit' },
  { href: '/admin/portfolio', label: 'Manage portfolio', permission: 'content:edit' },
  { href: '/admin/categories', label: 'Manage categories', permission: 'taxonomy:edit' },
  { href: '/admin/contact-submissions', label: 'Review leads' },
  { href: '/admin/media', label: 'Media library', permission: 'media:edit' },
  { href: '/admin/team', label: 'Manage team', permission: 'team:manage' },
  { href: '/admin/analytics', label: 'Analytics', permission: 'analytics:view' },
  { href: '/admin/audit', label: 'Audit log', permission: 'audit:view' },
  { href: '/admin/settings', label: 'Site settings', permission: 'settings:edit' }
] satisfies Array<{ href: string; label: string; permission?: AdminPermission }>;

type Metrics = {
  publishedPages: number;
  scheduledPages: number;
  publishedPosts: number;
  scheduledPosts: number;
  publishedPortfolio: number;
  scheduledPortfolio: number;
};

function KpiWidget({ data, metrics }: { data: DashboardSummary; metrics: Metrics | null }) {
  if (!metrics) return null;
  return (
    <section className="admin-kpi-grid">
      <article className="admin-card">
        <p className="admin-kpi-label">Published pages</p>
        <p className="admin-kpi-value">
          {metrics.publishedPages}/{data.pages.length}
        </p>
      </article>
      <article className="admin-card">
        <p className="admin-kpi-label">Scheduled pages</p>
        <p className="admin-kpi-value">{metrics.scheduledPages}</p>
      </article>
      <article className="admin-card">
        <p className="admin-kpi-label">Published posts</p>
        <p className="admin-kpi-value">{metrics.publishedPosts}</p>
      </article>
      <article className="admin-card">
        <p className="admin-kpi-label">Scheduled posts</p>
        <p className="admin-kpi-value">{metrics.scheduledPosts}</p>
      </article>
      <article className="admin-card">
        <p className="admin-kpi-label">Published portfolio</p>
        <p className="admin-kpi-value">{metrics.publishedPortfolio}</p>
      </article>
      <article className="admin-card">
        <p className="admin-kpi-label">Scheduled portfolio</p>
        <p className="admin-kpi-value">{metrics.scheduledPortfolio}</p>
      </article>
    </section>
  );
}

function ChecklistWidget({ data }: { data: DashboardSummary }) {
  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>First-run checklist</h2>
        <span className="admin-subtle">
          {data.checklist.filter((item) => item.done).length}/{data.checklist.length} complete
        </span>
      </div>
      <ul className="admin-plain-list">
        {data.checklist.map((item) => (
          <li key={item.id}>
            <strong>{item.done ? 'Done' : 'Pending'}: {item.label}</strong>
            <span>{item.detail}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}

function QuickActionsWidget({ user }: { user: AdminSessionUser }) {
  const allowedQuickActions = useMemo(
    () => quickActions.filter((item) => !item.permission || user.permissions.includes(item.permission)),
    [user.permissions]
  );

  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>Quick actions</h2>
      </div>
      <div className="admin-grid-3">
        {allowedQuickActions.map((item) => (
          <Link key={item.href} href={item.href} className="v2-btn v2-btn-secondary">
            {item.label}
          </Link>
        ))}
      </div>
    </section>
  );
}

function ScheduledWidget({ data }: { data: DashboardSummary }) {
  return (
    <article className="admin-card">
      <div className="admin-inline-header">
        <h2>Scheduled publishing</h2>
        <span className="admin-subtle">{data.scheduled.length} items</span>
      </div>
      <ul className="admin-plain-list">
        {data.scheduled.slice(0, 8).map((item) => (
          <li key={`${item.type}-${item.id}`}>
            <strong>{item.title}</strong>
            <span>
              {item.path} - {item.statusLabel}
              {item.publishAt ? ` - publish ${new Date(item.publishAt).toLocaleString()}` : ''}
              {item.unpublishAt ? ` - unpublish ${new Date(item.unpublishAt).toLocaleString()}` : ''}
            </span>
          </li>
        ))}
        {data.scheduled.length === 0 ? <li className="admin-subtle">No scheduled content yet.</li> : null}
      </ul>
    </article>
  );
}

function AnalyticsWidget({ data }: { data: DashboardSummary }) {
  return (
    <article className="admin-card">
      <div className="admin-inline-header">
        <h2>Analytics snapshot</h2>
        <Link href="/admin/analytics">Full report</Link>
      </div>
      {data.analytics.available ? (
        <ul className="admin-plain-list">
          <li>
            <strong>{data.analytics.totals.pageViews30d}</strong>
            <span>page views in the last 30 days</span>
          </li>
          <li>
            <strong>{data.analytics.totals.uniqueVisitors30d}</strong>
            <span>unique visitors in the last 30 days</span>
          </li>
          {data.analytics.topPaths.slice(0, 3).map((item) => (
            <li key={`${item.entityType}-${item.path}`}>
              <strong>{item.path}</strong>
              <span>{item.views} views - {item.visitors} visitors</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-subtle">Analytics becomes available automatically in database mode.</p>
      )}
    </article>
  );
}

function HealthWidget({ data }: { data: DashboardSummary }) {
  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>Content health</h2>
        <span className="admin-subtle">
          {data.health.errors} errors / {data.health.warnings} warnings
        </span>
      </div>
      {data.health.items.length > 0 ? (
        <ul className="admin-plain-list">
          {data.health.items.slice(0, 8).map((item) => (
            <li key={item.id}>
              <strong>
                <span className={`admin-chip ${item.severity === 'error' ? 'admin-chip-danger' : 'admin-chip-warning'}`}>
                  {item.severity}
                </span>{' '}
                {item.label}
              </strong>
              <span>{item.detail}</span>
              <Link href={item.href}>Open fix</Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="admin-subtle">No content health issues detected in the current CMS data.</p>
      )}
    </section>
  );
}

function AuditWidget({ data }: { data: DashboardSummary }) {
  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>Recent audit activity</h2>
        <Link href="/admin/audit">View all</Link>
      </div>
      <ul className="admin-plain-list">
        {data.auditLogs.map((entry) => (
          <li key={entry.id}>
            <strong>{entry.action}</strong>
            <span>{new Date(entry.createdAt).toLocaleString()} - {entry.entityType} - {entry.ip}</span>
          </li>
        ))}
        {data.auditLogs.length === 0 ? <li className="admin-subtle">No audit events yet.</li> : null}
      </ul>
    </section>
  );
}

function DashboardPanel({ user }: DashboardPanelProps) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<DashboardPreferences>({ widgetOrder: [], hiddenWidgets: [] });
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch('/api/admin/dashboard')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load dashboard.');
        }
        setData((await response.json()) as DashboardSummary);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard.');
      });

    fetch('/api/admin/dashboard/preferences')
      .then(async (response) => {
        if (!response.ok) return;
        const payload = (await response.json()) as { preferences: DashboardPreferences };
        if (payload.preferences) {
          setPreferences(payload.preferences);
        }
      })
      .catch(() => {});
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const publishedPages = data.pages.filter((page) => getLandingPagePublicationLabel(page) === 'published').length;
    const scheduledPages = data.pages.filter((page) => getLandingPagePublicationLabel(page) === 'scheduled').length;
    const publishedPosts = data.blogPosts.filter((post) => getBlogPostPublicationLabel(post) === 'published').length;
    const scheduledPosts = data.blogPosts.filter((post) => getBlogPostPublicationLabel(post) === 'scheduled').length;
    const publishedPortfolio = data.portfolioProjects.filter(
      (project) => getPortfolioProjectPublicationLabel(project) === 'published'
    ).length;
    const scheduledPortfolio = data.portfolioProjects.filter(
      (project) => getPortfolioProjectPublicationLabel(project) === 'scheduled'
    ).length;
    return { publishedPages, scheduledPages, publishedPosts, scheduledPosts, publishedPortfolio, scheduledPortfolio };
  }, [data]);

  const orderedWidgets = useMemo(() => {
    const order = preferences.widgetOrder.length > 0 ? preferences.widgetOrder : [...WIDGET_IDS];
    const hidden = new Set(preferences.hiddenWidgets);
    return order.filter((id) => !hidden.has(id)) as WidgetId[];
  }, [preferences]);

  const toggleWidget = (widgetId: WidgetId) => {
    setPreferences((prev) => ({
      ...prev,
      hiddenWidgets: prev.hiddenWidgets.includes(widgetId)
        ? prev.hiddenWidgets.filter((id) => id !== widgetId)
        : [...prev.hiddenWidgets, widgetId]
    }));
  };

  const moveWidget = (widgetId: WidgetId, direction: 'up' | 'down') => {
    setPreferences((prev) => {
      const order = prev.widgetOrder.length > 0 ? [...prev.widgetOrder] : [...WIDGET_IDS];
      const idx = order.indexOf(widgetId);
      if (idx === -1) return prev;

      const newIdx = direction === 'up' ? idx - 1 : idx + 1;
      if (newIdx < 0 || newIdx >= order.length) return prev;

      [order[idx], order[newIdx]] = [order[newIdx], order[idx]];
      return { ...prev, widgetOrder: order };
    });
  };

  const savePreferences = async () => {
    setSaving(true);
    await csrfFetch('/api/admin/dashboard/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(preferences)
    });
    setSaving(false);
    setIsCustomizing(false);
  };

  const resetPreferences = () => {
    setPreferences({ widgetOrder: [], hiddenWidgets: [] });
  };

  if (error) return <p className="error">{error}</p>;
  if (!data || !metrics) return <p>Loading dashboard...</p>;

  const renderWidget = (widgetId: WidgetId) => {
    switch (widgetId) {
      case 'kpi':
        return <KpiWidget key="kpi" data={data} metrics={metrics} />;
      case 'checklist':
        return <ChecklistWidget key="checklist" data={data} />;
      case 'quick-actions':
        return <QuickActionsWidget key="quick-actions" user={user} />;
      case 'scheduled':
        return (
          <section key="scheduled" className="admin-grid-2">
            <ScheduledWidget data={data} />
            <AnalyticsWidget data={data} />
          </section>
        );
      case 'analytics':
        return null;
      case 'health':
        return <HealthWidget key="health" data={data} />;
      case 'audit':
        return <AuditWidget key="audit" data={data} />;
      default:
        return null;
    }
  };

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Dashboard</h2>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => setIsCustomizing(!isCustomizing)}>
            {isCustomizing ? 'Done customizing' : 'Customize dashboard'}
          </button>
        </div>
      </section>

      {isCustomizing && (
        <section className="admin-card">
          <div className="admin-inline-header">
            <h3>Customize Widgets</h3>
          </div>
          <div className="admin-widget-settings">
            <div className="admin-widget-list">
              {(preferences.widgetOrder.length > 0 ? preferences.widgetOrder : [...WIDGET_IDS]).map((widgetId) => {
                const id = widgetId as WidgetId;
                const isHidden = preferences.hiddenWidgets.includes(id);
                return (
                  <div key={id} className="admin-widget-item">
                    <span className={`admin-widget-name ${isHidden ? 'hidden' : ''}`}>
                      {widgetLabels[id]}
                      {isHidden && ' (hidden)'}
                    </span>
                    <div className="admin-widget-controls">
                      <button
                        type="button"
                        onClick={() => moveWidget(id, 'up')}
                        disabled={preferences.widgetOrder.indexOf(id) === 0}
                        title="Move up"
                      >
                        ↑
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWidget(id, 'down')}
                        disabled={preferences.widgetOrder.indexOf(id) === WIDGET_IDS.length - 1}
                        title="Move down"
                      >
                        ↓
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWidget(id)}
                        className={isHidden ? 'admin-btn-show' : 'admin-btn-hide'}
                      >
                        {isHidden ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="admin-widget-actions">
              <button type="button" onClick={() => void savePreferences()} disabled={saving}>
                {saving ? 'Saving...' : 'Save preferences'}
              </button>
              <button type="button" onClick={resetPreferences} className="v2-btn v2-btn-secondary">
                Reset to default
              </button>
            </div>
          </div>
        </section>
      )}

      {orderedWidgets.map(renderWidget)}
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard" description="Content operations, onboarding, analytics, and publishing control center.">
      {(user) => <DashboardPanel user={user} />}
    </AdminShell>
  );
}
