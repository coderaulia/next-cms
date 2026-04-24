import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { listContentRevisions } from '@/features/cms/contentRevisions';
import type { CmsRevisionEntityType } from '@/features/cms/types';

const revisionEntityTypes: CmsRevisionEntityType[] = ['page', 'blog_post', 'portfolio_project', 'site_settings'];

function parseEntityType(value: string | null): CmsRevisionEntityType | null {
  if (!value) return null;
  return revisionEntityTypes.includes(value as CmsRevisionEntityType) ? (value as CmsRevisionEntityType) : null;
}

function requiredPermission(entityType: CmsRevisionEntityType) {
  return entityType === 'site_settings' || entityType === 'full_site' ? 'settings:edit' : 'content:edit';
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const entityType = parseEntityType(url.searchParams.get('entityType'));
  const entityId = (url.searchParams.get('entityId') ?? '').trim();
  const limit = Number(url.searchParams.get('limit') ?? '12');

  if (!entityType || !entityId) {
    return NextResponse.json({ error: 'Invalid revision query.' }, { status: 400 });
  }

  const auth = await assertAdminPermission(request, requiredPermission(entityType));
  if ('error' in auth) return auth.error;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const session = auth.session;

  const revisions = await listContentRevisions(entityType, entityId, limit);
  return NextResponse.json({ revisions });
}
