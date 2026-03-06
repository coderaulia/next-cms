import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { setPostStatus } from '@/features/cms/contentStore';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await setPostStatus(id, 'published');
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ post });
}

