# React CMS (Marketing + Blog)

Production-ready CMS for marketing websites using Next.js and TypeScript.

It includes:
- Editable landing pages (home, about, services, service details, partnership, contact)
- Typed homepage block system (`hero`, `value_triplet`, `solutions_grid`, `why_split`, `logo_cloud`, `primary_cta`)
- Blog management: create, edit, publish, unpublish, delete
- Separate admin login + dedicated admin shell (no public header/footer in admin)
- Website Settings module (General, Writing, Reading, Discussion, Media, Permalinks, Meta Tags, Sitemaps)
- Technical SEO defaults: metadata, canonicals, OG/Twitter tags, sitemap, robots, JSON-LD

## Stack Decision

- Framework: Next.js App Router
- Language: TypeScript (strict)
- Package manager: npm
- Test baseline: Vitest

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

- Set `CMS_ADMIN_TOKEN` in `.env.local`.
- Login at `/admin/login`.
- Admin APIs require `x-admin-token`.

## Scripts

- `npm run dev` - start dev server
- `npm run build` - production build
- `npm run start` - run production server
- `npm run lint` - eslint
- `npm run typecheck` - TypeScript checks
- `npm run test` - Vitest tests
- `npm run check` - lint + typecheck + test

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
- Set `CMS_ADMIN_TOKEN` to a strong secret.
- Ensure write access for `data/content.json`.
- For read-only/serverless hosting, replace file storage with DB (e.g. Neon).

See:
- [Admin usage guide](./docs/admin-usage.md)
- [Deployment handoff](./docs/deployment-handoff.md)
- [Phase 4 testing checklist](./docs/testing-phase-4.md)
- [Client reuse playbook](./docs/client-reuse-playbook.md)

## Assumptions

- Single language deployment.
- Single admin token auth for this stage.
- Free/open-source libraries only.

## Risks

- File storage is not ideal for horizontally scaled hosting.
- SEO outcomes depend on content quality and ongoing strategy.
