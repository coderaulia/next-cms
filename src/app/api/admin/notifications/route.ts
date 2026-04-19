import { desc, eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { notificationsTable } from '@/db/schema';
import { assertAdminPermission } from '@/features/cms/adminAuth';
import type { Notification, NotificationType } from '@/features/cms/notifications';

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'dashboard:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { searchParams } = new URL(request.url);
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '20', 10), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0', 10);

  const session = await import('@/features/cms/adminAuth').then((m) => m.getAdminSession(request));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, session.user.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const notifications: Notification[] = rows.map((row) => ({
    id: row.id,
    userId: row.userId,
    type: row.type as NotificationType,
    title: row.title,
    message: row.message,
    entityType: row.entityType,
    entityId: row.entityId,
    read: row.read,
    createdAt: row.createdAt
  }));

  return NextResponse.json({ notifications });
}

export async function DELETE(request: Request) {
  const auth = await assertAdminPermission(request, 'dashboard:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { searchParams } = new URL(request.url);
  const notificationId = searchParams.get('id');

  if (!notificationId) {
    return NextResponse.json({ error: 'Notification ID required' }, { status: 400 });
  }

  const session = await import('@/features/cms/adminAuth').then((m) => m.getAdminSession(request));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.id, notificationId))
    .limit(1);

  const notification = rows[0];
  if (!notification || notification.userId !== session.user.id) {
    return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
  }

  await db.delete(notificationsTable).where(eq(notificationsTable.id, notificationId));

  return NextResponse.json({ success: true });
}

export async function PUT(request: Request) {
  const auth = await assertAdminPermission(request, 'dashboard:view');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const session = await import('@/features/cms/adminAuth').then((m) => m.getAdminSession(request));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as { action?: string; notificationId?: string } | null;
  if (!body || !body.action) {
    return NextResponse.json({ error: 'Action required' }, { status: 400 });
  }

  const db = getDb();

  if (body.action === 'mark_all_read') {
    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.userId, session.user.id));

    return NextResponse.json({ success: true });
  }

  if (body.action === 'mark_read' && body.notificationId) {
    const rows = await db
      .select()
      .from(notificationsTable)
      .where(eq(notificationsTable.id, body.notificationId))
      .limit(1);

    const notification = rows[0];
    if (!notification || notification.userId !== session.user.id) {
      return NextResponse.json({ error: 'Notification not found' }, { status: 404 });
    }

    await db
      .update(notificationsTable)
      .set({ read: true })
      .where(eq(notificationsTable.id, body.notificationId));

    return NextResponse.json({ success: true });
  }

  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}
