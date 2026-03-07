# Admin Usage Guide

## Accessing Admin

1. Open `/admin/login`.
2. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` from `.env.local`.
3. On the first successful login in database mode, the app bootstraps the first admin user if `admin_users` is empty.
4. Use the left sidebar modules:
- Dashboard
- Posts
- Pages
- Settings
- Categories / Media Library / Comments
- Permalinks / Meta Tags / Sitemaps (settings shortcuts)

## Website Settings

Go to `/admin/settings`.

Tabs available:
- General: site title, URL, timezone, language, date/time format, org profile
- Writing: default post category/author/status and review behavior
- Reading: homepage mode, page mapping, posts-per-page, search indexing toggle
- Discussion: comment policy controls
- Media: default image dimensions
- Permalinks: post/category/tag URL bases
- Meta Tags: title template, default description, OG image, default noindex
- Sitemaps: enable sitemap and include rules

Save to apply runtime behavior updates for metadata, robots, sitemap, and blog list page size.

## Editing Landing Pages

Go to `/admin/pages` then choose a page.

You can edit:
- Page settings (title, nav label, publish flag)
- SEO fields (meta title, meta description, slug, canonical, social image, noindex)
- Homepage block editor (`home` page):
  - add/remove/reorder/enable blocks
  - choose token preset theme (`light`, `blue-soft`, `mist`)
  - edit block payload fields
- Non-home section editor:
  - structure (`stacked` / `split`)
  - heading/body/CTA/media fields
  - accent token fields

## Managing Blog Posts

Go to `/admin/blog`.

Flow:
1. Create draft
2. Edit content + SEO
3. Publish / unpublish
4. Delete when needed

Posts table supports:
- search by title/author
- status filter
- category filter (from managed category slugs)
- date sort
- pagination with URL-synced query state

## Publishing Checklist

Before publishing page/post:
- Confirm SEO title and description
- Confirm clean slug
- Confirm canonical strategy
- Confirm social image URL
- Confirm `noindex` is disabled for public content
