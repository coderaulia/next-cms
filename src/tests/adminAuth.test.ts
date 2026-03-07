import { afterEach, describe, expect, it, vi } from 'vitest';

const processEnv = process.env as Record<string, string | undefined>;
const originalToken = processEnv.CMS_ADMIN_TOKEN;
const originalNodeEnv = processEnv.NODE_ENV;

afterEach(() => {
  if (typeof originalToken === 'undefined') {
    delete processEnv.CMS_ADMIN_TOKEN;
  } else {
    processEnv.CMS_ADMIN_TOKEN = originalToken;
  }

  if (typeof originalNodeEnv === 'undefined') {
    delete processEnv.NODE_ENV;
  } else {
    processEnv.NODE_ENV = originalNodeEnv;
  }

  vi.resetModules();
});

describe('admin auth', () => {
  it('accepts valid token with surrounding whitespace', async () => {
    processEnv.CMS_ADMIN_TOKEN = 'my-secret-token';
    vi.resetModules();
    const { isValidAdminToken } = await import('@/features/cms/adminAuth');
    expect(isValidAdminToken(' my-secret-token ')).toBe(true);
  });

  it('rejects invalid token and returns unauthorized response', async () => {
    processEnv.CMS_ADMIN_TOKEN = 'my-secret-token';
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'wrong-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result?.status).toBe(401);
  });

  it('returns null when authorized in non-production mode', async () => {
    processEnv.CMS_ADMIN_TOKEN = 'my-secret-token';
    processEnv.NODE_ENV = 'test';
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'my-secret-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result).toBeNull();
  });

  it('does not accept legacy header token in production mode', async () => {
    processEnv.CMS_ADMIN_TOKEN = 'my-secret-token';
    processEnv.NODE_ENV = 'production';
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('https://vanaila.com/api/admin/pages', {
      headers: {
        origin: 'https://vanaila.com',
        'x-admin-token': 'my-secret-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result?.status).toBe(401);
  });
});
