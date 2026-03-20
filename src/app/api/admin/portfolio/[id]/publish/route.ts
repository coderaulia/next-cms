import { NextResponse } from 'next/server';

import { assertAdminPermission, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { captureContentRevision } from '@/features/cms/contentRevisions';
import { getPortfolioProjectById, setPortfolioProjectStatus } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function POST(request: Request, { params }: RouteContext) {
  const unauthorized = await assertAdminPermission(request, 'content:publish');
  if (unauthorized) return unauthorized;

  const { id } = await params;
  const existing = await getPortfolioProjectById(id);
  if (!existing) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const project = await setPortfolioProjectStatus(id, 'published');
  if (!project) {
    return NextResponse.json({ error: 'Portfolio project not found' }, { status: 404 });
  }

  const session = await getAdminSession(request);
  try {
    await captureContentRevision({
      entityType: 'portfolio_project',
      entityId: project.id,
      label: 'Published project',
      payload: project,
      userId: session?.user.id ?? null,
      userDisplayName: session?.user.displayName ?? null
    });

    await logAdminAuditEvent(request, {
      action: 'portfolio.publish',
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
