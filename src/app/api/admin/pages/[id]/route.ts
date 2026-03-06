import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { getPageById, upsertPage } from '@/features/cms/contentStore';
import { isValidPageId, validateLandingPage } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isValidPageId(id)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
  }
  const page = await getPageById(id);
  if (!page) {
    return NextResponse.json({ error: 'Page not found' }, { status: 404 });
  }
  return NextResponse.json({ page });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  if (!isValidPageId(id)) {
    return NextResponse.json({ error: 'Invalid page id' }, { status: 400 });
  }

  const payload = validateLandingPage(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid page payload' }, { status: 400 });
  }
  const page = await upsertPage(payload);
  return NextResponse.json({ page });
}

