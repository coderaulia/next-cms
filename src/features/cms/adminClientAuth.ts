export const ADMIN_TOKEN_STORAGE_KEY = 'cms_admin_token';

export function readAdminToken() {
  if (typeof window === 'undefined') return '';
  return localStorage.getItem(ADMIN_TOKEN_STORAGE_KEY)?.trim() ?? '';
}

export function saveAdminToken(token: string) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_TOKEN_STORAGE_KEY, token.trim());
}

export function clearAdminToken() {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ADMIN_TOKEN_STORAGE_KEY);
}

export async function verifyAdminToken(token: string) {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: token.trim() })
  });
  return response.ok;
}
