# Deployment + Handoff Notes

This document reflects the current production shape of the repository.

## Required Environment Variables

Core runtime:
- `NEXT_PUBLIC_SITE_URL`
- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD`
- `CMS_ADMIN_NAME`
- `DATABASE_URL`

Recommended runtime extras:
- `CMS_DB_POOL_MAX`
- `CMS_ORG_NAME`
- `CMS_ORG_LOGO`
- `CONTACT_NOTIFICATION_WEBHOOK_URL`
- `CONTACT_NOTIFICATION_WEBHOOK_METHOD`
- `CONTACT_NOTIFICATION_WEBHOOK_TOKEN`

Schema / migration:
- `DATABASE_URL_MIGRATION`

Supabase media storage:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `MEDIA_PUBLIC_BASE_URL`

## Connection Strategy

Recommended split for Supabase:
- `DATABASE_URL`: session pooler / pooled runtime connection
- `DATABASE_URL_MIGRATION`: direct connection if reachable from your machine or deployment runner

If the direct URI is not reachable from the environment where you run Drizzle, it is acceptable to reuse the working pooled URL for `DATABASE_URL_MIGRATION`.

For constrained hosting, set:

```bash
CMS_DB_POOL_MAX=2
```

## Build + Verify

```bash
npm install
npm run check
npm run build
npm run start
```

Current expected validation:
- ESLint passes
- TypeScript passes
- Vitest passes
- Next production build succeeds

## Database + Media Cutover

Recommended order:
1. Set database env vars.
2. Set Supabase storage env vars if production media should not live on local disk.
3. Run `npm run db:push` against the target database when schema changed.
4. Seed content if needed with `npm run db:seed:file`.
5. Run `npm run media:migrate:supabase:dry`.
6. Run `npm run media:migrate:supabase` after reviewing the dry run.

## Hosting Notes

Recommended production setup:
- Supabase Postgres for CMS data, sessions, analytics, audit logs, and rate limits
- Supabase Storage for uploaded media
- Hostinger Node.js hosting for the Next.js app

Important:
- Do not rely on local file writes for long-term production media persistence.
- Runtime DB should normally use the pooled URL.
- The app now includes one-time stale chunk recovery for deploy propagation issues, but clean deploys and consistent CDN caching are still preferred.

## Current Admin Handoff Checklist

1. Rotate bootstrap admin credentials after first production login.
2. Confirm at least one `super_admin` account exists in `/admin/team`.
3. Update default placeholder images and content.
4. Validate `/sitemap.xml` and `/robots.txt`.
5. Verify Dashboard, Analytics, Audit Log, Media Library, and Team pages load correctly.
6. Verify direct image upload from page/post/portfolio editors.
7. Verify revision restore works for settings and at least one content type.
8. Verify scheduled publish/unpublish behavior if your team uses scheduling.
9. Verify old `/media/...` and `/portfolio/...` assets have been migrated or rewritten.
10. Train content team on:
   - page/post/portfolio editing
   - preview and scheduling
   - media upload + replacement
   - revision restore
   - settings usage
   - analytics and audit review
