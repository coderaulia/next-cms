/**
 * Enable Row Level Security on all CMS tables.
 *
 * WHY: Supabase exposes a public PostgREST API. Without RLS, anyone with the
 * anon key can read/write every table — including admin_users (password hashes),
 * admin_sessions, and contact_submissions (PII).
 *
 * SAFE: This app connects via direct Postgres pool (DATABASE_URL) as the table
 * owner. RLS is bypassed by the table owner, so the app is unaffected. Only
 * the PostgREST anon/authenticated roles are locked out.
 *
 * No CREATE POLICY is needed — RLS enabled with zero policies = deny-all for
 * non-owner roles.
 *
 * Usage:
 *   npx tsx scripts/enable-rls.ts              # dry run (default)
 *   npx tsx scripts/enable-rls.ts --apply      # apply changes
 */

import '../src/services/loadLocalEnv';

import { sql } from 'drizzle-orm';
import { getDb } from '@/db/client';

const TABLES = [
  'admin_audit_logs',
  'admin_login_lockouts',
  'admin_sessions',
  'admin_users',
  'analytics_events',
  'blog_posts',
  'categories',
  'cms_content_revisions',
  'comments',
  'contact_submissions',
  'media_assets',
  'notifications',
  'page_404_log',
  'pages',
  'portfolio_project_tags',
  'portfolio_projects',
  'portfolio_tags',
  'post_categories',
  'redirects',
  'request_rate_limits',
  'site_settings',
  'user_dashboard_preferences',
];

function isApplyMode() {
  return process.argv.includes('--apply');
}

async function main() {
  const db = getDb();
  const apply = isApplyMode();

  console.log(apply ? '[rls] Applying RLS to all tables...' : '[rls] DRY RUN — pass --apply to execute.\n');

  // Check current RLS status
  const result = await db.execute<{ tablename: string; rowsecurity: boolean }>(sql`
    SELECT tablename, rowsecurity
    FROM pg_tables
    WHERE schemaname = 'public'
    ORDER BY tablename
  `);

  const existing = new Map<string, boolean>();
  for (const row of result.rows) {
    existing.set(row.tablename, row.rowsecurity);
  }

  const alreadyEnabled: string[] = [];
  const willEnable: string[] = [];
  const notFound: string[] = [];

  for (const table of TABLES) {
    const rlsStatus = existing.get(table);
    if (rlsStatus === undefined) {
      notFound.push(table);
    } else if (rlsStatus) {
      alreadyEnabled.push(table);
    } else {
      willEnable.push(table);
    }
  }

  // Report any public tables NOT in our list (catch new tables)
  const unlisted: string[] = [];
  for (const [tableName, hasRls] of existing) {
    if (tableName.startsWith('_')) continue; // drizzle internal
    if (!TABLES.includes(tableName) && !hasRls) {
      unlisted.push(tableName);
    }
  }

  if (alreadyEnabled.length > 0) {
    console.log(`✓ Already enabled (${alreadyEnabled.length}):`);
    for (const t of alreadyEnabled) console.log(`    ${t}`);
  }

  if (notFound.length > 0) {
    console.log(`⚠ Not found in database (${notFound.length}):`);
    for (const t of notFound) console.log(`    ${t}`);
  }

  if (unlisted.length > 0) {
    console.log(`⚠ Public tables NOT in script (may need RLS too):`);
    for (const t of unlisted) console.log(`    ${t}`);
  }

  if (willEnable.length === 0) {
    console.log('\n✓ All tables already have RLS enabled. Nothing to do.');
    process.exit(0);
  }

  console.log(`\n→ Will enable RLS on ${willEnable.length} table(s):`);
  for (const t of willEnable) console.log(`    ${t}`);

  if (!apply) {
    console.log('\nDry run complete. Run with --apply to execute.');
    process.exit(0);
  }

  console.log('');

  for (const table of willEnable) {
    // Enable RLS — deny-all for non-owner roles (anon, authenticated)
    await db.execute(sql.raw(`ALTER TABLE public."${table}" ENABLE ROW LEVEL SECURITY`));

    // Force RLS for the table owner too would break our app, so we do NOT use FORCE.
    // Default behavior: owner bypasses RLS, which is exactly what we want.

    console.log(`  ✓ ${table}`);
  }

  // Also revoke direct access from anon/authenticated as belt-and-suspenders
  console.log('\nRevoking direct table access from anon and authenticated roles...');
  await db.execute(sql`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM anon`);
  await db.execute(sql`REVOKE ALL ON ALL TABLES IN SCHEMA public FROM authenticated`);
  console.log('  ✓ Revoked');

  // Revoke sequence access too (prevents serial/identity abuse)
  try {
    await db.execute(sql`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM anon`);
    await db.execute(sql`REVOKE ALL ON ALL SEQUENCES IN SCHEMA public FROM authenticated`);
    console.log('  ✓ Sequences revoked');
  } catch {
    // Some setups may not have sequences — non-fatal
  }

  console.log('\n✓ Done. All tables locked down via RLS + REVOKE.');
  console.log('  Your app uses direct Postgres pool (owner role) — unaffected.');
  console.log('  PostgREST anon/authenticated API is now fully blocked.');

  process.exit(0);
}

main().catch((err) => {
  console.error('[rls] Failed:', err instanceof Error ? err.message : err);
  process.exit(1);
});
