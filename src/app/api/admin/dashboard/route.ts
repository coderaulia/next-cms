import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getDashboardSummary } from '@/features/cms/dashboardSummary';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'dashboard:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
