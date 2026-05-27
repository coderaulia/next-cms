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

# Media
npm run media:migrate:supabase:dry   # Preview local→Supabase media migration
npm run media:migrate:supabase       # Execute local→Supabase media migration

# Bundle / size auditing
npm run analyze       # Bundle analyzer (sets ANALYZE=true)
npm run audit:src     # Report src/ file sizes with gzip estimates
npm run audit:size    # Report build output sizes (raw + gzip)
npm run build:audit   # build + audit:size in one pass
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
    page.tsx          # Home — uses VanailaRedesignHome (homepage block system)
    about/            # About page
    blog/             # Blog listing + post detail
    contact/          # Contact page
    portfolio/        # Portfolio listing + project detail
    service/          # Service listing page
    [slug]/           # Catch-all for dynamic CMS pages (partnership, product-hris, etc.)
    admin/            # Admin shell and all admin pages
    api/admin/        # REST API (requires auth)
    api/public/       # Public REST API (contact form, etc.)
  components/
    admin/            # Admin UI components
    animations/       # Vanaila design system primitives: Reveal, StaggerGroup
    home/blocks/      # Typed homepage block components (hero, value_triplet, etc.)
    pages/            # Per-page view components (AboutPageView, ServicePageView, etc.)
    ui/               # Generic reusable UI
    AppShell.tsx      # Public layout wrapper (SiteHeader + SiteFooter + CustomCursor)
    CustomCursor.tsx  # Branded custom cursor (Vanaila design system)
    SiteHeader.tsx    # Navigation header
    SiteFooter.tsx    # Site footer
    MarketingPageRenderer.tsx  # Generic section renderer for CMS-managed pages
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

**Public page render:** `app/page.tsx` (or `app/[slug]/page.tsx`) → `publicApi.getPublishedPage()` → storeAdapter → DB or file store → ISR cached

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

`pagesTable.homeBlocks` stores a typed discriminated union: `hero | value_triplet | solutions_grid | why_split | logo_cloud | primary_cta`. Each block type has its own component in `src/components/home/blocks/`. The home page is rendered by `VanailaRedesignHome` — a fully custom component that fuses the block data with the Vanaila design system layout and motion primitives instead of going through `MarketingPageRenderer`.

### Vanaila design system

The public-facing UI uses the Vanaila design system (branded to the current client). Key pieces:

- `src/components/animations/Reveal.tsx` — scroll-triggered reveal with CSS-class-based animation (`fadeUp`, `fadeIn`, `scaleInSoft` presets, no external motion library)
- `src/components/animations/StaggerGroup.tsx` — stagger wrapper for list items
- `src/components/CustomCursor.tsx` — branded cursor with `useCursorMode` hook
- `src/app/globals.css` — design tokens, `reveal-motion-*` keyframes, `marketing-section` layout utilities
- All public page views (`AboutPageView`, `ServicePageView`, etc.) in `src/components/pages/` follow Vanaila layout conventions

When modifying public pages, keep animation and layout classes consistent with existing page views.

### Auth

- Cookie-based sessions (`cms_admin_session`, httpOnly, 7-day TTL)
- scrypt password hashing (100k iterations)
- Roles: `super_admin | admin | editor | analyst` with action-gated permissions (`content:edit`, `settings:manage`, `team:manage`)
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

<!-- rtk-instructions v2 -->
# RTK (Rust Token Killer) - Token-Optimized Commands

## Golden Rule

**Always prefix commands with `rtk`**. If RTK has a dedicated filter, it uses it. If not, it passes through unchanged. This means RTK is always safe to use.

**Important**: Even in command chains with `&&`, use `rtk`:
```bash
# ❌ Wrong
git add . && git commit -m "msg" && git push

# ✅ Correct
rtk git add . && rtk git commit -m "msg" && rtk git push
```

## RTK Commands by Workflow

### Build & Compile (80-90% savings)
```bash
rtk cargo build         # Cargo build output
rtk cargo check         # Cargo check output
rtk cargo clippy        # Clippy warnings grouped by file (80%)
rtk tsc                 # TypeScript errors grouped by file/code (83%)
rtk lint                # ESLint/Biome violations grouped (84%)
rtk prettier --check    # Files needing format only (70%)
rtk next build          # Next.js build with route metrics (87%)
```

### Test (60-99% savings)
```bash
rtk cargo test          # Cargo test failures only (90%)
rtk go test             # Go test failures only (90%)
rtk jest                # Jest failures only (99.5%)
rtk vitest              # Vitest failures only (99.5%)
rtk playwright test     # Playwright failures only (94%)
rtk pytest              # Python test failures only (90%)
rtk rake test           # Ruby test failures only (90%)
rtk rspec               # RSpec test failures only (60%)
rtk test <cmd>          # Generic test wrapper - failures only
```

### Git (59-80% savings)
```bash
rtk git status          # Compact status
rtk git log             # Compact log (works with all git flags)
rtk git diff            # Compact diff (80%)
rtk git show            # Compact show (80%)
rtk git add             # Ultra-compact confirmations (59%)
rtk git commit          # Ultra-compact confirmations (59%)
rtk git push            # Ultra-compact confirmations
rtk git pull            # Ultra-compact confirmations
rtk git branch          # Compact branch list
rtk git fetch           # Compact fetch
rtk git stash           # Compact stash
rtk git worktree        # Compact worktree
```

Note: Git passthrough works for ALL subcommands, even those not explicitly listed.

### GitHub (26-87% savings)
```bash
rtk gh pr view <num>    # Compact PR view (87%)
rtk gh pr checks        # Compact PR checks (79%)
rtk gh run list         # Compact workflow runs (82%)
rtk gh issue list       # Compact issue list (80%)
rtk gh api              # Compact API responses (26%)
```

### JavaScript/TypeScript Tooling (70-90% savings)
```bash
rtk pnpm list           # Compact dependency tree (70%)
rtk pnpm outdated       # Compact outdated packages (80%)
rtk pnpm install        # Compact install output (90%)
rtk npm run <script>    # Compact npm script output
rtk npx <cmd>           # Compact npx command output
rtk prisma              # Prisma without ASCII art (88%)
```

### Files & Search (60-75% savings)
```bash
rtk ls <path>           # Tree format, compact (65%)
rtk read <file>         # Code reading with filtering (60%)
rtk grep <pattern>      # Search grouped by file (75%)
rtk find <pattern>      # Find grouped by directory (70%)
```

### Analysis & Debug (70-90% savings)
```bash
rtk err <cmd>           # Filter errors only from any command
rtk log <file>          # Deduplicated logs with counts
rtk json <file>         # JSON structure without values
rtk deps                # Dependency overview
rtk env                 # Environment variables compact
rtk summary <cmd>       # Smart summary of command output
rtk diff                # Ultra-compact diffs
```

### Infrastructure (85% savings)
```bash
rtk docker ps           # Compact container list
rtk docker images       # Compact image list
rtk docker logs <c>     # Deduplicated logs
rtk kubectl get         # Compact resource list
rtk kubectl logs        # Deduplicated pod logs
```

### Network (65-70% savings)
```bash
rtk curl <url>          # Compact HTTP responses (70%)
rtk wget <url>          # Compact download output (65%)
```

### Meta Commands
```bash
rtk gain                # View token savings statistics
rtk gain --history      # View command history with savings
rtk discover            # Analyze Claude Code sessions for missed RTK usage
rtk proxy <cmd>         # Run command without filtering (for debugging)
rtk init                # Add RTK instructions to CLAUDE.md
rtk init --global       # Add RTK to ~/.claude/CLAUDE.md
```

## Token Savings Overview

| Category | Commands | Typical Savings |
|----------|----------|-----------------|
| Tests | vitest, playwright, cargo test | 90-99% |
| Build | next, tsc, lint, prettier | 70-87% |
| Git | status, log, diff, add, commit | 59-80% |
| GitHub | gh pr, gh run, gh issue | 26-87% |
| Package Managers | pnpm, npm, npx | 70-90% |
| Files | ls, read, grep, find | 60-75% |
| Infrastructure | docker, kubectl | 85% |
| Network | curl, wget | 65-70% |

Overall average: **60-90% token reduction** on common development operations.
<!-- /rtk-instructions -->