# React CMS (Marketing + Blog)

Production-ready starter CMS for marketing websites using Next.js and TypeScript.

It includes:
- Editable landing pages: Home, About, Service, Contact
- Typed homepage block system (`hero`, `value_triplet`, `solutions_grid`, `why_split`, `logo_cloud`, `primary_cta`)
- Blog management: create, edit, publish, unpublish, delete
- Redesigned admin panel with sidebar IA, posts table, and server-side filters
- Technical SEO defaults: metadata, canonicals, OG/Twitter tags, sitemap, robots, JSON-LD

## Stack Decision

- Framework: Next.js App Router (SEO-first marketing + blog use case)
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
- Admin panel: `http://localhost:3000/admin`

## Admin Access

- Default admin token is configured through `CMS_ADMIN_TOKEN` in `.env.local`.
- Enter the token in the admin login form.
- All admin API routes require `x-admin-token` header.

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

- `id` (`home`, `about`, `service`, `contact`)
- `title`
- `slug`
- `published`
- `seo`: `metaTitle`, `metaDescription`, `canonical`, `socialImage`, `noIndex`
- `sections[]`: legacy section model for non-home pages
  - `layout`: `stacked` or `split`
  - `theme`: `background`, `text`, `accent`
  - `heading`, `body`, `ctaLabel`, `ctaHref`, `mediaImage`, `mediaAlt`
- `homeBlocks[]` (home page only): typed dynamic block model
  - `hero`
  - `value_triplet`
  - `solutions_grid`
  - `why_split`
  - `logo_cloud`
  - `primary_cta`

### Blog post

- `id`
- `title`, `slug`, `excerpt`, `content`
- `status`: `draft` or `published`
- `publishedAt`, `updatedAt`
- `coverImage`, `tags[]`, `author`
- `seo`: `metaTitle`, `metaDescription`, `canonical`, `socialImage`, `noIndex`

### Admin blog list API

`GET /api/admin/blog` supports:
- `includeDrafts=1`
- `q`
- `status=all|draft|published`
- `category`
- `dateSort=newest|oldest`
- `page`
- `pageSize`

Response includes:
- `posts[]`
- `meta.total`
- `meta.page`
- `meta.pageSize`
- `meta.categories[]`

## SEO Features Included

- Per-page and per-post metadata controls
- Clean slugs
- Canonical URLs
- Open Graph + Twitter tags
- Dynamic sitemap at `/sitemap.xml`
- Robots config at `/robots.txt`
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

- Set `NEXT_PUBLIC_SITE_URL` to the production domain.
- Set `CMS_ADMIN_TOKEN` to a strong secret.
- Ensure filesystem write access for `data/content.json` in hosting environment.
  - If hosting is read-only (e.g. some serverless platforms), replace file storage with a database.

See:
- [Admin usage guide](./docs/admin-usage.md)
- [Deployment handoff](./docs/deployment-handoff.md)
- [Phase 4 testing checklist](./docs/testing-phase-4.md)

## Assumptions

- Single language deployment.
- Single admin token auth for initial implementation.
- Free/open-source libraries only.

## Risks

- File-based content persistence is not ideal for horizontally scaled deployments.
- SEO outcomes depend on content quality and ongoing strategy.
