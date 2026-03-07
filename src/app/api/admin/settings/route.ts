import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { getSettings, updateSettings } from '@/features/cms/contentStore';
import { validateSiteSettings } from '@/features/cms/validators';

export async function GET(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = validateSiteSettings(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
  }

  const settings = await updateSettings(payload);
  const session = await getAdminSession(request);

  try {
    await logAdminAuditEvent(request, {
      action: 'settings.update',
      entityType: 'site_settings',
      entityId: 'global',
      userId: session?.user.id ?? null,
      metadata: {
        siteName: settings.siteName,
        baseUrl: settings.general.baseUrl,
        timezone: settings.general.timezone
      }
    });
  } catch {
    // swallow audit log failures
  }

  return NextResponse.json({ settings });
}

