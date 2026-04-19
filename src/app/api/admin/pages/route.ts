import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getPages } from '@/features/cms/contentStore';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
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
  return NextResponse.json({ pages: ordered });
}

