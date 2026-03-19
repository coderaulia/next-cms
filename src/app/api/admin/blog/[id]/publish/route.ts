import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { setPostStatus } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminPermission(request, 'content:publish');
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await setPostStatus(id, 'published');
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'blog.publish',
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

  revalidatePublicCmsCache();
  return NextResponse.json({ post });
}
