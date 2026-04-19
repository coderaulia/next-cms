import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { updateContactSubmissionStatus } from '@/features/cms/contactSubmissionsStore';
import { validateContactSubmissionStatus } from '@/features/cms/validators';

export async function PATCH(
  request: Request,
  context: { params: Promise<{ id: string }> }
) {
  const auth = await assertAdminRequest(request);
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const body = await request.json().catch(() => null);
  const status = validateContactSubmissionStatus(body?.status);
  if (!status) {
    return NextResponse.json({ error: 'Invalid status.' }, { status: 400 });
  }

  const { id } = await context.params;
  const submission = await updateContactSubmissionStatus(id, status);
  if (!submission) {
    return NextResponse.json({ error: 'Submission not found.' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'contact_submission.update_status',
      entityType: 'contact_submission',
      entityId: submission.id,
      userId: session.user.id,
      metadata: {
        status: submission.status,
        email: submission.email,
        serviceCategory: submission.serviceCategory
      }
    });
  } catch {
    // swallow audit log failures
  }

  return NextResponse.json({ submission });
}
