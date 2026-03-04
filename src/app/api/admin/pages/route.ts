import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getPages } from '@/features/cms/contentStore';

export async function GET(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const pages = await getPages();
  const ordered = ['home', 'about', 'service', 'contact']
    .map((id) => pages[id as keyof typeof pages])
    .filter(Boolean);
  return NextResponse.json({ pages: ordered });
}
