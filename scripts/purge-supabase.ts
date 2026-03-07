import '../src/services/loadLocalEnv';

import { sql } from 'drizzle-orm';

import { getDb } from '@/db/client';

const TABLES = [
  'admin_sessions',
  'admin_users',
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
      'Refusing to purge CMS data without --force or --yes.\nRun: npm run db:purge -- --force'
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
    console.log('No CMS tables found in public schema. Nothing to purge.');
    return;
  }

  await Promise.all(
    existingTables.map((tableName) =>
      db.execute(sql.raw(`TRUNCATE TABLE "${tableName}" RESTART IDENTITY CASCADE`))
    )
  );

  console.log(
    `Purged ${existingTables.length} CMS tables in public schema: ${existingTables.join(', ')}`
  );
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
