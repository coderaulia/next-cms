'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Calendar,
  Compass,
  ExternalLink,
  Eye,
  FileText,
  Filter,
  Globe,
  Inbox,
  Layers,
  Monitor,
  MousePointerClick,
  Percent,
  RefreshCw,
  Smartphone,
  Target,
  TrendingUp,
  Users
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { AdminLoading } from '@/components/admin/AdminLoading';

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
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  const W = 640;
  const H = 140;
  const PAD_X = 40;
  const PAD_TOP = 20;
  const PAD_BOTTOM = 24;
  const n = daily.length;

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<SVGSVGElement>) => {
      if (!svgRef.current || n < 2) return;
      const rect = svgRef.current.getBoundingClientRect();
      const relX = ((e.clientX - rect.left) / rect.width) * W;
      const chartX = relX - PAD_X;
      const chartW = W - PAD_X * 2;
      const idx = Math.round((chartX / chartW) * (n - 1));
      setHoveredIdx(Math.max(0, Math.min(n - 1, idx)));
    },
    [n]
  );

  if (daily.length < 2) {
    return (
      <div style={{ textAlign: 'center', padding: '2.5rem 0' }}>
        <TrendingUp size={28} color="#94a3b8" style={{ margin: '0 auto 8px', display: 'block' }} />
        <p className="admin-subtle" style={{ margin: 0, fontSize: 13 }}>Not enough daily trend data collected for this period yet.</p>
      </div>
    );
  }

  const maxVal = Math.max(...daily.map((d) => d.views), 1);
  const gridVals = [0, Math.round(maxVal * 0.33), Math.round(maxVal * 0.66), maxVal];

  const xAt = (i: number) => PAD_X + (i / (n - 1)) * (W - PAD_X * 2);
  const yAt = (v: number) => PAD_TOP + (1 - v / maxVal) * (H - PAD_TOP - PAD_BOTTOM);
  const yBase = H - PAD_BOTTOM;

  const viewsPoints = daily.map((d, i) => `${xAt(i)},${yAt(d.views)}`).join(' ');
  const visitorsPoints = daily.map((d, i) => `${xAt(i)},${yAt(d.visitors)}`).join(' ');

  // Gradient area polygons
  const viewsAreaPoints = `${xAt(0)},${yBase} ${viewsPoints} ${xAt(n - 1)},${yBase}`;
  const visitorsAreaPoints = `${xAt(0)},${yBase} ${visitorsPoints} ${xAt(n - 1)},${yBase}`;

  const peakIdx = daily.reduce((best, d, i) => (d.views > daily[best].views ? i : best), 0);
  const labelEvery = n <= 7 ? 1 : n <= 14 ? 2 : n <= 30 ? 5 : 10;
  const hovered = hoveredIdx !== null ? daily[hoveredIdx] : null;

  return (
    <div>
      <svg
        ref={svgRef}
        viewBox={`0 0 ${W} ${H}`}
        style={{ width: '100%', height: 170, display: 'block', cursor: 'crosshair', overflow: 'visible' }}
        onMouseMove={handleMouseMove}
        onMouseLeave={() => setHoveredIdx(null)}
      >
        <defs>
          <linearGradient id="viewsAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0.32" />
            <stop offset="75%" stopColor="#6366f1" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
          </linearGradient>
          <linearGradient id="visitorsAreaGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#10b981" stopOpacity="0.22" />
            <stop offset="75%" stopColor="#10b981" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        {/* Y-axis grid lines + labels */}
        {gridVals.map((v) => {
          const y = yAt(v);
          return (
            <g key={v}>
              <line x1={PAD_X} y1={y} x2={W - PAD_X} y2={y} stroke="#e2e8f0" strokeWidth="0.7" strokeDasharray="3 3" />
              <text x={PAD_X - 6} y={y + 3} textAnchor="end" fontSize="8" fill="#94a3b8" fontWeight="500">
                {v}
              </text>
            </g>
          );
        })}

        {/* Area Fills */}
        <polygon points={viewsAreaPoints} fill="url(#viewsAreaGradient)" />
        <polygon points={visitorsAreaPoints} fill="url(#visitorsAreaGradient)" />

        {/* Trend Lines */}
        <polyline
          fill="none"
          stroke="#6366f1"
          strokeWidth="2.4"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={viewsPoints}
        />
        <polyline
          fill="none"
          stroke="#10b981"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeDasharray="4 3"
          points={visitorsPoints}
        />

        {/* Peak label */}
        {hoveredIdx !== peakIdx && daily[peakIdx].views > 0 ? (
          <g>
            <rect
              x={xAt(peakIdx) - 18}
              y={yAt(daily[peakIdx].views) - 18}
              width={36}
              height={14}
              rx={4}
              fill="#e0e7ff"
            />
            <text
              x={xAt(peakIdx)}
              y={yAt(daily[peakIdx].views) - 8}
              textAnchor="middle"
              fontSize="8"
              fill="#4338ca"
              fontWeight="700"
            >
              {daily[peakIdx].views} peak
            </text>
          </g>
        ) : null}

        {/* Dots at each point */}
        {daily.map((d, i) => (
          <g key={d.date}>
            <circle
              cx={xAt(i)}
              cy={yAt(d.views)}
              r={hoveredIdx === i ? 5 : 2.5}
              fill="#6366f1"
              stroke="#fff"
              strokeWidth="1.5"
            />
            <circle
              cx={xAt(i)}
              cy={yAt(d.visitors)}
              r={hoveredIdx === i ? 4 : 2}
              fill="#10b981"
              stroke="#fff"
              strokeWidth="1.5"
            />
          </g>
        ))}

        {/* Hover crosshair & floating card */}
        {hoveredIdx !== null ? (
          <g>
            <line
              x1={xAt(hoveredIdx)}
              y1={PAD_TOP}
              x2={xAt(hoveredIdx)}
              y2={H - PAD_BOTTOM}
              stroke="#4f46e5"
              strokeWidth="1"
              strokeDasharray="3 2"
              opacity="0.75"
            />
            <circle cx={xAt(hoveredIdx)} cy={yAt(daily[hoveredIdx].views)} r={6} fill="#4f46e5" stroke="#fff" strokeWidth="2" />
            <circle cx={xAt(hoveredIdx)} cy={yAt(daily[hoveredIdx].visitors)} r={5} fill="#10b981" stroke="#fff" strokeWidth="2" />
          </g>
        ) : null}

        {/* X-axis date labels */}
        {daily.map((d, i) => {
          if (i !== 0 && i !== n - 1 && i % labelEvery !== 0) return null;
          return (
            <text key={d.date} x={xAt(i)} y={H - 6} textAnchor="middle" fontSize="8" fill="#94a3b8">
              {d.date.slice(5)}
            </text>
          );
        })}
      </svg>

      {/* Legend & Hover Details */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: 16,
          marginTop: 12,
          padding: '8px 12px',
          background: '#f8fafc',
          borderRadius: 10,
          border: '1px solid #e2e8f0',
          fontSize: 12,
          color: '#475569',
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <span style={{ width: 12, height: 3, background: '#6366f1', borderRadius: 2 }} />
            Page views
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontWeight: 500 }}>
            <span style={{ width: 12, height: 3, background: '#10b981', borderRadius: 2 }} />
            Unique visitors
          </span>
        </div>

        {hovered ? (
          <div style={{ fontWeight: 600, color: '#0f172a' }}>
            <span>{hovered.date}: </span>
            <span style={{ color: '#6366f1' }}>{hovered.views.toLocaleString()} views</span>
            <span style={{ color: '#94a3b8', margin: '0 6px' }}>&middot;</span>
            <span style={{ color: '#10b981' }}>{hovered.visitors.toLocaleString()} visitors</span>
          </div>
        ) : (
          <span className="admin-subtle" style={{ fontSize: 11 }}>Hover over chart nodes for granular day counts</span>
        )}
      </div>
    </div>
  );
}

function ConversionFunnelChart({ totals }: { totals: { pageViews: number; ctaClicks: number; contactLeads: number } }) {
  const steps = [
    { label: 'Total Page Views', value: totals.pageViews, color: '#6366f1', icon: Eye },
    { label: 'CTA Interactions', value: totals.ctaClicks, color: '#8b5cf6', icon: MousePointerClick },
    { label: 'Qualified Contact Leads', value: totals.contactLeads, color: '#10b981', icon: Inbox }
  ];
  const max = Math.max(totals.pageViews, 1);

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 14 }}>
      {steps.map((step, i) => {
        const pct = Math.round((step.value / max) * 100);
        const fromPrev = i > 0 && steps[i - 1].value > 0
          ? Math.round((step.value / steps[i - 1].value) * 100)
          : null;
        const Icon = step.icon;

        return (
          <li key={step.label} style={{ padding: '10px 12px', background: '#f8fafc', borderRadius: 12, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: 13, marginBottom: 8 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: 6,
                    background: `${step.color}15`,
                    color: step.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                  }}
                >
                  <Icon size={14} />
                </div>
                <span style={{ fontWeight: 600, color: '#1e293b' }}>{step.label}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {fromPrev !== null ? (
                  <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.68rem', padding: '0 6px' }}>
                    {fromPrev}% conversion
                  </span>
                ) : null}
                <span style={{ color: step.color, fontWeight: 700, fontSize: '0.95rem' }}>
                  {step.value.toLocaleString()}
                </span>
              </div>
            </div>
            <div style={{ height: 8, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <div
                style={{
                  height: '100%',
                  borderRadius: 999,
                  width: `${pct}%`,
                  background: step.color,
                  transition: 'width 0.4s ease',
                  minWidth: pct > 0 ? 6 : 0
                }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function ContentTypeMixChart({ topPaths }: { topPaths: Array<{ entityType: string; views: number }> }) {
  const typeMap = new Map<string, number>();
  for (const p of topPaths) {
    typeMap.set(p.entityType, (typeMap.get(p.entityType) ?? 0) + p.views);
  }
  const items = Array.from(typeMap.entries())
    .map(([type, views]) => ({ label: type, count: views }))
    .sort((a, b) => b.count - a.count);
  const total = items.reduce((s, i) => s + i.count, 0);
  const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

  if (items.length === 0) {
    return <p className="admin-subtle" style={{ fontSize: 13, textAlign: 'center', padding: '1.5rem 0' }}>No content category data recorded yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 12 }}>
      {items.map((item, i) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        const color = COLORS[i % COLORS.length];
        return (
          <li key={item.label} style={{ padding: '8px 10px', background: '#f8fafc', borderRadius: 10, border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 6 }}>
              <span style={{ textTransform: 'capitalize', fontWeight: 600, color: '#334155' }}>
                {item.label.replace(/_/g, ' ')}
              </span>
              <span style={{ fontSize: 12, color: '#64748b' }}>
                <strong style={{ color: '#0f172a' }}>{pct}%</strong> &middot; {item.count.toLocaleString()} views
              </span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: color, minWidth: pct > 0 ? 5 : 0 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function BreakdownBars({
  items,
  totalLabel,
  color = '#6366f1'
}: {
  items: Array<{ label: string; count: number }>;
  totalLabel: string;
  color?: string;
}) {
  const total = items.reduce((s, i) => s + i.count, 0);
  if (items.length === 0) {
    return <p className="admin-subtle" style={{ fontSize: 13, textAlign: 'center', padding: '1rem 0' }}>No {totalLabel} metrics captured yet.</p>;
  }

  return (
    <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
      {items.map((item) => {
        const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
        return (
          <li key={item.label}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4 }}>
              <span style={{ fontWeight: 500, color: '#334155' }}>{item.label}</span>
              <span className="admin-subtle" style={{ fontSize: 12 }}>{pct}% &middot; {item.count.toLocaleString()}</span>
            </div>
            <div style={{ height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
              <div style={{ height: '100%', borderRadius: 999, width: `${pct}%`, background: color, minWidth: pct > 0 ? 5 : 0 }} />
            </div>
          </li>
        );
      })}
    </ul>
  );
}

function InsightBadge({
  label,
  value,
  sub,
  icon: Icon,
  iconBg,
  iconColor
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ComponentType<{ size?: number }>;
  iconBg: string;
  iconColor: string;
}) {
  return (
    <article className="admin-card" style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p className="admin-kpi-label">{label}</p>
        <div
          style={{
            width: 32,
            height: 32,
            borderRadius: 8,
            background: iconBg,
            color: iconColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={16} />
        </div>
      </div>
      <p className="admin-kpi-value" style={{ margin: 0 }}>{value}</p>
      {sub ? (
        <p className="admin-subtle" style={{ fontSize: '0.78rem', margin: 0, marginTop: 'auto' }}>
          {sub}
        </p>
      ) : null}
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

  if (!data && loading) return <AdminLoading label="Loading analytics reporting..." />;

  if (data && !data.available) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Analytics is available when the CMS is running in database mode.</p>
      </section>
    );
  }

  return (
    <div className="admin-form-wrap">
      {/* Modern Filter Bar Card */}
      <section
        className="admin-card"
        style={{
          padding: '12px 18px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          flexWrap: 'wrap'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#334155' }}>
            <Calendar size={18} color="#2563eb" />
            <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>Period:</span>
          </div>

          {/* Segmented Control */}
          <div
            style={{
              display: 'inline-flex',
              padding: 3,
              background: '#f1f5f9',
              borderRadius: 10,
              border: '1px solid #e2e8f0'
            }}
          >
            {PERIODS.map((p) => {
              const active = days === p.value;
              return (
                <button
                  key={p.value}
                  type="button"
                  onClick={() => setDays(p.value)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 7,
                    fontSize: '0.84rem',
                    fontWeight: active ? 600 : 500,
                    border: 'none',
                    background: active ? '#ffffff' : 'transparent',
                    color: active ? '#1e293b' : '#64748b',
                    boxShadow: active ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease'
                  }}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <label
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              fontSize: '0.85rem',
              cursor: 'pointer',
              userSelect: 'none',
              color: '#334155',
              fontWeight: 500
            }}
          >
            <input
              type="checkbox"
              checked={excludeInternal}
              onChange={(e) => setExcludeInternal(e.target.checked)}
              style={{ width: 'auto', cursor: 'pointer', margin: 0 }}
            />
            <span>Filter own visits</span>
            {data && data.totals.internalViews > 0 ? (
              <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.7rem' }}>
                {data.totals.internalViews.toLocaleString()} filtered
              </span>
            ) : null}
          </label>

          {loading ? (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', color: '#2563eb' }}>
              <RefreshCw size={14} className="animate-spin" />
              <span>Updating...</span>
            </span>
          ) : null}
        </div>
      </section>

      {data ? (
        <>
          {/* KPI + insights grid */}
          <section className="admin-kpi-grid">
            <InsightBadge
              label={`Page views (${days}d)`}
              value={data.totals.pageViews.toLocaleString()}
              sub="total content impressions"
              icon={Eye}
              iconBg="#eff6ff"
              iconColor="#2563eb"
            />
            <InsightBadge
              label={`Unique visitors (${days}d)`}
              value={data.totals.uniqueVisitors.toLocaleString()}
              sub="distinct browser sessions"
              icon={Users}
              iconBg="#ecfdf5"
              iconColor="#059669"
            />
            <InsightBadge
              label={`CTA clicks (${days}d)`}
              value={data.totals.ctaClicks.toLocaleString()}
              sub="conversion action buttons"
              icon={MousePointerClick}
              iconBg="#f5f3ff"
              iconColor="#7c3aed"
            />
            <InsightBadge
              label={`Contact leads (${days}d)`}
              value={data.totals.contactLeads.toLocaleString()}
              sub="submitted contact inquiries"
              icon={Inbox}
              iconBg="#fffbeb"
              iconColor="#d97706"
            />
            <InsightBadge
              label="Conversion rate"
              value={`${data.insights.conversionRate}%`}
              sub="(CTA + leads) / page views"
              icon={Percent}
              iconBg="#e0f2fe"
              iconColor="#0284c7"
            />
            <InsightBadge
              label="Pages / session"
              value={data.insights.avgPagesPerSession.toString()}
              sub="depth per visit session"
              icon={Layers}
              iconBg="#fdf2f8"
              iconColor="#db2777"
            />
          </section>

          {/* Daily trend chart */}
          <section className="admin-card">
            <div className="admin-inline-header" style={{ marginBottom: 14 }}>
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
                <h2 style={{ margin: 0 }}>Daily traffic trend</h2>
              </div>
              <span className="admin-chip admin-chip-muted">{days} day trajectory</span>
            </div>
            <DailyTrendChart daily={data.daily} />
          </section>

          {/* Conversion funnel + Content type mix */}
          <section className="admin-grid-2">
            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} color="#7c3aed" />
                  <h2 style={{ margin: 0 }}>Conversion funnel</h2>
                </div>
              </div>
              <p className="admin-subtle" style={{ fontSize: 12, marginBottom: 16 }}>views &rarr; clicks &rarr; contact leads</p>
              <ConversionFunnelChart totals={data.totals} />
            </article>

            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Layers size={18} color="#2563eb" />
                  <h2 style={{ margin: 0 }}>Content category mix</h2>
                </div>
              </div>
              <p className="admin-subtle" style={{ fontSize: 12, marginBottom: 16 }}>page view breakdown by entity type</p>
              <ContentTypeMixChart topPaths={data.topPaths} />
            </article>
          </section>

          {/* Top content paths */}
          <section className="admin-card">
            <div className="admin-inline-header" style={{ marginBottom: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <FileText size={18} color="#2563eb" />
                <h2 style={{ margin: 0 }}>Top performing pages</h2>
              </div>
              <span className="admin-subtle" style={{ fontSize: 12 }}>ranked by page views</span>
            </div>

            <div className="admin-table-wrap">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Page / Path</th>
                    <th>Type</th>
                    <th>Views</th>
                    <th>Visitors</th>
                    <th style={{ width: 150 }}>Traffic Share</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topPaths.map((item) => {
                    const sharePct = data.totals.pageViews > 0 ? Math.round((item.views / data.totals.pageViews) * 100) : 0;
                    return (
                      <tr key={`${item.entityType}-${item.entityId ?? item.path}`}>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <Globe size={15} color="#64748b" />
                            <strong style={{ fontSize: '0.88rem', margin: 0 }}>{item.path}</strong>
                          </div>
                        </td>
                        <td>
                          <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.7rem', textTransform: 'capitalize' }}>
                            {item.entityType.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ fontWeight: 600 }}>{item.views.toLocaleString()}</td>
                        <td style={{ color: '#64748b' }}>{item.visitors.toLocaleString()}</td>
                        <td>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            <div style={{ flex: 1, height: 6, borderRadius: 999, background: '#e2e8f0', overflow: 'hidden' }}>
                              <div
                                style={{
                                  width: `${sharePct}%`,
                                  height: '100%',
                                  borderRadius: 999,
                                  background: 'linear-gradient(90deg, #6366f1, #8b5cf6)',
                                  minWidth: sharePct > 0 ? 4 : 0
                                }}
                              />
                            </div>
                            <span className="admin-subtle" style={{ fontSize: 11, minWidth: 32, fontWeight: 600 }}>
                              {sharePct}%
                            </span>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                  {data.topPaths.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: '24px 0', color: '#94a3b8' }}>
                        No tracked visits registered yet for this period.
                      </td>
                    </tr>
                  ) : null}
                </tbody>
              </table>
            </div>
          </section>

          {/* Conversions + Referrers */}
          <section className="admin-grid-2">
            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Target size={18} color="#059669" />
                  <h2 style={{ margin: 0 }}>Top conversions</h2>
                </div>
                <span className="admin-chip admin-chip-muted">{data.topConversions.length} goals</span>
              </div>
              <ul className="admin-plain-list">
                {data.topConversions.map((item) => (
                  <li key={`${item.eventType}-${item.label}-${item.path}`} style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8, flexWrap: 'wrap' }}>
                      <strong style={{ fontSize: '0.9rem', color: '#0f2240' }}>{item.label}</strong>
                      <span className="admin-chip admin-chip-success" style={{ fontSize: '0.72rem' }}>
                        {item.count.toLocaleString()} conversions
                      </span>
                    </div>
                    <span className="admin-subtle" style={{ fontSize: '0.8rem', display: 'block', marginTop: 4 }}>
                      {item.eventType} &middot; path: {item.path}
                    </span>
                  </li>
                ))}
                {data.topConversions.length === 0 ? (
                  <li style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>No conversion events registered yet.</li>
                ) : null}
              </ul>
            </article>

            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Compass size={18} color="#2563eb" />
                  <h2 style={{ margin: 0 }}>Top referrers</h2>
                </div>
                <span className="admin-chip admin-chip-muted">{data.referrers.length} sources</span>
              </div>
              <ul className="admin-plain-list">
                {data.referrers.map((item) => (
                  <li key={item.referrer} style={{ padding: '10px 14px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <ExternalLink size={14} color="#64748b" />
                        <strong style={{ fontSize: '0.9rem', color: '#0f2240' }}>{item.referrer}</strong>
                      </div>
                      <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.72rem' }}>
                        {item.views.toLocaleString()} views
                      </span>
                    </div>
                  </li>
                ))}
                {data.referrers.length === 0 ? (
                  <li style={{ textAlign: 'center', padding: '20px 0', color: '#94a3b8' }}>Direct traffic only &mdash; no external referrers.</li>
                ) : null}
              </ul>
            </article>
          </section>

          {/* Device + Browser breakdown */}
          <section className="admin-grid-2">
            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Smartphone size={18} color="#6366f1" />
                  <h2 style={{ margin: 0 }}>Device types</h2>
                </div>
              </div>
              <BreakdownBars
                items={data.devices.map((d) => ({
                  label: d.deviceType.charAt(0).toUpperCase() + d.deviceType.slice(1),
                  count: d.count
                }))}
                totalLabel="device"
                color="#6366f1"
              />
            </article>

            <article className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Monitor size={18} color="#10b981" />
                  <h2 style={{ margin: 0 }}>Browsers</h2>
                </div>
              </div>
              <BreakdownBars
                items={data.browsers.map((b) => ({ label: b.browser, count: b.count }))}
                totalLabel="browser"
                color="#10b981"
              />
            </article>
          </section>

          {/* Campaigns */}
          {data.campaigns.some((c) => c.label !== 'none') ? (
            <section className="admin-card">
              <div className="admin-inline-header" style={{ marginBottom: 12 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Filter size={18} color="#d97706" />
                  <h2 style={{ margin: 0 }}>Campaign Attribution</h2>
                </div>
              </div>
              <ul className="admin-plain-list">
                {data.campaigns
                  .filter((c) => c.label !== 'none')
                  .map((item) => (
                    <li key={item.label} style={{ padding: '10px 14px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <strong style={{ fontSize: '0.9rem' }}>{item.label}</strong>
                        <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.72rem' }}>
                          {item.views.toLocaleString()} views
                        </span>
                      </div>
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
    <AdminShell title="Analytics" description="Visitor, referrer, and conversion reporting for marketing handoff.">
      {(user) => <AnalyticsPagePanel user={user} />}
    </AdminShell>
  );
}
