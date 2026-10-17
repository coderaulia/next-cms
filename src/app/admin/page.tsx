'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  ArrowDown,
  ArrowRight,
  ArrowUp,
  ArrowUpRight,
  BarChart3,
  Briefcase,
  CalendarCheck,
  CalendarClock,
  CheckCircle2,
  CheckSquare,
  Circle,
  Clock,
  Eye,
  EyeOff,
  Files,
  FileText,
  HeartPulse,
  History,
  Image,
  Inbox,
  RotateCcw,
  Save,
  Settings,
  Shield,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Tags,
  TrendingUp,
  Users
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { DashboardSummary } from '@/features/cms/dashboardSummary';
import {
  getBlogPostPublicationLabel,
  getLandingPagePublicationLabel,
  getPortfolioProjectPublicationLabel
} from '@/features/cms/publicationState';
import { formatAdminRoleLabel } from '@/features/cms/adminPermissions';
import type { AdminPermission } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

type DashboardPanelProps = {
  user: AdminSessionUser;
  isCustomizing: boolean;
  setIsCustomizing: React.Dispatch<React.SetStateAction<boolean>>;
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
  {
    href: '/admin/pages',
    label: 'Landing Pages',
    desc: 'Core marketing pages & layout blocks',
    icon: Files,
    permission: 'content:edit'
  },
  {
    href: '/admin/blog',
    label: 'Blog Posts',
    desc: 'Articles, drafts, scheduling & SEO',
    icon: FileText,
    permission: 'content:edit'
  },
  {
    href: '/admin/portfolio',
    label: 'Portfolio',
    desc: 'Case studies, galleries & showcase',
    icon: Briefcase,
    permission: 'content:edit'
  },
  {
    href: '/admin/categories',
    label: 'Categories',
    desc: 'Taxonomies, filters & topics',
    icon: Tags,
    permission: 'taxonomy:edit'
  },
  {
    href: '/admin/contact-submissions',
    label: 'Review Leads',
    desc: 'Inquiries & form submissions',
    icon: Inbox
  },
  {
    href: '/admin/media',
    label: 'Media Library',
    desc: 'Images, assets & CDN management',
    icon: Image,
    permission: 'media:edit'
  },
  {
    href: '/admin/team',
    label: 'Manage Team',
    desc: 'User accounts & permission roles',
    icon: Users,
    permission: 'team:manage'
  },
  {
    href: '/admin/analytics',
    label: 'Analytics',
    desc: 'Traffic, funnel & conversion metrics',
    icon: BarChart3,
    permission: 'analytics:view'
  },
  {
    href: '/admin/audit',
    label: 'Audit Log',
    desc: 'Security trails & admin change history',
    icon: ShieldCheck,
    permission: 'audit:view'
  },
  {
    href: '/admin/settings',
    label: 'Site Settings',
    desc: 'Branding, discussion & SEO defaults',
    icon: Settings,
    permission: 'settings:edit'
  }
] satisfies Array<{ href: string; label: string; desc: string; icon: unknown; permission?: AdminPermission }>;

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

  const totalPages = data.pages.length || 1;
  const pagesPct = Math.round((metrics.publishedPages / totalPages) * 100);

  const totalPosts = data.blogPosts.length || 1;
  const postsPct = Math.round((metrics.publishedPosts / totalPosts) * 100);

  const totalProjects = data.portfolioProjects.length || 1;
  const portfolioPct = Math.round((metrics.publishedPortfolio / totalProjects) * 100);

  return (
    <section className="admin-kpi-grid">
      {/* 1. Landing Pages */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#eff6ff',
                color: '#2563eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Files size={18} />
            </div>
            <p className="admin-kpi-label">Landing Pages</p>
          </div>
          <span className={metrics.scheduledPages > 0 ? 'admin-chip admin-chip-warning' : 'admin-chip admin-chip-success'} style={{ fontSize: '0.72rem' }}>
            {metrics.scheduledPages > 0 ? `${metrics.scheduledPages} scheduled` : 'Live'}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {metrics.publishedPages} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>/ {data.pages.length}</span>
          </p>
        </div>
        <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${pagesPct}%`, height: '100%', background: '#2563eb', borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/pages" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            Manage pages <ArrowRight size={13} />
          </Link>
        </div>
      </article>

      {/* 2. Blog Posts */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#ecfdf5',
                color: '#059669',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileText size={18} />
            </div>
            <p className="admin-kpi-label">Blog Posts</p>
          </div>
          <span className={metrics.scheduledPosts > 0 ? 'admin-chip admin-chip-warning' : 'admin-chip admin-chip-success'} style={{ fontSize: '0.72rem' }}>
            {metrics.scheduledPosts > 0 ? `${metrics.scheduledPosts} scheduled` : `${data.blogPosts.length} total`}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {metrics.publishedPosts} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>published</span>
          </p>
        </div>
        <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${postsPct}%`, height: '100%', background: '#059669', borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/blog" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            Manage posts <ArrowRight size={13} />
          </Link>
        </div>
      </article>

      {/* 3. Portfolio Projects */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#f5f3ff',
                color: '#7c3aed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Briefcase size={18} />
            </div>
            <p className="admin-kpi-label">Portfolio</p>
          </div>
          <span className={metrics.scheduledPortfolio > 0 ? 'admin-chip admin-chip-warning' : 'admin-chip admin-chip-success'} style={{ fontSize: '0.72rem' }}>
            {metrics.scheduledPortfolio > 0 ? `${metrics.scheduledPortfolio} scheduled` : `${data.portfolioProjects.length} total`}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {metrics.publishedPortfolio} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>published</span>
          </p>
        </div>
        <div style={{ height: 5, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden' }}>
          <div style={{ width: `${portfolioPct}%`, height: '100%', background: '#7c3aed', borderRadius: 999 }} />
        </div>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/portfolio" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            Manage portfolio <ArrowRight size={13} />
          </Link>
        </div>
      </article>

      {/* 4. Scheduled Queue */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#fffbeb',
                color: '#d97706',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Clock size={18} />
            </div>
            <p className="admin-kpi-label">Scheduled Queue</p>
          </div>
          <span className={data.scheduled.length > 0 ? 'admin-chip admin-chip-warning' : 'admin-chip admin-chip-muted'} style={{ fontSize: '0.72rem' }}>
            {data.scheduled.length > 0 ? 'Active queue' : 'Clear'}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {data.scheduled.length} <span style={{ fontSize: '0.9rem', color: '#64748b', fontWeight: 500 }}>items queued</span>
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
          {data.scheduled.length > 0
            ? `Next release: ${data.scheduled[0]?.title.slice(0, 24)}...`
            : 'No automated publishing jobs pending'}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/pages" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            View queue <ArrowRight size={13} />
          </Link>
        </div>
      </article>

      {/* 5. Content Health */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: data.health.errors > 0 ? '#fee2e2' : '#f0fdf4',
                color: data.health.errors > 0 ? '#dc2626' : '#16a34a',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              {data.health.errors > 0 ? <HeartPulse size={18} /> : <CheckCircle2 size={18} />}
            </div>
            <p className="admin-kpi-label">Content Health</p>
          </div>
          <span
            className={
              data.health.errors > 0
                ? 'admin-chip admin-chip-danger'
                : data.health.warnings > 0
                  ? 'admin-chip admin-chip-warning'
                  : 'admin-chip admin-chip-success'
            }
            style={{ fontSize: '0.72rem' }}
          >
            {data.health.errors > 0 ? `${data.health.errors} errors` : data.health.warnings > 0 ? `${data.health.warnings} warnings` : 'Healthy'}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {data.health.errors === 0 && data.health.warnings === 0 ? '100%' : `${data.health.items.length} issues`}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
          {data.health.errors === 0 && data.health.warnings === 0
            ? 'All assets and links validated'
            : `${data.health.errors} critical errors, ${data.health.warnings} warnings`}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/audit" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            Audit health <ArrowRight size={13} />
          </Link>
        </div>
      </article>

      {/* 6. Analytics Traffic */}
      <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: 32,
                height: 32,
                borderRadius: 8,
                background: '#e0e7ff',
                color: '#4338ca',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Sparkles size={18} />
            </div>
            <p className="admin-kpi-label">30d Page Views</p>
          </div>
          <span className="admin-chip admin-chip-success" style={{ fontSize: '0.72rem' }}>
            {data.analytics.available ? 'Tracked' : 'Live Mode'}
          </span>
        </div>
        <div>
          <p className="admin-kpi-value" style={{ margin: 0 }}>
            {data.analytics.available ? data.analytics.totals.pageViews.toLocaleString() : 'Ready'}
          </p>
        </div>
        <p style={{ margin: 0, fontSize: '0.78rem', color: '#64748b' }}>
          {data.analytics.available
            ? `${data.analytics.totals.uniqueVisitors.toLocaleString()} unique visitors recorded`
            : 'Automatic analytics reporting'}
        </p>
        <div style={{ marginTop: 'auto', paddingTop: 4 }}>
          <Link href="/admin/analytics" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
            Full analytics <ArrowRight size={13} />
          </Link>
        </div>
      </article>
    </section>
  );
}

function ChecklistWidget({ data }: { data: DashboardSummary }) {
  const completedCount = data.checklist.filter((item) => item.done).length;
  const totalCount = data.checklist.length;
  const pct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <section className="admin-card">
      <div className="admin-inline-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#f0fdf4',
              color: '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CheckSquare size={18} />
          </div>
          <h2 style={{ margin: 0 }}>First-run checklist</h2>
        </div>
        <span className="admin-chip admin-chip-muted" style={{ fontWeight: 600 }}>
          {completedCount}/{totalCount} complete ({pct}%)
        </span>
      </div>

      {/* Visual progress bar */}
      <div style={{ height: 8, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden', marginBottom: 16 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: 999,
            transition: 'width 0.4s ease'
          }}
        />
      </div>

      <ul className="admin-plain-list">
        {data.checklist.map((item) => (
          <li
            key={item.id}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '12px 14px',
              borderRadius: 14,
              border: item.done ? '1px solid #d1fae5' : '1px solid #e2e8f0',
              background: item.done ? '#fafffd' : '#fff'
            }}
          >
            <div style={{ marginTop: 2, flexShrink: 0 }}>
              {item.done ? (
                <CheckCircle2 size={18} color="#10b981" />
              ) : (
                <Circle size={18} color="#94a3b8" />
              )}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <strong style={{ fontSize: '0.92rem', color: item.done ? '#1e293b' : '#0f172a' }}>
                  {item.label}
                </strong>
                <span className={`admin-chip ${item.done ? 'admin-chip-success' : 'admin-chip-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {item.done ? 'Done' : 'Pending'}
                </span>
              </div>
              <span className="admin-subtle" style={{ fontSize: '0.82rem', marginTop: 4, display: 'block' }}>
                {item.detail}
              </span>
            </div>
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
      <div className="admin-inline-header" style={{ marginBottom: 14 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Sparkles size={18} />
          </div>
          <h2 style={{ margin: 0 }}>Quick actions</h2>
        </div>
        <span className="admin-subtle" style={{ fontSize: '0.82rem' }}>
          {allowedQuickActions.length} shortcuts available
        </span>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(210px, 1fr))',
          gap: 12
        }}
      >
        {allowedQuickActions.map((item) => {
          const IconComponent = item.icon as React.ComponentType<{ size?: number; className?: string }>;
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 8,
                padding: '14px',
                borderRadius: 14,
                border: '1px solid #d8e2f1',
                background: '#fbfdff',
                textDecoration: 'none',
                color: 'inherit',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#2563eb';
                e.currentTarget.style.background = '#f0f6ff';
                e.currentTarget.style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#d8e2f1';
                e.currentTarget.style.background = '#fbfdff';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div
                  style={{
                    width: 32,
                    height: 32,
                    borderRadius: 8,
                    background: '#e0e7ff',
                    color: '#3730a3',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <IconComponent size={16} />
                </div>
                <ArrowUpRight size={15} color="#94a3b8" />
              </div>
              <div>
                <strong style={{ display: 'block', fontSize: '0.9rem', color: '#0f2240' }}>{item.label}</strong>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: 2 }}>{item.desc}</span>
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}

function ScheduledWidget({ data }: { data: DashboardSummary }) {
  return (
    <article className="admin-card">
      <div className="admin-inline-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#fffbeb',
              color: '#d97706',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <CalendarClock size={18} />
          </div>
          <h2 style={{ margin: 0 }}>Scheduled publishing</h2>
        </div>
        <span className="admin-chip admin-chip-muted">{data.scheduled.length} items</span>
      </div>

      <ul className="admin-plain-list">
        {data.scheduled.slice(0, 8).map((item) => (
          <li key={`${item.type}-${item.id}`} style={{ padding: '12px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: '0.9rem', color: '#0f2240' }}>{item.title}</strong>
              <span className="admin-chip admin-chip-warning" style={{ fontSize: '0.7rem' }}>
                {item.statusLabel}
              </span>
            </div>
            <span className="admin-subtle" style={{ fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
              {item.path}
              {item.publishAt ? ` · publish: ${new Date(item.publishAt).toLocaleString()}` : ''}
              {item.unpublishAt ? ` · unpublish: ${new Date(item.unpublishAt).toLocaleString()}` : ''}
            </span>
          </li>
        ))}
        {data.scheduled.length === 0 ? (
          <li style={{ textAlign: 'center', padding: '24px 16px', background: '#fafbfc' }}>
            <CalendarCheck size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>No scheduled content</p>
            <span className="admin-subtle" style={{ fontSize: '0.8rem' }}>Posts and pages set with future publication dates will appear here.</span>
          </li>
        ) : null}
      </ul>
    </article>
  );
}

function AnalyticsWidget({ data }: { data: DashboardSummary }) {
  return (
    <article className="admin-card">
      <div className="admin-inline-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#e0e7ff',
              color: '#4338ca',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <TrendingUp size={18} />
          </div>
          <h2 style={{ margin: 0 }}>Analytics snapshot</h2>
        </div>
        <Link href="/admin/analytics" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          Full report <ArrowRight size={13} />
        </Link>
      </div>

      {data.analytics.available ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {/* Quick numbers */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Page views (30d)</span>
              <p style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#4338ca' }}>
                {data.analytics.totals.pageViews.toLocaleString()}
              </p>
            </div>
            <div style={{ padding: '12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
              <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Unique visitors (30d)</span>
              <p style={{ margin: '4px 0 0', fontSize: '1.4rem', fontWeight: 700, color: '#059669' }}>
                {data.analytics.totals.uniqueVisitors.toLocaleString()}
              </p>
            </div>
          </div>

          {/* Top paths */}
          <div>
            <span style={{ fontSize: '0.78rem', fontWeight: 700, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Top Viewed Content
            </span>
            <ul className="admin-plain-list" style={{ marginTop: 8 }}>
              {data.analytics.topPaths.slice(0, 3).map((item) => (
                <li key={`${item.entityType}-${item.path}`} style={{ padding: '8px 12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <strong style={{ fontSize: '0.85rem' }}>{item.path}</strong>
                    <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.7rem' }}>
                      {item.views.toLocaleString()} views
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: '#fafbfc', borderRadius: 14 }}>
          <TrendingUp size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
          <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>Database analytics active</p>
          <span className="admin-subtle" style={{ fontSize: '0.8rem' }}>Full visitor insights and conversion tracking become available as traffic arrives.</span>
        </div>
      )}
    </article>
  );
}

function HealthWidget({ data }: { data: DashboardSummary }) {
  return (
    <section className="admin-card">
      <div className="admin-inline-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: data.health.errors > 0 ? '#fee2e2' : '#f0fdf4',
              color: data.health.errors > 0 ? '#dc2626' : '#16a34a',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <HeartPulse size={18} />
          </div>
          <h2 style={{ margin: 0 }}>Content health</h2>
        </div>
        <span className={data.health.errors > 0 ? 'admin-chip admin-chip-danger' : 'admin-chip admin-chip-muted'}>
          {data.health.errors} errors / {data.health.warnings} warnings
        </span>
      </div>

      {data.health.items.length > 0 ? (
        <ul className="admin-plain-list">
          {data.health.items.slice(0, 8).map((item) => (
            <li key={item.id} style={{ padding: '12px 14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {item.severity === 'error' ? (
                    <AlertCircle size={16} color="#dc2626" />
                  ) : (
                    <AlertTriangle size={16} color="#d97706" />
                  )}
                  <strong style={{ fontSize: '0.9rem', color: '#0f2240' }}>{item.label}</strong>
                </div>
                <span className={`admin-chip ${item.severity === 'error' ? 'admin-chip-danger' : 'admin-chip-warning'}`} style={{ fontSize: '0.7rem' }}>
                  {item.severity}
                </span>
              </div>
              <span className="admin-subtle" style={{ fontSize: '0.82rem', marginTop: 4, display: 'block' }}>
                {item.detail}
              </span>
              <div style={{ marginTop: 8 }}>
                <Link href={item.href} className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.82rem' }}>
                  Open fix <ArrowRight size={13} />
                </Link>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div style={{ textAlign: 'center', padding: '24px 16px', background: '#fafbfc', borderRadius: 14 }}>
          <CheckCircle2 size={28} color="#16a34a" style={{ margin: '0 auto 8px', display: 'block' }} />
          <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>All content is healthy</p>
          <span className="admin-subtle" style={{ fontSize: '0.8rem' }}>No broken links, missing SEO titles, or unoptimized media detected in CMS data.</span>
        </div>
      )}
    </section>
  );
}

function AuditWidget({ data }: { data: DashboardSummary }) {
  return (
    <section className="admin-card">
      <div className="admin-inline-header" style={{ marginBottom: 12 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 8,
              background: '#eff6ff',
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <History size={18} />
          </div>
          <h2 style={{ margin: 0 }}>Recent audit activity</h2>
        </div>
        <Link href="/admin/audit" className="admin-link-btn" style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          View all <ArrowRight size={13} />
        </Link>
      </div>

      <ul className="admin-plain-list">
        {data.auditLogs.map((entry) => (
          <li key={entry.id} style={{ padding: '10px 14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Shield size={15} color="#475569" />
                <strong style={{ fontSize: '0.88rem', color: '#0f2240' }}>{entry.action}</strong>
              </div>
              <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.7rem' }}>
                {entry.entityType}
              </span>
            </div>
            <span className="admin-subtle" style={{ fontSize: '0.78rem', display: 'block', marginTop: 4 }}>
              {new Date(entry.createdAt).toLocaleString()} &middot; IP: {entry.ip}
            </span>
          </li>
        ))}
        {data.auditLogs.length === 0 ? (
          <li style={{ textAlign: 'center', padding: '24px 16px', background: '#fafbfc' }}>
            <ShieldCheck size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
            <p style={{ margin: 0, fontWeight: 600, color: '#334155', fontSize: '0.88rem' }}>No audit events recorded</p>
            <span className="admin-subtle" style={{ fontSize: '0.8rem' }}>Administrative modifications and security events will appear here.</span>
          </li>
        ) : null}
      </ul>
    </section>
  );
}

function DashboardPanel({ user, isCustomizing, setIsCustomizing }: DashboardPanelProps) {
  const [data, setData] = useState<DashboardSummary | null>(null);
  const [error, setError] = useState('');
  const [preferences, setPreferences] = useState<DashboardPreferences>({ widgetOrder: [], hiddenWidgets: [] });
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
  if (!data || !metrics) return <AdminLoading label="Loading command center dashboard..." />;

  const userInitials = (user.displayName || user.email)
    .split(/\s+|@/)[0]
    .slice(0, 2)
    .toUpperCase();

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
      {/* Sleek top status bar replaces the duplicate h2 card */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap',
          padding: '12px 18px',
          background: 'linear-gradient(135deg, rgba(255,255,255,0.98), rgba(243,247,255,0.85))',
          border: '1px solid #d2dced',
          borderRadius: 18,
          boxShadow: '0 4px 14px rgba(17,37,65,0.04)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <div
            style={{
              width: 42,
              height: 42,
              borderRadius: 12,
              background: 'linear-gradient(135deg, #1e3a8a, #3b82f6)',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 700,
              fontSize: '1rem',
              boxShadow: '0 2px 8px rgba(30,58,138,0.25)'
            }}
          >
            {userInitials}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: '#0f2240' }}>
                Welcome, {user.displayName || user.email.split('@')[0]}
              </span>
              <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.72rem', textTransform: 'capitalize' }}>
                {formatAdminRoleLabel(user.role)}
              </span>
            </div>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#64748b' }}>
              Operational control center &middot; Real-time CMS publishing status
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button
            type="button"
            className={`v2-btn ${isCustomizing ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
            onClick={() => setIsCustomizing(!isCustomizing)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              padding: '8px 14px'
            }}
          >
            <SlidersHorizontal size={15} />
            <span>{isCustomizing ? 'Close layout editor' : 'Customize layout'}</span>
          </button>
        </div>
      </div>

      {isCustomizing && (
        <section className="admin-card" style={{ border: '2px solid #3b82f6', background: '#f8fbff' }}>
          <div className="admin-inline-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <SlidersHorizontal size={18} color="#2563eb" />
              <h3 style={{ margin: 0 }}>Customize Dashboard Widgets</h3>
            </div>
            <span className="admin-subtle" style={{ fontSize: '0.82rem' }}>
              Reorder or toggle visibility of widgets
            </span>
          </div>

          <div className="admin-widget-settings">
            <div className="admin-widget-list">
              {(preferences.widgetOrder.length > 0 ? preferences.widgetOrder : [...WIDGET_IDS]).map((widgetId) => {
                const id = widgetId as WidgetId;
                const isHidden = preferences.hiddenWidgets.includes(id);
                const orderList = preferences.widgetOrder.length > 0 ? preferences.widgetOrder : [...WIDGET_IDS];
                const currentIndex = orderList.indexOf(id);

                return (
                  <div key={id} className="admin-widget-item">
                    <span className={`admin-widget-name ${isHidden ? 'hidden' : ''}`} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      {isHidden ? <EyeOff size={15} color="#94a3b8" /> : <Eye size={15} color="#10b981" />}
                      <span>{widgetLabels[id]}</span>
                      {isHidden && <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.68rem' }}>Hidden</span>}
                    </span>
                    <div className="admin-widget-controls" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <button
                        type="button"
                        onClick={() => moveWidget(id, 'up')}
                        disabled={currentIndex <= 0}
                        title="Move widget up"
                        style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <ArrowUp size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => moveWidget(id, 'down')}
                        disabled={currentIndex >= orderList.length - 1}
                        title="Move widget down"
                        style={{ padding: '6px 10px', display: 'inline-flex', alignItems: 'center' }}
                      >
                        <ArrowDown size={14} />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleWidget(id)}
                        className={isHidden ? 'admin-btn-show' : 'admin-btn-hide'}
                        style={{ padding: '6px 12px', fontSize: '0.8rem' }}
                      >
                        {isHidden ? 'Show' : 'Hide'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="admin-widget-actions" style={{ display: 'flex', gap: 10, marginTop: 14 }}>
              <button
                type="button"
                onClick={() => void savePreferences()}
                disabled={saving}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <Save size={15} />
                <span>{saving ? 'Saving...' : 'Save layout'}</span>
              </button>
              <button
                type="button"
                onClick={resetPreferences}
                className="v2-btn v2-btn-secondary"
                style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
              >
                <RotateCcw size={15} />
                <span>Reset to default</span>
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
  const [isCustomizing, setIsCustomizing] = useState(false);

  return (
    <AdminShell
      title="Dashboard"
      description="Content operations, onboarding, analytics, and publishing control center."
      actions={
        <button
          type="button"
          className={`v2-btn ${isCustomizing ? 'v2-btn-primary' : 'v2-btn-secondary'}`}
          onClick={() => setIsCustomizing((prev) => !prev)}
          style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: '0.85rem' }}
        >
          <SlidersHorizontal size={15} />
          <span>{isCustomizing ? 'Done customizing' : 'Customize dashboard'}</span>
        </button>
      }
    >
      {(user) => (
        <DashboardPanel
          user={user}
          isCustomizing={isCustomizing}
          setIsCustomizing={setIsCustomizing}
        />
      )}
    </AdminShell>
  );
}
