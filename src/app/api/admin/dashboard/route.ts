import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getDashboardSummary } from '@/features/cms/dashboardSummary';

export async function GET(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'dashboard:view');
  if (unauthorized) return unauthorized;

  const summary = await getDashboardSummary();
  return NextResponse.json(summary);
}
