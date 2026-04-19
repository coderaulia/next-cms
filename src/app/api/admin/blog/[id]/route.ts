import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
import { deleteBlogPost, getBlogPostById, updateBlogPost } from '@/features/cms/contentStore';
import { revalidateBlogCache } from '@/features/cms/publicCache';
import { validateBlogPost } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;

  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const payload = validateBlogPost(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const post = await updateBlogPost(id, payload);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const saveMode = (request.headers.get('x-cms-save-mode') ?? 'manual').trim().toLowerCase();
  try {
    if (saveMode !== 'autosave') {
      await captureContentRevision({
        entityType: 'blog_post',
        entityId: post.id,
        label: post.status === 'published' ? 'Saved published post' : 'Saved draft post',
        payload: post,
        userId: session.user.id,
        userDisplayName: session?.user.displayName ?? null
      });
    }

    await logAdminAuditEvent(request, {
      action: 'blog.update',
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
  return NextResponse.json({ post });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'content:delete');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  const removed = await deleteBlogPost(id);
  if (!removed) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'blog.delete',
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
  return NextResponse.json({ ok: true });
}
