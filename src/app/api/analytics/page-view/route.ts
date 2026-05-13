import { NextResponse } from 'next/server';

import { trackAnalyticsPageView } from '@/features/cms/analyticsStore';
import { assertRateLimit } from '@/services/requestSecurity';

const MAX = { id: 128, path: 512, referrer: 1024, utm: 256 };

function cap(value: unknown, max: number): string {
  return String(value ?? '').trim().slice(0, max);
}

function sanitizePath(value: unknown) {
  const s = cap(value, MAX.path);
  return s.startsWith('/') ? s : '/';
}

function entityTypeForPath(path: string) {
  if (path.startsWith('/blog/')) return 'blog_post';
  if (path.startsWith('/portfolio/')) return 'portfolio_project';
  return 'page';
}

export async function POST(request: Request) {
  const rateLimitFailure = await assertRateLimit(request, 'analytics-pv', 60, 60_000);
  if (rateLimitFailure) return rateLimitFailure;

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
  const visitorId = cap(body?.visitorId, MAX.id);
  const sessionId = cap(body?.sessionId, MAX.id);

  if (!visitorId || !sessionId) {
    return NextResponse.json({ error: 'Missing visitor identifiers.' }, { status: 400 });
  }

  await trackAnalyticsPageView({
    path,
    entityType: entityTypeForPath(path),
    entityId: path,
    referrer: cap(body?.referrer, MAX.referrer),
    utmSource: cap(body?.utmSource, MAX.utm),
    utmMedium: cap(body?.utmMedium, MAX.utm),
    utmCampaign: cap(body?.utmCampaign, MAX.utm),
    visitorId,
    sessionId,
    userAgent: request.headers.get('user-agent') ?? 'unknown'
  });

  return NextResponse.json({ ok: true }, { status: 202 });
}
