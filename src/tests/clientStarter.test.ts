import { describe, expect, it } from 'vitest';

import { defaultContent } from '@/features/cms/defaultContent';
import {
  bootstrapFixtures,
  buildFixtureSeedContent,
  buildStarterContent,
  buildEnvExample,
  normalizeBootstrapConfig,
  updateGlobalCssBrandColors,
  updateTailwindBrandColors
} from '@/features/bootstrap/clientStarter';

describe('client starter bootstrap', () => {
  it('normalizes module and page selections into a consistent starter config', () => {
    const config = normalizeBootstrapConfig({
      outputDir: '../acme-cms',
      siteName: 'Acme Studio',
      modules: ['portfolio'],
      pages: ['service']
    });

    expect(config.slug).toBe('acme-studio');
    expect(config.modules).toEqual(['services', 'portfolio']);
    expect(config.pages).toEqual(['service']);
    expect(config.brandMark).toBe('A');
  });

  it('filters disabled modules from starter content and rewrites navigation', () => {
    const config = normalizeBootstrapConfig({
      outputDir: '../acme-cms',
      siteName: 'Acme Studio',
      modules: ['services'],
      pages: ['contact']
    });

    const starter = buildStarterContent(defaultContent, config);

    expect(starter.settings.siteName).toBe('Acme Studio');
    expect(starter.blogPosts).toHaveLength(0);
    expect(starter.portfolioProjects).toHaveLength(0);
    expect(Object.keys(starter.pages)).toEqual([
      'home',
      'service',
      'service-website-development',
      'service-custom-business-tools',
      'service-secure-online-shops',
      'service-mobile-business-app',
      'service-official-business-email',
      'contact'
    ]);
    expect(starter.settings.navigation.headerLinks.map((link) => link.href)).toEqual([
      '/',
      '/service'
    ]);
    expect(starter.settings.navigation.footerNavigatorLinks.map((link) => link.href)).toEqual([
      '/',
      '/service',
      '/contact'
    ]);
    expect(starter.settings.sitemap.includePosts).toBe(false);
    expect(starter.settings.sitemap.includePortfolio).toBe(false);
  });

  it('updates brand tokens in theme source files', () => {
    const tailwind = updateTailwindBrandColors(
      "colors: { vanailaNavy: '#1f314f', electricBlue: '#3b82f6', royalPurple: '#6366f1', vibrantCyan: '#06b6d4', deepSlate: '#111b31' }",
      {
        dark: '#112233',
        primary: '#224466',
        secondary: '#335577',
        accent: '#446688',
        text: '#010203'
      }
    );

    const globals = updateGlobalCssBrandColors(
      ':root { --bg: #eef2f7; --bg-soft: #f6f8fc; --text: #0c1730; --text-muted: #637391; --line: #d6dfed; --line-strong: #b9c7dd; --primary: #1a2d4c; --primary-hover: #14253f; --accent: #2f6dff; --accent-soft: #a3c0ff; }',
      {
        dark: '#112233',
        primary: '#224466',
        secondary: '#335577',
        accent: '#446688',
        text: '#010203'
      }
    );

    expect(tailwind).toContain("vanailaNavy: '#112233'");
    expect(tailwind).toContain("electricBlue: '#224466'");
    expect(globals).toContain('--primary: #112233;');
    expect(globals).toContain('--accent: #224466;');
    expect(globals).toContain('--text: #010203;');
  });

  it('applies named variant defaults for common client profiles', () => {
    const config = normalizeBootstrapConfig({
      outputDir: '../searchlane-cms',
      siteName: '',
      variant: 'blog-seo'
    });

    expect(config.siteName).toBe('Searchlane Studio');
    expect(config.modules).toEqual(['services', 'blog']);
    expect(config.pages).toEqual(['about', 'service', 'contact']);
    expect(config.fixture).toBe('blog-seo');
  });

  it('builds distinct starter fixtures for multiple client shapes', () => {
    for (const fixture of bootstrapFixtures) {
      const starter = buildFixtureSeedContent(defaultContent, fixture);

      expect(starter.pages.home).toBeDefined();
      expect(starter.settings.general.siteName.length).toBeGreaterThan(0);
      expect(starter.settings.navigation.headerLinks[0]?.href).toBe('/');
    }

    const caseStudyStarter = buildFixtureSeedContent(defaultContent, 'portfolio-case-studies');
    expect(caseStudyStarter.settings.navigation.headerLinks.some((link) => link.label === 'Case Studies')).toBe(true);
    expect(caseStudyStarter.portfolioProjects.length).toBeGreaterThan(0);
    expect(caseStudyStarter.blogPosts).toHaveLength(0);
  });

  it('includes the selected seed fixture in the generated env template', () => {
    const config = normalizeBootstrapConfig({
      outputDir: '../pipeline-works',
      siteName: '',
      fixture: 'lead-gen'
    });

    expect(buildEnvExample(config)).toContain('CMS_SEED_FIXTURE=lead-gen');
  });
});
