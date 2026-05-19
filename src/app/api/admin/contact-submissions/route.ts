import { assertAdminPermission } from '@/features/cms/adminAuth';
import { listContactSubmissions } from '@/features/cms/contactSubmissionsStore';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const result = await assertAdminPermission(request, 'content:read');
  if ('error' in result) return result.error;

  const submissions = await listContactSubmissions();
  return NextResponse.json({ submissions });
}
