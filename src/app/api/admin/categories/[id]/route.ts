import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { deleteCategory, getCategoryById, updateCategory } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validateCategory } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  return NextResponse.json({ category });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const payload = validateCategory(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid category payload' }, { status: 400 });
  }

  const category = await updateCategory(id, payload);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'category.update',
      entityType: 'category',
      entityId: category.id,
      userId: session?.user.id ?? null,
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
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const category = await getCategoryById(id);
  if (!category) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const removed = await deleteCategory(id);
  if (!removed) {
    return NextResponse.json({ error: 'Category not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'category.delete',
      entityType: 'category',
      entityId: category.id,
      userId: session?.user.id ?? null,
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
