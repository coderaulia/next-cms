import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';

function sanitizePath(value: string | null) {
  const candidate = (value ?? '').trim();
  if (!candidate.startsWith('/')) return '/';
  if (candidate.startsWith('//')) return '/';
  return candidate;
}

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  const session = auth.session;

  const { searchParams } = new URL(request.url);
  const redirectTo = sanitizePath(searchParams.get('path'));
  const action = searchParams.get('action') === 'disable' ? 'disable' : 'enable';

  const draft = await draftMode();
  if (action === 'disable') {
    draft.disable();
  } else {
    draft.enable();
  }

  return NextResponse.redirect(new URL(redirectTo, request.url));
}
