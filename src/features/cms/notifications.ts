import { eq, desc } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';

import { getDb } from '@/db/client';
import { notificationsTable } from '@/db/schema';
import { nowIso } from '@/features/cms/storeShared';

export type NotificationType = 'schedule_publish' | 'schedule_unpublish' | 'approval_request' | 'mention' | 'system';

export type Notification = {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType: string | null;
  entityId: string | null;
  read: boolean;
  createdAt: string;
};

export async function createNotification(params: {
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  entityType?: string;
  entityId?: string;
}): Promise<Notification> {
  const db = getDb();
  const now = nowIso();
  const id = randomUUID();

  await db.insert(notificationsTable).values({
    id,
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    read: false,
    createdAt: now
  });

  return {
    id,
    userId: params.userId,
    type: params.type,
    title: params.title,
    message: params.message,
    entityType: params.entityType ?? null,
    entityId: params.entityId ?? null,
    read: false,
    createdAt: now
  };
}

export async function getNotificationsForUser(userId: string, limit = 20): Promise<Notification[]> {
  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(Math.min(Math.max(limit, 1), 100));

  return rows.map((row) => ({
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
}

export async function getUnreadNotificationCount(userId: string): Promise<number> {
  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, userId));

  return rows.filter((row) => !row.read).length;
}

export async function markNotificationAsRead(notificationId: string, userId: string): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.id, notificationId))
    .limit(1);

  const notification = rows[0];
  if (!notification || notification.userId !== userId) {
    return false;
  }

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.id, notificationId));

  return true;
}

export async function markAllNotificationsAsRead(userId: string): Promise<void> {
  const db = getDb();

  await db
    .update(notificationsTable)
    .set({ read: true })
    .where(eq(notificationsTable.userId, userId));
}

export async function deleteNotification(notificationId: string, userId: string): Promise<boolean> {
  const db = getDb();

  const rows = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.id, notificationId))
    .limit(1);

  const notification = rows[0];
  if (!notification || notification.userId !== userId) {
    return false;
  }

  await db.delete(notificationsTable).where(eq(notificationsTable.id, notificationId));
  return true;
}
