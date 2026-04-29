import { pgTable, text, boolean, jsonb, timestamp, integer, uniqueIndex, index, primaryKey } from 'drizzle-orm/pg-core';

import type {
  BlogPost,
  BlogStatus,
  CmsRevisionPayload,
  HomeBlock,
  PageId,
  PageSection,
  PortfolioProject,
  PortfolioStatus,
  SeoFields,
  SiteSettings
} from '@/features/cms/types';

export const siteSettingsTable = pgTable('site_settings', {
  id: text('id').primaryKey(),
  payload: jsonb('payload').$type<SiteSettings>().notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
});

export const pagesTable = pgTable(
  'pages',
  {
    id: text('id').$type<PageId>().primaryKey(),
    title: text('title').notNull(),
    navLabel: text('nav_label').notNull(),
    slug: text('slug').notNull(),
    published: boolean('published').notNull(),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'string' }),
    scheduledUnpublishAt: timestamp('scheduled_unpublish_at', { withTimezone: true, mode: 'string' }),
    seo: jsonb('seo').$type<SeoFields>().notNull(),
    sections: jsonb('sections').$type<PageSection[]>().notNull(),
    homeBlocks: jsonb('home_blocks').$type<HomeBlock[] | null>(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('pages_slug_unique').on(table.slug)
  })
);

export const blogPostsTable = pgTable(
  'blog_posts',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    excerpt: text('excerpt').notNull(),
    content: text('content').notNull(),
    author: text('author').notNull(),
    tags: jsonb('tags').$type<string[]>().notNull(),
    coverImage: text('cover_image').notNull(),
    status: text('status').$type<BlogStatus>().notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'string' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'string' }),
    scheduledUnpublishAt: timestamp('scheduled_unpublish_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
    seo: jsonb('seo').$type<BlogPost['seo']>().notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('blog_posts_slug_unique').on(table.slug),
    statusIdx: index('blog_posts_status_idx').on(table.status)
  })
);

export const portfolioProjectsTable = pgTable(
  'portfolio_projects',
  {
    id: text('id').primaryKey(),
    title: text('title').notNull(),
    slug: text('slug').notNull(),
    summary: text('summary').notNull(),
    challenge: text('challenge').notNull(),
    solution: text('solution').notNull(),
    outcome: text('outcome').notNull(),
    clientName: text('client_name').notNull(),
    serviceType: text('service_type').notNull(),
    industry: text('industry').notNull(),
    projectUrl: text('project_url').notNull(),
    relatedServicePageIds: jsonb('related_service_page_ids').$type<PortfolioProject['relatedServicePageIds']>().notNull(),
    coverImage: text('cover_image').notNull(),
    gallery: jsonb('gallery').$type<string[]>().notNull(),
    tags: jsonb('tags').$type<string[]>().notNull(),
    featured: boolean('featured').notNull(),
    status: text('status').$type<PortfolioStatus>().notNull(),
    sortOrder: integer('sort_order').notNull(),
    publishedAt: timestamp('published_at', { withTimezone: true, mode: 'string' }),
    scheduledPublishAt: timestamp('scheduled_publish_at', { withTimezone: true, mode: 'string' }),
    scheduledUnpublishAt: timestamp('scheduled_unpublish_at', { withTimezone: true, mode: 'string' }),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
    seo: jsonb('seo').$type<PortfolioProject['seo']>().notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('portfolio_projects_slug_unique').on(table.slug),
    statusIdx: index('portfolio_projects_status_idx').on(table.status),
    featuredIdx: index('portfolio_projects_featured_idx').on(table.featured),
    sortOrderIdx: index('portfolio_projects_sort_order_idx').on(table.sortOrder)
  })
);

export const categoriesTable = pgTable(
  'categories',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    description: text('description').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('categories_slug_unique').on(table.slug)
  })
);

export const postCategoriesTable = pgTable('post_categories', {
  postId: text('post_id').notNull(),
  categoryId: text('category_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
},
  (table) => ({
    postIdIdx: index('post_categories_post_id_idx').on(table.postId),
    categoryIdIdx: index('post_categories_category_id_idx').on(table.categoryId),
    pk: primaryKey({ columns: [table.postId, table.categoryId] })
  })
);

export const portfolioTagsTable = pgTable(
  'portfolio_tags',
  {
    id: text('id').primaryKey(),
    name: text('name').notNull(),
    slug: text('slug').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('portfolio_tags_slug_unique').on(table.slug)
  })
);

export const portfolioProjectTagsTable = pgTable(
  'portfolio_project_tags',
  {
    projectId: text('project_id').notNull(),
    tagId: text('tag_id').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    projectIdIdx: index('portfolio_project_tags_project_id_idx').on(table.projectId),
    tagIdIdx: index('portfolio_project_tags_tag_id_idx').on(table.tagId),
    pk: primaryKey({ columns: [table.projectId, table.tagId] })
  })
);

export const mediaAssetsTable = pgTable('media_assets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  mimeType: text('mime_type').notNull(),
  width: integer('width'),
  height: integer('height'),
  sizeBytes: integer('size_bytes'),
  checksumSha256: text('checksum_sha256'),
  storageProvider: text('storage_provider').notNull(),
  storageKey: text('storage_key'),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
});

export const commentsTable = pgTable('comments', {
  id: text('id').primaryKey(),
  postId: text('post_id').notNull(),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email').notNull(),
  body: text('body').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
  reviewedAt: timestamp('reviewed_at', { withTimezone: true, mode: 'string' })
});

export const contactSubmissionsTable = pgTable('contact_submissions', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  company: text('company').notNull(),
  email: text('email').notNull(),
  serviceCategory: text('service_category').notNull(),
  projectOverview: text('project_overview').notNull(),
  status: text('status').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
});

export const adminUsersTable = pgTable(
  'admin_users',
  {
    id: text('id').primaryKey(),
    email: text('email').notNull(),
    displayName: text('display_name').notNull(),
    passwordHash: text('password_hash').notNull(),
    role: text('role').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
    lastLoginAt: timestamp('last_login_at', { withTimezone: true, mode: 'string' })
  },
  (table) => ({
    emailUnique: uniqueIndex('admin_users_email_unique').on(table.email)
  })
);

export const adminSessionsTable = pgTable(
  'admin_sessions',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    sessionToken: text('session_token').notNull(),
    expiresAt: timestamp('expires_at', { withTimezone: true, mode: 'string' }).notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    sessionTokenUnique: uniqueIndex('admin_sessions_token_unique').on(table.sessionToken)
  })
);

export const requestRateLimitsTable = pgTable('request_rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull(),
  resetAt: timestamp('reset_at', { withTimezone: true, mode: 'string' }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
});

export const adminLoginLockoutsTable = pgTable('admin_login_lockouts', {
  identifier: text('identifier').primaryKey(),
  failedCount: integer('failed_count').notNull(),
  lockoutUntil: timestamp('lockout_until', { withTimezone: true, mode: 'string' }),
  updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
});

export const adminAuditLogsTable = pgTable(
  'admin_audit_logs',
  {
    id: text('id').primaryKey(),
    userId: text('user_id'),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    metadata: jsonb('metadata').$type<Record<string, unknown>>().notNull(),
    ip: text('ip').notNull(),
    userAgent: text('user_agent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    actionIdx: index('admin_audit_logs_action_idx').on(table.action),
    createdAtIdx: index('admin_audit_logs_created_at_idx').on(table.createdAt)
  })
);

export const cmsContentRevisionsTable = pgTable(
  'cms_content_revisions',
  {
    id: text('id').primaryKey(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id').notNull(),
    label: text('label').notNull(),
    summary: text('summary').notNull(),
    userId: text('user_id'),
    userDisplayName: text('user_display_name'),
    payload: jsonb('payload').$type<CmsRevisionPayload>().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    entityIdx: index('cms_content_revisions_entity_idx').on(table.entityType, table.entityId),
    createdAtIdx: index('cms_content_revisions_created_at_idx').on(table.createdAt)
  })
);

export const analyticsEventsTable = pgTable(
  'analytics_events',
  {
    id: text('id').primaryKey(),
    path: text('path').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: text('entity_id'),
    referrer: text('referrer').notNull(),
    utmSource: text('utm_source'),
    utmMedium: text('utm_medium'),
    utmCampaign: text('utm_campaign'),
    visitorId: text('visitor_id').notNull(),
    sessionId: text('session_id').notNull(),
    userAgent: text('user_agent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    pathIdx: index('analytics_events_path_idx').on(table.path),
    entityIdx: index('analytics_events_entity_idx').on(table.entityType, table.entityId),
    visitorIdx: index('analytics_events_visitor_idx').on(table.visitorId),
    createdAtIdx: index('analytics_events_created_at_idx').on(table.createdAt)
  })
);

export const notificationsTable = pgTable(
  'notifications',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull(),
    type: text('type').notNull(),
    title: text('title').notNull(),
    message: text('message').notNull(),
    entityType: text('entity_type'),
    entityId: text('entity_id'),
    read: boolean('read').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    userIdIdx: index('notifications_user_id_idx').on(table.userId),
    readIdx: index('notifications_read_idx').on(table.read),
    createdAtIdx: index('notifications_created_at_idx').on(table.createdAt)
  })
);

export const userDashboardPreferencesTable = pgTable(
  'user_dashboard_preferences',
  {
    id: text('id').primaryKey(),
    userId: text('user_id').notNull().unique(),
    widgetOrder: jsonb('widget_order').$type<string[]>().notNull().default([]),
    hiddenWidgets: jsonb('hidden_widgets').$type<string[]>().notNull().default([]),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    userIdUnique: uniqueIndex('user_dashboard_preferences_user_id_unique').on(table.userId)
  })
);

export const redirectsTable = pgTable(
  'redirects',
  {
    id: text('id').primaryKey(),
    fromPath: text('from_path').notNull(),
    toPath: text('to_path').notNull(),
    type: text('type').notNull().default('302'),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    fromPathUnique: uniqueIndex('redirects_from_path_unique').on(table.fromPath)
  })
);

export const page404LogTable = pgTable(
  'page_404_log',
  {
    id: text('id').primaryKey(),
    path: text('path').notNull(),
    referrer: text('referrer').notNull(),
    userAgent: text('user_agent').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  },
  (table) => ({
    pathIdx: index('page_404_log_path_idx').on(table.path),
    createdAtIdx: index('page_404_log_created_at_idx').on(table.createdAt)
  })
);
