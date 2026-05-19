import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { deleteCategory, getCategoryById, updateCategory } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validateCategory, validationFailed } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth;

  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({ category });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'taxonomy:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const payload = validateCategory(body);
  if (!payload || payload.id !== id) {
    validationFailed('/api/admin/categories/[id]', body);
    return NextResponse.json({ error: 'Invalid category payload' }, { status: 400 });
  }

  const category = await updateCategory(id, payload);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'category.update',
      entityType: 'category',
      entityId: category.id,
      userId: session.user.id,
      metadata: {
        name: category.name,
        slug: category.slug
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ category });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'taxonomy:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const removed = await deleteCategory(id);
  if (!removed) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'category.delete',
      entityType: 'category',
      entityId: category.id,
      userId: session.user.id,
      metadata: {
        name: category.name,
        slug: category.slug
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ ok: true });
}
