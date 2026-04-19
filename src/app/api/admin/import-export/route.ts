import { NextResponse } from 'next/server';

import {
  type CmsImportCollection,
  type CmsImportMode,
  exportCmsJson,
  importCmsJson
} from '@/features/cms/importExport';
import {
  assertAdminPermission,
  assertAdminRequest,
  logAdminAuditEvent
} from '@/features/cms/adminAuth';
import { revalidatePublicCmsCache } from '@/features/cms/publicCache';

const collections: CmsImportCollection[] = ['pages', 'blogPosts', 'portfolioProjects', 'settings', 'fullSite'];

function parseCollection(value: string | null): CmsImportCollection | null {
  if (!value) return null;
  return collections.includes(value as CmsImportCollection) ? (value as CmsImportCollection) : null;
}

function parseMode(value: unknown): CmsImportMode {
  return value === 'replace' ? 'replace' : 'merge';
}

function requiredPermission(collection: CmsImportCollection) {
  return collection === 'settings' || collection === 'fullSite' ? 'settings:edit' : 'content:edit';
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const collection = parseCollection(searchParams.get('collection'));
  if (!collection) {
    return NextResponse.json({ error: 'Invalid collection.' }, { status: 400 });
  }

  const auth = await assertAdminPermission(request, requiredPermission(collection));
  if ('error' in auth) return auth.error;
  const adminSession = auth.session;

  const payload = await exportCmsJson(collection);

  try {
    await logAdminAuditEvent(request, {
      action: 'content.export',
      entityType: collection,
      entityId: null,
      userId: adminSession.user.id,
      metadata: {
        collection
      }
    });
  } catch {
    // swallow audit log failures
  }

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
}

export async function POST(request: Request) {
  const auth = await assertAdminRequest(request);
  if (auth instanceof NextResponse) return auth;

  const body = (await request.json().catch(() => null)) as {
    collection?: string;
    mode?: CmsImportMode;
    payload?: unknown;
  } | null;

  const collection = parseCollection(body?.collection ?? null);
  if (!collection) {
    return NextResponse.json({ error: 'Invalid collection.' }, { status: 400 });
  }

  const authPerm = await assertAdminPermission(request, requiredPermission(collection));
  if ('error' in authPerm) return authPerm.error;
  const permissionSession = authPerm.session;

  try {
    const result = await importCmsJson(collection, body?.payload ?? null, parseMode(body?.mode));

    try {
      await logAdminAuditEvent(request, {
        action: 'content.import',
        entityType: collection,
        entityId: null,
        userId: permissionSession.user.id,
        metadata: {
          collection,
          mode: result.mode,
          importedCount: result.importedCount,
          totals: result.totals
        }
      });
    } catch {
      // swallow audit log failures
    }

    revalidatePublicCmsCache();
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Failed to import JSON.'
      },
      { status: 400 }
    );
  }
}
