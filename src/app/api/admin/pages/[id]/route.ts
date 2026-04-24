import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
import { getPageById, upsertPage } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { isValidPageId, validateLandingPage } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth;

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

  const editAuth = await assertAdminPermission(request, 'content:edit');
  if ('error' in editAuth) return editAuth.error;
  const session = editAuth.session;

  const payload = validateLandingPage(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid page payload' }, { status: 400 });
  }

  const publishStateChanged =
    existing.published !== payload.published ||
    (existing.scheduledPublishAt ?? null) !== (payload.scheduledPublishAt ?? null) ||
    (existing.scheduledUnpublishAt ?? null) !== (payload.scheduledUnpublishAt ?? null);
  if (publishStateChanged) {
    const publishAuth = await assertAdminPermission(request, 'content:publish');
    if ('error' in publishAuth) return publishAuth.error;
  }

  const page = await upsertPage(payload);
  const saveMode = (request.headers.get('x-cms-save-mode') ?? 'manual').trim().toLowerCase();

  try {
    if (saveMode !== 'autosave') {
      await captureContentRevision({
        entityType: 'page',
        entityId: page.id,
        label: publishStateChanged ? 'Saved page with publish changes' : 'Saved page',
        payload: page,
        userId: session.user.id,
        userDisplayName: session?.user.displayName ?? null
      });
    }

    await logAdminAuditEvent(request, {
      action: 'page.update',
      entityType: 'page',
      entityId: page.id,
      userId: session.user.id,
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
