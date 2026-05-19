'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

type AnalyticsSummary = {
  available: boolean;
  days: number;
  excludeInternal: boolean;
  totals: {
    pageViews: number;
    uniqueVisitors: number;
    ctaClicks: number;
    contactLeads: number;
    internalViews: number;
  };
  insights: {
    conversionRate: number;
    avgPagesPerSession: number;
  };
  topPaths: Array<{ path: string; entityType: string; entityId: string | null; views: number; visitors: number }>;
  topConversions: Array<{ eventType: string; label: string; path: string; count: number }>;
  referrers: Array<{ referrer: string; views: number }>;
  campaigns: Array<{ label: string; views: number }>;
  devices: Array<{ deviceType: string; count: number }>;
  browsers: Array<{ browser: string; count: number }>;
  daily: Array<{ date: string; views: number; visitors: number }>;
};

const PERIODS = [
  { label: '7d', value: 7 },
  { label: '14d', value: 14 },
  { label: '30d', value: 30 },
  { label: '60d', value: 60 },
  { label: '90d', value: 90 }
] as const;

function DailyTrendChart({ daily }: { daily: Array<{ date: string; views: number; visitors: number }> }) {
  if (daily.length < 2) {
    return <p className="admin-subtle" style={{ textAlign: 'center', padding: '2rem 0', fontSize: 13 }}>Not enough data for this period yet.</p>;
  }

  const W = 600;
  const H = 100;
  const PAD = 6;
  const n = daily.length;
  const maxVal = Math.max(...daily.map((d) => d.views), 1);

  const xAt = (i: number) => PAD + (i / (n - 1)) * (W - PAD * 2);
  const yAt = (v: number) => H - PAD - (v / maxVal) * (H - PAD * 2);

  const viewsPoints = daily.map((d, i) => `${xAt(i)},${yAt(d.views)}`).join(' ');
  const visitorsPoints = daily.map((d, i) => `${xAt(i)},${yAt(d.visitors)}`).join(' ');

  const gridPcts = [0.25, 0.5, 0.75, 1.0];

  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : n <= 30 ? 5 : 10;
  const labelDates = daily.filter((_, i) => i === 0 || i === n - 1 || i % labelEvery === 0);

  return (
    <div>
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', height: 120, display: 'block' }}>
        {gridPcts.map((p) => {
          const y = H - PAD - p * (H - PAD * 2);
          return <line key={p} x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e5e7eb" strokeWidth="0.5" />;
        })}
        <polyline fill="none" stroke="#6366f1" strokeWidth="2" strokeLinejoin="round" points={viewsPoints} />
        <polyline fill="none" stroke="#10b981" strokeWidth="1.5" strokeLinejoin="round" strokeDasharray="4 3" points={visitorsPoints} />
        {labelDates.map((d) => {
          const i = daily.indexOf(d);
          return (
            <text key={d.date} x={xAt(i)} y={H - 1} textAnchor="middle" fontSize="7" fill="#9ca3af">
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>
      <div style={{ display: 'flex', gap: 20, marginTop: 8, fontSize: 12, color: '#6b7280' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="2" style={{ display: 'inline' }}>
            <line x1="0" y1="1" x2="16" y2="1" stroke="#6366f1" strokeWidth="2" />
          </svg>
          Page views
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <svg width="16" height="2" style={{ display: 'inline' }}>
            <line x1="0" y1="1" x2="16" y2="1" stroke="#10b981" strokeWidth="1.5" strokeDasharray="4 3" />
          </svg>
          Unique visitors
        </span>
      </div>
    </div>
  );
}

function BreakdownBars({ items, totalLabel }: { items: Array<{ label: string; count: number }>; totalLabel: string }) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (items.length === 0) return <p className="admin-subtle" style={{ fontSize: 13 }}>No {totalLabel} data yet.</p>;
  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <li key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span>{item.label}</span>
              <span className="admin-subtle">{pct}% &middot; {item.count.toLocaleString()}</span>
            </div>
            <div style={{ height: 5, borderRadius: 3, background: '#e5e7eb' }}>
              <div style={{ height: 5, borderRadius: 3, width: `${pct}%`, background: '#6366f1', minWidth: pct > 0 ? 4 : 0 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function InsightBadge({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
      <p className="admin-kpi-label">{label}</p>
      <p className="admin-kpi-value">{value}</p>
      {sub ? <p className="admin-subtle" style={{ fontSize: 12, marginTop: 2 }}>{sub}</p> : null}
    </article>
  );
}

type AnalyticsPagePanelProps = {
  user: AdminSessionUser;
};

function AnalyticsPagePanel({ user }: AnalyticsPagePanelProps) {
  const [days, setDays] = useState(30);
  const [excludeInternal, setExcludeInternal] = useState(true);
  const [data, setData] = useState<AnalyticsSummary | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const canViewAnalytics = user.permissions.includes('analytics:view');

  useEffect(() => {
    if (!canViewAnalytics) return;
    setLoading(true);
    setError('');
    fetch(`/api/admin/analytics/summary?days=${days}&excludeInternal=${excludeInternal}`)
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to load analytics.');
        setData((await res.json()) as AnalyticsSummary);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load analytics.');
      })
      .finally(() => setLoading(false));
  }, [canViewAnalytics, days, excludeInternal]);

  if (!canViewAnalytics) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include access to analytics reporting.</p>
      </section>
    );
  }

  if (error) return <p className="error">{error}</p>;

  if (!data && loading) return <p>Loading analytics&hellip;</p>;

  if (data && !data.available) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Analytics is available when the CMS is running in database mode.</p>
      </section>
    );
  }

  return (
    <div className="admin-form-wrap">
      {/* Filter bar */}
      <section style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap', marginBottom: 8 }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {PERIODS.map((p) => (
            <button
              key={p.value}
              onClick={() => setDays(p.value)}
              style={{
                padding: '4px 12px',
                borderRadius: 6,
                fontSize: 13,
                fontWeight: days === p.value ? 600 : 400,
                border: '1px solid',
                borderColor: days === p.value ? '#6366f1' : '#d1d5db',
                background: days === p.value ? '#6366f1' : 'transparent',
                color: days === p.value ? '#fff' : 'inherit',
                cursor: 'pointer'
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer', userSelect: 'none' }}>
          <input
            type="checkbox"
            checked={excludeInternal}
            onChange={(e) => setExcludeInternal(e.target.checked)}
            style={{ cursor: 'pointer' }}
          />
          Exclude own visits
          {data && data.totals.internalViews > 0 ? (
            <span className="admin-subtle" style={{ fontSize: 12 }}>({data.totals.internalViews.toLocaleString()} filtered)</span>
          ) : null}
        </label>
        {loading && data ? <span className="admin-subtle" style={{ fontSize: 12 }}>Refreshing&hellip;</span> : null}
      </section>

      {data ? (
        <>
          {/* KPI + insights grid */}
          <section className="admin-kpi-grid">
            <InsightBadge label={`Page views (${days}d)`} value={data.totals.pageViews.toLocaleString()} />
            <InsightBadge label={`Unique visitors (${days}d)`} value={data.totals.uniqueVisitors.toLocaleString()} />
            <InsightBadge label={`CTA clicks (${days}d)`} value={data.totals.ctaClicks.toLocaleString()} />
            <InsightBadge label={`Contact leads (${days}d)`} value={data.totals.contactLeads.toLocaleString()} />
            <InsightBadge
              label="Conversion rate"
              value={`${data.insights.conversionRate}%`}
              sub="(CTA + leads) / page views"
            />
            <InsightBadge
              label="Pages / session"
              value={data.insights.avgPagesPerSession.toString()}
              sub="avg page views per session"
            />
          </section>

          {/* Daily trend chart */}
          <section className="admin-card">
            <div className="admin-inline-header">
              <h2>Daily trend</h2>
            </div>
            <DailyTrendChart daily={data.daily} />
          </section>

          {/* Top content paths */}
          <section className="admin-card">
            <div className="admin-inline-header">
              <h2>Top pages</h2>
            </div>
            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Path</th>
                    <th>Type</th>
                    <th>Views</th>
                    <th>Visitors</th>
                    <th style={{ width: 120 }}>Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPaths.map((item) => {
                    const sharePct = data.totals.pageViews > 0 ? Math.round((item.views / data.totals.pageViews) * 100) : 0;
                    return (
                      <tr key={`${item.entityType}-${item.entityId ?? item.path}`}>
                        <td>{item.path}</td>
                        <td>{item.entityType}</td>
                        <td>{item.views.toLocaleString()}</td>
                        <td>{item.visitors.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                            <div style={{ flex: 1, height: 5, borderRadius: 3, background: '#e5e7eb' }}>
                              <div style={{ width: `${sharePct}%`, height: 5, borderRadius: 3, background: '#6366f1', minWidth: sharePct > 0 ? 3 : 0 }} />
                            </div>
                            <span className="admin-subtle" style={{ fontSize: 11, minWidth: 28 }}>{sharePct}%</span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {data.topPaths.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="admin-subtle">No tracked visits yet.</td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          {/* Conversions + Referrers */}
          <section className="admin-grid-2">
            <article className="admin-card">
              <h2>Top conversions</h2>
              <ul className="admin-plain-list">
                {data.topConversions.map((item) => (
                  <li key={`${item.eventType}-${item.label}-${item.path}`}>
                    <strong>{item.label}</strong>
                    <span>{item.eventType} &middot; {item.path}</span>
                    <span>{item.count.toLocaleString()} conversions</span>
                  </li>
                ))}
                {data.topConversions.length === 0 ? <li className="admin-subtle">No conversion events yet.</li> : null}
              </ul>
            </article>
            <article className="admin-card">
              <h2>Referrers</h2>
              <ul className="admin-plain-list">
                {data.referrers.map((item) => (
                  <li key={item.referrer}>
                    <strong>{item.referrer}</strong>
                    <span>{item.views.toLocaleString()} views</span>
                  </li>
                ))}
                {data.referrers.length === 0 ? <li className="admin-subtle">No referrers yet.</li> : null}
              </ul>
            </article>
          </section>

          {/* Device + Browser breakdown */}
          <section className="admin-grid-2">
            <article className="admin-card">
              <h2>Devices</h2>
              <BreakdownBars
                items={data.devices.map((d) => ({ label: d.deviceType.charAt(0).toUpperCase() + d.deviceType.slice(1), count: d.count }))}
                totalLabel="device"
              />
            </article>
            <article className="admin-card">
              <h2>Browsers</h2>
              <BreakdownBars
                items={data.browsers.map((b) => ({ label: b.browser, count: b.count }))}
                totalLabel="browser"
              />
            </article>
          </section>

          {/* Campaigns */}
          {data.campaigns.some((c) => c.label !== 'none') ? (
            <section className="admin-card">
              <h2>Campaigns</h2>
              <ul className="admin-plain-list">
                {data.campaigns.filter((c) => c.label !== 'none').map((item) => (
                  <li key={item.label}>
                    <strong>{item.label}</strong>
                    <span>{item.views.toLocaleString()} views</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </>
      ) : null}
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
