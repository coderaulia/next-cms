import { NextResponse } from 'next/server';

import { trackAnalyticsPageView } from '@/features/cms/analyticsStore';

function sanitizePath(value: unknown) {
  return typeof value === 'string' && value.startsWith('/') ? value : '/';
}

function entityTypeForPath(path: string) {
  if (path.startsWith('/blog/')) return 'blog_post';
  if (path.startsWith('/portfolio/')) return 'portfolio_project';
  return 'page';
}

export async function POST(request: Request) {
  const body = (await request.json().catch(() => null)) as
    | {
        path?: string;
        referrer?: string;
        utmSource?: string;
        utmMedium?: string;
        utmCampaign?: string;
        visitorId?: string;
        sessionId?: string;
      }
    | null;

  const path = sanitizePath(body?.path);
  const visitorId = body?.visitorId?.trim();
  const sessionId = body?.sessionId?.trim();

  if (!visitorId || !sessionId) {
    return NextResponse.json({ error: 'Missing visitor identifiers.' }, { status: 400 });
  }

  await trackAnalyticsPageView({
    path,
    entityType: entityTypeForPath(path),
    entityId: path,
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
