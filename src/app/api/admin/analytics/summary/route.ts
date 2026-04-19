import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getAnalyticsSummary } from '@/features/cms/analyticsStore';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'analytics:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const summary = await getAnalyticsSummary(30);
  return NextResponse.json(summary);
}
