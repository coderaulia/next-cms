# Client Reuse Playbook

This guide explains how to turn the current repo into a new client project without losing the existing admin workflows.

## 1) Start a New Client Implementation

Preferred path:

```bash
npm run bootstrap:client -- --output ../acme-cms --site-name "Acme Studio" --variant brochure
```

Then:

```bash
cd ../acme-cms
npm install
npm run dev
```

The bootstrap generator currently supports:
- `brochure`
- `blog-seo`
- `portfolio-case-studies`
- `lead-gen`

Available deterministic fixtures:
- `full-service`
- `brochure`
- `blog-seo`
- `portfolio-case-studies`
- `lead-gen`

## 2) Set Environment Values

Baseline local env:
- `NEXT_PUBLIC_SITE_URL`
- `CMS_ADMIN_EMAIL`
- `CMS_ADMIN_PASSWORD`
- `CMS_ADMIN_NAME`
- `CMS_ORG_NAME`
- `CMS_ORG_LOGO`

When using database mode:
- `DATABASE_URL`
- `DATABASE_URL_MIGRATION`
- `CMS_DB_POOL_MAX`

When using Supabase-backed media:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_STORAGE_BUCKET`
- `MEDIA_PUBLIC_BASE_URL`

## 3) Choose Content Storage

Current repo behavior:
- file mode works when `DATABASE_URL` is not set
- database mode activates automatically when `DATABASE_URL` is present

Recommended for production client work:
1. Use managed Postgres for content, sessions, analytics, audit logs, and rate limits.
2. Use Supabase Storage for uploaded media.
3. Keep flexible content in JSONB:
   - `seo`
   - `sections`
   - `homeBlocks`
4. Keep searchable/query-oriented facets relational:
   - blog categories via `categories` + `post_categories`
   - portfolio tags via `portfolio_tags` + `portfolio_project_tags`

## 4) Reuse What Already Exists

The starter already includes:
- landing pages
- blog
- portfolio / case studies
- contact leads
- media library with direct form uploads
- revision history and restore
- analytics + conversion tracking
- audit log
- role-based admin team management

For a new client, remove or ignore modules only when the client genuinely does not need them.

## 5) Define Client Content Model

When page requirements change:
1. Update `PageId` in `src/features/cms/types.ts`
2. Update the page validator in `src/features/cms/validators.ts`
3. Update seeded content in `src/features/cms/defaultContent.ts`
4. Verify the page appears in:
   - admin pages list
   - route rendering
   - sitemap / metadata behavior

Rule:
- every public page you plan to ship should exist in CMS and be editable in admin

## 6) Wire Dynamic Rendering

Adjust the public rendering layer in:
- `src/app/[slug]/page.tsx`
- `src/components/pages/*`
- `src/components/home/blocks/*`

Keep CMS contracts stable when redesigning:
- do not remove fields unless the admin forms, validators, storage, and public renderers are all updated together

## 7) Reuse the Current Admin Surface

Current reusable admin capabilities:
- preview mode
- scheduled publish / unpublish
- revisions
- media upload / duplicate detection / replace-in-place / usage checks
- analytics summary and conversion reporting
- audit log
- team management with `super_admin`, `admin`, `editor`, and `analyst`

For client projects with only one operator:
- keep one `super_admin`
- you can ignore the Team screen operationally

For client projects with multiple editors:
- keep team management enabled
- validate permissions before handoff

## 8) Media Strategy

For production client sites:
1. Prefer managed media storage over local disk.
2. Migrate old `/media/...` and `/portfolio/...` URLs before launch.
3. Keep alt text requirements enabled in editorial workflow.
4. Use replace-in-place when updating client assets so URLs do not break.

## 9) SEO + Launch Requirements

Before launch:
1. Verify each page/post/project has:
   - title
   - description
   - slug
   - canonical strategy if needed
   - social image
2. Verify:
   - `/sitemap.xml`
   - `/robots.txt`
   - JSON-LD output
3. Run:

```bash
npm run check
npm run build
```

## 10) Delivery Checklist

1. Branding applied.
2. Required pages editable in admin.
3. Blog and portfolio workflows tested.
4. Settings configured for domain, timezone, and indexing behavior.
5. Media storage configured.
6. Team roles configured if the client has multiple operators.
7. Analytics and audit access confirmed for the handoff team.
8. Revision restore tested at least once before handoff.
