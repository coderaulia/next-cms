import { createHash } from 'node:crypto';
import { desc, eq, gt } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { adminSessionsTable, adminUsersTable } from '@/db/schema';
import { nowIso } from '@/features/cms/storeShared';

import { assertAdminPermission, logAdminAuditEvent } from '@/features/cms/adminAuth';

export type AdminSessionInfo = {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userRole: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
};

export async function GET(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'team:manage');
  if (unauthorized) return unauthorized;

  const db = getDb();

  const rows = await db
    .select({
      session: adminSessionsTable,
      user: adminUsersTable
    })
    .from(adminSessionsTable)
    .leftJoin(adminUsersTable, eq(adminSessionsTable.userId, adminUsersTable.id))
    .where(gt(adminSessionsTable.expiresAt, nowIso()))
    .orderBy(desc(adminSessionsTable.createdAt));

  const cookieHeader = request.headers.get('cookie') ?? '';
  const cookies = cookieHeader.split(';').map((c) => c.trim());
  const sessionCookie = cookies.find((c) => c.startsWith('cms_admin_session='));
  const rawToken = sessionCookie ? sessionCookie.split('=')[1] : '';
  const currentTokenHash = rawToken ? createHash('sha256').update(rawToken).digest('hex') : '';

  const sessions: AdminSessionInfo[] = rows
    .filter((row) => row.user != null)
    .map((row) => {
      const session = row.session;
      const user = row.user!;
      return {
        id: session.id,
        userId: session.userId,
        userEmail: user.email,
        userDisplayName: user.displayName,
        userRole: user.role,
        expiresAt: session.expiresAt,
        createdAt: session.createdAt,
        isCurrent: session.sessionToken === currentTokenHash
      };
    });

  return NextResponse.json({ sessions });
}

export async function DELETE(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'team:manage');
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const sessionId = searchParams.get('id');

  if (!sessionId) {
    return NextResponse.json({ error: 'Session ID required' }, { status: 400 });
  }

  const db = getDb();

  const rows = await db.select().from(adminSessionsTable).where(eq(adminSessionsTable.id, sessionId)).limit(1);

  const session = rows[0];
  if (!session) {
    return NextResponse.json({ error: 'Session not found' }, { status: 404 });
  }

  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.id, sessionId));

  await logAdminAuditEvent(request, {
    action: 'session.revoked',
    entityType: 'session',
    entityId: sessionId,
    metadata: { revokedUserId: session.userId }
  });

  return NextResponse.json({ success: true });
}
