# Neon + Hostinger Setup

This repo now supports Neon-backed CMS content and Neon-backed admin login.

## Goal

Run the CMS on Neon Postgres so content and admin sessions do not depend on local filesystem persistence.

Current status in this repo:
- File mode still works when `DATABASE_URL` is not set.
- Neon mode activates automatically when `DATABASE_URL` is present.
- Admin login uses email/password and cookie sessions when Neon mode is enabled.
- Legacy `CMS_ADMIN_TOKEN` remains only as a compatibility fallback during migration.

## What was added

- Drizzle ORM + Drizzle Kit
- Neon database client
- SQL schema and first migration
- Dual storage mode:
  - file mode for local fallback
  - Neon mode for database-backed runtime
- Import script to move `data/content.json` into Neon
- `admin_users` and `admin_sessions` usage for real login/session auth

## Hostinger prerequisites

Use one of these:
- Hostinger Business Web Hosting with Node.js Web Apps
- Hostinger Cloud hosting with Node.js Web Apps
- Hostinger VPS

Recommended Node version for this app:
- `20.x`

## Neon project setup

1. Create a Neon project in the Neon console.
2. Keep the default `main` branch for production.
3. Create one `staging` branch from `main`.
4. Create or use the default database and application role.
5. Copy the connection strings.

Recommended env strategy:
- `DATABASE_URL`: pooled/runtime URL used by the app
- `DATABASE_URL_MIGRATION`: direct migration URL for Drizzle commands

## Local env setup

Add to `.env.local`:

```bash
NEXT_PUBLIC_SITE_URL=http://localhost:3000
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=change-this-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_neon_runtime_url
DATABASE_URL_MIGRATION=your_neon_direct_url
```

If you only want one URL for now, set only `DATABASE_URL`.

## Database commands

Generate SQL migration files:

```bash
npm run db:generate
```

Apply migrations to Neon:

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

## Recommended first run order

1. Set Neon env vars locally
2. Run `npm run db:migrate`
3. Run `npm run db:seed:file`
4. Run `npm run dev`
5. Open `/admin/login`
6. Sign in with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`
7. Verify public and admin content matches the file-backed version

## Hostinger deployment env vars

Set these in Hostinger:

```bash
NEXT_PUBLIC_SITE_URL=https://your-domain.com
CMS_ADMIN_EMAIL=admin@example.com
CMS_ADMIN_PASSWORD=strong-admin-password
CMS_ADMIN_NAME=Administrator
DATABASE_URL=your_neon_runtime_url
DATABASE_URL_MIGRATION=your_neon_direct_url
```

For production deployment order:
1. Deploy staging app first
2. Point staging to Neon `staging` branch
3. Validate content and admin flows
4. Deploy production app
5. Point production to Neon `main` branch

## Important limitations

- Media files are not stored in Neon. Neon stores metadata only.
- Public contact form persistence/inbox workflow still needs full implementation.
- Categories and media now have working admin CRUD. Comments and contact submissions still need their full workflows.

