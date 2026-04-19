import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { getContentHealthReport } from '@/features/cms/contentHealth';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'analytics:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  try {
    const report = await getContentHealthReport();
    return NextResponse.json(report);
  } catch (err) {
    console.error('Failed to generate health report:', err);
    return NextResponse.json({ error: 'Failed to generate health report' }, { status: 500 });
  }
}
