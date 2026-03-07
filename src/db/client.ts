import { drizzle } from 'drizzle-orm/node-postgres';
import type { NodePgDatabase } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';

import { env } from '@/services/env';

import * as schema from './schema';

type DbClient = NodePgDatabase<typeof schema>;

declare global {
  var __cmsPgPool: Pool | undefined;
  var __cmsDb: DbClient | undefined;
}

function getPool() {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!globalThis.__cmsPgPool) {
    globalThis.__cmsPgPool = new Pool({
      connectionString: env.databaseUrl,
      max: process.env.NODE_ENV === 'production' ? 10 : 4
    });
  }

  return globalThis.__cmsPgPool;
}

export function getDb(): DbClient {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!globalThis.__cmsDb) {
    globalThis.__cmsDb = drizzle(getPool(), { schema });
  }

  return globalThis.__cmsDb;
}
