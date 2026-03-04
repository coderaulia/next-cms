import { NextResponse } from 'next/server';

import { env } from '@/services/env';

export function isValidAdminToken(token: string | null) {
  return Boolean(token) && token === env.adminToken;
}

export function assertAdminRequest(request: Request): NextResponse | null {
  const token = request.headers.get('x-admin-token');
  if (!isValidAdminToken(token)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
