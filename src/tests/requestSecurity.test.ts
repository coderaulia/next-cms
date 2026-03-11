import { afterEach, describe, expect, it } from 'vitest';

import {
  assertCsrfToken,
  assertRateLimit,
  assertTrustedMutationRequest,
  serializeJsonForScript
} from '@/services/requestSecurity';

afterEach(() => {
  globalThis.__cmsRateLimits?.clear();
});

describe('request security', () => {
  it('blocks cross-site mutation requests', async () => {
    const request = new Request('https://example.com/api/admin/blog', {
      method: 'POST',
      headers: {
        origin: 'https://evil.example'
      }
    });

    const response = assertTrustedMutationRequest(request);
    expect(response?.status).toBe(403);
  });

  it('allows same-origin mutation requests', async () => {
    const request = new Request('https://example.com/api/admin/blog', {
      method: 'POST',
      headers: {
        origin: 'https://example.com'
      }
    });

    expect(assertTrustedMutationRequest(request)).toBeNull();
  });

  it('rejects mutation requests without valid csrf token', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: {
        origin: 'https://example.com'
      }
    });

    const response = assertCsrfToken(request);
    expect(response?.status).toBe(403);
  });

  it('accepts mutation requests with matching csrf cookie and header', async () => {
    const token = 'csrf-token-123';
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: {
        origin: 'https://example.com',
        cookie: `cms_csrf_token=${token}`,
        'x-csrf-token': token
      }
    });

    expect(assertCsrfToken(request)).toBeNull();
  });

  it('rate limits repeated requests from the same client', async () => {
    const request = new Request('https://example.com/api/contact', {
      method: 'POST',
      headers: {
        origin: 'https://example.com',
        'x-forwarded-for': '203.0.113.10'
      }
    });

    expect(await assertRateLimit(request, 'contact', 2, 60_000)).toBeNull();
    expect(await assertRateLimit(request, 'contact', 2, 60_000)).toBeNull();
    expect((await assertRateLimit(request, 'contact', 2, 60_000))?.status).toBe(429);
  });

  it('escapes script-breaking characters in JSON-LD payloads', async () => {
    const html = serializeJsonForScript({ dangerous: '</script><script>alert(1)</script>' });
    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c/script\\u003e');
  });
});

