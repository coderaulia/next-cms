import { csrfFetch } from '@/lib/clientCsrf';

import type {
  AdminAuthResponse,
  AdminErrorResponse,
  AdminLoginPayload,
  AdminSessionUser
} from './adminTypes';

let cachedSessionUser: AdminSessionUser | null | undefined;
let sessionRequest: Promise<AdminSessionUser | null> | null = null;

export function getCachedAdminSession() {
  return cachedSessionUser;
}

export function primeAdminSession(user: AdminSessionUser | null) {
  cachedSessionUser = user;
}

export async function getAdminSession(force = false): Promise<AdminSessionUser | null> {
  if (!force && cachedSessionUser !== undefined) {
    return cachedSessionUser;
  }

  if (!force && sessionRequest) {
    return sessionRequest;
  }

  sessionRequest = csrfFetch('/api/admin/auth', {
    method: 'GET',
    cache: 'no-store'
  })
    .then(async (response) => {
      if (!response.ok) {
        cachedSessionUser = null;
        return null;
      }

      const payload = (await response.json()) as AdminAuthResponse;
      cachedSessionUser = payload.user;
      return payload.user;
    })
    .catch(() => {
      cachedSessionUser = null;
      return null;
    })
    .finally(() => {
      sessionRequest = null;
    });

  return sessionRequest;
}

export async function loginAdmin(input: AdminLoginPayload): Promise<{ user: AdminSessionUser | null; error: string | null }> {
  const response = await csrfFetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input)
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as AdminErrorResponse | null;
    cachedSessionUser = null;
    return { user: null, error: payload?.error || 'Unable to sign in.' };
  }

  const payload = (await response.json()) as AdminAuthResponse;
  cachedSessionUser = payload.user;
  return { user: payload.user, error: null };
}

export async function logoutAdmin() {
  await csrfFetch('/api/admin/auth', {
    method: 'DELETE'
  });
  cachedSessionUser = null;
}