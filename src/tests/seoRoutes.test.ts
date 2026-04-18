import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

describe('SEO routes', () => {
  it('sitemap returns empty when baseUrl is localhost (localhost guard)', async () => {
    // The sitemap deliberately blocks indexing when baseUrl is localhost
    // to protect against search engines crawling misconfigured deployments.
    // In tests, defaultContent.settings.general.baseUrl is http://localhost:3000.
    const entries = await sitemap();
    expect(entries).toEqual([]);
  });

  it('robots exposes sitemap and disallows admin endpoints', async () => {
    const payload = await robots();
    const rules = Array.isArray(payload.rules) ? payload.rules : [payload.rules];

    expect(payload.sitemap).toBe('http://localhost:3000/sitemap.xml');
    expect(rules.some((rule) => Array.isArray(rule.disallow) && rule.disallow.includes('/admin'))).toBe(
      true
    );
    expect(
      rules.some((rule) => Array.isArray(rule.disallow) && rule.disallow.includes('/api/admin'))
    ).toBe(true);
  });
});
