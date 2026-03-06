import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import type { NeonHttpDatabase } from 'drizzle-orm/neon-http';

import { env } from '@/services/env';

import * as schema from './schema';

type DbClient = NeonHttpDatabase<typeof schema>;

let db: DbClient | null = null;

neonConfig.disableWarningInBrowsers = true;

export function getDb(): DbClient {
  if (!env.databaseUrl) {
    throw new Error('DATABASE_URL is not configured.');
  }

  if (!db) {
    db = drizzle(neon(env.databaseUrl), { schema });
  }

  return db;
}
