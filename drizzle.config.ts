import { defineConfig } from 'drizzle-kit';

import './src/services/loadLocalEnv';

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
