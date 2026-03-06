import type { AdminAuthResponse, AdminLoginPayload, AdminSessionUser } from './adminTypes';

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

export async function loginAdmin(input: AdminLoginPayload): Promise<AdminSessionUser | null> {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as AdminAuthResponse;
  return payload.user;
}

export async function logoutAdmin() {
  await fetch('/api/admin/auth', {
    method: 'DELETE'
  });
}
