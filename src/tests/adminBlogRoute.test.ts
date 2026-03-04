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

describe('admin blog API route', () => {
  it('rejects unauthorized requests', async () => {
    process.env.CMS_ADMIN_TOKEN = 'secure-token';
    vi.resetModules();
    const route = await import('@/app/api/admin/blog/route');
    const response = await route.GET(new Request('http://localhost/api/admin/blog'));

    expect(response.status).toBe(401);
  });

  it('returns filtered posts and metadata', async () => {
    process.env.CMS_ADMIN_TOKEN = 'secure-token';
    vi.resetModules();
    const route = await import('@/app/api/admin/blog/route');

    const response = await route.GET(
      new Request(
        'http://localhost/api/admin/blog?includeDrafts=1&status=published&category=engineering&page=1&pageSize=1',
        {
          headers: { 'x-admin-token': 'secure-token' }
        }
      )
    );

    expect(response.status).toBe(200);
    const body = (await response.json()) as {
      posts: Array<{ status: string; tags: string[] }>;
      meta: { total: number; page: number; pageSize: number; categories: string[] };
    };
    expect(body.posts.length).toBe(1);
    expect(body.posts[0].status).toBe('published');
    expect(body.posts[0].tags).toContain('engineering');
    expect(body.meta.page).toBe(1);
    expect(body.meta.pageSize).toBe(1);
    expect(body.meta.categories.length).toBeGreaterThan(0);
  });
});
