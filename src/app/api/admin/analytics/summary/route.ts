import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getAnalyticsSummary } from '@/features/cms/analyticsStore';

export async function GET(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'analytics:view');
  if (unauthorized) return unauthorized;

  const summary = await getAnalyticsSummary(30);
  return NextResponse.json(summary);
}
