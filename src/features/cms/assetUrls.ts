import { env } from '@/services/env';

import type { BlogPost, CmsContent, HomeBlock, LandingPage, MediaAsset, PortfolioProject, SeoFields, SiteSettings } from './types';

function mediaBaseUrl() {
  return env.mediaPublicBaseUrl.trim().replace(/\/+$/, '');
}

export function resolveStoredAssetUrl(value: string) {
  const raw = value.trim();
  const baseUrl = mediaBaseUrl();

  if (!raw || !baseUrl) {
    return raw;
  }

  try {
    const parsed = new URL(raw, env.siteUrl);
    const normalizedPath = parsed.pathname.replace(/^\/+/, '');

    if (!normalizedPath.startsWith('media/') && !normalizedPath.startsWith('portfolio/')) {
      return raw;
    }

    return `${baseUrl}/${normalizedPath}`;
  } catch {
    return raw;
  }
}

function resolveSeoFields(seo: SeoFields): SeoFields {
  return {
    ...seo,
    socialImage: resolveStoredAssetUrl(seo.socialImage)
  };
}

function resolveHomeBlock(block: HomeBlock): HomeBlock {
  if (block.type !== 'why_split') {
    return block;
  }

  return {
    ...block,
    mediaImage: resolveStoredAssetUrl(block.mediaImage)
  };
}

export function resolveLandingPageAssetUrls(page: LandingPage): LandingPage {
  return {
    ...page,
    seo: resolveSeoFields(page.seo),
    sections: page.sections.map((section) => ({
      ...section,
      mediaImage: resolveStoredAssetUrl(section.mediaImage)
    })),
    homeBlocks: page.homeBlocks?.map(resolveHomeBlock)
  };
}

export function resolveBlogPostAssetUrls(post: BlogPost): BlogPost {
  return {
    ...post,
    coverImage: resolveStoredAssetUrl(post.coverImage),
    seo: resolveSeoFields(post.seo)
  };
}

export function resolvePortfolioProjectAssetUrls(project: PortfolioProject): PortfolioProject {
  return {
    ...project,
    coverImage: resolveStoredAssetUrl(project.coverImage),
    gallery: project.gallery.map(resolveStoredAssetUrl),
    seo: resolveSeoFields(project.seo)
  };
}

export function resolveMediaAssetUrls(asset: MediaAsset): MediaAsset {
  return {
    ...asset,
    url: resolveStoredAssetUrl(asset.url)
  };
}

export function resolveSettingsAssetUrls(settings: SiteSettings): SiteSettings {
  return {
    ...settings,
    defaultOgImage: resolveStoredAssetUrl(settings.defaultOgImage),
    organizationLogo: resolveStoredAssetUrl(settings.organizationLogo),
    branding: {
      ...settings.branding,
      headerLogo: resolveStoredAssetUrl(settings.branding.headerLogo),
      footerLogo: resolveStoredAssetUrl(settings.branding.footerLogo),
      siteIcon: resolveStoredAssetUrl(settings.branding.siteIcon)
    },
    seo: {
      ...settings.seo,
      defaultOgImage: resolveStoredAssetUrl(settings.seo.defaultOgImage)
    }
  };
}

export function resolveCmsContentAssetUrls(content: CmsContent): CmsContent {
  return {
    ...content,
    settings: resolveSettingsAssetUrls(content.settings),
    pages: Object.fromEntries(
      Object.entries(content.pages).map(([id, page]) => [id, resolveLandingPageAssetUrls(page)])
    ) as CmsContent['pages'],
    blogPosts: content.blogPosts.map(resolveBlogPostAssetUrls),
    portfolioProjects: content.portfolioProjects.map(resolvePortfolioProjectAssetUrls),
    mediaAssets: content.mediaAssets.map(resolveMediaAssetUrls)
  };
}
