# Supabase + Hostinger Setup

This document reflects the current storage and deployment model used by the repo.

## Goal

Run the CMS with:
- Supabase Postgres for content, sessions, analytics, audit logs, and rate limits
- Supabase Storage for uploaded media
- Hostinger Node.js hosting for the Next.js app

## Current Repo Behavior

- File mode still works when `DATABASE_URL` is not set.
- Database mode activates automatically when `DATABASE_URL` is present.
- Admin login uses email/password and cookie sessions in database mode.
- Team management is available in database mode.
- Media uploads switch to Supabase Storage when storage env vars are present.
- Old `/media/...` and `/portfolio/...` paths can be migrated or rewritten through `MEDIA_PUBLIC_BASE_URL`.

## Supabase Connection Strategy

Recommended split:
- `DATABASE_URL`: pooled runtime connection, typically the Supabase session pooler
- `DATABASE_URL_MIGRATION`: direct connection if reachable from your machine or deployment runner

Important:
- If the direct URI does not work from your environment, reuse the working pooled URL for `DATABASE_URL_MIGRATION`.
- This repo now supports `CMS_DB_POOL_MAX`; for constrained hosting, set `CMS_DB_POOL_MAX=2`.

## Supabase Project Setup

1. Create a Supabase project.
2. Open `Project Settings -> Database`.
3. Copy:
   - runtime / pooled connection string
   - direct connection string if available and reachable
4. Open `Project Settings -> API`.
5. Copy:
   - `SUPABASE_URL`
   - `SUPABASE_SERVICE_ROLE_KEY`
6. Create a public Storage bucket, for example `cms-media`.

## Local Env Setup

Example `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=change-this-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
CMS_DB_POOL_MAX=2
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=cms-media
MEDIA_PUBLIC_BASE_URL=https://your-project.supabase.co/storage/v1/object/public/cms-media
```

## Database Commands

Generate SQL migration files:

```bash
npm run db:generate
```

Apply migration files:

```bash
npm run db:migrate
```

Push schema directly:

```bash
npm run db:push
```

Seed from local content:

```bash
npm run db:seed:file
```

Preview media migration:

```bash
npm run media:migrate:supabase:dry
```

Execute media migration:

```bash
npm run media:migrate:supabase
```

## Recommended First Run Order

1. Set local database and storage env vars.
2. Run `npm run db:push` or `npm run db:migrate`.
3. Run `npm run db:seed:file` if you need initial content.
4. Run `npm run media:migrate:supabase:dry`.
5. Run `npm run media:migrate:supabase`.
6. Run `npm run check`.
7. Run `npm run build`.
8. Open `/admin/login`.
9. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`.
10. Verify admin modules and public pages.

## Hostinger Deployment Env Vars

Set these in Hostinger:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=strong-admin-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
CMS_DB_POOL_MAX=2
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=cms-media
MEDIA_PUBLIC_BASE_URL=https://your-project.supabase.co/storage/v1/object/public/cms-media
```

## Hostinger Deployment Process

1. Push the repo to your Git provider.
2. Create a Node.js Web App in Hostinger.
3. Select Node `20.x`.
4. Set build command:

```bash
npm install && npm run build
```

5. Set start command:

```bash
npm run start
```

6. Add the environment variables above.
7. Deploy.
8. Validate:
   - `/`
   - `/admin/login`
   - `/admin/settings`
   - `/admin/media`
   - `/admin/team`
   - `/api/admin/categories`

## Operational Notes

- If `db:push` works only through the session pooler from your local environment, that is acceptable.
- The runtime app should still prefer the stable pooled URL on constrained hosting.
- The app now includes one-time chunk recovery for stale deploy asset races, but you should still prefer clean rollouts and consistent caching.
- This repo does not currently ship a built-in GitHub Actions deployment workflow; configure CI/CD separately if you want automated checks or webhook deploys.
