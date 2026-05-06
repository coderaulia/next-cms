# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
# Dev
npm run dev           # Start dev server (localhost:3000)
npm run build         # Production build
npm run check         # lint + typecheck + test (run before committing)
npm run lint          # ESLint
npm run typecheck     # TypeScript strict check

# Testing
npm run test                                              # Vitest (run once)
npx vitest run src/tests/contentStore.test.ts             # Single test file
npx vitest run --watch                                    # Watch mode

# Database (Drizzle ORM)
npm run db:generate   # Generate migration from schema changes
npm run db:migrate    # Apply migrations
npm run db:push       # Push schema directly (dev, no migration file)
npm run db:studio     # Drizzle Studio UI
npm run db:reseed     # Full reset: purge + migrate + seed
npm run db:seed:file -- --fixture <name>   # Seed with preset fixture

# Utilities
npm run analyze       # Bundle analyzer (sets ANALYZE=true)
```

## Architecture

Next.js 16.2 App Router, TypeScript strict, React 19, Tailwind CSS 3.4, Drizzle ORM, Vitest.

**Dual persistence layer** — controlled by `src/features/cms/storeAdapter.ts`:
- `DATABASE_URL` set → PostgreSQL via Drizzle (`dbStore.ts`)
- `DATABASE_URL` not set → local JSON file at `data/content.json` (`fileStore.ts`, concurrent-safe with write lock)

All read/write goes through `contentStore.ts`, which delegates to the active store.

### Key directories

```
src/
  app/
    (public)/         # Public-facing pages (home, about, blog, portfolio, contact)
    admin/            # Admin shell and all admin pages
    api/admin/        # REST API (requires auth)
    api/public/       # Public REST API (contact form, etc.)
  components/
    admin/            # Admin UI components
    home/blocks/      # Typed homepage block components
    ui/               # Generic reusable UI
  features/cms/       # Core CMS logic — start here for any data/content work
    storeAdapter.ts   # DB vs file store switch
    contentStore.ts   # Unified read/write API
    dbStore.ts        # Drizzle queries
    fileStore.ts      # JSON file persistence
    publicApi.ts      # Published-content-only API (public pages use this)
    publicCache.ts    # Next.js ISR revalidation
    adminAuth.ts      # Sessions, password hashing, audit logs, lockouts
    validators.ts     # Input validation — return null on failure (callers check null → 400)
    types.ts          # Core types: BlogPost, Page, PortfolioProject, etc.
    seo.ts            # SEO metadata builder
  db/
    schema.ts         # Drizzle schema (all tables)
    client.ts         # Pool config (2 conns build / 5 prod / 4 dev)
  services/
    env.ts            # All env var parsing lives here
    mediaStorage.ts   # File upload (local or Supabase Storage)
    requestSecurity.ts # CSRF, rate limiting, client ID
  config/
    site-profile.ts   # Brand, navigation, routing config — customize per client
```

### Data flow

**Public page render:** `app/(public)/page.tsx` → `publicApi.getPublishedPage()` → storeAdapter → DB or file store → ISR cached

**Admin mutation:** `app/admin/` page → `fetch('/api/admin/...')` → API route → `assertAdminPermission()` → `contentStore` → `publicCache.revalidate()` (triggers ISR)

**API route pattern:**
```ts
const session = await getAdminSession(req);
if (!session) return unauthorized();
const data = validate(await req.json());
if (!data) return badRequest('Invalid input');
const result = await contentStore.updateX(data);
await revalidateCache();
return NextResponse.json(result);
```

### Homepage block system

`pagesTable.homeBlocks` stores a typed discriminated union: `hero | value_triplet | solutions_grid | why_split | logo_cloud | primary_cta`. Each block type has its own component in `src/components/home/blocks/`.

### Auth

- Cookie-based sessions (`cms_admin_session`, httpOnly, 7-day TTL)
- scrypt password hashing (100k iterations)
- Roles: `editor | admin | owner` with action-gated permissions (`content:edit`, `settings:manage`, `team:manage`)
- Login lockout after 5 failures (15-min window)
- CSRF: token in cookie, must be sent as header on POST/PUT/DELETE
- First-run bootstrap: if `admin_users` table empty, creates admin from `CMS_ADMIN_EMAIL` + `CMS_ADMIN_PASSWORD` env vars

### Validator pattern

Validators return `null` on invalid input (never throw). Always check null before using:

```ts
const validated = validateBlogPost(body);
if (!validated) return NextResponse.json({ error: 'Invalid' }, { status: 400 });
```

### Testing

Tests live in `src/tests/`. Uses jsdom environment. `vitest.setup.ts` mocks `IntersectionObserver`. Test the store layer directly; no database needed for file store tests.

### Client generation

`npm run bootstrap:client -- --output ../acme-cms --site-name "Name"` scaffolds a new client site from this repo. Entry point: `src/features/bootstrap/`.
