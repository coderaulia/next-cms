import { NextResponse } from 'next/server';
import { eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { requestRateLimitsTable } from '@/db/schema';
import { env } from '@/services/env';
import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/services/securityConstants';

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
  } catch {
    // ignore invalid request URL
  }

  try {
    origins.add(new URL(env.siteUrl).origin);
  } catch {
    // ignore invalid configured site URL
  }

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

function parseCookies(cookieHeader: string | null) {
  if (!cookieHeader) return new Map<string, string>();

  const entries = cookieHeader
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const separator = part.indexOf('=');
      if (separator === -1) return [part, ''] as const;
      const key = part.slice(0, separator).trim();
      const value = part.slice(separator + 1).trim();
      return [key, value] as const;
    });

  return new Map(entries);
}

export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || 'unknown';
}

export function readCookieValue(request: Request, name: string) {
  const cookies = parseCookies(request.headers.get('cookie'));
  const raw = (cookies.get(name) || '').trim();

  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
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

export function assertCsrfToken(request: Request) {
  if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(request.method.toUpperCase())) {
    return null;
  }

  const cookieToken = readCookieValue(request, CSRF_COOKIE_NAME);
  const headerToken = request.headers.get(CSRF_HEADER_NAME)?.trim() || '';

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return NextResponse.json({ error: 'CSRF token validation failed.' }, { status: 403 });
  }

  return null;
}

async function assertRateLimitInDatabase(
  request: Request,
  scope: string,
  limit: number,
  windowMs: number
) {
  const now = Date.now();
  const key = `${scope}:${getClientIdentifier(request)}`;
  const nowIso = new Date(now).toISOString();
  const resetAtIso = new Date(now + windowMs).toISOString();

  const rows = await getDb()
    .select()
    .from(requestRateLimitsTable)
    .where(eq(requestRateLimitsTable.key, key))
    .limit(1);

  const current = rows[0];

  if (!current || new Date(current.resetAt).getTime() <= now) {
    await getDb()
      .insert(requestRateLimitsTable)
      .values({
        key,
        count: 1,
        resetAt: resetAtIso,
        updatedAt: nowIso
      })
      .onConflictDoUpdate({
        target: requestRateLimitsTable.key,
        set: {
          count: 1,
          resetAt: resetAtIso,
          updatedAt: nowIso
        }
      });

    return null;
  }

  if (current.count >= limit) {
    const retryAfter = Math.max(1, Math.ceil((new Date(current.resetAt).getTime() - now) / 1000));
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

  await getDb()
    .update(requestRateLimitsTable)
    .set({
      count: current.count + 1,
      updatedAt: nowIso
    })
    .where(eq(requestRateLimitsTable.key, key));

  return null;
}

function assertRateLimitInMemory(request: Request, scope: string, limit: number, windowMs: number) {
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

export async function assertRateLimit(request: Request, scope: string, limit: number, windowMs: number) {
  if (env.databaseUrl) {
    try {
      return await assertRateLimitInDatabase(request, scope, limit, windowMs);
    } catch {
      // fallback if database is temporarily unavailable
    }
  }

  return assertRateLimitInMemory(request, scope, limit, windowMs);
}

export function serializeJsonForScript(data: unknown) {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}


