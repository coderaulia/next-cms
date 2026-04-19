import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminAuditLogs } from '@/features/cms/adminAuth';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'audit:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { searchParams } = new URL(request.url);
  const limit = Number(searchParams.get('limit') ?? '50');
  const auditLogs = await getAdminAuditLogs(limit);
  return NextResponse.json({ auditLogs });
}
