import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { listContactSubmissions } from '@/features/cms/contactSubmissionsStore';

export async function GET(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const submissions = await listContactSubmissions();
  return NextResponse.json({ submissions });
}
