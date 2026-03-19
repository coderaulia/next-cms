'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

type AnalyticsSummary = {
  available: boolean;
  totals: {
    pageViews30d: number;
    uniqueVisitors30d: number;
    pageViews7d: number;
    uniqueVisitors7d: number;
  };
  topPaths: Array<{ path: string; entityType: string; entityId: string | null; views: number; visitors: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  campaigns: Array<{ label: string; views: number }>;
  daily: Array<{ date: string; views: number; visitors: number }>;
};

type AnalyticsPagePanelProps = {
  user: AdminSessionUser;
};

function AnalyticsPagePanel({ user }: AnalyticsPagePanelProps) {
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [error, setError] = useState('');
  const canViewAnalytics = user.permissions.includes('analytics:view');

  useEffect(() => {
    if (!canViewAnalytics) {
      return;
    }

    fetch('/api/admin/analytics/summary')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load analytics.');
        }
        setData((await response.json()) as AnalyticsSummary);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      });
  }, [canViewAnalytics]);

  if (!canViewAnalytics) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include access to analytics reporting.</p>
      </section>
    );
  }
  if (error) return <p className="error">{error}</p>;
  if (!data) return <p>Loading analytics...</p>;

  if (!data.available) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Analytics is available when the CMS is running in database mode.</p>
      </section>
    );
  }

  return (
    <div className="admin-form-wrap">
      <section className="admin-kpi-grid">
        <article className="admin-card">
          <p className="admin-kpi-label">Page views (30d)</p>
          <p className="admin-kpi-value">{data.totals.pageViews30d}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">Unique visitors (30d)</p>
          <p className="admin-kpi-value">{data.totals.uniqueVisitors30d}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">Page views (7d)</p>
          <p className="admin-kpi-value">{data.totals.pageViews7d}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">Unique visitors (7d)</p>
          <p className="admin-kpi-value">{data.totals.uniqueVisitors7d}</p>
        </article>
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Top content paths</h2>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Path</th>
                <th>Type</th>
                <th>Views</th>
                <th>Visitors</th>
              </tr>
            </thead>
            <tbody>
              {data.topPaths.map((item) => (
                <tr key={`${item.entityType}-${item.entityId ?? item.path}`}>
                  <td>{item.path}</td>
                  <td>{item.entityType}</td>
                  <td>{item.views}</td>
                  <td>{item.visitors}</td>
                </tr>
              ))}
              {data.topPaths.length === 0 ? (
                <tr>
                  <td colSpan={4} className="admin-subtle">No tracked visits yet.</td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>

      <section className="admin-grid-2">
        <article className="admin-card">
          <h2>Referrers</h2>
          <ul className="admin-plain-list">
            {data.referrers.map((item) => (
              <li key={item.referrer}>
                <strong>{item.referrer}</strong>
                <span>{item.views} views</span>
              </li>
            ))}
            {data.referrers.length === 0 ? <li className="admin-subtle">No referrers yet.</li> : null}
          </ul>
        </article>
        <article className="admin-card">
          <h2>Campaigns</h2>
          <ul className="admin-plain-list">
            {data.campaigns.map((item) => (
              <li key={item.label}>
                <strong>{item.label}</strong>
                <span>{item.views} views</span>
              </li>
            ))}
            {data.campaigns.length === 0 ? <li className="admin-subtle">No campaign parameters yet.</li> : null}
          </ul>
        </article>
      </section>
    </div>
  );
}

export default function AdminAnalyticsPage() {
  return (
    <AdminShell title="Analytics" description="Visitor, referrer, and campaign reporting for marketing handoff.">
      {(user) => <AnalyticsPagePanel user={user} />}
    </AdminShell>
  );
}
