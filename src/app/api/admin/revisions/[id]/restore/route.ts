import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { getContentRevision, restoreContentRevision } from '@/features/cms/contentRevisions';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import type { CmsRevisionEntityType } from '@/features/cms/types';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function requiredPermission(entityType: CmsRevisionEntityType) {
  return entityType === 'site_settings' || entityType === 'full_site' ? 'settings:edit' : 'content:edit';
}

export async function POST(request: Request, { params }: RouteContext) {
  const { id } = await params;
  const revision = await getContentRevision(id);
  if (!revision) {
    return NextResponse.json({ error: 'Revision not found.' }, { status: 404 });
  }

  const unauthorized = await assertAdminPermission(request, requiredPermission(revision.entityType));
  if (unauthorized) return unauthorized;

  const session = await getAdminSession(request);
  const restored = await restoreContentRevision(id, {
    userId: session?.user.id ?? null,
    userDisplayName: session?.user.displayName ?? null
  });

  if (!restored) {
    return NextResponse.json({ error: 'Revision not found.' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'content.restore',
      entityType: restored.entityType,
      entityId: restored.entityId,
      userId: session?.user.id ?? null,
      metadata: {
        revisionId: id,
        restoredEntityType: restored.entityType
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json(restored);
}
