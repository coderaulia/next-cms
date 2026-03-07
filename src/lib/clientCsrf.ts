import { CSRF_COOKIE_NAME, CSRF_HEADER_NAME } from '@/services/securityConstants';

function readCookie(name: string) {
  if (typeof document === 'undefined') return '';

  const pairs = document.cookie
    .split(';')
    .map((part) => part.trim())
    .filter(Boolean);

  for (const pair of pairs) {
    const separator = pair.indexOf('=');
    const key = separator === -1 ? pair : pair.slice(0, separator);
    if (key !== name) continue;
    return separator === -1 ? '' : pair.slice(separator + 1);
  }

  return '';
}

function isMutationMethod(method: string | undefined) {
  const normalized = (method || 'GET').toUpperCase();
  return ['POST', 'PUT', 'PATCH', 'DELETE'].includes(normalized);
}

export function getCsrfToken() {
  return readCookie(CSRF_COOKIE_NAME);
}

export function withCsrfHeaders(headers: HeadersInit | undefined, method: string | undefined) {
  const next = new Headers(headers ?? {});
  if (isMutationMethod(method)) {
    const token = getCsrfToken();
    if (token) {
      next.set(CSRF_HEADER_NAME, token);
    }
  }
  return next;
}

export async function csrfFetch(input: RequestInfo | URL, init: RequestInit = {}) {
  const method = init.method ?? 'GET';
  const headers = withCsrfHeaders(init.headers, method);
  return fetch(input, { ...init, headers });
}
