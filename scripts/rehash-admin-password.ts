/**
 * Re-hashes the admin password using the current PASSWORD_PEPPER from .env.
 * Run this after setting PASSWORD_PEPPER on a DB that has existing admin users.
 *
 * Usage:
 *   npx tsx scripts/rehash-admin-password.ts
 *   npx tsx scripts/rehash-admin-password.ts --dry-run
 */
import { config } from 'dotenv';
import { resolve } from 'node:path';
config({ path: resolve(process.cwd(), '.env') });

import { eq } from 'drizzle-orm';
import { getDb } from '../src/db/client';
const db = getDb();
import { adminUsersTable } from '../src/db/schema';
import { hashAdminPassword } from '../src/features/cms/adminAuth';

const dryRun = process.argv.includes('--dry-run');

const email = process.env.CMS_ADMIN_EMAIL;
const password = process.env.CMS_ADMIN_PASSWORD;

if (!email || !password) {
  console.error('CMS_ADMIN_EMAIL and CMS_ADMIN_PASSWORD must be set');
  process.exit(1);
}

if (!process.env.PASSWORD_PEPPER) {
  console.error('PASSWORD_PEPPER not set — nothing to do');
  process.exit(1);
}

const users = await db
  .select({ id: adminUsersTable.id, email: adminUsersTable.email })
  .from(adminUsersTable)
  .where(eq(adminUsersTable.email, email));

if (users.length === 0) {
  console.error(`No admin user found with email: ${email}`);
  process.exit(1);
}

const user = users[0];
const newHash = await hashAdminPassword(password);

if (dryRun) {
  console.log(`[dry-run] Would update password hash for ${user.email} (id: ${user.id})`);
  process.exit(0);
}

await db
  .update(adminUsersTable)
  .set({ passwordHash: newHash, updatedAt: new Date().toISOString() })
  .where(eq(adminUsersTable.id, user.id));

console.log(`Updated password hash for ${user.email}`);
