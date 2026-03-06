import { existsSync } from 'node:fs';

import { config as loadEnv } from 'dotenv';
import { defineConfig } from 'drizzle-kit';

for (const file of ['.env.local', '.env']) {
  if (existsSync(file)) {
    loadEnv({ path: file, override: false, quiet: true });
  }
}

const clean = (value: string | undefined) => value?.trim().replace(/^['"]|['"]$/g, '') || '';
const connectionString = clean(process.env.DATABASE_URL_MIGRATION) || clean(process.env.DATABASE_URL);

if (!connectionString) {
  throw new Error('Set DATABASE_URL or DATABASE_URL_MIGRATION before running Drizzle commands.');
}

export default defineConfig({
  schema: './src/db/schema.ts',
  out: './drizzle',
  dialect: 'postgresql',
  dbCredentials: {
    url: connectionString
  },
  strict: true,
  verbose: true
});

