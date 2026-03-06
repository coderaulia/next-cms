import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { createMediaAsset, getMediaAssets } from '@/features/cms/contentStore';
import { validateMediaAsset } from '@/features/cms/validators';

export async function GET(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const mediaAssets = await getMediaAssets();
  return NextResponse.json({ mediaAssets });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = validateMediaAsset(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid media asset payload' }, { status: 400 });
  }

  const mediaAsset = await createMediaAsset(payload);
  return NextResponse.json({ mediaAsset }, { status: 201 });
}
