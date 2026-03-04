import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { createBlogPost, queryBlogPosts } from '@/features/cms/contentStore';
import type { BlogPost } from '@/features/cms/types';

export async function GET(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get('includeDrafts') === '1';
  const q = searchParams.get('q') ?? undefined;
  const status = (searchParams.get('status') ?? 'all') as 'all' | 'draft' | 'published';
  const category = searchParams.get('category') ?? undefined;
  const dateSort = (searchParams.get('dateSort') ?? 'newest') as 'newest' | 'oldest';
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');

  const payload = await queryBlogPosts({
    includeDrafts,
    q,
    status,
    category,
    dateSort,
    page,
    pageSize
  });
  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as Partial<BlogPost> | null;
  const post = await createBlogPost(payload ?? {});
  return NextResponse.json({ post }, { status: 201 });
}
