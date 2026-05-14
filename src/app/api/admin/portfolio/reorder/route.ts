import { NextResponse } from 'next/server';

import { assertAdminPermission, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { reorderPortfolioProjects } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const body = (await request.json().catch(() => null)) as { orderedIds?: unknown } | null;

  if (
    !body ||
    !Array.isArray(body.orderedIds) ||
    body.orderedIds.length === 0 ||
    !body.orderedIds.every((id: unknown) => typeof id === 'string' && id.length > 0)
  ) {
    return NextResponse.json(
      { error: 'Invalid payload. Provide { orderedIds: string[] }.' },
      { status: 400 }
    );
  }

  const orderedIds = body.orderedIds as string[];

  if (orderedIds.length > 200) {
    return NextResponse.json(
      { error: 'Too many items. Maximum 200 projects per reorder request.' },
      { status: 400 }
    );
  }

  const result = await reorderPortfolioProjects(orderedIds);

  try {
    await logAdminAuditEvent(request, {
      action: 'portfolio.reorder',
      entityType: 'portfolio_project',
      entityId: orderedIds[0],
      userId: session.user.id,
      metadata: {
        count: orderedIds.length,
        firstId: orderedIds[0],
        lastId: orderedIds[orderedIds.length - 1]
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ ok: true, updated: result.updated });
}
