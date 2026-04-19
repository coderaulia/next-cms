import { eq } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { redirectsTable } from '@/db/schema';
import { assertAdminPermission } from '@/features/cms/adminAuth';
import { nowIso } from '@/features/cms/storeShared';

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await assertAdminPermission(request, 'settings:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;

  const body = await request.json().catch(() => null) as { fromPath?: string; toPath?: string; type?: string } | null;

  if (!body || !body.fromPath || !body.toPath) {
    return NextResponse.json({ error: 'fromPath and toPath are required' }, { status: 400 });
  }

  const fromPath = '/' + body.fromPath.replace(/^\/+|\/+$/g, '');
  const toPath = body.toPath.startsWith('/') ? body.toPath : '/' + body.toPath.replace(/^\/+|\/+$/g, '');
  const type = ['301', '302', '307', '308'].includes(body.type || '') ? body.type! : '302';

  const db = getDb();

  const existing = await db
    .select()
    .from(redirectsTable)
    .where(eq(redirectsTable.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });
  }

  const conflictRedirect = await db
    .select()
    .from(redirectsTable)
    .where(eq(redirectsTable.fromPath, fromPath))
    .limit(1);

  if (conflictRedirect.length > 0 && conflictRedirect[0].id !== id) {
    return NextResponse.json({ error: 'A redirect from this path already exists' }, { status: 409 });
  }

  await db
    .update(redirectsTable)
    .set({
      fromPath,
      toPath,
      type,
      updatedAt: nowIso()
    })
    .where(eq(redirectsTable.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const auth = await assertAdminPermission(request, 'settings:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;

  const db = getDb();

  const existing = await db
    .select()
    .from(redirectsTable)
    .where(eq(redirectsTable.id, id))
    .limit(1);

  if (existing.length === 0) {
    return NextResponse.json({ error: 'Redirect not found' }, { status: 404 });
  }

  await db.delete(redirectsTable).where(eq(redirectsTable.id, id));

  return NextResponse.json({ success: true });
}
