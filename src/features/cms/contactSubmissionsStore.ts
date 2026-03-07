import { desc, eq } from 'drizzle-orm';

import { getDb } from '@/db/client';
import { contactSubmissionsTable } from '@/db/schema';
import { env } from '@/services/env';

import { nowIso } from './storeShared';
import type { ContactSubmission, ContactSubmissionStatus } from './types';

function assertDatabaseMode() {
  if (!env.databaseUrl) {
    throw new Error('Contact submissions require DATABASE_URL.');
  }
}

function rowToSubmission(row: typeof contactSubmissionsTable.$inferSelect): ContactSubmission {
  return {
    id: row.id,
    name: row.name,
    company: row.company,
    email: row.email,
    serviceCategory: row.serviceCategory,
    projectOverview: row.projectOverview,
    status: row.status as ContactSubmissionStatus,
    createdAt: row.createdAt
  };
}

export async function listContactSubmissions(): Promise<ContactSubmission[]> {
  assertDatabaseMode();
  const rows = await getDb()
    .select()
    .from(contactSubmissionsTable)
    .orderBy(desc(contactSubmissionsTable.createdAt));

  return rows.map(rowToSubmission);
}

export async function createContactSubmission(
  input: Omit<ContactSubmission, 'id' | 'status' | 'createdAt'>
): Promise<ContactSubmission> {
  assertDatabaseMode();

  const submission: ContactSubmission = {
    id: crypto.randomUUID(),
    status: 'new',
    createdAt: nowIso(),
    ...input
  };

  await getDb().insert(contactSubmissionsTable).values(submission);
  return submission;
}

export async function updateContactSubmissionStatus(
  id: string,
  status: ContactSubmissionStatus
): Promise<ContactSubmission | null> {
  assertDatabaseMode();

  const rows = await getDb()
    .update(contactSubmissionsTable)
    .set({ status })
    .where(eq(contactSubmissionsTable.id, id))
    .returning();

  return rows[0] ? rowToSubmission(rows[0]) : null;
}

