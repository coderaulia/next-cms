import { afterEach, describe, expect, it, vi } from 'vitest';

const originalToken = process.env.CMS_ADMIN_TOKEN;

afterEach(() => {
  if (typeof originalToken === 'undefined') {
    delete process.env.CMS_ADMIN_TOKEN;
  } else {
    process.env.CMS_ADMIN_TOKEN = originalToken;
  }
  vi.resetModules();
});

describe('admin auth', () => {
  it('accepts valid token with surrounding whitespace', async () => {
    process.env.CMS_ADMIN_TOKEN = 'my-secret-token';
    vi.resetModules();
    const { isValidAdminToken } = await import('@/features/cms/adminAuth');
    expect(isValidAdminToken(' my-secret-token ')).toBe(true);
  });

  it('rejects invalid token and returns unauthorized response', async () => {
    process.env.CMS_ADMIN_TOKEN = 'my-secret-token';
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'wrong-token'
      }
    });

    const result = assertAdminRequest(request);
    expect(result?.status).toBe(401);
  });

  it('returns null when authorized', async () => {
    process.env.CMS_ADMIN_TOKEN = 'my-secret-token';
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'my-secret-token'
      }
    });

    const result = assertAdminRequest(request);
    expect(result).toBeNull();
  });
});
