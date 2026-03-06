import { NextResponse } from 'next/server';

import {
  applyAdminSessionCookie,
  clearAdminSessionCookie,
  getAdminSession,
  loginAdminUser,
  logoutAdminUser
} from '@/features/cms/adminAuth';
import type { AdminLoginPayload } from '@/features/cms/adminTypes';

export async function GET(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  return NextResponse.json({ ok: true, user: session.user });
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as Partial<AdminLoginPayload> | null;
  const email = body?.email ?? '';
  const password = body?.password ?? '';

  const session = await loginAdminUser(email, password);
  if (!session) {
    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true, user: session.user });
  return applyAdminSessionCookie(response, session.sessionToken, session.expiresAt);
}

export async function DELETE(request: Request) {
  await logoutAdminUser(request);
  const response = NextResponse.json({ ok: true });
  return clearAdminSessionCookie(response);
}
