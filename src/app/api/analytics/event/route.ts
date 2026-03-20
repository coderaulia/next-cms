import { NextResponse } from 'next/server';

import { trackAnalyticsEvent } from '@/features/cms/analyticsStore';

function sanitizePath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') ? value : '/';
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        path?: string;
        eventType?: string;
        label?: string;
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        visitorId?: string;
        sessionId?: string;
      }
    | null;

  const path = sanitizePath(body?.path);
  const eventType = body?.eventType === 'contact_submit' ? 'contact_submit' : body?.eventType === 'cta_click' ? 'cta_click' : null;
  const visitorId = body?.visitorId?.trim();
  const sessionId = body?.sessionId?.trim();

  if (!eventType || !visitorId || !sessionId) {
    return NextResponse.json({ error: 'Invalid analytics event payload.' }, { status: 400 });
  }

  await trackAnalyticsEvent({
    path,
    eventType,
    label: body?.label ?? '',
    referrer: body?.referrer ?? '',
    utmSource: body?.utmSource ?? '',
    utmMedium: body?.utmMedium ?? '',
    utmCampaign: body?.utmCampaign ?? '',
    visitorId,
    sessionId,
    userAgent: request.headers.get('user-agent') ?? 'unknown'
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
