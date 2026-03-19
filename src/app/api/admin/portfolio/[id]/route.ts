import { NextResponse } from 'next/server';

import { assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import {
  deletePortfolioProject,
  getPortfolioProjectById,
  updatePortfolioProject
} from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import { validatePortfolioProject } from '@/features/cms/validators';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function GET(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const project = await getPortfolioProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const payload = validatePortfolioProject(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid portfolio payload' }, { status: 400 });
  }

  const project = await updatePortfolioProject(id, payload);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'portfolio.update',
      entityType: 'portfolio_project',
      entityId: project.id,
      userId: session?.user.id ?? null,
      metadata: {
        title: project.title,
        slug: project.seo.slug,
        status: project.status
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ project });
}

export async function DELETE(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminRequest(request);
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const project = await getPortfolioProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const removed = await deletePortfolioProject(id);
  if (!removed) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await logAdminAuditEvent(request, {
      action: 'portfolio.delete',
      entityType: 'portfolio_project',
      entityId: project.id,
      userId: session?.user.id ?? null,
      metadata: {
        title: project.title,
        slug: project.seo.slug,
        status: project.status
      }
    });
  } catch {
    // swallow audit log failures
  }

  revalidatePublicCmsCache();
  return NextResponse.json({ ok: true });
}
