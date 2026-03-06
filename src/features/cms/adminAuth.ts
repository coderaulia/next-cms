import { createHash, randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { and, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { adminSessionsTable, adminUsersTable } from '@/db/schema';
import { env } from '@/services/env';

import type { AdminSessionUser } from './adminTypes';
import { nowIso } from './storeShared';

const scrypt = promisify(nodeScrypt);

const ADMIN_SESSION_COOKIE = 'cms_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_EMAIL = 'admin@vanaila.local';
const DEFAULT_ADMIN_NAME = 'Administrator';

type AdminUserRow = typeof adminUsersTable.$inferSelect;

type AdminSession = {
  user: AdminSessionUser;
  expiresAt: string;
};

type AdminLoginResult = {
  user: AdminSessionUser;
  sessionToken: string;
  expiresAt: string;
};

function normalize(value: string | null | undefined) {
  return (value ?? '').trim();
}

function mapAdminUser(row: AdminUserRow): AdminSessionUser {
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role: row.role
  };
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashSessionToken(token: string) {
  return hashValue(token);
}

async function createPasswordHash(password: string) {
  const salt = randomBytes(16).toString('hex');
  const derived = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${derived.toString('hex')}`;
}

async function verifyPassword(password: string, passwordHash: string) {
  const [salt, storedHash] = passwordHash.split(':');
  if (!salt || !storedHash) return false;

  const derived = (await scrypt(password, salt, 64)) as Buffer;
  const expected = Buffer.from(storedHash, 'hex');
  if (derived.length !== expected.length) return false;
  return timingSafeEqual(derived, expected);
}

function getSessionCookieOptions(expiresAt?: string) {
  return {
    httpOnly: true,
    sameSite: 'lax' as const,
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    expires: expiresAt ? new Date(expiresAt) : new Date(0)
  };
}

function readSessionTokenFromRequest(request: Request) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = cookieHeader.split(';').map((part) => part.trim());
  const match = cookies.find((item) => item.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  return normalize(match?.split('=').slice(1).join('='));
}

async function findAdminUserByEmail(email: string) {
  const rows = await getDb()
    .select()
    .from(adminUsersTable)
    .where(eq(adminUsersTable.email, email.toLowerCase()))
    .limit(1);

  return rows[0] ?? null;
}

async function findAdminUserById(id: string) {
  const rows = await getDb().select().from(adminUsersTable).where(eq(adminUsersTable.id, id)).limit(1);
  return rows[0] ?? null;
}

async function getFirstAdminUser() {
  const rows = await getDb().select().from(adminUsersTable).limit(1);
  return rows[0] ?? null;
}

async function ensureAdminBootstrap() {
  if (!env.databaseUrl) {
    return null;
  }

  const existing = await getFirstAdminUser();
  if (existing) {
    return existing;
  }

  const password = normalize(env.adminPassword || env.adminToken);
  if (!password) {
    return null;
  }

  const now = nowIso();
  const user = {
    id: randomUUID(),
    email: normalize(env.adminEmail || DEFAULT_ADMIN_EMAIL).toLowerCase(),
    displayName: normalize(env.adminName || DEFAULT_ADMIN_NAME),
    passwordHash: await createPasswordHash(password),
    role: 'super_admin',
    createdAt: now,
    updatedAt: now,
    lastLoginAt: null
  };

  await getDb().insert(adminUsersTable).values(user);
  return user;
}

async function createSession(userId: string) {
  const rawToken = randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

  await getDb().insert(adminSessionsTable).values({
    id: randomUUID(),
    userId,
    sessionToken: hashSessionToken(rawToken),
    expiresAt,
    createdAt: nowIso()
  });

  return { rawToken, expiresAt };
}

async function deleteSessionByRawToken(rawToken: string) {
  const token = normalize(rawToken);
  if (!token || !env.databaseUrl) return;
  await getDb()
    .delete(adminSessionsTable)
    .where(eq(adminSessionsTable.sessionToken, hashSessionToken(token)));
}

export function isValidAdminToken(token: string | null) {
  const input = normalize(token);
  const expected = normalize(env.adminToken);
  return input.length > 0 && expected.length > 0 && input === expected;
}

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  const headerToken = request.headers.get('x-admin-token');
  if (isValidAdminToken(headerToken)) {
    const bootstrapped = env.databaseUrl ? await ensureAdminBootstrap() : null;
    if (bootstrapped) {
      return { user: mapAdminUser(bootstrapped), expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString() };
    }

    return {
      user: {
        id: 'legacy-token-admin',
        email: normalize(env.adminEmail || DEFAULT_ADMIN_EMAIL).toLowerCase(),
        displayName: normalize(env.adminName || DEFAULT_ADMIN_NAME),
        role: 'super_admin'
      },
      expiresAt: new Date(Date.now() + SESSION_TTL_MS).toISOString()
    };
  }

  if (!env.databaseUrl) {
    return null;
  }

  await ensureAdminBootstrap();

  const rawToken = readSessionTokenFromRequest(request);
  if (!rawToken) {
    return null;
  }

  const rows = await getDb()
    .select()
    .from(adminSessionsTable)
    .where(
      and(
        eq(adminSessionsTable.sessionToken, hashSessionToken(rawToken)),
        gt(adminSessionsTable.expiresAt, nowIso())
      )
    )
    .limit(1);

  const session = rows[0];
  if (!session) {
    return null;
  }

  const user = await findAdminUserById(session.userId);
  if (!user) {
    await getDb().delete(adminSessionsTable).where(eq(adminSessionsTable.id, session.id));
    return null;
  }

  return {
    user: mapAdminUser(user),
    expiresAt: session.expiresAt
  };
}

export async function assertAdminRequest(request: Request): Promise<NextResponse | null> {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function loginAdminUser(email: string, password: string): Promise<AdminLoginResult | null> {
  if (!env.databaseUrl) {
    return null;
  }

  await ensureAdminBootstrap();

  const normalizedEmail = normalize(email).toLowerCase();
  const normalizedPassword = normalize(password);
  if (!normalizedEmail || !normalizedPassword) {
    return null;
  }

  const user = await findAdminUserByEmail(normalizedEmail);
  if (!user) {
    return null;
  }

  const valid = await verifyPassword(normalizedPassword, user.passwordHash);
  if (!valid) {
    return null;
  }

  const session = await createSession(user.id);
  const loginAt = nowIso();
  await getDb()
    .update(adminUsersTable)
    .set({ lastLoginAt: loginAt, updatedAt: loginAt })
    .where(eq(adminUsersTable.id, user.id));

  return {
    user: mapAdminUser({ ...user, lastLoginAt: loginAt, updatedAt: loginAt }),
    sessionToken: session.rawToken,
    expiresAt: session.expiresAt
  };
}

export async function logoutAdminUser(request: Request) {
  const rawToken = readSessionTokenFromRequest(request);
  if (rawToken) {
    await deleteSessionByRawToken(rawToken);
  }
}

export function applyAdminSessionCookie(response: NextResponse, sessionToken: string, expiresAt: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, getSessionCookieOptions(expiresAt));
  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', getSessionCookieOptions());
  return response;
}
