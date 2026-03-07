import { NextResponse } from 'next/server';

import { createContactSubmission } from '@/features/cms/contactSubmissionsStore';
import { validateContactSubmission } from '@/features/cms/validators';
import { env } from '@/services/env';
import { assertRateLimit, assertTrustedMutationRequest } from '@/services/requestSecurity';

export async function POST(request: Request) {
  const originFailure = assertTrustedMutationRequest(request);
  if (originFailure) return originFailure;

  const rateLimitFailure = assertRateLimit(request, 'contact-form', 10, 60_000);
  if (rateLimitFailure) return rateLimitFailure;

  if (!env.databaseUrl) {
    return NextResponse.json({ error: 'Contact submissions are unavailable.' }, { status: 503 });
  }

  const payload = validateContactSubmission(await request.json().catch(() => null));
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

  return NextResponse.json({ ok: true, submission }, { status: 201 });
}
