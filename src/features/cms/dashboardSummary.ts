import { getAdminAuditLogs, type AdminAuditLogEntry } from './adminAuth';
import { getAnalyticsSummary, type AnalyticsSummary } from './analyticsStore';
import { getContentHealthReport } from './contentHealth';
import * as contentStore from './contentStore';
import {
  getBlogPostPublicationLabel,
  getLandingPagePublicationLabel,
  getPortfolioProjectPublicationLabel
} from './publicationState';
import type { BlogPost, ContentHealthReport, LandingPage, PortfolioProject, SiteSettings } from './types';

export type ChecklistItem = {
  id: string;
  label: string;
  done: boolean;
  detail: string;
};

export type ScheduledContentItem = {
  id: string;
  title: string;
  path: string;
  type: 'page' | 'blog_post' | 'portfolio_project';
  publishAt: string | null;
  unpublishAt: string | null;
  statusLabel: string;
};

export type DashboardSummary = {
  pages: LandingPage[];
  blogPosts: BlogPost[];
  portfolioProjects: PortfolioProject[];
  checklist: ChecklistItem[];
  scheduled: ScheduledContentItem[];
  auditLogs: AdminAuditLogEntry[];
  analytics: AnalyticsSummary;
  health: ContentHealthReport;
};

function placeholderAsset(value: string) {
  return /placehold\.co|localhost:3000/i.test(value);
}

function buildChecklist(settings: SiteSettings, pages: LandingPage[], posts: BlogPost[], projects: PortfolioProject[]): ChecklistItem[] {
  return [
    {
      id: 'site-url',
      label: 'Set the production site URL',
      done: Boolean(settings.baseUrl) && !/localhost|example\.com/i.test(settings.baseUrl),
      detail: settings.baseUrl || 'NEXT_PUBLIC_SITE_URL still uses the default placeholder.'
    },
    {
      id: 'contact-email',
      label: 'Confirm the public contact email',
      done: Boolean(settings.contact.emailValue) && !/example\.com|example\.local/i.test(settings.contact.emailValue),
      detail: settings.contact.emailValue || 'Contact email is still empty.'
    },
    {
      id: 'default-og',
      label: 'Upload a real Open Graph image',
      done: Boolean(settings.defaultOgImage) && !placeholderAsset(settings.defaultOgImage),
      detail: settings.defaultOgImage || 'Default social image is still empty.'
    },
    {
      id: 'seo-defaults',
      label: 'Review SEO and social defaults',
      done:
        Boolean(settings.seo.titleTemplate.trim()) &&
        Boolean(settings.seo.defaultMetaDescription.trim()) &&
        !settings.seo.defaultNoIndex,
      detail: 'Confirm title template, default description, and indexing defaults before launch.'
    },
    {
      id: 'homepage-copy',
      label: 'Review homepage SEO copy',
      done: !/example studio|example/i.test(settings.siteName) && pages.some((page) => page.id === 'home'),
      detail: 'Replace starter copy and verify the homepage title/meta description.'
    },
    {
      id: 'first-publish',
      label: 'Publish at least one client-ready content item',
      done: pages.some((page) => page.published) || posts.some((post) => post.status === 'published') || projects.some((project) => project.status === 'published'),
      detail: 'Pages, posts, and portfolio items are still all in draft mode.'
    }
  ];
}

function buildScheduledItems(pages: LandingPage[], posts: BlogPost[], projects: PortfolioProject[]): ScheduledContentItem[] {
  return [
    ...pages
      .filter((page) => page.scheduledPublishAt || page.scheduledUnpublishAt)
      .map((page) => ({
        id: page.id,
        title: page.title,
        path: page.id === 'home' ? '/' : `/${page.seo.slug}`,
        type: 'page' as const,
        publishAt: page.scheduledPublishAt ?? null,
        unpublishAt: page.scheduledUnpublishAt ?? null,
        statusLabel: getLandingPagePublicationLabel(page)
      })),
    ...posts
      .filter((post) => post.scheduledPublishAt || post.scheduledUnpublishAt)
      .map((post) => ({
        id: post.id,
        title: post.title,
        path: `/blog/${post.seo.slug}`,
        type: 'blog_post' as const,
        publishAt: post.scheduledPublishAt ?? null,
        unpublishAt: post.scheduledUnpublishAt ?? null,
        statusLabel: getBlogPostPublicationLabel(post)
      })),
    ...projects
      .filter((project) => project.scheduledPublishAt || project.scheduledUnpublishAt)
      .map((project) => ({
        id: project.id,
        title: project.title,
        path: `/portfolio/${project.seo.slug}`,
        type: 'portfolio_project' as const,
        publishAt: project.scheduledPublishAt ?? null,
        unpublishAt: project.scheduledUnpublishAt ?? null,
        statusLabel: getPortfolioProjectPublicationLabel(project)
      }))
  ].sort((a, b) => {
    const aTime = a.publishAt || a.unpublishAt || '';
    const bTime = b.publishAt || b.unpublishAt || '';
    return aTime > bTime ? 1 : -1;
  });
}

export async function getDashboardSummary(): Promise<DashboardSummary> {
  const [pagesMap, blogPosts, portfolioProjects, settings, auditLogs, analytics, health] = await Promise.all([
    contentStore.getPages(),
    contentStore.getBlogPosts(true),
    contentStore.getPortfolioProjects(true),
    contentStore.getSettings(),
    getAdminAuditLogs(8),
    getAnalyticsSummary(30),
    getContentHealthReport()
  ]);

  const pages = Object.values(pagesMap);
  return {
    pages,
    blogPosts,
    portfolioProjects,
    checklist: buildChecklist(settings, pages, blogPosts, portfolioProjects),
    scheduled: buildScheduledItems(pages, blogPosts, portfolioProjects),
    auditLogs,
    analytics,
    health
  };
}
