import { NextResponse } from 'next/server';

import { env } from '@/services/env';

const normalize = (value: string | null) => (value ?? '').trim();

export function isValidAdminToken(token: string | null) {
  const input = normalize(token);
  const expected = normalize(env.adminToken);
  return input.length > 0 && expected.length > 0 && input === expected;
}

export function assertAdminRequest(request: Request): NextResponse | null {
  const token = request.headers.get('x-admin-token');
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
