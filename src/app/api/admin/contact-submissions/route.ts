import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { listContactSubmissions } from '@/features/cms/contactSubmissionsStore';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  const session = auth;

  const submissions = await listContactSubmissions();
  return NextResponse.json({ submissions });
}
