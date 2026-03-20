import { access } from 'node:fs/promises';
import path from 'node:path';

import { getBlogPostPublicationLabel, getLandingPagePublicationLabel, getPortfolioProjectPublicationLabel } from './publicationState';
import { nowIso } from './storeShared';
import type {
  BlogPost,
  ContentHealthItem,
  ContentHealthReport,
  HomeBlock,
  LandingPage,
  PortfolioProject,
  SiteSettings
} from './types';
import * as contentStore from './contentStore';

const RESERVED_PAGE_SLUGS = new Set(['admin', 'api', 'blog', 'portfolio']);

type LinkReference = {
  href: string;
  label: string;
  targetLabel: string;
  adminHref: string;
};

type ImageReference = {
  url: string;
  label: string;
  adminHref: string;
};

function addUniqueItem(items: ContentHealthItem[], item: ContentHealthItem) {
  if (items.some((entry) => entry.id === item.id)) return;
  items.push(item);
}

function normalizeInternalPath(href: string) {
  const trimmed = href.trim();
  if (!trimmed.startsWith('/')) return '';
  if (trimmed.startsWith('//')) return '';
  const [pathname] = trimmed.split(/[?#]/, 1);
  const normalized = pathname.replace(/\/+$/, '');
  return normalized || '/';
}

function isExternalHref(href: string) {
  return /^(https?:)?\/\//i.test(href) || /^(mailto|tel):/i.test(href.trim());
}

async function publicAssetExists(url: string) {
  if (!url.startsWith('/')) return true;
  const relativePath = url.replace(/^\/+/, '');
  if (!relativePath) return true;

  try {
    await access(path.join(process.cwd(), 'public', relativePath));
    return true;
  } catch {
    return false;
  }
}

function collectPageBlockLinks(block: HomeBlock): string[] {
  switch (block.type) {
    case 'hero':
      return [block.primaryCtaHref, block.secondaryCtaHref];
    case 'solutions_grid':
      return block.items.flatMap((item) => [item.ctaHref]);
    case 'logo_cloud':
      return [block.primaryCtaHref, block.secondaryCtaHref];
    case 'primary_cta':
      return [block.ctaHref];
    default:
      return [];
  }
}

function collectPageImageReferences(page: LandingPage): ImageReference[] {
  const refs: ImageReference[] = [];

  for (const section of page.sections) {
    if (section.mediaImage.trim()) {
      refs.push({
        url: section.mediaImage.trim(),
        label: `${page.title}: section "${section.heading || section.id}" image`,
        adminHref: `/admin/pages/${page.id}`
      });
    }
  }

  for (const block of page.homeBlocks ?? []) {
    if (block.type === 'why_split' && block.mediaImage.trim()) {
      refs.push({
        url: block.mediaImage.trim(),
        label: `${page.title}: block "${block.heading || block.id}" image`,
        adminHref: `/admin/pages/${page.id}`
      });
    }
  }

  return refs;
}

function collectPageLinkReferences(page: LandingPage): LinkReference[] {
  const refs: LinkReference[] = [];

  for (const section of page.sections) {
    if (section.ctaHref.trim()) {
      refs.push({
        href: section.ctaHref.trim(),
        label: `${page.title}: section CTA`,
        targetLabel: section.heading || section.id,
        adminHref: `/admin/pages/${page.id}`
      });
    }
  }

  for (const block of page.homeBlocks ?? []) {
    for (const href of collectPageBlockLinks(block)) {
      if (!href.trim()) continue;
      refs.push({
        href: href.trim(),
        label: `${page.title}: ${block.type} CTA`,
        targetLabel: block.id,
        adminHref: `/admin/pages/${page.id}`
      });
    }
  }

  return refs;
}

function collectSettingsLinks(settings: SiteSettings): LinkReference[] {
  const refs: LinkReference[] = [];

  const navigationLinks = [
    ...settings.navigation.headerLinks,
    ...settings.navigation.footerNavigatorLinks,
    ...settings.navigation.footerServiceLinks
  ];

  for (const link of navigationLinks) {
    if (!link.enabled || !link.href.trim()) continue;
    refs.push({
      href: link.href.trim(),
      label: 'Navigation link',
      targetLabel: link.label || link.id,
      adminHref: '/admin/settings?tab=general'
    });
  }

  for (const [label, href] of [
    ['Header CTA', settings.navigation.headerCtaHref],
    ['Contact email', settings.contact.emailHref],
    ['WhatsApp', settings.contact.whatsappHref],
    ['Instagram', settings.contact.instagramHref],
    ['Social website', settings.social.websiteHref],
    ['Social chat', settings.social.chatHref],
    ['Social Instagram', settings.social.instagramHref],
    ['Social email', settings.social.emailHref]
  ]) {
    if (!href.trim()) continue;
    refs.push({
      href: href.trim(),
      label,
      targetLabel: label,
      adminHref: '/admin/settings?tab=general'
    });
  }

  return refs;
}

function collectKnownPaths(
  pages: LandingPage[],
  posts: BlogPost[],
  projects: PortfolioProject[]
) {
  const publishedPaths = new Set<string>(['/', '/blog', '/portfolio']);
  const draftOnlyPaths = new Set<string>();

  for (const page of pages) {
    const target = page.id === 'home' ? '/' : `/${page.seo.slug}`;
    const normalized = normalizeInternalPath(target);
    if (!normalized) continue;
    if (getLandingPagePublicationLabel(page) === 'published') {
      publishedPaths.add(normalized);
      draftOnlyPaths.delete(normalized);
    } else if (!publishedPaths.has(normalized)) {
      draftOnlyPaths.add(normalized);
    }
  }

  for (const post of posts) {
    const normalized = normalizeInternalPath(`/blog/${post.seo.slug}`);
    if (!normalized) continue;
    if (getBlogPostPublicationLabel(post) === 'published') {
      publishedPaths.add(normalized);
      draftOnlyPaths.delete(normalized);
    } else if (!publishedPaths.has(normalized)) {
      draftOnlyPaths.add(normalized);
    }
  }

  for (const project of projects) {
    const normalized = normalizeInternalPath(`/portfolio/${project.seo.slug}`);
    if (!normalized) continue;
    if (getPortfolioProjectPublicationLabel(project) === 'published') {
      publishedPaths.add(normalized);
      draftOnlyPaths.delete(normalized);
    } else if (!publishedPaths.has(normalized)) {
      draftOnlyPaths.add(normalized);
    }
  }

  return { publishedPaths, draftOnlyPaths };
}

export async function getContentHealthReport(): Promise<ContentHealthReport> {
  const [settings, pagesMap, posts, projects, mediaAssets] = await Promise.all([
    contentStore.getSettings(),
    contentStore.getPages(),
    contentStore.getBlogPosts(true),
    contentStore.getPortfolioProjects(true),
    contentStore.getMediaAssets()
  ]);

  const pages = Object.values(pagesMap);
  const items: ContentHealthItem[] = [];
  const mediaUrls = new Set(mediaAssets.map((asset) => asset.url.trim()).filter(Boolean));
  const knownPaths = collectKnownPaths(pages, posts, projects);

  if (!settings.seo.defaultMetaDescription.trim()) {
    addUniqueItem(items, {
      id: 'settings-seo-default-description',
      severity: 'warning',
      category: 'seo',
      label: 'Default meta description is empty',
      detail: 'Set a site-wide default so pages without custom copy still have a valid description.',
      href: '/admin/settings?tab=seo'
    });
  }

  if (!settings.defaultOgImage.trim()) {
    addUniqueItem(items, {
      id: 'settings-default-og',
      severity: 'warning',
      category: 'seo',
      label: 'Default social image is missing',
      detail: 'Social previews will fall back poorly until a default Open Graph image is configured.',
      href: '/admin/settings?tab=seo'
    });
  }

  for (const page of pages) {
    const pageAdminHref = `/admin/pages/${page.id}`;
    const normalizedSlug = page.seo.slug.trim().replace(/^\/+|\/+$/g, '');

    if (!page.seo.metaTitle.trim() || !page.seo.metaDescription.trim()) {
      addUniqueItem(items, {
        id: `page-seo-${page.id}`,
        severity: 'warning',
        category: 'seo',
        label: `${page.title} is missing core SEO fields`,
        detail: 'Meta title and meta description should both be set before publishing.',
        href: pageAdminHref
      });
    }

    if (normalizedSlug && RESERVED_PAGE_SLUGS.has(normalizedSlug)) {
      addUniqueItem(items, {
        id: `page-reserved-slug-${page.id}`,
        severity: 'error',
        category: 'slugs',
        label: `${page.title} uses a reserved slug`,
        detail: `The slug "${normalizedSlug}" conflicts with a system route.`,
        href: pageAdminHref
      });
    }

    const altIssues = page.sections.filter((section) => section.mediaImage.trim() && !section.mediaAlt.trim()).length;
    const blockAltIssues = (page.homeBlocks ?? []).filter(
      (block) => block.type === 'why_split' && block.mediaImage.trim() && !block.mediaAlt.trim()
    ).length;
    const totalAltIssues = altIssues + blockAltIssues;

    if (totalAltIssues > 0) {
      addUniqueItem(items, {
        id: `page-alt-${page.id}`,
        severity: 'warning',
        category: 'media',
        label: `${page.title} has images without alt text`,
        detail: `${totalAltIssues} page image${totalAltIssues === 1 ? '' : 's'} need descriptive alt text.`,
        href: pageAdminHref
      });
    }

    for (const reference of collectPageLinkReferences(page)) {
      const normalized = normalizeInternalPath(reference.href);
      if (!normalized || isExternalHref(reference.href)) continue;

      if (knownPaths.publishedPaths.has(normalized)) continue;
      const draftOnly = knownPaths.draftOnlyPaths.has(normalized);

      addUniqueItem(items, {
        id: `page-link-${page.id}-${reference.targetLabel}-${normalized}`,
        severity: draftOnly ? 'warning' : 'error',
        category: 'links',
        label: `${reference.label} points to ${draftOnly ? 'draft' : 'missing'} content`,
        detail: draftOnly
          ? `${reference.targetLabel} links to ${normalized}, but that target is not published.`
          : `${reference.targetLabel} links to ${normalized}, but no published route currently matches it.`,
        href: reference.adminHref
      });
    }
  }

  for (const post of posts) {
    if (!post.seo.metaTitle.trim() || !post.seo.metaDescription.trim()) {
      addUniqueItem(items, {
        id: `post-seo-${post.id}`,
        severity: 'warning',
        category: 'seo',
        label: `${post.title} is missing core SEO fields`,
        detail: 'Meta title and meta description should both be set before publishing.',
        href: `/admin/blog/${post.id}`
      });
    }
  }

  for (const project of projects) {
    if (!project.seo.metaTitle.trim() || !project.seo.metaDescription.trim()) {
      addUniqueItem(items, {
        id: `portfolio-seo-${project.id}`,
        severity: 'warning',
        category: 'seo',
        label: `${project.title} is missing core SEO fields`,
        detail: 'Meta title and meta description should both be set before publishing.',
        href: `/admin/portfolio/${project.id}`
      });
    }
  }

  const pageSlugMap = new Map<string, LandingPage[]>();
  for (const page of pages) {
    const slug = page.seo.slug.trim().toLowerCase();
    if (!slug) continue;
    pageSlugMap.set(slug, [...(pageSlugMap.get(slug) ?? []), page]);
  }

  for (const [slug, groupedPages] of pageSlugMap) {
    if (groupedPages.length < 2) continue;
    for (const page of groupedPages) {
      addUniqueItem(items, {
        id: `page-duplicate-slug-${page.id}`,
        severity: 'error',
        category: 'slugs',
        label: `Duplicate page slug "${slug}"`,
        detail: 'Multiple pages share the same slug. Only one route can win.',
        href: `/admin/pages/${page.id}`
      });
    }
  }

  const postSlugMap = new Map<string, BlogPost[]>();
  for (const post of posts) {
    const slug = post.seo.slug.trim().toLowerCase();
    if (!slug) continue;
    postSlugMap.set(slug, [...(postSlugMap.get(slug) ?? []), post]);
  }

  for (const [slug, groupedPosts] of postSlugMap) {
    if (groupedPosts.length < 2) continue;
    for (const post of groupedPosts) {
      addUniqueItem(items, {
        id: `post-duplicate-slug-${post.id}`,
        severity: 'error',
        category: 'slugs',
        label: `Duplicate blog slug "${slug}"`,
        detail: 'Multiple blog posts share the same slug.',
        href: `/admin/blog/${post.id}`
      });
    }
  }

  const projectSlugMap = new Map<string, PortfolioProject[]>();
  for (const project of projects) {
    const slug = project.seo.slug.trim().toLowerCase();
    if (!slug) continue;
    projectSlugMap.set(slug, [...(projectSlugMap.get(slug) ?? []), project]);
  }

  for (const [slug, groupedProjects] of projectSlugMap) {
    if (groupedProjects.length < 2) continue;
    for (const project of groupedProjects) {
      addUniqueItem(items, {
        id: `portfolio-duplicate-slug-${project.id}`,
        severity: 'error',
        category: 'slugs',
        label: `Duplicate portfolio slug "${slug}"`,
        detail: 'Multiple portfolio projects share the same slug.',
        href: `/admin/portfolio/${project.id}`
      });
    }
  }

  const imageReferences: ImageReference[] = [
    {
      url: settings.organizationLogo.trim(),
      label: 'Organization logo',
      adminHref: '/admin/settings?tab=general'
    },
    {
      url: settings.defaultOgImage.trim(),
      label: 'Default Open Graph image',
      adminHref: '/admin/settings?tab=seo'
    },
    ...pages.flatMap(collectPageImageReferences),
    ...posts.flatMap((post) => [
      {
        url: post.coverImage.trim(),
        label: `${post.title}: cover image`,
        adminHref: `/admin/blog/${post.id}`
      },
      {
        url: post.seo.socialImage.trim(),
        label: `${post.title}: social image`,
        adminHref: `/admin/blog/${post.id}`
      }
    ]),
    ...projects.flatMap((project) => [
      {
        url: project.coverImage.trim(),
        label: `${project.title}: cover image`,
        adminHref: `/admin/portfolio/${project.id}`
      },
      {
        url: project.seo.socialImage.trim(),
        label: `${project.title}: social image`,
        adminHref: `/admin/portfolio/${project.id}`
      },
      ...project.gallery.map((url, index) => ({
        url: url.trim(),
        label: `${project.title}: gallery image ${index + 1}`,
        adminHref: `/admin/portfolio/${project.id}`
      }))
    ])
  ].filter((reference) => reference.url);

  for (const reference of imageReferences) {
    if (isExternalHref(reference.url)) continue;
    const existsInMedia = mediaUrls.has(reference.url);
    const existsOnDisk = await publicAssetExists(reference.url);
    if (existsInMedia || existsOnDisk) continue;

    addUniqueItem(items, {
      id: `missing-image-${reference.adminHref}-${reference.label}-${reference.url}`,
      severity: 'error',
      category: 'media',
      label: `${reference.label} is missing`,
      detail: `${reference.url} does not resolve to a tracked media asset or local public file.`,
      href: reference.adminHref
    });
  }

  for (const asset of mediaAssets) {
    if (asset.url.trim() && !asset.altText.trim()) {
      addUniqueItem(items, {
        id: `media-alt-${asset.id}`,
        severity: 'warning',
        category: 'media',
        label: `${asset.title} is missing alt text`,
        detail: 'Media assets should have descriptive alt text before editors reuse them across pages.',
        href: '/admin/media'
      });
    }
  }

  for (const reference of collectSettingsLinks(settings)) {
    const normalized = normalizeInternalPath(reference.href);
    if (!normalized || isExternalHref(reference.href)) continue;
    if (knownPaths.publishedPaths.has(normalized)) continue;
    const draftOnly = knownPaths.draftOnlyPaths.has(normalized);

    addUniqueItem(items, {
      id: `settings-link-${reference.targetLabel}-${normalized}`,
      severity: draftOnly ? 'warning' : 'error',
      category: 'links',
      label: `${reference.label} points to ${draftOnly ? 'draft' : 'missing'} content`,
      detail: draftOnly
        ? `${reference.targetLabel} links to ${normalized}, but that page is not published.`
        : `${reference.targetLabel} links to ${normalized}, but no published route currently matches it.`,
      href: reference.adminHref
    });
  }

  const errors = items.filter((item) => item.severity === 'error').length;
  const warnings = items.filter((item) => item.severity === 'warning').length;

  return {
    checkedAt: nowIso(),
    errors,
    warnings,
    items: items.sort((a, b) => {
      if (a.severity !== b.severity) return a.severity === 'error' ? -1 : 1;
      return a.label.localeCompare(b.label);
    })
  };
}
