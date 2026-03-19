# Supabase + Hostinger Setup

This repo supports database-backed CMS content and database-backed admin login using a standard PostgreSQL connection.

## Goal

Run the CMS on Supabase Postgres so content and admin sessions do not depend on local filesystem persistence.

Current status in this repo:
- File mode still works when `DATABASE_URL` is not set.
- Database mode activates automatically when `DATABASE_URL` is present.
- Admin login uses email/password and cookie sessions when database mode is enabled.
- Media uploads switch to Supabase Storage when the storage env vars are present.
- Legacy `CMS_ADMIN_TOKEN` remains only as a compatibility fallback during migration.

## What is in place

- Drizzle ORM + Drizzle Kit
- Generic Node PostgreSQL client
- SQL schema and migrations
- Dual storage mode:
  - file mode for local fallback
  - database mode for runtime persistence
- Import script to move local CMS content into the database, or fall back to sanitized defaults
- Media migration script to upload local `/media/...` and `/portfolio/...` assets into Supabase Storage and rewrite stored CMS URLs
- `admin_users` and `admin_sessions` usage for real login/session auth

## Hostinger prerequisites

Use:
- Hostinger Business Web Hosting with Node.js Web Apps

Recommended Node version for this app:
- `20.x`

## Supabase project setup

1. Create a Supabase project.
2. Open `Project Settings -> Database`.
3. Copy the connection strings.
4. Use:
- `DATABASE_URL`: pooled/runtime connection string
- `DATABASE_URL_MIGRATION`: direct connection string if available from your network, otherwise reuse `DATABASE_URL`
5. Open `Project Settings -> API`.
6. Copy:
- `SUPABASE_URL`: your project URL
- `SUPABASE_SERVICE_ROLE_KEY`: server-side key for storage uploads
7. Create a public Storage bucket, for example `cms-media`.

## Local env setup

Add to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=change-this-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=cms-media
MEDIA_PUBLIC_BASE_URL=https://your-project.supabase.co/storage/v1/object/public/cms-media
```

If you only want one URL for now, set only `DATABASE_URL`.

## Database commands

Generate SQL migration files:

```bash
npm run db:generate
```

Apply migrations:

```bash
npm run db:migrate
```

Alternative for first-time setup only:

```bash
npm run db:push
```

Import current CMS content from local `data/content.json` / `data/content.local.json`, or fall back to sanitized defaults:

```bash
npm run db:seed:file
```

Preview media migration without writing changes:

```bash
npm run media:migrate:supabase:dry
```

Upload local assets and rewrite stored CMS URLs to Supabase public URLs:

```bash
npm run media:migrate:supabase
```

To remove old CMS rows before reseeding:

```bash
npm run db:purge -- --force
```

Run all three in one command:

```bash
npm run db:reseed
```

## Recommended first run order

1. Set the Supabase database and storage env vars locally.
2. (Optional) Run `npm run db:purge -- --force` only when you want to clear rows without dropping tables.
3. If migration fails with existing-table errors, run `npm run db:reset -- --force`.
4. Run `npm run db:migrate`.
5. Run `npm run db:seed:file` or `npm run db:reseed`.
6. Run `npm run media:migrate:supabase:dry` and review any missing keys before cutover.
7. Run `npm run media:migrate:supabase`.
8. Run `npm run build:audit` to review `.next` and `public/` sizes before deployment.
9. Run `npm run dev`.
10. Open `/admin/login`.
11. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`.
12. Verify public and admin content matches the file-backed version.

## Hostinger deployment env vars

Set these in Hostinger:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=strong-admin-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
SUPABASE_STORAGE_BUCKET=cms-media
MEDIA_PUBLIC_BASE_URL=https://your-project.supabase.co/storage/v1/object/public/cms-media
```

## Hostinger deployment process

1. Push the repo to your Git provider.
2. Create a new Node.js Web App in Hostinger.
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
8. After deploy, run content QA and admin QA.
9. If old records still point at `/media/...` or `/portfolio/...`, run the media migration script or copy that path structure into the Supabase bucket.

## Important limitations

- Existing URLs that already point to missing local Hostinger uploads must still be migrated, and missing source files cannot be reconstructed automatically.
- Contact submissions require `DATABASE_URL`.
- Comments exist in the schema but moderation workflow can still be expanded.

## GitHub Actions option

This repo includes [.github/workflows/hostinger-nodejs.yml](../.github/workflows/hostinger-nodejs.yml).

What it does:
- runs `npm ci`, `npm run check`, and `npm run build` on every push to `main`
- optionally triggers a Hostinger deployment webhook when this secret is set:
  - `HOSTINGER_DEPLOY_WEBHOOK`
- optional bearer secret if your webhook expects auth:
  - `HOSTINGER_DEPLOY_TOKEN`

Important:
- On Hostinger Business Node.js Web App, the preferred deployment path is still the built-in Node.js deployment service with GitHub integration.
- Use the webhook deploy step only if your Hostinger setup provides a redeploy webhook. Otherwise keep the workflow as CI only and let Hostinger auto-deploy directly from GitHub.
