import { describe, expect, it } from 'vitest';

import { validateCategory, validateMediaAsset } from '@/features/cms/validators';

describe('collection validators', () => {
  it('accepts valid category payloads and normalizes slug', () => {
    const category = validateCategory({
      id: 'cat-1',
      name: 'Engineering Insights',
      slug: 'Engineering Insights',
      description: 'Technical notes'
    });

    expect(category).not.toBeNull();
    expect(category?.slug).toBe('engineering-insights');
  });

  it('rejects category payloads without a name', () => {
    expect(validateCategory({ slug: 'empty' })).toBeNull();
  });

  it('accepts valid media asset payloads', () => {
    const asset = validateMediaAsset({
      id: 'media-1',
      title: 'Homepage Hero',
      url: 'https://example.com/hero.png',
      altText: 'Hero visual',
      mimeType: 'image/png',
      width: 1200,
      height: 800,
      sizeBytes: 2048,
      storageProvider: 'external-url'
    });

    expect(asset).not.toBeNull();
    expect(asset?.width).toBe(1200);
    expect(asset?.storageProvider).toBe('external-url');
  });

  it('rejects media asset payloads without title or url', () => {
    expect(validateMediaAsset({ title: '', url: '' })).toBeNull();
  });
});
