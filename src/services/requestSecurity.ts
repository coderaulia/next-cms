import { NextResponse } from 'next/server';

import { env } from '@/services/env';

type RateLimitEntry = {
  count: number;
  resetAt: number;
};

declare global {
  var __cmsRateLimits: Map<string, RateLimitEntry> | undefined;
}

function getRateLimitStore() {
  if (!globalThis.__cmsRateLimits) {
    globalThis.__cmsRateLimits = new Map<string, RateLimitEntry>();
  }

  return globalThis.__cmsRateLimits;
}

function getAllowedOrigins(request: Request) {
  const origins = new Set<string>();

  try {
    origins.add(new URL(request.url).origin);
  } catch {}

  try {
    origins.add(new URL(env.siteUrl).origin);
  } catch {}

  return origins;
}

function extractOrigin(value: string | null) {
  if (!value) return '';

  try {
    return new URL(value).origin;
  } catch {
    return '';
  }
}

export function assertTrustedMutationRequest(request: Request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
    return null;
  }

  const allowedOrigins = getAllowedOrigins(request);
  const origin = extractOrigin(request.headers.get('origin'));
  const referer = extractOrigin(request.headers.get('referer'));

  if ((origin && allowedOrigins.has(origin)) || (referer && allowedOrigins.has(referer))) {
    return null;
  }

  return NextResponse.json({ error: 'Cross-site request blocked.' }, { status: 403 });
}

function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || 'unknown';
}

export function assertRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  const store = getRateLimitStore();
  const now = Date.now();
  const key = `${scope}:${getClientIdentifier(request)}`;
  const current = store.get(key);

  if (!current || current.resetAt <= now) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((current.resetAt - now) / 1000));
    return NextResponse.json(
      { error: 'Too many requests. Please retry later.' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Cache-Control': 'no-store'
        }
      }
    );
  }

  current.count += 1;
  store.set(key, current);
  return null;
}

export function serializeJsonForScript(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}
