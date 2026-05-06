import { NextResponse } from 'next/server';

import { createContactSubmission } from '@/features/cms/contactSubmissionsStore';
import { validateContactSubmission } from '@/features/cms/validators';
import { env } from '@/services/env';
import { notifyContactSubmission } from '@/services/contactNotifications';
import {
  assertCsrfToken,
  assertRateLimit,
  assertTrustedMutationRequest,
  readJsonWithLimit
} from '@/services/requestSecurity';

const contactSubmissionBodyLimitBytes = 16 * 1024;

export async function POST(request: Request) {
  const originFailure = assertTrustedMutationRequest(request);
  if (originFailure) return originFailure;

  const csrfFailure = assertCsrfToken(request);
  if (csrfFailure) return csrfFailure;

  const rateLimitFailure = await assertRateLimit(request, 'contact-form', 10, 60_000);
  if (rateLimitFailure) return rateLimitFailure;

  if (!env.databaseUrl) {
    return NextResponse.json({ error: 'Contact submissions are unavailable.' }, { status: 503 });
  }

  const body = await readJsonWithLimit(request, contactSubmissionBodyLimitBytes);
  if (!body.ok) return body.response;

  const payload = validateContactSubmission(body.value);
  if (!payload) {
    return NextResponse.json({ error: 'Invalid contact submission payload.' }, { status: 400 });
  }

  const submission = await createContactSubmission({
    name: payload.name,
    company: payload.company,
    email: payload.email,
    serviceCategory: payload.serviceCategory,
    projectOverview: payload.projectOverview
  });

  try {
    await notifyContactSubmission(submission);
  } catch {
    // notification is non-blocking
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
