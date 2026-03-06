# React CMS (Marketing + Blog)

Production-ready CMS for marketing websites using Next.js and TypeScript.

It includes:
- Editable landing pages (home, about, services, service details, partnership, contact)
- Typed homepage block system (`hero`, `value_triplet`, `solutions_grid`, `why_split`, `logo_cloud`, `primary_cta`)
- Blog management: create, edit, publish, unpublish, delete
- Separate admin login + dedicated admin shell (no public header/footer in admin)
- Website Settings module (General, Writing, Reading, Discussion, Media, Permalinks, Meta Tags, Sitemaps)
- Technical SEO defaults: metadata, canonicals, OG/Twitter tags, sitemap, robots, JSON-LD
- Dual persistence mode: local file store by default, Neon Postgres when `DATABASE_URL` is configured
- Neon-backed admin users and cookie sessions when database mode is enabled`r`n- Working admin modules for categories and media library metadata

## Stack Decision

- Framework: Next.js App Router
- Language: TypeScript (strict)
- Package manager: npm
- Test baseline: Vitest
- Database: Neon Postgres + Drizzle ORM

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
- The first admin login bootstraps an admin user into Neon if `admin_users` is empty.
- Admin UI uses secure cookie sessions.
- Legacy `CMS_ADMIN_TOKEN` / `x-admin-token` support remains only as a compatibility fallback for migration and tests.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - eslint
- `npm run typecheck` - TypeScript checks
- `npm run test` - Vitest tests
- `npm run check` - lint + typecheck + test
- `npm run db:generate` - generate Drizzle SQL migrations
- `npm run db:migrate` - apply migrations
- `npm run db:push` - push schema directly to database
- `npm run db:studio` - open Drizzle Studio
- `npm run db:seed:file` - import `data/content.json` into Neon

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
  content.json
docs/
  admin-usage.md
  deployment-handoff.md
```

## Deployment Notes

- Set `NEXT_PUBLIC_SITE_URL` to production domain.
- Set `CMS_ADMIN_EMAIL`, `CMS_ADMIN_PASSWORD`, and `CMS_ADMIN_NAME`.
- For Neon mode, set `DATABASE_URL` and optionally `DATABASE_URL_MIGRATION`.
- Local file persistence still works when `DATABASE_URL` is not set, but Neon is the recommended production path.
- For Hostinger deployment, database mode is the recommended path.

See:
- [Admin usage guide](./docs/admin-usage.md)
- [Deployment handoff](./docs/deployment-handoff.md)
- [Phase 4 testing checklist](./docs/testing-phase-4.md)
- [Client reuse playbook](./docs/client-reuse-playbook.md)
- [Neon + Hostinger setup](./docs/neon-hostinger-setup.md)

## Assumptions

- Single language deployment.
- Free/open-source libraries only.

## Risks

- Media uploads still need a production storage provider.
- SEO outcomes depend on content quality and ongoing strategy.

