import { eq, desc } from 'drizzle-orm';
import { NextResponse } from 'next/server';

import { getDb } from '@/db/client';
import { redirectsTable } from '@/db/schema';
import { assertAdminPermission } from '@/features/cms/adminAuth';
import { nowIso } from '@/features/cms/storeShared';
import { randomUUID } from 'node:crypto';

export type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'settings:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const db = getDb();

  const rows = await db
    .select()
    .from(redirectsTable)
    .orderBy(desc(redirectsTable.createdAt));

  const redirects: Redirect[] = rows.map((row) => ({
    id: row.id,
    fromPath: row.fromPath,
    toPath: row.toPath,
    type: row.type,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt
  }));

  return NextResponse.json({ redirects });
}

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'settings:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const body = await request.json().catch(() => null) as { fromPath?: string; toPath?: string; type?: string } | null;

  if (!body || !body.fromPath || !body.toPath) {
    return NextResponse.json({ error: 'fromPath and toPath are required' }, { status: 400 });
  }

  const fromPath = '/' + body.fromPath.replace(/^\/+|\/+$/g, '');
  const toPath = body.toPath.startsWith('/') ? body.toPath : '/' + body.toPath.replace(/^\/+|\/+$/g, '');
  const type = ['301', '302', '307', '308'].includes(body.type || '') ? body.type! : '302';

  const db = getDb();
  const now = nowIso();

  const existing = await db
    .select()
    .from(redirectsTable)
    .where(eq(redirectsTable.fromPath, fromPath))
    .limit(1);

  if (existing.length > 0) {
    return NextResponse.json({ error: 'A redirect from this path already exists' }, { status: 409 });
  }

  const id = randomUUID();
  await db.insert(redirectsTable).values({
    id,
    fromPath,
    toPath,
    type,
    createdAt: now,
    updatedAt: now
  });

  return NextResponse.json({
    redirect: {
      id,
      fromPath,
      toPath,
      type,
      createdAt: now,
      updatedAt: now
    }
  });
}
