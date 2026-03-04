import { NextResponse } from 'next/server';

import { assertAdminRequest } from '@/features/cms/adminAuth';
import { deleteBlogPost, getBlogPostById, updateBlogPost } from '@/features/cms/contentStore';
import { validateBlogPost } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const post = await getBlogPostById(id);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const payload = validateBlogPost(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  }
  const post = await updateBlogPost(id, payload);
  if (!post) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ post });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorized = assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const removed = await deleteBlogPost(id);
  if (!removed) {
    return NextResponse.json({ error: 'Post not found' }, { status: 404 });
  }
  return NextResponse.json({ ok: true });
}
