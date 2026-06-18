import createMiddleware from 'next-intl/middleware';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { routing } from '@/i18n/routing';
import { CSRF_COOKIE_NAME } from '@/services/securityConstants';

const intlMiddleware = createMiddleware(routing);

// Routes that must NOT be locale-routed: admin UI, API, Next internals, and
// any file with an extension (sitemap.xml, robots.txt, feed.xml, favicon.ico).
function isNonLocalizedPath(pathname: string): boolean {
  return (
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.includes('.')
  );
}

const contentSecurityPolicyBase = [
  "default-src 'self'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "script-src 'self' 'nonce-REPLACE_ME_NONCE'",
  "script-src-attr 'none'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' https://fonts.gstatic.com data:",
  "connect-src 'self' https:",
  "frame-src 'none'",
  "worker-src 'self' blob:",
  'upgrade-insecure-requests'
];

function generateNonce() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

function generateCsrfToken() {
  try {
    return crypto.randomUUID();
  } catch {
    return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
  }
}

export function middleware(request: NextRequest) {
  const nonce = generateNonce();
  const csp = contentSecurityPolicyBase
    .join('; ')
    .replace(/REPLACE_ME_NONCE/g, nonce);

  const pathname = request.nextUrl.pathname;

  // Public pages go through next-intl routing; everything else passes through.
  // Security headers + CSRF below are applied to whichever response we return.
  const response = isNonLocalizedPath(pathname) ? NextResponse.next() : intlMiddleware(request);

  response.headers.set('Content-Security-Policy', csp);
  response.headers.set('x-nonce', nonce);
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), payment=(), usb=()');
  response.headers.set('Cross-Origin-Opener-Policy', 'same-origin');
  response.headers.set('Cross-Origin-Resource-Policy', 'same-site');

  const csrfToken = request.cookies.get(CSRF_COOKIE_NAME)?.value;
  if (!csrfToken) {
    response.cookies.set(CSRF_COOKIE_NAME, generateCsrfToken(), {
      httpOnly: false,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/'
    });
  }

  if (pathname.startsWith('/admin') || pathname.startsWith('/api/admin') || pathname.startsWith('/api/contact')) {
    response.headers.set('Cache-Control', 'no-store');
  }

  if (process.env.NODE_ENV === 'production') {
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains; preload');
  }

  return response;
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico).*)']
};
