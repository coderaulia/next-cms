import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { getMediaAssetById, getMediaAssets, updateMediaAsset } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { saveUploadedMedia } from '@/services/mediaStorage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

function parseText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function sha256ForBuffer(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function isImageMimeType(value: string) {
  return value.toLowerCase().startsWith('image/');
}

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'media:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const existing = await getMediaAssetById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  if (!existing.storageKey || !['local', 'supabase'].includes(existing.storageProvider)) {
    return NextResponse.json(
      { error: 'Only managed media assets can be replaced without changing the public URL.' },
      { status: 400 }
    );
  }

  const form = await request.formData();
  const rawFile = form.get('file');
  const altText = parseText(form.get('altText'));
  if (!(rawFile instanceof File)) {
    return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
  }

  if (isImageMimeType(rawFile.type || existing.mimeType) && !(altText || existing.altText)) {
    return NextResponse.json({ error: 'Alt text is required for image replacements.' }, { status: 400 });
  }

  const buffer = Buffer.from(await rawFile.arrayBuffer());
  const checksumSha256 = sha256ForBuffer(buffer);
  const existingAssets = await getMediaAssets();
  const duplicate = existingAssets.find((asset) => asset.id !== existing.id && asset.checksumSha256 === checksumSha256);
  if (duplicate) {
    return NextResponse.json(
      {
        error: 'Duplicate media detected.',
        duplicateOf: duplicate
      },
      { status: 409 }
    );
  }

  const stored = await saveUploadedMedia(new File([buffer], rawFile.name, { type: rawFile.type }), {
    storageKey: existing.storageKey,
    upsert: true
  });

  const mediaAsset = await updateMediaAsset(id, {
    ...existing,
    url: stored.url,
    altText: altText || existing.altText,
    mimeType: rawFile.type || existing.mimeType,
    sizeBytes: stored.sizeBytes,
    checksumSha256,
    storageProvider: stored.storageProvider,
    storageKey: stored.storageKey
  });

  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'media.replace',
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
