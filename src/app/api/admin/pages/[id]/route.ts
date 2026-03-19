import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { getPageById, upsertPage } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { isValidPageId, validateLandingPage } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isValidPageId(id)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
  }
  const page = await getPageById(id);
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  return NextResponse.json({ page });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const { id } = await params;
  if (!isValidPageId(id)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
  }

  const existing = await getPageById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }

  const editFailure = await assertAdminPermission(request, 'content:edit');
  if (editFailure) return editFailure;

  const payload = validateLandingPage(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid page payload' }, { status: 400 });
  }

  const publishStateChanged =
    existing.published !== payload.published ||
    (existing.scheduledPublishAt ?? null) !== (payload.scheduledPublishAt ?? null) ||
    (existing.scheduledUnpublishAt ?? null) !== (payload.scheduledUnpublishAt ?? null);
  if (publishStateChanged) {
    const publishFailure = await assertAdminPermission(request, 'content:publish');
    if (publishFailure) return publishFailure;
  }

  const page = await upsertPage(payload);
  const session = await getAdminSession(request);

  try {
    await logAdminAuditEvent(request, {
      action: 'page.update',
      entityType: 'page',
      entityId: page.id,
      userId: session?.user.id ?? null,
      metadata: {
        title: page.title,
        slug: page.seo.slug,
        published: page.published
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ page });
}
