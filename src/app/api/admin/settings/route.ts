import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
import { getSettings, updateSettings } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validateSiteSettings, validationFailed } from '@/features/cms/validators';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth;

  const settings = await getSettings();
  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  const auth = await assertAdminPermission(request, 'settings:edit');
  if ('error' in auth) return auth.error;

  const session = auth.session;

  const body = await request.json().catch(() => null);
  const payload = validateSiteSettings(body);
  if (!payload) {
    validationFailed('/api/admin/settings', body);
    return NextResponse.json({ error: 'Invalid settings payload' }, { status: 400 });
  }

  const settings = await updateSettings(payload);

  try {
    await captureContentRevision({
      entityType: 'site_settings',
      entityId: 'default',
      label: 'Settings saved',
      payload: settings,
      userId: session.user.id,
      userDisplayName: session?.user.displayName ?? null
    });

    await logAdminAuditEvent(request, {
      action: 'settings.update',
      entityType: 'site_settings',
      entityId: 'global',
      userId: session.user.id,
      metadata: {
        siteName: settings.siteName,
        baseUrl: settings.general.baseUrl,
        timezone: settings.general.timezone
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ settings });
}
