import { describe, expect, it, vi } from 'vitest';

vi.mock('next-intl/middleware', () => ({
  default: () => () => {
    const headers = new Headers();
    return {
      headers,
      cookies: {
        set: () => {}
      }
    };
  }
}));

describe('proxy security guards', () => {
  it('blocks requests with Content-Encoding: br (CVE-2026-111497 mitigation)', async () => {
    const { proxy } = await import('@/proxy');
    const request = {
      nextUrl: { pathname: '/api/contact' },
      url: 'http://localhost:3000/api/contact',
      headers: new Headers({ 'content-encoding': 'br' }),
      cookies: { get: () => undefined }
    } as unknown as Parameters<typeof proxy>[0];

    const response = proxy(request);
    expect(response.status).toBe(415);
  });

  it('blocks requests with null bytes in URL (CVE-2026-105482 mitigation)', async () => {
    const { proxy } = await import('@/proxy');
    const request = {
      nextUrl: { pathname: '/api/contact%00payload' },
      url: 'http://localhost:3000/api/contact%00payload',
      headers: new Headers(),
      cookies: { get: () => undefined }
    } as unknown as Parameters<typeof proxy>[0];

    const response = proxy(request);
    expect(response.status).toBe(400);
  });

  it('allows standard requests through with security headers', async () => {
    const { proxy } = await import('@/proxy');
    const request = {
      nextUrl: { pathname: '/api/health' },
      url: 'http://localhost:3000/api/health',
      headers: new Headers(),
      cookies: { get: () => undefined }
    } as unknown as Parameters<typeof proxy>[0];

    const response = proxy(request);
    expect(response.status).toBe(200);
    expect(response.headers.get('Content-Security-Policy')).toBeTruthy();
    expect(response.headers.get('X-Frame-Options')).toBe('DENY');
  });
});
