import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminAuditLogs } from '@/features/cms/adminAuth';

export async function GET(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'audit:view');
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? '50');
  const auditLogs = await getAdminAuditLogs(limit);
  return NextResponse.json({ auditLogs });
}
