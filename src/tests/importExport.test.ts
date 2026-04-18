import { beforeEach, describe, expect, it, vi } from 'vitest';

import { defaultContent } from '@/features/cms/defaultContent';
import { exportCmsJson, importCmsJson } from '@/features/cms/importExport';
import type { CmsContent } from '@/features/cms/types';

const readRawCmsContentMock = vi.fn<() => Promise<CmsContent>>();
const writeRawCmsContentMock = vi.fn<(content: CmsContent) => Promise<void>>();
const captureContentRevisionMock = vi.fn();

vi.mock('@/features/cms/storeAdapter', () => ({
  readRawCmsContent: () => readRawCmsContentMock(),
  writeRawCmsContent: (content: CmsContent) => writeRawCmsContentMock(content)
}));

vi.mock('@/features/cms/contentRevisions', () => ({
  captureContentRevision: (...args: unknown[]) => captureContentRevisionMock(...args)
}));

let currentContent: CmsContent;

beforeEach(() => {
  currentContent = structuredClone(defaultContent);
  readRawCmsContentMock.mockReset();
  writeRawCmsContentMock.mockReset();
  captureContentRevisionMock.mockReset();
  readRawCmsContentMock.mockImplementation(async () => currentContent);
  writeRawCmsContentMock.mockImplementation(async (content: CmsContent) => {
    currentContent = content;
  });
  captureContentRevisionMock.mockResolvedValue(null);
});

describe('import/export helpers', () => {
  it('exports pages as a wrapped schema payload', async () => {
    const result = await exportCmsJson('pages');

    expect(result.collection).toBe('pages');
    expect(result.schemaVersion).toBe(1);
    expect(result.data).toEqual(currentContent.pages);
  });

  it('merges imported pages by id and preserves untouched pages', async () => {
    const importedAbout = {
      ...currentContent.pages.about,
      title: 'Updated About Title',
      navLabel: 'About Us',
      updatedAt: new Date('2026-03-28T10:00:00.000Z').toISOString()
    };

    const result = await importCmsJson(
      'pages',
      {
        data: {
          pages: {
            about: importedAbout
          }
        }
      },
      'merge'
    );

    expect(result.importedCount).toBe(1);
    expect(currentContent.pages.about.title).toBe('Updated About Title');
    expect(currentContent.pages.about.navLabel).toBe('About Us');
    expect(currentContent.pages.home.title).toBe(defaultContent.pages.home.title);
    expect(writeRawCmsContentMock).toHaveBeenCalledTimes(1);
    expect(captureContentRevisionMock).toHaveBeenCalledWith(
      expect.objectContaining({
        entityType: 'full_site',
        entityId: 'cms',
        label: 'Backup before pages merge import',
        payload: expect.objectContaining({
          pages: expect.objectContaining({
            about: expect.objectContaining({
              title: defaultContent.pages.about.title
            })
          })
        })
      })
    );
  });

  it('rejects incomplete full-site replace payloads', async () => {
    await expect(
      importCmsJson(
        'fullSite',
        {
          data: {
            settings: currentContent.settings,
            pages: currentContent.pages
          }
        },
        'replace'
      )
    ).rejects.toThrow(/full-site replace requires a complete cms backup payload/i);

    expect(writeRawCmsContentMock).not.toHaveBeenCalled();
  });

  it('rejects page imports with duplicate slugs before writing', async () => {
    const importedAbout = {
      ...currentContent.pages.about,
      seo: {
        ...currentContent.pages.about.seo,
        slug: currentContent.pages.service.seo.slug
      }
    };

    await expect(
      importCmsJson(
        'pages',
        {
          data: {
            pages: {
              about: importedAbout
            }
          }
        },
        'merge'
      )
    ).rejects.toThrow(/page slugs must be unique/i);

    expect(writeRawCmsContentMock).not.toHaveBeenCalled();
    expect(captureContentRevisionMock).not.toHaveBeenCalled();
  });
});
