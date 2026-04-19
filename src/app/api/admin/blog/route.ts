import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createBlogPost, queryBlogPosts } from '@/features/cms/contentStore';
import { revalidateBlogCache } from '@/features/cms/publicCache';
import type { BlogPost } from '@/features/cms/types';

export async function GET(request: Request) {
  const session = await getAdminSession(request);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

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
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;

  const session = auth.session;

  const payload = (await request.json().catch(() => null)) as Partial<BlogPost> | null;
  const post = await createBlogPost(payload ?? {});

  try {
    await logAdminAuditEvent(request, {
      action: 'blog.create',
      entityType: 'blog_post',
      entityId: post.id,
      userId: session.user.id,
      metadata: {
        title: post.title,
        slug: post.seo.slug,
        status: post.status
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidateBlogCache();
  return NextResponse.json({ post }, { status: 201 });
}
