import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { deleteMediaAsset, getMediaAssetById, updateMediaAsset } from '@/features/cms/contentStore';
import { getMediaUsage } from '@/features/cms/mediaUsage';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { deleteUploadedMedia } from '@/services/mediaStorage';
import { validateMediaAsset } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth;

  const { id } = await params;
  const mediaAsset = await getMediaAssetById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  return NextResponse.json({ mediaAsset });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'media:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const existing = await getMediaAssetById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  const payload = validateMediaAsset(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid media asset payload' }, { status: 400 });
  }

  const usesManagedStorage =
    !!existing.storageKey && (existing.storageProvider === 'local' || existing.storageProvider === 'supabase');
  const shouldCleanup =
    usesManagedStorage &&
    (payload.storageProvider !== existing.storageProvider ||
      payload.storageKey !== existing.storageKey);

  const mediaAsset = await updateMediaAsset(id, payload);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  if (shouldCleanup) {
    await deleteUploadedMedia(existing.storageKey || '', existing.storageProvider);
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'media.update',
      entityType: 'media_asset',
      entityId: mediaAsset.id,
      userId: session.user.id,
      metadata: {
        title: mediaAsset.title,
        url: mediaAsset.url,
        mimeType: mediaAsset.mimeType
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ mediaAsset });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'media:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const mediaAsset = await getMediaAssetById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  const usage = await getMediaUsage(mediaAsset);
  if (usage.length > 0) {
    return NextResponse.json(
      {
        error: 'This media asset is still used in published or draft content.',
        usage
      },
      { status: 409 }
    );
  }

  const removed = await deleteMediaAsset(id);
  if (!removed) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  if (
    mediaAsset.storageKey &&
    (mediaAsset.storageProvider === 'local' || mediaAsset.storageProvider === 'supabase')
  ) {
    try {
      await deleteUploadedMedia(mediaAsset.storageKey, mediaAsset.storageProvider);
    } catch {
      // keep deletion behavior stable even if file cleanup fails
    }
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'media.delete',
      entityType: 'media_asset',
      entityId: mediaAsset.id,
      userId: session.user.id,
      metadata: {
        title: mediaAsset.title,
        url: mediaAsset.url,
        mimeType: mediaAsset.mimeType
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ ok: true });
}
