import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { env } from '@/services/env';

export async function GET() {
  if (!env.databaseUrl) {
    return NextResponse.json({ status: 'ok', db: false, mode: 'file' });
  }

  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ status: 'ok', db: true, mode: 'database' });
  } catch {
    return NextResponse.json({ status: 'degraded', db: false, mode: 'database' }, { status: 503 });
  }
}
