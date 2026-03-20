import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getMediaAssetById } from '@/features/cms/contentStore';
import { getMediaUsage } from '@/features/cms/mediaUsage';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const mediaAsset = await getMediaAssetById(id);
  if (!mediaAsset) {
    return NextResponse.json({ error: 'Media asset not found.' }, { status: 404 });
  }

  const usage = await getMediaUsage(mediaAsset);
  return NextResponse.json({ usage });
}
