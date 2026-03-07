import type {
  AdminAuthResponse,
  AdminErrorResponse,
  AdminLoginPayload,
  AdminSessionUser
} from './adminTypes';

export async function getAdminSession(): Promise<AdminSessionUser | null> {
  const response = await fetch('/api/admin/auth', {
    method: 'GET',
    cache: 'no-store'
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AdminAuthResponse;
  return payload.user;
}

export async function loginAdmin(input: AdminLoginPayload): Promise<{ user: AdminSessionUser | null; error: string | null }> {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as AdminErrorResponse | null;
    return { user: null, error: payload?.error || 'Unable to sign in.' };
  }

  const payload = (await response.json()) as AdminAuthResponse;
  return { user: payload.user, error: null };
}

export async function logoutAdmin() {
  await fetch('/api/admin/auth', {
    method: 'DELETE'
  });
}
