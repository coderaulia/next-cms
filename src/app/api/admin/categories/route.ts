import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createCategory, getCategories } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validateCategory } from '@/features/cms/validators';

export async function GET(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const categories = await getCategories();
  return NextResponse.json({ categories });
}

export async function POST(request: Request) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const payload = validateCategory(await request.json().catch(() => null));
  if (!payload) {
    return NextResponse.json({ error: 'Invalid category payload' }, { status: 400 });
  }

  const category = await createCategory(payload);
  const session = await getAdminSession(request);

  try {
    await logAdminAuditEvent(request, {
      action: 'category.create',
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
  return NextResponse.json({ category }, { status: 201 });
}
