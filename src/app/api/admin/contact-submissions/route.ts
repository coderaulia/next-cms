import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { listContactSubmissions } from '@/features/cms/contactSubmissionsStore';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const submissions = await listContactSubmissions();
  return NextResponse.json({ submissions });
}
