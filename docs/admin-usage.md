# Admin Usage Guide

This guide reflects the current admin surface in this repository.

## Accessing Admin

1. Open `/admin/login`.
2. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` from `.env.local` or production env.
3. In database mode, the first successful login bootstraps the first admin user if `admin_users` is empty.
4. Access is role-based:
   - `super_admin`: full access, including Team management
   - `admin`: content, settings, media, analytics, audit
   - `editor`: content + media
   - `analyst`: dashboard + analytics + audit

## Sidebar Modules

Current admin navigation:
- Dashboard
- Posts
- Pages
- Portfolio
- Settings
- Contact Leads
- Categories
- Media Library
- Team
- Analytics
- Audit Log
- Settings shortcuts for Discussion, Permalinks, Meta Tags, and Sitemaps

Note:
- Comment controls live under `Settings -> Discussion`.
- There is no separate comments moderation screen yet.

## Dashboard

Go to `/admin`.

The dashboard currently includes:
- first-run checklist
- scheduled publish/unpublish queue
- analytics snapshot
- content health warnings
- recent audit activity
- quick links into the main admin modules

Use this page first after deployment or content handoff.

## Website Settings

Go to `/admin/settings`.

Current tabs:
- General
- Writing
- Reading
- Discussion
- Media
- Permalinks
- Meta Tags
- Sitemaps

Important behavior:
- Settings save from the current tab, but the page now degrades gracefully if `Pages` or `Categories` fail to load.
- Reading tab lazily loads page choices.
- Writing tab lazily loads category choices.
- Settings now keep revision history and can be restored from the revisions panel.

## Editing Pages, Posts, and Portfolio

### Pages

Go to `/admin/pages` and open a page.

Current editor capabilities:
- manual save plus autosave
- dirty-state tracking
- keyboard save shortcut (`Ctrl+S` / `Cmd+S`)
- draft preview via preview mode
- scheduled publish / scheduled unpublish
- revision history and restore
- direct image upload from image inputs
- media library browsing from image inputs

Home page supports:
- add/remove/reorder/enable homepage blocks
- theme token selection (`light`, `blue-soft`, `mist`)
- block-specific payload editing

Non-home pages support:
- section editing
- layout switching (`stacked` / `split`)
- heading/body/CTA/media fields
- media alt text editing

### Posts

Go to `/admin/blog`.

Current post workflow:
1. Create draft
2. Edit content + SEO
3. Use preview mode
4. Publish, unpublish, or schedule
5. Restore previous revision if needed

Posts table supports:
- search by title/author
- status filter
- category filter
- date sort
- pagination with URL-synced query state
- bulk publish / move-to-draft

### Portfolio

Go to `/admin/portfolio`.

Current portfolio workflow:
1. Create draft case study
2. Edit cover image, gallery, SEO, and publication state
3. Use preview mode
4. Publish, unpublish, or schedule
5. Restore previous revision if needed

Portfolio list supports:
- search
- status filter
- tag filter
- featured filter
- date sort
- bulk publish / move-to-draft
- bulk feature / unfeature

## Media Library

Go to `/admin/media`.

Current media behavior:
- image uploads require alt text
- duplicate uploads are detected by checksum
- managed assets can be replaced without changing their URL
- selected assets show aspect ratio, size, and storage info
- delete is blocked when the asset is still referenced
- the asset detail panel shows "Where this asset is used"

Editors also support direct upload from page/post/portfolio image fields, so users do not need to open the media library first.

## Analytics

Go to `/admin/analytics`.

Current analytics report includes:
- page views
- unique visitors
- CTA clicks
- contact leads
- top content paths
- top conversions
- referrers
- campaign attribution from UTM parameters

Tracked conversion events currently include:
- CTA clicks on shared marketing CTAs
- contact form submissions

## Audit Log

Go to `/admin/audit`.

Audit log covers admin mutations such as:
- content create/update/delete
- publish/unpublish
- media upload/update/delete/replace
- settings save
- revision restore
- team changes

## Team Management

Go to `/admin/team`.

Current team management supports:
- create admin users
- update display name, role, and password
- delete admin users
- block self-delete
- block removing the last `super_admin`

## Publishing Checklist

Before publishing or scheduling:
- confirm SEO title and description
- confirm slug and canonical behavior
- confirm social image
- confirm alt text on images
- confirm preview mode matches expectations
- confirm scheduled publish/unpublish times if using them
- review content health warnings from the dashboard
