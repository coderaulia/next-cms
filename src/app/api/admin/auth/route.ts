import { NextResponse } from 'next/server';

import { applyAdminSessionCookie, assertAdminRequest, clearAdminSessionCookie, clearLoginLockout, getLoginLockoutState, logAdminAuditEvent, loginAdminUser, logoutAdminUser, registerFailedLoginAttempt } from '@/features/cms/adminAuth';
import type { AdminLoginPayload } from '@/features/cms/adminTypes';
import { assertCsrfToken, assertRateLimit, assertTrustedMutationRequest } from '@/services/requestSecurity';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  const session = auth;

  return NextResponse.json({ ok: true, user: session.user });
}

export async function POST(request: Request) {
  const originFailure = assertTrustedMutationRequest(request);
  if (originFailure) return originFailure;

  const csrfFailure = assertCsrfToken(request);
  if (csrfFailure) return csrfFailure;

  const rateLimitFailure = await assertRateLimit(request, 'admin-login', 8, 60_000);
  if (rateLimitFailure) return rateLimitFailure;

  const body = (await request.json().catch(() => null)) as Partial<AdminLoginPayload> | null;
  const email = body?.email ?? '';
  const password = body?.password ?? '';

  const lockState = await getLoginLockoutState(email);
  if (lockState.locked) {
    return NextResponse.json(
      { error: `Too many failed login attempts. Try again in ${lockState.retryAfter} seconds.` },
      { status: 429, headers: { 'Retry-After': String(lockState.retryAfter), 'Cache-Control': 'no-store' } }
    );
  }

  const session = await loginAdminUser(email, password);
  if (!session) {
    const failedState = await registerFailedLoginAttempt(email);

    try {
      await logAdminAuditEvent(request, {
        action: 'admin.login.failed',
        entityType: 'auth',
        metadata: { email: email.trim().toLowerCase() || 'unknown' }
      });
    } catch {
      // swallow audit log failures
    }

    if (failedState.locked) {
      return NextResponse.json(
        { error: `Too many failed login attempts. Try again in ${failedState.retryAfter} seconds.` },
        { status: 429, headers: { 'Retry-After': String(failedState.retryAfter), 'Cache-Control': 'no-store' } }
      );
    }

    return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 });
  }

  await clearLoginLockout(email);

  try {
    await logAdminAuditEvent(request, {
      action: 'admin.login.success',
      entityType: 'auth',
      userId: session.user.id,
      metadata: { email: session.user.email }
    });
  } catch {
    // swallow audit log failures
  }

  const response = NextResponse.json({ ok: true, user: session.user });
  return applyAdminSessionCookie(response, session.sessionToken, session.expiresAt);
}

export async function DELETE(request: Request) {
  const originFailure = assertTrustedMutationRequest(request);
  if (originFailure) return originFailure;

  const csrfFailure = assertCsrfToken(request);
  if (csrfFailure) return csrfFailure;

  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  const session = auth;

  await logoutAdminUser(request);

  try {
    await logAdminAuditEvent(request, {
      action: 'admin.logout',
      entityType: 'auth',
      userId: session.user.id
    });
  } catch {
    // swallow audit log failures
  }

  const response = NextResponse.json({ ok: true });
  return clearAdminSessionCookie(response);
}
