import { randomUUID } from 'node:crypto';

import { desc, gte } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { analyticsEventsTable } from '@/db/schema';
import { env } from '@/services/env';

import { nowIso } from './storeShared';

const MAX_ANALYTICS_SUMMARY_ROWS = 20_000;

export type AnalyticsPageViewInput = {
  path: string;
  entityType: string;
  entityId?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  visitorId: string;
  sessionId: string;
  userAgent?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  isInternal?: boolean;
};

export type AnalyticsEventInput = {
  path: string;
  eventType: 'cta_click' | 'contact_submit';
  label?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  visitorId: string;
  sessionId: string;
  userAgent?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  isInternal?: boolean;
};

export type AnalyticsSummary = {
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

export function parseUserAgent(ua: string): { deviceType: string; browser: string; os: string } {
  const s = ua.toLowerCase();
  const isTablet = /tablet|ipad/.test(s);
  const isMobile = !isTablet && /mobile|android|iphone/.test(s);
  const deviceType = isTablet ? 'tablet' : isMobile ? 'mobile' : 'desktop';

  let browser = 'Other';
  if (/edg\//.test(s)) browser = 'Edge';
  else if (/opr\/|opera/.test(s)) browser = 'Opera';
  else if (/chrome\//.test(s)) browser = 'Chrome';
  else if (/firefox\//.test(s)) browser = 'Firefox';
  else if (/safari\//.test(s)) browser = 'Safari';

  let os = 'Other';
  if (/windows/.test(s)) os = 'Windows';
  else if (/iphone|ipad/.test(s)) os = 'iOS';
  else if (/android/.test(s)) os = 'Android';
  else if (/mac os x|macintosh/.test(s)) os = 'macOS';
  else if (/linux/.test(s)) os = 'Linux';

  return { deviceType, browser, os };
}

function emptySummary(days: number, excludeInternal: boolean): AnalyticsSummary {
  return {
    available: false,
    days,
    excludeInternal,
    totals: { pageViews: 0, uniqueVisitors: 0, ctaClicks: 0, contactLeads: 0, internalViews: 0 },
    insights: { conversionRate: 0, avgPagesPerSession: 0 },
    topPaths: [],
    topConversions: [],
    referrers: [],
    campaigns: [],
    devices: [],
    browsers: [],
    daily: []
  };
}

function extractErrorCode(error: unknown): string | undefined {
  if (!error || typeof error !== 'object') return undefined;
  const record = error as { code?: unknown; cause?: unknown };
  if (typeof record.code === 'string') return record.code;
  if (record.cause) return extractErrorCode(record.cause);
  return undefined;
}

function isMissingAnalyticsSchemaError(error: unknown) {
  const code = extractErrorCode(error);
  return code === '42P01' || code === '42703';
}

function normalizeUrlPath(value: string) {
  const candidate = value.trim();
  if (!candidate.startsWith('/')) return '/';
  return candidate.replace(/\/+$/, '') || '/';
}

function asDateKey(value: string) {
  return value.slice(0, 10);
}

function isConversionEventType(value: string) {
  return value === 'cta_click' || value === 'contact_submit';
}

async function insertAnalyticsRow(input: {
  path: string;
  entityType: string;
  entityId?: string | null;
  referrer?: string | null;
  utmSource?: string | null;
  utmMedium?: string | null;
  utmCampaign?: string | null;
  visitorId: string;
  sessionId: string;
  userAgent?: string | null;
  deviceType?: string | null;
  browser?: string | null;
  os?: string | null;
  isInternal?: boolean;
}) {
  await getDb().insert(analyticsEventsTable).values({
    id: randomUUID(),
    path: normalizeUrlPath(input.path),
    entityType: input.entityType || 'page',
    entityId: input.entityId?.trim() || null,
    referrer: (input.referrer ?? '').trim(),
    utmSource: input.utmSource?.trim() || null,
    utmMedium: input.utmMedium?.trim() || null,
    utmCampaign: input.utmCampaign?.trim() || null,
    visitorId: input.visitorId.trim(),
    sessionId: input.sessionId.trim(),
    userAgent: input.userAgent?.trim() || 'unknown',
    deviceType: input.deviceType ?? null,
    browser: input.browser ?? null,
    os: input.os ?? null,
    isInternal: input.isInternal ?? false,
    createdAt: nowIso()
  });
}

export async function trackAnalyticsPageView(input: AnalyticsPageViewInput) {
  if (!env.databaseUrl) {
    return false;
  }

  try {
    await insertAnalyticsRow(input);
  } catch (error) {
    if (isMissingAnalyticsSchemaError(error)) {
      return false;
    }
    throw error;
  }

  return true;
}

export async function trackAnalyticsEvent(input: AnalyticsEventInput) {
  if (!env.databaseUrl) {
    return false;
  }

  try {
    await insertAnalyticsRow({
      path: input.path,
      entityType: input.eventType,
      entityId: input.label?.slice(0, 120) || null,
      referrer: input.referrer ?? '',
      utmSource: input.utmSource ?? '',
      utmMedium: input.utmMedium ?? '',
      utmCampaign: input.utmCampaign ?? '',
      visitorId: input.visitorId,
      sessionId: input.sessionId,
      userAgent: input.userAgent ?? 'unknown',
      deviceType: input.deviceType ?? null,
      browser: input.browser ?? null,
      os: input.os ?? null,
      isInternal: input.isInternal ?? false
    });
  } catch (error) {
    if (isMissingAnalyticsSchemaError(error)) {
      return false;
    }
    throw error;
  }

  return true;
}

export async function getAnalyticsSummary(days = 30, excludeInternal = true): Promise<AnalyticsSummary> {
  if (!env.databaseUrl) {
    return emptySummary(days, excludeInternal);
  }

  const safeDays = Math.min(Math.max(days, 1), 90);
  const cutoff = new Date(Date.now() - safeDays * 24 * 60 * 60 * 1000).toISOString();

  let rows;
  try {
    rows = await getDb()
      .select()
      .from(analyticsEventsTable)
      .where(gte(analyticsEventsTable.createdAt, cutoff))
      .orderBy(desc(analyticsEventsTable.createdAt))
      .limit(MAX_ANALYTICS_SUMMARY_ROWS);
  } catch (error) {
    if (isMissingAnalyticsSchemaError(error)) {
      return emptySummary(safeDays, excludeInternal);
    }
    throw error;
  }

  const internalPageViews = rows.filter((r) => r.isInternal && !isConversionEventType(r.entityType)).length;
  const workingRows = excludeInternal ? rows.filter((r) => !r.isInternal) : rows;

  const pageViewRows = workingRows.filter((r) => !isConversionEventType(r.entityType));
  const conversionRows = workingRows.filter((r) => isConversionEventType(r.entityType));
  const ctaRows = conversionRows.filter((r) => r.entityType === 'cta_click');
  const contactRows = conversionRows.filter((r) => r.entityType === 'contact_submit');

  const pathMap = new Map<string, { path: string; entityType: string; entityId: string | null; views: number; visitors: Set<string> }>();
  const conversionMap = new Map<string, { eventType: string; label: string; path: string; count: number }>();
  const referrerMap = new Map<string, number>();
  const campaignMap = new Map<string, number>();
  const dailyMap = new Map<string, { date: string; views: number; visitors: Set<string> }>();
  const deviceMap = new Map<string, number>();
  const browserMap = new Map<string, number>();

  for (const row of pageViewRows) {
    const pathKey = `${row.entityType}:${row.entityId ?? ''}:${row.path}`;
    const currentPath = pathMap.get(pathKey) ?? {
      path: row.path,
      entityType: row.entityType,
      entityId: row.entityId ?? null,
      views: 0,
      visitors: new Set<string>()
    };
    currentPath.views += 1;
    currentPath.visitors.add(row.visitorId);
    pathMap.set(pathKey, currentPath);

    const referrer = row.referrer.trim() || 'direct';
    referrerMap.set(referrer, (referrerMap.get(referrer) ?? 0) + 1);

    const campaignLabel = [row.utmSource, row.utmMedium, row.utmCampaign].filter(Boolean).join(' / ') || 'none';
    campaignMap.set(campaignLabel, (campaignMap.get(campaignLabel) ?? 0) + 1);

    const date = asDateKey(row.createdAt);
    const currentDay = dailyMap.get(date) ?? { date, views: 0, visitors: new Set<string>() };
    currentDay.views += 1;
    currentDay.visitors.add(row.visitorId);
    dailyMap.set(date, currentDay);

    const device = row.deviceType ?? 'Unknown';
    deviceMap.set(device, (deviceMap.get(device) ?? 0) + 1);

    const browser = row.browser ?? 'Unknown';
    browserMap.set(browser, (browserMap.get(browser) ?? 0) + 1);
  }

  for (const row of conversionRows) {
    const label = row.entityId?.trim() || 'Unlabeled';
    const conversionKey = `${row.entityType}:${label}:${row.path}`;
    const currentConversion = conversionMap.get(conversionKey) ?? {
      eventType: row.entityType,
      label,
      path: row.path,
      count: 0
    };
    currentConversion.count += 1;
    conversionMap.set(conversionKey, currentConversion);
  }

  const uniqueSessions = new Set(pageViewRows.map((r) => r.sessionId)).size;
  const conversionCount = ctaRows.length + contactRows.length;
  const conversionRate = pageViewRows.length > 0 ? Math.round((conversionCount / pageViewRows.length) * 1000) / 10 : 0;
  const avgPagesPerSession = uniqueSessions > 0 ? Math.round((pageViewRows.length / uniqueSessions) * 10) / 10 : 0;

  return {
    available: true,
    days: safeDays,
    excludeInternal,
    totals: {
      pageViews: pageViewRows.length,
      uniqueVisitors: new Set(pageViewRows.map((r) => r.visitorId)).size,
      ctaClicks: ctaRows.length,
      contactLeads: contactRows.length,
      internalViews: internalPageViews
    },
    insights: { conversionRate, avgPagesPerSession },
    topPaths: Array.from(pathMap.values())
      .map((entry) => ({
        path: entry.path,
        entityType: entry.entityType,
        entityId: entry.entityId,
        views: entry.views,
        visitors: entry.visitors.size
      }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 10),
    topConversions: Array.from(conversionMap.values()).sort((a, b) => b.count - a.count).slice(0, 10),
    referrers: Array.from(referrerMap.entries())
      .map(([referrer, views]) => ({ referrer, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    campaigns: Array.from(campaignMap.entries())
      .map(([label, views]) => ({ label, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    devices: Array.from(deviceMap.entries())
      .map(([deviceType, count]) => ({ deviceType, count }))
      .sort((a, b) => b.count - a.count),
    browsers: Array.from(browserMap.entries())
      .map(([browser, count]) => ({ browser, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6),
    daily: Array.from(dailyMap.values())
      .map((entry) => ({
        date: entry.date,
        views: entry.views,
        visitors: entry.visitors.size
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
  };
}
