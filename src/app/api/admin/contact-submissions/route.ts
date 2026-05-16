import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { listContactSubmissions } from '@/features/cms/contactSubmissionsStore';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'content:read');
  if ('error' in auth) return auth.error;

  const submissions = await listContactSubmissions();
  return NextResponse.json({ submissions });
}
