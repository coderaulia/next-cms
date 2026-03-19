import { env } from '@/services/env';

import * as dbCollectionsStore from './dbCollectionsStore';
import * as dbStore from './dbStore';
import type { CmsContent } from './types';

type FileContentStore = typeof import('./fileStore');
type FileCollectionsStore = typeof import('./fileCollectionsStore');

export type CmsStoreModules =
  | {
      mode: 'database';
      contentStore: typeof dbStore;
      collectionsStore: typeof dbCollectionsStore;
    }
  | {
      mode: 'file';
      contentStore: FileContentStore;
      collectionsStore: FileCollectionsStore;
    };

export function isDatabaseMode() {
  return Boolean(env.databaseUrl);
}

export async function loadCmsStoreModules(): Promise<CmsStoreModules> {
  if (isDatabaseMode()) {
    return {
      mode: 'database',
      contentStore: dbStore,
      collectionsStore: dbCollectionsStore
    };
  }

  const [contentStore, collectionsStore] = await Promise.all([
    import('./fileStore'),
    import('./fileCollectionsStore')
  ]);

  return {
    mode: 'file',
    contentStore,
    collectionsStore
  };
}

export async function readRawCmsContent(): Promise<CmsContent> {
  const stores = await loadCmsStoreModules();
  if (stores.mode === 'file') {
    return stores.contentStore.readContent();
  }

  const [settings, pages, blogPosts, portfolioProjects, categories, mediaAssets] = await Promise.all([
    stores.contentStore.getSettings(),
    stores.contentStore.getPages(),
    stores.contentStore.getBlogPosts(true),
    stores.contentStore.getPortfolioProjects(true),
    stores.collectionsStore.getCategories(),
    stores.collectionsStore.getMediaAssets()
  ]);

  return {
    settings,
    pages,
    blogPosts,
    portfolioProjects,
    categories,
    mediaAssets
  };
}

export async function writeRawCmsContent(content: CmsContent): Promise<void> {
  const stores = await loadCmsStoreModules();
  if (stores.mode === 'file') {
    await stores.contentStore.writeContent(content);
    return;
  }

  await stores.contentStore.replaceAllCmsContent(content);
}
