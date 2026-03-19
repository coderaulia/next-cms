# React CMS (Marketing + Blog)

Production-ready CMS for marketing websites using Next.js and TypeScript.

It includes:
- Editable landing pages (home, about, services, service details, partnership, contact)
- Typed homepage block system (`hero`, `value_triplet`, `solutions_grid`, `why_split`, `logo_cloud`, `primary_cta`)
- Blog management: create, edit, publish, unpublish, delete
- Separate admin login + dedicated admin shell (no public header/footer in admin)
- Website Settings module (General, Writing, Reading, Discussion, Media, Permalinks, Meta Tags, Sitemaps)
- Technical SEO defaults: metadata, canonicals, OG/Twitter tags, sitemap, robots, JSON-LD
- Dual persistence mode: local file store by default, Postgres when `DATABASE_URL` is configured
- Database-backed admin users and cookie sessions when database mode is enabled
- Working admin modules for categories, contact submissions, and media library metadata
- Optional Supabase Storage uploads for portfolio, page, and post media assets

## Stack Decision

- Framework: Next.js App Router
- Language: TypeScript (strict)
- Package manager: npm
- Test baseline: Vitest
- Database: PostgreSQL-compatible database (recommended: Supabase) + Drizzle ORM

## Getting Started

1. Install dependencies:

```bash
npm install
```

2. Configure environment:

```bash
cp .env.example .env.local
```

3. Start development server:

```bash
npm run dev
```

4. Open:
- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

## Admin Access

Preferred setup:
- Set `CMS_ADMIN_EMAIL`
- Set `CMS_ADMIN_PASSWORD`
- Optional: set `CMS_ADMIN_NAME`

Behavior:
- The first admin login bootstraps an admin user into the database if `admin_users` is empty.
- Admin UI uses secure cookie sessions.
- Legacy `CMS_ADMIN_TOKEN` / `x-admin-token` support remains only as a compatibility fallback for migration and tests.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run analyze` - production build with bundle analyzer report
- `npm run audit:size` - report `public/` and build output sizes
- `npm run build:audit` - production build followed by size audit
- `npm run start` - run production server
- `npm run lint` - eslint
- `npm run typecheck` - TypeScript checks
- `npm run test` - Vitest tests
- `npm run check` - lint + typecheck + test
- `npm run db:generate` - generate Drizzle SQL migrations
- `npm run db:migrate` - apply migrations
- `npm run db:push` - push schema directly to database
- `npm run db:studio` - open Drizzle Studio
- `npm run db:seed:file` - import local `data/content.json` if present, otherwise seed sanitized defaults or a fixture via `--fixture <name>`
- `npm run bootstrap:client -- --output ../acme-cms --site-name "Acme Studio"` - generate a new client starter from this repo
- `npm run media:migrate:supabase:dry` - preview which `/media/...` and `/portfolio/...` assets will be uploaded and rewritten
- `npm run media:migrate:supabase` - upload local assets to Supabase Storage and rewrite stored CMS URLs

## Bootstrap a New Client Starter

Use the generator when you want a fresh client project based on this repo without manually editing seed files.

Example:

```bash
npm run bootstrap:client -- \
  --output ../acme-cms \
  --site-name "Acme Studio" \
  --variant portfolio-case-studies \
  --fixture portfolio-case-studies \
  --color-dark "#17304a" \
  --color-primary "#0f79ff" \
  --color-secondary "#7c3aed" \
  --color-accent "#14b8a6" \
  --color-text "#0f172a"
```

What the generator customizes in the output project:
- package name
- tracked `data/content.json` starter content
- `src/config/site-profile.ts`
- `.env.example`
- `tailwind.config.mjs` brand tokens
- `src/app/globals.css` core CSS palette tokens

Supported modules:
- `services`
- `blog`
- `portfolio`
- `partnership`

Supported variants:
- `brochure`
- `blog-seo`
- `portfolio-case-studies`
- `lead-gen`

Supported fixture presets:
- `full-service`
- `brochure`
- `blog-seo`
- `portfolio-case-studies`
- `lead-gen`

Supported seeded top-level pages:
- `about`
- `service`
- `partnership`
- `contact`

`home` is always included. If you enable `services`, the service overview page and all service detail pages are seeded automatically.

You can also provide a JSON config file:

```bash
npm run bootstrap:client -- --config ./docs/client-bootstrap.example.json
```

Seed the database with one of the same deterministic fixtures when you want regression coverage across multiple client shapes:

```bash
npm run db:seed:file -- --fixture brochure
```

## Content Model

### Landing page

- `id`: one of
  - `home`
  - `about`
  - `service`
  - `service-website-development`
  - `service-custom-business-tools`
  - `service-secure-online-shops`
  - `service-mobile-business-app`
  - `service-official-business-email`
  - `partnership`
  - `contact`
- `title`, `navLabel`, `published`
- `seo`: `metaTitle`, `metaDescription`, `slug`, `canonical`, `socialImage`, `noIndex`
- `sections[]`: legacy section model for non-home pages
- `homeBlocks[]` (home only): typed dynamic block model

### Blog post

- `id`
- `title`, `excerpt`, `content`, `author`, `tags[]`, `coverImage`
- `status`: `draft` or `published`
- `publishedAt`, `updatedAt`
- `seo`: `metaTitle`, `metaDescription`, `slug`, `canonical`, `socialImage`, `noIndex`

Database note:
- flexible content stays in JSONB (`seo`, `sections`, `homeBlocks`, gallery data)
- query/filter facets are normalized when using Postgres:
  - blog categories via `categories` + `post_categories`
  - portfolio tags via `portfolio_tags` + `portfolio_project_tags`

### Site settings

- `general`: site identity, URL, timezone, language, date/time format
- `writing`: default category/author/format/status + review policy
- `reading`: homepage mode, posts page, posts-per-page, indexing preference
- `discussion`: comment policy controls
- `media`: image size defaults
- `permalinks`: post/category/tag URL bases
- `seo`: title template, default meta description/OG image, default noindex
- `sitemap`: include/exclude pages/posts/lastmod

## Admin Blog List API

`GET /api/admin/blog` supports:
- `includeDrafts=1`
- `q`
- `status=all|draft|published`
- `category`
- `dateSort=newest|oldest`
- `page`
- `pageSize`

Response:
- `posts[]`
- `meta.total`
- `meta.page`
- `meta.pageSize`
- `meta.categories[]`

## SEO Behavior

- Per-page and per-post metadata controls
- Global SEO defaults from Website Settings
- Canonical URLs
- Open Graph + Twitter tags
- `/sitemap.xml` respects sitemap settings and indexing flags
- `/robots.txt` respects indexing flags and sitemap enabled state
- Structured data:
  - Organization + WebSite (global)
  - BlogPosting (blog detail pages)

## Folder Structure

```txt
src/
  app/
    (public pages, admin pages, api routes, sitemap, robots)
  components/
    home/
      blocks/
    admin/
  db/
  features/cms/
  services/
  tests/
data/
  content.json (generated locally, gitignored)
docs/
  admin-usage.md
  deployment-handoff.md
```

## Deployment Notes

- Set `NEXT_PUBLIC_SITE_URL` to production domain.
- Set `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `CMS_ADMIN_NAME`.
- For database mode, set `DATABASE_URL` and optionally `DATABASE_URL_MIGRATION`.
- For Supabase-backed media uploads, set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `SUPABASE_STORAGE_BUCKET`.
- Run `npm run media:migrate:supabase:dry` before production cutover, then `npm run media:migrate:supabase` once the bucket is ready.
- If you need old `/media/...` or `/portfolio/...` paths to resolve from a CDN or Supabase public bucket, set `MEDIA_PUBLIC_BASE_URL`.
- Local file persistence still works when `DATABASE_URL` is not set, but a database is the recommended production path.
- For Hostinger deployment, use database mode and Supabase Storage instead of relying on local uploaded files.

See:
- [Admin usage guide](./docs/admin-usage.md)
- [Deployment handoff](./docs/deployment-handoff.md)
- [Phase 4 testing checklist](./docs/testing-phase-4.md)
- [Client reuse playbook](./docs/client-reuse-playbook.md)
- [Supabase + Hostinger setup](./docs/supabase-hostinger-setup.md)
- [Security hardening notes](./docs/security-hardening.md)

## Assumptions

- Single language deployment.
- Free/open-source libraries only.

## Risks

- Existing content entries that point to files no longer available in `public/` cannot be auto-recovered; the migration script will report those missing keys.
- SEO outcomes depend on content quality and ongoing strategy.
