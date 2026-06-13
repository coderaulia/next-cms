import { NextResponse } from 'next/server';
import { sql } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { env } from '@/services/env';

export async function GET() {
  if (!env.databaseUrl) {
    return NextResponse.json({ status: 'ok' });
  }

  try {
    await getDb().execute(sql`select 1`);
    return NextResponse.json({ status: 'ok' });
  } catch {
    return NextResponse.json({ status: 'degraded' }, { status: 503 });
  }
}
