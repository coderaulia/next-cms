import { NextResponse } from 'next/server';

import { assertAdminPermission, logAdminAuditEvent } from '@/features/cms/adminAuth';
import { AdminTeamError, createAdminTeamMember, listAdminTeamMembers } from '@/features/cms/adminTeam';
import { env } from '@/services/env';

function errorResponse(error: unknown) {
  if (error instanceof AdminTeamError) {
    return NextResponse.json({ error: error.message }, { status: error.status });
  }

  return NextResponse.json({ error: 'Failed to manage admin team.' }, { status: 500 });
}

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'team:manage');
  if ('error' in auth) return auth.error;
  

  if (!env.databaseUrl) {
    return NextResponse.json({ available: false, members: [] });
  }

  try {
    const members = await listAdminTeamMembers();
    return NextResponse.json({ available: true, members });
  } catch (error) {
    return errorResponse(error);
  }
}

export async function POST(request: Request) {
  const auth = await assertAdminPermission(request, 'team:manage');
  if ('error' in auth) return auth.error;
  const { session } = auth;
  

  const body = (await request.json().catch(() => null)) as
    | {
        email?: string;
        displayName?: string;
        role?: string;
        password?: string;
      }
    | null;

  try {
    const member = await createAdminTeamMember({
      email: body?.email ?? '',
      displayName: body?.displayName ?? '',
      role: body?.role ?? '',
      password: body?.password ?? ''
    });

    try {
      await logAdminAuditEvent(request, {
        action: 'team.create',
        entityType: 'admin_user',
        entityId: member.id,
        userId: session.user.id,
        metadata: {
          email: member.email,
          role: member.role
        }
      });
    } catch {
      // swallow audit log failures
    }

    return NextResponse.json({ member }, { status: 201 });
  } catch (error) {
    return errorResponse(error);
  }
}
