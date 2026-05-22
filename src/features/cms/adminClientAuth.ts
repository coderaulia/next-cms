import { csrfFetch } from '@/lib/clientCsrf';

import type {
  AdminAuthResponse,
  AdminErrorResponse,
  AdminLoginPayload,
  AdminSessionUser
} from './adminTypes';

const SESSION_KEY = 'cms_admin_session';

let cachedSessionUser: AdminSessionUser | null | undefined;
let sessionRequest: Promise<AdminSessionUser | null> | null = null;

function readStorage(): AdminSessionUser | null | undefined {
  if (typeof sessionStorage === 'undefined') return undefined;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    return raw ? (JSON.parse(raw) as AdminSessionUser) : undefined;
  } catch {
    return undefined;
  }
}

function writeStorage(user: AdminSessionUser | null): void {
  if (typeof sessionStorage === 'undefined') return;
  try {
    if (user) {
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(user));
    } else {
      sessionStorage.removeItem(SESSION_KEY);
    }
  } catch {}
}

export function getCachedAdminSession() {
  if (cachedSessionUser === undefined) {
    const stored = readStorage();
    if (stored !== undefined) {
      cachedSessionUser = stored;
    }
  }
  return cachedSessionUser;
}

export function primeAdminSession(user: AdminSessionUser | null) {
  cachedSessionUser = user;
  writeStorage(user);
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
        writeStorage(null);
        return null;
      }

      const payload = (await response.json()) as AdminAuthResponse;
      cachedSessionUser = payload.user;
      writeStorage(payload.user);
      return payload.user;
    })
    .catch(() => {
      cachedSessionUser = null;
      writeStorage(null);
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
    writeStorage(null);
    return { user: null, error: payload?.error || 'Unable to sign in.' };
  }

  const payload = (await response.json()) as AdminAuthResponse;
  cachedSessionUser = payload.user;
  writeStorage(payload.user);
  return { user: payload.user, error: null };
}

export async function logoutAdmin() {
  await csrfFetch('/api/admin/auth', {
    method: 'DELETE'
  });
  cachedSessionUser = null;
  writeStorage(null);
}

export async function logoutAllAdminSessions() {
  await csrfFetch('/api/admin/auth/logout-all', {
    method: 'POST'
  });
  cachedSessionUser = null;
  writeStorage(null);
}
