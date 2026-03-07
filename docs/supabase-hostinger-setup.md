# Supabase + Hostinger Setup

This repo supports database-backed CMS content and database-backed admin login using a standard PostgreSQL connection.

## Goal

Run the CMS on Supabase Postgres so content and admin sessions do not depend on local filesystem persistence.

Current status in this repo:
- File mode still works when `DATABASE_URL` is not set.
- Database mode activates automatically when `DATABASE_URL` is present.
- Admin login uses email/password and cookie sessions when database mode is enabled.
- Legacy `CMS_ADMIN_TOKEN` remains only as a compatibility fallback during migration.

## What is in place

- Drizzle ORM + Drizzle Kit
- Generic Node PostgreSQL client
- SQL schema and migrations
- Dual storage mode:
  - file mode for local fallback
  - database mode for runtime persistence
- Import script to move `data/content.json` into the database
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

## Local env setup

Add to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=change-this-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
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

Import current CMS content from `data/content.json`:

```bash
npm run db:seed:file
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

1. Set Supabase env vars locally
2. (optional) Run `npm run db:purge -- --force` only when you want to clear rows without dropping tables`r`n4. If migration fails with existing-table errors, run `npm run db:reset -- --force` before migrate`r`n5. Run `npm run db:migrate` (`db:seed:file` works after migrations)`r`n6. Run `npm run db:seed:file` (or `npm run db:reseed`)
3. Run `npm run db:migrate` (`db:seed:file` works after migrations)
4. Run `npm run db:seed:file` (or `npm run db:reseed`)
5. Run `npm run dev`
6. Open `/admin/login`
7. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`
8. Verify public and admin content matches the file-backed version

## Hostinger deployment env vars

Set these in Hostinger:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=strong-admin-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_supabase_runtime_url
DATABASE_URL_MIGRATION=your_supabase_migration_url
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

## Important limitations

- Media files are currently managed as external URLs. Binary upload storage is not configured.
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

