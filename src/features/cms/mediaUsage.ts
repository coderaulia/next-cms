import * as contentStore from './contentStore';
import type { MediaAsset } from './types';

export type MediaUsageEntry = {
  entityType: 'settings' | 'page' | 'blog_post' | 'portfolio_project';
  entityId: string;
  label: string;
  field: string;
  href: string;
};

function valueContainsMediaUrl(value: unknown, assetUrl: string): boolean {
  if (typeof value === 'string') {
    return value === assetUrl;
  }

  if (Array.isArray(value)) {
    return value.some((entry) => valueContainsMediaUrl(entry, assetUrl));
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some((entry) => valueContainsMediaUrl(entry, assetUrl));
  }

  return false;
}

export async function getMediaUsage(mediaAsset: MediaAsset): Promise<MediaUsageEntry[]> {
  const assetUrl = mediaAsset.url.trim();
  if (!assetUrl) return [];

  const [settings, pagesMap, posts, projects] = await Promise.all([
    contentStore.getSettings(),
    contentStore.getPages(),
    contentStore.getBlogPosts(true),
    contentStore.getPortfolioProjects(true)
  ]);

  const usages: MediaUsageEntry[] = [];
  const usageKeys = new Set<string>();
  const pages = Object.values(pagesMap);

  const addUsage = (entry: MediaUsageEntry) => {
    const key = `${entry.entityType}:${entry.entityId}:${entry.field}`;
    if (usageKeys.has(key)) return;
    usageKeys.add(key);
    usages.push(entry);
  };

  if (settings.branding.headerLogo === assetUrl) {
    addUsage({
      entityType: 'settings',
      entityId: 'default',
      label: 'Site settings',
      field: 'Organization logo',
      href: '/admin/settings?tab=general'
    });
  }

  if (settings.seo.defaultOgImage === assetUrl) {
    addUsage({
      entityType: 'settings',
      entityId: 'default',
      label: 'Site settings',
      field: 'Default Open Graph image',
      href: '/admin/settings?tab=seo'
    });
  }

  for (const page of pages) {
    for (const section of page.sections) {
      if (!valueContainsMediaUrl(section, assetUrl)) continue;
      addUsage({
        entityType: 'page',
        entityId: page.id,
        label: page.title,
        field: `Section: ${section.heading || section.id}`,
        href: `/admin/pages/${page.id}`
      });
    }

    for (const block of page.homeBlocks ?? []) {
      if (!valueContainsMediaUrl(block, assetUrl)) continue;
      addUsage({
        entityType: 'page',
        entityId: page.id,
        label: page.title,
        field: `Home block: ${'heading' in block ? block.heading || block.id : block.id}`,
        href: `/admin/pages/${page.id}`
      });
    }
  }

  for (const post of posts) {
    if (post.coverImage === assetUrl) {
      addUsage({
        entityType: 'blog_post',
        entityId: post.id,
        label: post.title,
        field: 'Cover image',
        href: `/admin/blog/${post.id}`
      });
    }

    if (post.seo.socialImage === assetUrl) {
      addUsage({
        entityType: 'blog_post',
        entityId: post.id,
        label: post.title,
        field: 'Social image',
        href: `/admin/blog/${post.id}`
      });
    }
  }

  for (const project of projects) {
    if (project.coverImage === assetUrl) {
      addUsage({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.title,
        field: 'Cover image',
        href: `/admin/portfolio/${project.id}`
      });
    }

    if (project.seo.socialImage === assetUrl) {
      addUsage({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.title,
        field: 'Social image',
        href: `/admin/portfolio/${project.id}`
      });
    }

    project.gallery.forEach((item, index) => {
      if (item !== assetUrl) return;
      addUsage({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.title,
        field: `Gallery image ${index + 1}`,
        href: `/admin/portfolio/${project.id}`
      });
    });
  }

  return usages;
}

export async function findMediaReferences(mediaUrl: string): Promise<string[]> {
  const mediaAsset: MediaAsset = {
    id: 'lookup',
    title: mediaUrl,
    url: mediaUrl,
    altText: '',
    mimeType: '',
    width: null,
    height: null,
    sizeBytes: null,
    storageProvider: 'local',
    storageKey: null,
    createdAt: '',
    updatedAt: ''
  };

  const usage = await getMediaUsage(mediaAsset);
  return usage.map((entry) => `${entry.label} - ${entry.field}`);
}
