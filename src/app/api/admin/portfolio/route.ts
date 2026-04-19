import { NextResponse } from 'next/server';

import { assertAdminPermission, assertAdminRequest, getAdminSession, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { createPortfolioProject, queryPortfolioProjects } from '@/features/cms/contentStore';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';
import type { PortfolioProject } from '@/features/cms/types';

export async function GET(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;
  const session = auth;

  const { searchParams } = new URL(request.url);
  const includeDrafts = searchParams.get('includeDrafts') === '1';
  const q = searchParams.get('q') ?? undefined;
  const status = (searchParams.get('status') ?? 'all') as 'all' | 'draft' | 'published';
  const tag = searchParams.get('tag') ?? undefined;
  const featured = (searchParams.get('featured') ?? 'all') as 'all' | 'featured' | 'standard';
  const dateSort = (searchParams.get('dateSort') ?? 'newest') as 'newest' | 'oldest';
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');

  const payload = await queryPortfolioProjects({
    includeDrafts,
    q,
    status,
    tag,
    featured,
    dateSort,
    page,
    pageSize
  });

  return NextResponse.json(payload);
}

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const payload = (await request.json().catch(() => null)) as Partial<PortfolioProject> | null;
  const project = await createPortfolioProject(payload ?? {});

  try {
    await logAdminAuditEvent(request, {
      action: 'portfolio.create',
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
  return NextResponse.json({ project }, { status: 201 });
}
