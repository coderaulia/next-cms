import { afterEach, describe, expect, it, vi } from 'vitest';

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe('admin auth', () => {
  it('accepts valid token with surrounding whitespace', async () => {
    vi.stubEnv('CMS_ADMIN_TOKEN', 'my-secret-token');
    vi.resetModules();
    const { isValidAdminToken } = await import('@/features/cms/adminAuth');
    expect(isValidAdminToken(' my-secret-token ')).toBe(true);
  });

  it('rejects invalid token and returns unauthorized response', async () => {
    vi.stubEnv('CMS_ADMIN_TOKEN', 'my-secret-token');
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'wrong-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result).toHaveProperty('status', 401);
  });

  it('returns null when authorized in non-production mode', async () => {
    vi.stubEnv('CMS_ADMIN_TOKEN', 'my-secret-token');
    vi.stubEnv('NODE_ENV', 'test');
    vi.stubEnv('CMS_ENABLE_DEV_AUTH', 'true');
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('http://localhost/api/admin/pages', {
      headers: {
        'x-admin-token': 'my-secret-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result).toHaveProperty('user');
  });

  it('does not accept legacy header token in production mode', async () => {
    vi.stubEnv('CMS_ADMIN_TOKEN', 'my-secret-token');
    vi.stubEnv('NODE_ENV', 'production');
    vi.resetModules();
    const { assertAdminRequest } = await import('@/features/cms/adminAuth');

    const request = new Request('https://example.com/api/admin/pages', {
      headers: {
        origin: 'https://example.com',
        'x-admin-token': 'my-secret-token'
      }
    });

    const result = await assertAdminRequest(request);
    expect(result).toHaveProperty('status', 401);
  });

  it('falls back to env-backed sessions when admin tables are missing', async () => {
    const missingTableError = Object.assign(new Error('relation does not exist'), { code: '42P01' });

    vi.stubEnv('DATABASE_URL', 'postgresql://example.invalid/postgres');
    vi.stubEnv('CMS_ADMIN_EMAIL', 'admin@example.com');
    vi.stubEnv('CMS_ADMIN_PASSWORD', 'super-secret');
    vi.stubEnv('CMS_ADMIN_NAME', 'Admin');
    vi.stubEnv('NODE_ENV', 'test');

    vi.doMock('@/db/client', () => ({
      getDb: () => ({
        select: () => ({
          from: () => {
            throw missingTableError;
          }
        }),
        insert: () => ({
          values: () => {
            throw missingTableError;
          }
        }),
        update: () => ({
          set: () => ({
            where: () => {
              throw missingTableError;
            }
          })
        }),
        delete: () => ({
          where: () => {
            throw missingTableError;
          }
        })
      })
    }));

    const { getAdminSession, loginAdminUser } = await import('@/features/cms/adminAuth');
    const session = await loginAdminUser('admin@example.com', 'super-secret');

    expect(session).not.toBeNull();
    expect(session?.user.email).toBe('admin@example.com');

    const request = new Request('https://example.com/api/admin/pages', {
      headers: {
        cookie: `cms_admin_session=${session?.sessionToken ?? ''}`
      }
    });

    const restored = await getAdminSession(request);
    expect(restored?.user.email).toBe('admin@example.com');
    expect(restored?.user.role).toBe('super_admin');
  });
});

