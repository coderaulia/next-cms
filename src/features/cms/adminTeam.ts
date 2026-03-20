import { randomUUID } from 'node:crypto';

import { eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { adminSessionsTable, adminUsersTable } from '@/db/schema';
import { env } from '@/services/env';

import { hashAdminPassword } from './adminAuth';
import { normalizeAdminRole, permissionsForRole } from './adminPermissions';
import type { AdminTeamMember } from './adminTypes';
import { nowIso } from './storeShared';
import type { AdminRole } from './types';

type AdminUserRow = typeof adminUsersTable.$inferSelect;

export class AdminTeamError extends Error {
  status: number;

  constructor(message: string, status = 400) {
    super(message);
    this.name = 'AdminTeamError';
    this.status = status;
  }
}

function normalize(value: string | null | undefined) {
  return (value ?? '').trim();
}

function normalizeEmail(value: string | null | undefined) {
  return normalize(value).toLowerCase();
}

function mapAdminTeamMember(row: AdminUserRow): AdminTeamMember {
  const role = normalizeAdminRole(row.role);
  return {
    id: row.id,
    email: row.email,
    displayName: row.displayName,
    role,
    permissions: permissionsForRole(role),
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    lastLoginAt: row.lastLoginAt ?? null
  };
}

async function findAdminUserById(id: string) {
  const rows = await getDb().select().from(adminUsersTable).where(eq(adminUsersTable.id, id)).limit(1);
  return rows[0] ?? null;
}

async function findAdminUserByEmail(email: string) {
  const rows = await getDb().select().from(adminUsersTable).where(eq(adminUsersTable.email, email)).limit(1);
  return rows[0] ?? null;
}

async function countSuperAdmins() {
  const rows = await getDb().select().from(adminUsersTable);
  return rows.filter((row) => normalizeAdminRole(row.role) === 'super_admin').length;
}

function assertDatabaseMode() {
  if (!env.databaseUrl) {
    throw new AdminTeamError('Team management requires database mode.', 503);
  }
}

function assertPasswordPolicy(password: string, required: boolean) {
  const normalized = normalize(password);
  if (!normalized) {
    if (required) {
      throw new AdminTeamError('Password is required.', 400);
    }
    return '';
  }

  if (normalized.length < 8) {
    throw new AdminTeamError('Password must be at least 8 characters.', 400);
  }

  return normalized;
}

function assertRole(value: string | null | undefined): AdminRole {
  const normalized = normalizeAdminRole(value);
  if (!normalize(value)) {
    throw new AdminTeamError('Role is required.', 400);
  }
  return normalized;
}

export async function listAdminTeamMembers(): Promise<AdminTeamMember[]> {
  assertDatabaseMode();
  const rows = await getDb().select().from(adminUsersTable);
  return rows
    .slice()
    .sort((left, right) => left.displayName.localeCompare(right.displayName) || left.email.localeCompare(right.email))
    .map(mapAdminTeamMember);
}

export async function createAdminTeamMember(input: {
  email: string;
  displayName: string;
  role: string;
  password: string;
}) {
  assertDatabaseMode();

  const email = normalizeEmail(input.email);
  const displayName = normalize(input.displayName);
  const role = assertRole(input.role);
  const password = assertPasswordPolicy(input.password, true);

  if (!email) {
    throw new AdminTeamError('Email is required.', 400);
  }

  if (!displayName) {
    throw new AdminTeamError('Display name is required.', 400);
  }

  const existing = await findAdminUserByEmail(email);
  if (existing) {
    throw new AdminTeamError('An admin user with that email already exists.', 409);
  }

  const timestamp = nowIso();
  const nextUser: AdminUserRow = {
    id: randomUUID(),
    email,
    displayName,
    passwordHash: await hashAdminPassword(password),
    role,
    createdAt: timestamp,
    updatedAt: timestamp,
    lastLoginAt: null
  };

  await getDb().insert(adminUsersTable).values(nextUser);
  return mapAdminTeamMember(nextUser);
}

export async function updateAdminTeamMember(
  id: string,
  input: {
    displayName: string;
    role: string;
    password?: string | null;
  },
  actorUserId?: string | null
) {
  assertDatabaseMode();

  const existing = await findAdminUserById(id);
  if (!existing) {
    throw new AdminTeamError('Admin user not found.', 404);
  }

  const displayName = normalize(input.displayName);
  const role = assertRole(input.role);
  const password = assertPasswordPolicy(input.password ?? '', false);

  if (!displayName) {
    throw new AdminTeamError('Display name is required.', 400);
  }

  if (actorUserId && actorUserId === id && role !== normalizeAdminRole(existing.role)) {
    throw new AdminTeamError('Use another super admin account to change your own role.', 409);
  }

  if (normalizeAdminRole(existing.role) === 'super_admin' && role !== 'super_admin') {
    const superAdminCount = await countSuperAdmins();
    if (superAdminCount <= 1) {
      throw new AdminTeamError('At least one super admin must remain on the team.', 409);
    }
  }

  const updates: Partial<AdminUserRow> = {
    displayName,
    role,
    updatedAt: nowIso()
  };

  if (password) {
    updates.passwordHash = await hashAdminPassword(password);
  }

  await getDb().update(adminUsersTable).set(updates).where(eq(adminUsersTable.id, id));
  return mapAdminTeamMember({
    ...existing,
    ...updates
  });
}

export async function deleteAdminTeamMember(id: string, actorUserId?: string | null) {
  assertDatabaseMode();

  const existing = await findAdminUserById(id);
  if (!existing) {
    throw new AdminTeamError('Admin user not found.', 404);
  }

  if (actorUserId && actorUserId === id) {
    throw new AdminTeamError('You cannot delete the account you are currently using.', 409);
  }

  if (normalizeAdminRole(existing.role) === 'super_admin') {
    const superAdminCount = await countSuperAdmins();
    if (superAdminCount <= 1) {
      throw new AdminTeamError('At least one super admin must remain on the team.', 409);
    }
  }

  await getDb().delete(adminSessionsTable).where(eq(adminSessionsTable.userId, id));
  await getDb().delete(adminUsersTable).where(eq(adminUsersTable.id, id));
  return mapAdminTeamMember(existing);
}
