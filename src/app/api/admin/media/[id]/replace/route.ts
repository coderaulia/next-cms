import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';

import { assertAdminPermission, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { getMediaAssetById, getMediaAssets, updateMediaAsset } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { deleteUploadedMedia, saveUploadedMedia } from '@/services/mediaStorage';
import { env } from '@/services/env';

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

  // Early rejection based on Content-Length header before parsing the body
  const contentLength = request.headers.get('content-length');
  if (contentLength) {
    const declaredSize = Number.parseInt(contentLength, 10);
    if (Number.isFinite(declaredSize) && declaredSize > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File too large. Maximum upload size is 10 MB.' },
        { status: 413 }
      );
    }
  }

  const { id } = await params;
  const existing = await getMediaAssetById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  if (!existing.storageKey || !['local', 'supabase', 'r2'].includes(existing.storageProvider)) {
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

  // Reject oversized files before buffering the full content
  if (rawFile.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: 'File too large. Maximum upload size is 10 MB.' },
      { status: 413 }
    );
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

  const totalUsed = existingAssets.reduce((sum, a) => sum + (a.sizeBytes ?? 0), 0);
  const oldSize = existing.sizeBytes ?? 0;
  const netDelta = buffer.length - oldSize;
  const quotaBytes = env.storageQuotaMb * 1024 * 1024;
  if (netDelta > 0 && totalUsed + netDelta > quotaBytes) {
    return NextResponse.json(
      {
        error: `Storage quota exceeded. Used ${Math.round(totalUsed / 1024 / 1024)} MB of ${env.storageQuotaMb} MB limit.`
      },
      { status: 413 }
    );
  }

  // Write to a temporary key first, then update CMS metadata, then promote.
  // This prevents storage/metadata desync if the CMS update fails.
  const tempStorageKey = `${existing.storageKey}.__replacing__`;
  const stored = await saveUploadedMedia(new File([buffer], rawFile.name, { type: rawFile.type }), {
    storageKey: tempStorageKey,
    upsert: true
  });

  // Now attempt the CMS metadata update
  const mediaAsset = await updateMediaAsset(id, {
    ...existing,
    url: stored.url,
    altText: altText || existing.altText,
    mimeType: rawFile.type || existing.mimeType,
    sizeBytes: stored.sizeBytes,
    checksumSha256,
    storageProvider: stored.storageProvider,
    storageKey: existing.storageKey
  });

  if (!mediaAsset) {
    // CMS update failed — clean up the temporary file and abort
    await deleteUploadedMedia(tempStorageKey, stored.storageProvider).catch(() => {});
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  // CMS update succeeded — promote the temp file to the real key and clean up
  try {
    await saveUploadedMedia(new File([buffer], rawFile.name, { type: rawFile.type }), {
      storageKey: existing.storageKey,
      upsert: true
    });
    await deleteUploadedMedia(tempStorageKey, stored.storageProvider).catch(() => {});
  } catch (promoteError) {
    // If promotion fails, the temp file exists but the old file is still intact.
    // The CMS metadata now points to the old storageKey which still has old bytes.
    // Revert the CMS update to keep things consistent.
    await updateMediaAsset(id, existing).catch(() => {});
    await deleteUploadedMedia(tempStorageKey, stored.storageProvider).catch(() => {});
    throw promoteError;
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
