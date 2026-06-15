import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getPages } from '@/features/cms/contentStore';
import { getViewCountsForPaths } from '@/features/cms/analyticsStore';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth;

  const pages = await getPages();
  const ordered = [
    'home',
    'about',
    'service',
    'product-hris',
    'service-website-development',
    'service-custom-business-tools',
    'service-secure-online-shops',
    'service-mobile-business-app',
    'service-official-business-email',
    'partnership',
    'contact'
  ]
    .map((id) => pages[id as keyof typeof pages])
    .filter(Boolean);
  const pagePaths = ordered.map((p) => (p.id === 'home' ? '/' : `/${p.seo.slug || p.id}`));
  const countsMap = await getViewCountsForPaths(pagePaths).catch(() => new Map<string, number>());
  const viewCounts = Object.fromEntries(countsMap);

  return NextResponse.json({ pages: ordered, viewCounts });
}

