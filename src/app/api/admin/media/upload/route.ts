import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createMediaAsset } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { deleteUploadedMedia, saveUploadedMedia } from '@/services/mediaStorage';

function parseText(value: FormDataEntryValue | null) {
  return typeof value === 'string' ? value.trim() : '';
}

function nowIso() {
  return new Date().toISOString();
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  try {
    const form = await request.formData();
    const rawFile = form.get('file');
    const title = parseText(form.get('title'));
    const altText = parseText(form.get('altText'));

    if (!(rawFile instanceof File)) {
      return NextResponse.json({ error: 'No media file provided.' }, { status: 400 });
    }

    const safeTitle = title || rawFile.name || 'Uploaded media';
    const safeAlt = altText || '';

    const stored = await saveUploadedMedia(rawFile);
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
        storageProvider: stored.storageProvider,
        storageKey: stored.storageKey,
        createdAt: nowIso(),
        updatedAt: nowIso()
      });

      const session = await getAdminSession(request);
      try {
        await logAdminAuditEvent(request, {
          action: 'media.upload',
          entityType: 'media_asset',
          entityId: mediaAsset.id,
          userId: session?.user.id ?? null,
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
