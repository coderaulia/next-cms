import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getSettings, updateSettings } from '@/features/cms/contentStore';
import { validateSiteSettings } from '@/features/cms/validators';

export async function GET(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = validateSiteSettings(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
  }

  const settings = await updateSettings(payload);
  return NextResponse.json({ settings });
}
