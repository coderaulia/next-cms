import { afterEach, describe, expect, it } from 'vitest';

import { assertRateLimit, assertTrustedMutationRequest, serializeJsonForScript } from '@/services/requestSecurity';

afterEach(() => {
  globalThis.__cmsRateLimits?.clear();
});

describe('request security', () => {
  it('blocks cross-site mutation requests', async () => {
    const request = new Request('https://vanaila.com/api/admin/blog', {
      method: 'POST',
      headers: {
        origin: 'https://evil.example'
      }
    });

    const response = assertTrustedMutationRequest(request);
    expect(response?.status).toBe(403);
  });

  it('allows same-origin mutation requests', async () => {
    const request = new Request('https://vanaila.com/api/admin/blog', {
      method: 'POST',
      headers: {
        origin: 'https://vanaila.com'
      }
    });

    expect(assertTrustedMutationRequest(request)).toBeNull();
  });

  it('rate limits repeated requests from the same client', async () => {
    const request = new Request('https://vanaila.com/api/contact', {
      method: 'POST',
      headers: {
        origin: 'https://vanaila.com',
        'x-forwarded-for': '203.0.113.10'
      }
    });

    expect(assertRateLimit(request, 'contact', 2, 60_000)).toBeNull();
    expect(assertRateLimit(request, 'contact', 2, 60_000)).toBeNull();
    expect(assertRateLimit(request, 'contact', 2, 60_000)?.status).toBe(429);
  });

  it('escapes script-breaking characters in JSON-LD payloads', async () => {
    const html = serializeJsonForScript({ dangerous: '</script><script>alert(1)</script>' });
    expect(html).not.toContain('</script>');
    expect(html).toContain('\\u003c/script\\u003e');
  });
});
