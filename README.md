# Vanaila CMS

Production-ready CMS starter for marketing websites, built with Next.js App Router, TypeScript, Drizzle ORM, and a reusable admin surface.

The app ships with editable public pages, blog, portfolio/case studies, media management, SEO controls, contact leads, analytics, audit logs, revision restore, scheduled publishing, and role-based admin access.

## Production Stack

- Next.js 16 App Router and React 19
- TypeScript strict mode
- Drizzle ORM with PostgreSQL-compatible databases
- Local JSON persistence for development fallback
- Managed media storage through Cloudflare R2 or Supabase Storage
- Vitest for the test baseline

## Production Requirements

Use managed services for production:

- PostgreSQL-compatible database, recommended Supabase Postgres
- Managed object storage, recommended Cloudflare R2 or Supabase Storage
- Node.js 20 or newer
- HTTPS public site URL

Required environment variables:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=strong-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=postgres-runtime-url
```

Recommended production variables:

```bash
DATABASE_URL_MIGRATION=postgres-migration-url
CMS_DB_POOL_MAX=2
CMS_STORAGE_QUOTA_MB=10000
```

For media storage, configure either R2 or Supabase. R2 is preferred when bandwidth cost matters.

## Local Development

```bash
npm install
cp .env.example .env.local
npm run dev
```

Open:

- Public site: `http://localhost:3000`
- Admin login: `http://localhost:3000/admin/login`

File mode works when `DATABASE_URL` is not set. Use it for local exploration only; production should use database mode.

## Database And Media Setup

For a new production environment:

```bash
npm run db:migrate
npm run db:seed:file
npm run media:migrate:supabase:dry
```

Run the real media migration only after the storage bucket and public URL are confirmed:

```bash
npm run media:migrate:supabase
```

For direct schema sync during development, use:

```bash
npm run db:push
```

## Verify A Release

Run the full local gate before deployment:

```bash
npm run check
npm run build
```

Optional size checks:

```bash
npm run audit:src
npm run build:audit
```

Expected production validation:

- ESLint passes
- TypeScript passes
- Vitest passes
- Next production build succeeds
- `/`, `/admin/login`, `/sitemap.xml`, and `/robots.txt` load correctly

## Deployment Checklist

1. Set production environment variables.
2. Run migrations against the production database.
3. Seed initial content if needed.
4. Configure R2 or Supabase Storage for uploads.
5. Rotate bootstrap admin credentials after first login.
6. Confirm at least one `super_admin` user exists.
7. Verify Dashboard, Settings, Media, Team, Analytics, and Audit Log.
8. Verify image uploads and revision restore.
9. Confirm sitemap, robots, metadata, and indexing settings.
10. Run a final `npm run check` and `npm run build`.

## Common Commands

```bash
npm run dev
npm run build
npm run start
npm run check
npm run test
npm run db:migrate
npm run db:seed:file
npm run bootstrap:client -- --output ../acme-cms --site-name "Acme Studio"
```

## Documentation

- [Docs index](./docs/README.md)
- [Deployment handoff](./docs/deployment-handoff.md)
- [Admin usage guide](./docs/admin-usage.md)
- [Technical reference](./docs/technical-reference.md)
- [Client reuse playbook](./docs/client-reuse-playbook.md)
- [Supabase + Hostinger setup](./docs/supabase-hostinger-setup.md)
- [Security hardening notes](./docs/security-hardening.md)
- [Source audit and gzip plan](./docs/src-audit-gzip-plan.md)

## Operational Notes

- Do not rely on local disk for long-term production uploads.
- Keep database and storage credentials least-privilege where possible.
- Add upstream WAF/CDN rate limiting for public launch.
- Back up database content and media references before major imports.
- SEO performance still depends on content quality, not only technical output.
