import { pgTable, text, boolean, jsonb, timestamp, integer, uniqueIndex, index } from 'drizzle-orm/pg-core';

import type {
  BlogPost,
  BlogStatus,
  HomeBlock,
  PageId,
  PageSection,
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
    updatedAt: timestamp('updated_at', { withTimezone: true, mode: 'string' }).notNull(),
    seo: jsonb('seo').$type<BlogPost['seo']>().notNull()
  },
  (table) => ({
    slugUnique: uniqueIndex('blog_posts_slug_unique').on(table.slug),
    statusIdx: index('blog_posts_status_idx').on(table.status)
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
});

export const mediaAssetsTable = pgTable('media_assets', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  url: text('url').notNull(),
  altText: text('alt_text').notNull(),
  mimeType: text('mime_type').notNull(),
  width: integer('width'),
  height: integer('height'),
  sizeBytes: integer('size_bytes'),
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
