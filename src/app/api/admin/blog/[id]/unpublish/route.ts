import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { setPostStatus } from '@/features/cms/contentStore';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await setPostStatus(id, 'draft');
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'blog.unpublish',
      entityType: 'blog_post',
      entityId: post.id,
      userId: session?.user.id ?? null,
      metadata: {
        title: post.title,
        slug: post.seo.slug,
        status: post.status
      }
    });
  } catch {
    // swallow audit log failures
  }

  return NextResponse.json({ post });
}

