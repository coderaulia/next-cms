import { NextResponse } from 'next/server';

import { isValidAdminToken } from '@/features/cms/adminAuth';

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as { token?: string } | null;
  const token = body?.token ?? '';
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
  }
  return NextResponse.json({ ok: true });
}
