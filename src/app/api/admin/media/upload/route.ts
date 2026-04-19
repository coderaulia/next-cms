import { createHash } from 'node:crypto';

import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createMediaAsset, getMediaAssets } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { deleteUploadedMedia, saveUploadedMedia } from '@/services/mediaStorage';

function parseText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function nowIso() {
  return new Date().toISOString();
}

function sha256ForBuffer(buffer: Buffer) {
  return createHash('sha256').update(buffer).digest('hex');
}

function isImageMimeType(value: string) {
  return value.toLowerCase().startsWith('image/');
}

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'media:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  try {
    const form = await request.formData();
    const rawFile = form.get('file');
    const title = parseText(form.get('title'));
    const altText = parseText(form.get('altText'));

    if (!(rawFile instanceof File)) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    if (isImageMimeType(rawFile.type || 'image/png') && !altText) {
      return NextResponse.json({ error: 'Alt text is required for image uploads.' }, { status: 400 });
    }

    const safeTitle = title || rawFile.name || 'Uploaded media';
    const safeAlt = altText || '';
    const buffer = Buffer.from(await rawFile.arrayBuffer());
    const checksumSha256 = sha256ForBuffer(buffer);

    const existingAssets = await getMediaAssets();
    const duplicate = existingAssets.find((asset) => asset.checksumSha256 === checksumSha256);
    if (duplicate) {
      return NextResponse.json(
        {
          error: 'Duplicate media detected.',
          duplicateOf: duplicate
        },
        { status: 409 }
      );
    }

    const stored = await saveUploadedMedia(new File([buffer], rawFile.name, { type: rawFile.type }));
    try {
      const mediaAsset = await createMediaAsset({
        id: crypto.randomUUID(),
        title: safeTitle,
        url: stored.url,
        altText: safeAlt,
        mimeType: rawFile.type || 'application/octet-stream',
        width: null,
        height: null,
        sizeBytes: stored.sizeBytes,
        checksumSha256,
        storageProvider: stored.storageProvider,
        storageKey: stored.storageKey,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });

      try {
        await logAdminAuditEvent(request, {
          action: 'media.upload',
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
    } catch (error) {
      await deleteUploadedMedia(stored.storageKey, stored.storageProvider);
      throw error;
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Upload failed.';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
