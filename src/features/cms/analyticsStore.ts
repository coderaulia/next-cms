import { randomUUID } from 'node:crypto';

import { desc, gte } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { analyticsEventsTable } from '@/db/schema';
import { env } from '@/services/env';

import { nowIso } from './storeShared';

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
};

export type AnalyticsSummary = {
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

function emptySummary(): AnalyticsSummary {
  return {
    available: false,
    totals: {
      pageViews30d: 0,
      uniqueVisitors30d: 0,
      pageViews7d: 0,
      uniqueVisitors7d: 0
    },
    topPaths: [],
    referrers: [],
    campaigns: [],
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

export async function trackAnalyticsPageView(input: AnalyticsPageViewInput) {
  if (!env.databaseUrl) {
    return false;
  }

  try {
    await getDb().insert(analyticsEventsTable).values({
      id: randomUUID(),
      path: normalizeUrlPath(input.path),
      entityType: input.entityType || 'page',
      entityId: input.entityId ?? null,
      referrer: (input.referrer ?? '').trim(),
      utmSource: input.utmSource?.trim() || null,
      utmMedium: input.utmMedium?.trim() || null,
      utmCampaign: input.utmCampaign?.trim() || null,
      visitorId: input.visitorId.trim(),
      sessionId: input.sessionId.trim(),
      userAgent: input.userAgent?.trim() || 'unknown',
      createdAt: nowIso()
    });
  } catch (error) {
    if (isMissingAnalyticsSchemaError(error)) {
      return false;
    }
    throw error;
  }

  return true;
}

export async function getAnalyticsSummary(days = 30): Promise<AnalyticsSummary> {
  if (!env.databaseUrl) {
    return emptySummary();
  }

  const safeDays = Math.min(Math.max(days, 1), 90);
  const current = Date.now();
  const cutoff30 = new Date(current - safeDays * 24 * 60 * 60 * 1000).toISOString();
  const cutoff7 = new Date(current - 7 * 24 * 60 * 60 * 1000).toISOString();
  let rows;
  try {
    rows = await getDb()
      .select()
      .from(analyticsEventsTable)
      .where(gte(analyticsEventsTable.createdAt, cutoff30))
      .orderBy(desc(analyticsEventsTable.createdAt));
  } catch (error) {
    if (isMissingAnalyticsSchemaError(error)) {
      return emptySummary();
    }
    throw error;
  }

  const rows7 = rows.filter((row) => row.createdAt >= cutoff7);

  const pathMap = new Map<string, { path: string; entityType: string; entityId: string | null; views: number; visitors: Set<string> }>();
  const referrerMap = new Map<string, number>();
  const campaignMap = new Map<string, number>();
  const dailyMap = new Map<string, { date: string; views: number; visitors: Set<string> }>();

  for (const row of rows) {
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
  }

  return {
    available: true,
    totals: {
      pageViews30d: rows.length,
      uniqueVisitors30d: new Set(rows.map((row) => row.visitorId)).size,
      pageViews7d: rows7.length,
      uniqueVisitors7d: new Set(rows7.map((row) => row.visitorId)).size
    },
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
    referrers: Array.from(referrerMap.entries())
      .map(([referrer, views]) => ({ referrer, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    campaigns: Array.from(campaignMap.entries())
      .map(([label, views]) => ({ label, views }))
      .sort((a, b) => b.views - a.views)
      .slice(0, 8),
    daily: Array.from(dailyMap.values())
      .map((entry) => ({
        date: entry.date,
        views: entry.views,
        visitors: entry.visitors.size
      }))
      .sort((a, b) => (a.date > b.date ? 1 : -1))
  };
}
