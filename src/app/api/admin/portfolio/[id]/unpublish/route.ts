import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
import { getPortfolioProjectById, setPortfolioProjectStatus } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const auth = await assertAdminPermission(request, 'content:publish');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { id } = await params;
  const existing = await getPortfolioProjectById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const project = await setPortfolioProjectStatus(id, 'draft');
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  try {
    await captureContentRevision({
      entityType: 'portfolio_project',
      entityId: project.id,
      label: 'Moved project to draft',
      payload: project,
      userId: session.user.id,
      userDisplayName: session?.user.displayName ?? null
    });

    await logAdminAuditEvent(request, {
      action: 'portfolio.unpublish',
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
