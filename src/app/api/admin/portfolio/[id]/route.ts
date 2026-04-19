import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
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
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  const session = auth;

  const { id } = await params;
  const project = await getPortfolioProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }
  return NextResponse.json({ project });
}

export async function PUT(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const payload = validatePortfolioProject(await request.json().catch(() => null));
  if (!payload || payload.id !== id) {
    return NextResponse.json({ error: 'Invalid portfolio payload' }, { status: 400 });
  }

  const project = await updatePortfolioProject(id, payload);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const saveMode = (request.headers.get('x-cms-save-mode') ?? 'manual').trim().toLowerCase();
  try {
    if (saveMode !== 'autosave') {
      await captureContentRevision({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.status === 'published' ? 'Saved published project' : 'Saved draft project',
        payload: project,
        userId: session.user.id,
        userDisplayName: session?.user.displayName ?? null
      });
    }

    await logAdminAuditEvent(request, {
      action: 'portfolio.update',
      entityType: 'portfolio_project',
      entityId: project.id,
      userId: session.user.id,
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
  const auth = await assertAdminPermission(request, 'content:delete');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const project = await getPortfolioProjectById(id);
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const removed = await deletePortfolioProject(id);
  if (!removed) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  try {
    await logAdminAuditEvent(request, {
      action: 'portfolio.delete',
      entityType: 'portfolio_project',
      entityId: project.id,
      userId: session.user.id,
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
