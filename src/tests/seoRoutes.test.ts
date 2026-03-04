import { describe, expect, it } from 'vitest';

import robots from '@/app/robots';
import sitemap from '@/app/sitemap';

describe('SEO routes', () => {
  it('sitemap includes published pages and posts only', async () => {
    const entries = await sitemap();
    const urls = entries.map((entry) => entry.url);

    expect(urls).toContain('http://localhost:3000');
    expect(urls).toContain('http://localhost:3000/about');
    expect(urls).toContain('http://localhost:3000/service');
    expect(urls).toContain('http://localhost:3000/contact');
    expect(urls).toContain('http://localhost:3000/blog/high-converting-service-landing-page');
    expect(urls).not.toContain('http://localhost:3000/blog/editorial-workflow-checklist');
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
