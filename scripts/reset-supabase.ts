import '../src/services/loadLocalEnv';

import { sql } from 'drizzle-orm';

import { getDb } from '@/db/client';

const TABLES = [
  '_drizzle_migrations',
  'admin_audit_logs',
  'admin_login_lockouts',
  'admin_sessions',
  'admin_users',
  'request_rate_limits',
  'post_categories',
  'blog_posts',
  'categories',
  'media_assets',
  'contact_submissions',
  'comments',
  'pages',
  'site_settings'
];

function isForceMode() {
  return process.argv.includes('--force') || process.argv.includes('--yes');
}

async function main() {
  if (!isForceMode()) {
    console.error(
      'Refusing to reset CMS schema without --force or --yes.\nRun: npm run db:reset -- --force'
    );
    process.exit(1);
  }

  const db = getDb();

  const checks = await Promise.all(
    TABLES.map(async (tableName) => {
      const result = await db.execute<{ exists: boolean }>(
        sql`
          SELECT EXISTS(
            SELECT 1
            FROM information_schema.tables
            WHERE table_schema = 'public'
              AND table_name = ${tableName}
          ) AS exists
        `
      );

      return {
        tableName,
        exists: result.rows[0]?.exists === true
      };
    })
  );

  const existingTables = checks
    .filter((entry) => entry.exists)
    .map((entry) => entry.tableName);

  if (existingTables.length === 0) {
    console.log('No CMS tables found in public schema. Nothing to reset.');
    return;
  }

  for (const tableName of existingTables) {
    await db.execute(sql.raw(`DROP TABLE IF EXISTS "${tableName}" CASCADE`));
  }

  console.log(`Dropped ${existingTables.length} CMS tables in public schema: ${existingTables.join(', ')}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
