import * as contentStore from './contentStore';
import type { HomeBlock, LandingPage, MediaAsset } from './types';

export type MediaUsageEntry = {
  entityType: 'settings' | 'page' | 'blog_post' | 'portfolio_project';
  entityId: string;
  label: string;
  field: string;
  href: string;
};

function collectBlockUsage(page: LandingPage, assetUrl: string, block: HomeBlock) {
  if (block.type === 'why_split' && block.mediaImage === assetUrl) {
    return {
      entityType: 'page' as const,
      entityId: page.id,
      label: page.title,
      field: `Home block: ${block.heading || block.id}`,
      href: `/admin/pages/${page.id}`
    };
  }

  return null;
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
  const pages = Object.values(pagesMap);

  if (settings.organizationLogo === assetUrl) {
    usages.push({
      entityType: 'settings',
      entityId: 'default',
      label: 'Site settings',
      field: 'Organization logo',
      href: '/admin/settings?tab=general'
    });
  }

  if (settings.defaultOgImage === assetUrl || settings.seo.defaultOgImage === assetUrl) {
    usages.push({
      entityType: 'settings',
      entityId: 'default',
      label: 'Site settings',
      field: 'Default Open Graph image',
      href: '/admin/settings?tab=seo'
    });
  }

  for (const page of pages) {
    for (const section of page.sections) {
      if (section.mediaImage !== assetUrl) continue;
      usages.push({
        entityType: 'page',
        entityId: page.id,
        label: page.title,
        field: `Section: ${section.heading || section.id}`,
        href: `/admin/pages/${page.id}`
      });
    }

    for (const block of page.homeBlocks ?? []) {
      const usage = collectBlockUsage(page, assetUrl, block);
      if (usage) {
        usages.push(usage);
      }
    }
  }

  for (const post of posts) {
    if (post.coverImage === assetUrl) {
      usages.push({
        entityType: 'blog_post',
        entityId: post.id,
        label: post.title,
        field: 'Cover image',
        href: `/admin/blog/${post.id}`
      });
    }

    if (post.seo.socialImage === assetUrl) {
      usages.push({
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
      usages.push({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.title,
        field: 'Cover image',
        href: `/admin/portfolio/${project.id}`
      });
    }

    if (project.seo.socialImage === assetUrl) {
      usages.push({
        entityType: 'portfolio_project',
        entityId: project.id,
        label: project.title,
        field: 'Social image',
        href: `/admin/portfolio/${project.id}`
      });
    }

    project.gallery.forEach((item, index) => {
      if (item !== assetUrl) return;
      usages.push({
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
