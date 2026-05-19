import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getAnalyticsSummary } from '@/features/cms/analyticsStore';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'analytics:view');
  if ('error' in auth) return auth.error;

  const url = new URL(request.url);
  const days = Math.min(Math.max(parseInt(url.searchParams.get('days') ?? '30', 10) || 30, 1), 90);
  const excludeInternal = url.searchParams.get('excludeInternal') !== 'false';

  const summary = await getAnalyticsSummary(days, excludeInternal);
  return NextResponse.json(summary);
}
