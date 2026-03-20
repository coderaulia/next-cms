import { createHash, randomBytes, randomUUID, scrypt as nodeScrypt, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

import { and, desc, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { adminAuditLogsTable, adminLoginLockoutsTable, adminSessionsTable, adminUsersTable } from '@/db/schema';
import { env } from '@/services/env';
import {
  assertCsrfToken,
  assertTrustedMutationRequest,
  getClientIdentifier
} from '@/services/requestSecurity';
import { ADMIN_LOGIN_LOCK_THRESHOLD, ADMIN_LOGIN_LOCK_WINDOW_MS } from '@/services/securityConstants';

import type { AdminSessionUser } from './adminTypes';
import { hasAdminPermission, normalizeAdminRole, permissionsForRole } from './adminPermissions';
import { nowIso } from './storeShared';
import type { AdminPermission, AdminRole } from './types';

const scrypt = promisify(nodeScrypt);

const ADMIN_SESSION_COOKIE = 'cms_admin_session';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 7;
const DEFAULT_ADMIN_EMAIL = 'admin@example.local';
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

type LoginLockState = {
  locked: boolean;
  retryAfter: number;
};

type LoginLockEntry = {
  failedCount: number;
  lockoutUntil: number | null;
};

type AdminAuditEvent = {
  action: string;
  entityType: string;
  entityId?: string | null;
  userId?: string | null;
  metadata?: Record<string, unknown>;
};

export type AdminAuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  ip: string;
  userAgent: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

declare global {
  var __cmsAdminLoginLockouts: Map<string, LoginLockEntry> | undefined;
}

function normalize(value: string | null | undefined) {
  return (value ?? '').trim();
}

function getLoginLockStore() {
  if (!globalThis.__cmsAdminLoginLockouts) {
    globalThis.__cmsAdminLoginLockouts = new Map<string, LoginLockEntry>();
  }

  return globalThis.__cmsAdminLoginLockouts;
}

function normalizeLoginIdentifier(email: string) {
  const normalized = normalize(email).toLowerCase();
  return normalized.length > 0 ? normalized : 'unknown';
}

function mapAdminUser(row: AdminUserRow): AdminSessionUser {
  const role = normalizeAdminRole(row.role);
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role,
    permissions: permissionsForRole(role)
  };
}

function hashValue(value: string) {
  return createHash('sha256').update(value).digest('hex');
}

function hashSessionToken(token: string) {
  return hashValue(token);
}

export async function hashAdminPassword(password: string) {
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
    passwordHash: await hashAdminPassword(password),
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

async function getLoginLockStateFromDb(identifier: string): Promise<LoginLockState> {
  const now = Date.now();
  const rows = await getDb()
    .select()
    .from(adminLoginLockoutsTable)
    .where(eq(adminLoginLockoutsTable.identifier, identifier))
    .limit(1);

  const lockout = rows[0];
  if (!lockout) {
    return { locked: false, retryAfter: 0 };
  }

  const lockoutUntil = lockout.lockoutUntil ? new Date(lockout.lockoutUntil).getTime() : 0;
  if (lockoutUntil > now) {
    return {
      locked: true,
      retryAfter: Math.max(1, Math.ceil((lockoutUntil - now) / 1000))
    };
  }

  if (lockout.failedCount !== 0 || lockout.lockoutUntil) {
    await getDb()
      .update(adminLoginLockoutsTable)
      .set({ failedCount: 0, lockoutUntil: null, updatedAt: nowIso() })
      .where(eq(adminLoginLockoutsTable.identifier, identifier));
  }

  return { locked: false, retryAfter: 0 };
}

async function registerFailedLoginFromDb(identifier: string): Promise<LoginLockState> {
  const state = await getLoginLockStateFromDb(identifier);
  if (state.locked) {
    return state;
  }

  const rows = await getDb()
    .select()
    .from(adminLoginLockoutsTable)
    .where(eq(adminLoginLockoutsTable.identifier, identifier))
    .limit(1);

  const current = rows[0];
  const nextFailedCount = (current?.failedCount ?? 0) + 1;
  const lockoutUntilIso =
    nextFailedCount >= ADMIN_LOGIN_LOCK_THRESHOLD
      ? new Date(Date.now() + ADMIN_LOGIN_LOCK_WINDOW_MS).toISOString()
      : null;

  await getDb()
    .insert(adminLoginLockoutsTable)
    .values({
      identifier,
      failedCount: nextFailedCount,
      lockoutUntil: lockoutUntilIso,
      updatedAt: nowIso()
    })
    .onConflictDoUpdate({
      target: adminLoginLockoutsTable.identifier,
      set: {
        failedCount: nextFailedCount,
        lockoutUntil: lockoutUntilIso,
        updatedAt: nowIso()
      }
    });

  if (!lockoutUntilIso) {
    return { locked: false, retryAfter: 0 };
  }

  return {
    locked: true,
    retryAfter: Math.max(1, Math.ceil((new Date(lockoutUntilIso).getTime() - Date.now()) / 1000))
  };
}

function getLoginLockStateFromMemory(identifier: string): LoginLockState {
  const now = Date.now();
  const entry = getLoginLockStore().get(identifier);

  if (!entry) {
    return { locked: false, retryAfter: 0 };
  }

  if (!entry.lockoutUntil || entry.lockoutUntil <= now) {
    if (entry.failedCount > 0 || entry.lockoutUntil) {
      getLoginLockStore().set(identifier, { failedCount: 0, lockoutUntil: null });
    }
    return { locked: false, retryAfter: 0 };
  }

  return {
    locked: true,
    retryAfter: Math.max(1, Math.ceil((entry.lockoutUntil - now) / 1000))
  };
}

function registerFailedLoginFromMemory(identifier: string): LoginLockState {
  const current = getLoginLockStore().get(identifier) ?? { failedCount: 0, lockoutUntil: null };
  const state = getLoginLockStateFromMemory(identifier);
  if (state.locked) {
    return state;
  }

  const nextFailedCount = current.failedCount + 1;
  const lockoutUntil =
    nextFailedCount >= ADMIN_LOGIN_LOCK_THRESHOLD ? Date.now() + ADMIN_LOGIN_LOCK_WINDOW_MS : null;

  getLoginLockStore().set(identifier, {
    failedCount: nextFailedCount,
    lockoutUntil
  });

  if (!lockoutUntil) {
    return { locked: false, retryAfter: 0 };
  }

  return {
    locked: true,
    retryAfter: Math.max(1, Math.ceil((lockoutUntil - Date.now()) / 1000))
  };
}

export function isValidAdminToken(token: string | null) {
  const input = normalize(token);
  const expected = normalize(env.adminToken);
  return input.length > 0 && expected.length > 0 && input === expected;
}

export async function getLoginLockoutState(email: string): Promise<LoginLockState> {
  const identifier = normalizeLoginIdentifier(email);

  if (env.databaseUrl) {
    return getLoginLockStateFromDb(identifier);
  }

  return getLoginLockStateFromMemory(identifier);
}

export async function registerFailedLoginAttempt(email: string): Promise<LoginLockState> {
  const identifier = normalizeLoginIdentifier(email);

  if (env.databaseUrl) {
    return registerFailedLoginFromDb(identifier);
  }

  return registerFailedLoginFromMemory(identifier);
}

export async function clearLoginLockout(email: string): Promise<void> {
  const identifier = normalizeLoginIdentifier(email);

  if (env.databaseUrl) {
    await getDb().delete(adminLoginLockoutsTable).where(eq(adminLoginLockoutsTable.identifier, identifier));
    return;
  }

  getLoginLockStore().delete(identifier);
}

export async function logAdminAuditEvent(request: Request, event: AdminAuditEvent) {
  if (!env.databaseUrl) {
    return;
  }

  const metadata = event.metadata && typeof event.metadata === 'object' ? event.metadata : {};

  await getDb().insert(adminAuditLogsTable).values({
    id: randomUUID(),
    userId: event.userId ?? null,
    action: event.action,
    entityType: event.entityType,
    entityId: event.entityId ?? null,
    metadata,
    ip: getClientIdentifier(request),
    userAgent: normalize(request.headers.get('user-agent')) || 'unknown',
    createdAt: nowIso()
  });
}

export async function getAdminSession(request: Request): Promise<AdminSession | null> {
  const headerToken = process.env.NODE_ENV !== 'production' ? request.headers.get('x-admin-token') : null;
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
        role: 'super_admin',
        permissions: permissionsForRole('super_admin')
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
  const originFailure = assertTrustedMutationRequest(request);
  if (originFailure) {
    return originFailure;
  }

  const csrfFailure = assertCsrfToken(request);
  if (csrfFailure) {
    return csrfFailure;
  }

  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}

export async function assertAdminPermission(
  request: Request,
  permission: AdminPermission
): Promise<NextResponse | null> {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!hasAdminPermission(session.user.role, permission)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
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

export async function getAdminAuditLogs(limit = 50): Promise<AdminAuditLogEntry[]> {
  if (!env.databaseUrl) {
    return [];
  }

  const rows = await getDb()
    .select()
    .from(adminAuditLogsTable)
    .orderBy(desc(adminAuditLogsTable.createdAt))
    .limit(Math.min(Math.max(limit, 1), 200));

  return rows.map((row) => ({
    id: row.id,
    action: row.action,
    entityType: row.entityType,
    entityId: row.entityId ?? null,
    userId: row.userId ?? null,
    ip: row.ip,
    userAgent: row.userAgent,
    createdAt: row.createdAt,
    metadata: row.metadata
  }));
}

export function roleLabel(role: AdminRole) {
  return role.replace(/_/g, ' ');
}

export function applyAdminSessionCookie(response: NextResponse, sessionToken: string, expiresAt: string) {
  response.cookies.set(ADMIN_SESSION_COOKIE, sessionToken, getSessionCookieOptions(expiresAt));
  return response;
}

export function clearAdminSessionCookie(response: NextResponse) {
  response.cookies.set(ADMIN_SESSION_COOKIE, '', getSessionCookieOptions());
  return response;
}
