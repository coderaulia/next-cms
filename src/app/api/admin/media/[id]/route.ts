import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { deleteMediaAsset, getMediaAssetById, updateMediaAsset } from '@/features/cms/contentStore';
import { validateMediaAsset } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const mediaAsset = await getMediaAssetById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  return NextResponse.json({ mediaAsset });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const payload = validateMediaAsset(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid media asset payload' }, { status: 400 });
  }

  const mediaAsset = await updateMediaAsset(id, payload);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  return NextResponse.json({ mediaAsset });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const mediaAsset = await getMediaAssetById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  const removed = await deleteMediaAsset(id);
  if (!removed) {
    return NextResponse.json({ error: 'Media asset not found' }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
