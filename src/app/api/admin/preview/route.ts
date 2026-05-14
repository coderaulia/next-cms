import { draftMode } from 'next/headers';
import { NextResponse } from 'next/server';

import { assertAdminPermission } from '@/features/cms/adminAuth';
import { env } from '@/services/env';

function sanitizePath(value: string | null) {
  const candidate = (value ?? '').trim();
  if (!candidate.startsWith('/')) return '/';
  if (candidate.startsWith('//')) return '/';
  return candidate;
}

export async function GET(request: Request) {
  const auth = await assertAdminPermission(request, 'content:edit');
  if ('error' in auth) return auth.error;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
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

  const baseUrl = env.siteUrl;
  return NextResponse.redirect(new URL(redirectTo, baseUrl));
}
