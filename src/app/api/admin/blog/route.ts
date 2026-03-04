import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { createBlogPost, getBlogPosts } from '@/features/cms/contentStore';
import type { BlogPost } from '@/features/cms/types';

export async function GET(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get('includeDrafts') === '1';
  const posts = await getBlogPosts(includeDrafts);
  return NextResponse.json({ posts });
}

export async function POST(request: Request) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = (await request.json().catch(() => null)) as Partial<BlogPost> | null;
  const post = await createBlogPost(payload ?? {});
  return NextResponse.json({ post }, { status: 201 });
}
