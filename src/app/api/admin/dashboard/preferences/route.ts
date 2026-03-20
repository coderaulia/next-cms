import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { userDashboardPreferencesTable } from '@/db/schema';
import { assertAdminPermission } from '@/features/cms/adminAuth';
import { nowIso } from '@/features/cms/storeShared';
import { randomUUID } from 'node:crypto';

export type DashboardPreferences = {
  widgetOrder: string[];
  hiddenWidgets: string[];
};

export async function GET(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'dashboard:view');
  if (unauthorized) return unauthorized;

  const session = await import('@/features/cms/adminAuth').then((m) => m.getAdminSession(request));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const db = getDb();

  const rows = await db
    .select()
    .from(userDashboardPreferencesTable)
    .where(eq(userDashboardPreferencesTable.userId, session.user.id))
    .limit(1);

  if (rows.length === 0) {
    return NextResponse.json({
      preferences: {
        widgetOrder: [],
        hiddenWidgets: []
      }
    });
  }

  return NextResponse.json({
    preferences: {
      widgetOrder: rows[0].widgetOrder,
      hiddenWidgets: rows[0].hiddenWidgets
    }
  });
}

export async function PUT(request: Request) {
  const unauthorized = await assertAdminPermission(request, 'dashboard:view');
  if (unauthorized) return unauthorized;

  const session = await import('@/features/cms/adminAuth').then((m) => m.getAdminSession(request));
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json().catch(() => null) as DashboardPreferences | null;
  if (!body) {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 });
  }

  const widgetOrder = Array.isArray(body.widgetOrder) ? body.widgetOrder : [];
  const hiddenWidgets = Array.isArray(body.hiddenWidgets) ? body.hiddenWidgets : [];

  const db = getDb();

  const existing = await db
    .select()
    .from(userDashboardPreferencesTable)
    .where(eq(userDashboardPreferencesTable.userId, session.user.id))
    .limit(1);

  if (existing.length === 0) {
    await db.insert(userDashboardPreferencesTable).values({
      id: randomUUID(),
      userId: session.user.id,
      widgetOrder,
      hiddenWidgets,
      updatedAt: nowIso()
    });
  } else {
    await db
      .update(userDashboardPreferencesTable)
      .set({
        widgetOrder,
        hiddenWidgets,
        updatedAt: nowIso()
      })
      .where(eq(userDashboardPreferencesTable.userId, session.user.id));
  }

  return NextResponse.json({
    preferences: { widgetOrder, hiddenWidgets }
  });
}
