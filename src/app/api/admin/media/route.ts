import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createMediaAsset, getMediaAssets } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validateMediaAsset } from '@/features/cms/validators';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const mediaAssets = await getMediaAssets();
  return NextResponse.json({ mediaAssets });
}

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'media:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const payload = validateMediaAsset(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid media asset payload' }, { status: 400 });
  }

  const mediaAsset = await createMediaAsset(payload);

  try {
    await logAdminAuditEvent(request, {
      action: 'media.create',
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
  return NextResponse.json({ mediaAsset }, { status: 201 });
}
