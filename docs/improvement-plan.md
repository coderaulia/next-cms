# CMS Improvement Plan

Updated: 2026-05-19

This document tracks all planned fixes and improvements for Vanaila CMS. Work through items in priority order. Mark each item done by checking the checkbox when complete.

---

## P0 — Critical (Fix Before Next Deploy)

### 1. ISR Cache Not Invalidated on Settings Change

**Problem:** `revalidatePublicCmsCache()` is called after content mutations but SEO and sitemap settings mutations may not trigger it, causing stale sitemap/robots output to be served.

**Files to check:**
- `src/app/api/admin/settings/route.ts` (or equivalent settings API route)
- `src/features/cms/publicCache.ts`

**Fix:**
1. Open every settings-related API route (general, SEO, sitemap, reading, permalinks).
2. Confirm `revalidatePublicCmsCache()` is called after each successful mutation.
3. If any route is missing the call, add it after the `contentStore` write.
4. Manually test: update a sitemap setting in admin → hit `/sitemap.xml` → confirm it reflects the change without a full redeploy.

- [x] Done

---

### 2. Rate Limiting on Contact Form Endpoint

**Problem:** `/api/public/contact` may not have rate limiting. Unprotected contact endpoints are a common spam and abuse vector.

**Files to check:**
- `src/app/api/public/contact/route.ts`
- `src/services/requestSecurity.ts`

**Fix:**
1. Open `requestSecurity.ts` and confirm a rate limiter function exists (same one used for analytics endpoints).
2. In the contact route, apply the rate limiter at the top of the handler before any processing.
3. Return `429 Too Many Requests` when the limit is exceeded.
4. Set a sensible limit — suggested: 5 submissions per IP per 10 minutes.

Example pattern:
```ts
const limited = await checkRateLimit(req, 'contact', { max: 5, windowMs: 600_000 });
if (limited) return NextResponse.json({ error: 'Too many requests' }, { status: 429 });
```

- [x] Done

---

## P1 — High (Fix Within This Sprint)

### 3. DB Pool Max Env Override Not Consistently Applied

**Problem:** `src/db/client.ts` hardcodes different pool sizes per environment (2 build / 5 prod / 4 dev). `CMS_DB_POOL_MAX` env var may not override all of these.

**Files to check:**
- `src/db/client.ts`
- `src/services/env.ts`

**Fix:**
1. In `env.ts`, confirm `CMS_DB_POOL_MAX` is parsed as a number with a fallback.
2. In `client.ts`, replace hardcoded per-env values with:
```ts
const poolMax = env.CMS_DB_POOL_MAX ?? (isBuild ? 2 : isProd ? 5 : 4);
```
3. Ensure `CMS_DB_POOL_MAX` always wins when set, regardless of environment.

- [x] Done

---

### 4. Validator Null Returns Have No Server-Side Logging

**Problem:** When `validateXxx()` returns `null`, the API returns 400 with no server-side trace. Debugging bad payloads requires guesswork.

**Files to check:**
- `src/features/cms/validators.ts`
- All files in `src/app/api/admin/`

**Fix:**
1. Add a lightweight log helper in `validators.ts` or `lib/utils.ts`:
```ts
export function validationFailed(route: string, payload: unknown) {
  console.warn(`[validation] ${route} rejected payload:`, JSON.stringify(payload).slice(0, 300));
}
```
2. In each API route, call it before returning 400:
```ts
if (!validated) {
  validationFailed('/api/admin/blog', body);
  return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
}
```
3. Keep the log truncated (300 chars) to avoid leaking sensitive data in logs.

- [x] Done

---

### 5. Media Deletion Cross-Reference Check Is Incomplete

**Problem:** Media deletion protection needs to check all content types that can reference media: blog `coverImage`, portfolio `coverImage`, portfolio `gallery[]`, and any page section with embedded media URLs.

**Files to check:**
- `src/app/api/admin/media/[id]/route.ts`
- `src/features/cms/dbStore.ts` or `fileStore.ts` (whichever has the delete logic)

**Fix:**
1. Before deleting a media record, query all tables that can hold a media reference:
   - `blog_posts.cover_image`
   - `portfolio_projects.cover_image`
   - `portfolio_projects.gallery` (JSONB array — check if URL appears)
   - `pages.home_blocks` and `pages.sections` (JSONB — check if URL appears)
2. If any reference is found, return `409 Conflict` with a message listing where it's used.
3. Write a helper: `findMediaReferences(mediaUrl: string): Promise<string[]>` that returns human-readable location strings.

- [x] Done

---

## P2 — Medium (Schedule Within 2 Weeks)

### 6. Add GitHub Actions CI Workflow

**Problem:** No automated CI runs `npm run check` or `npm run build` on PRs. Broken builds can reach production.

**Fix:**
Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  check:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'
      - run: npm ci
      - run: npm run check
      - run: npm run build
    env:
      NEXT_PUBLIC_SITE_URL: http://localhost:3000
      CMS_ADMIN_EMAIL: ci@example.com
      CMS_ADMIN_PASSWORD: ci-password
      CMS_ADMIN_NAME: CI
      PASSWORD_PEPPER: ci-pepper-not-real
```

Note: Do not add `DATABASE_URL` — let CI run in file mode to avoid needing a real DB.

- [x] Done

---

### 7. Add `/api/health` Endpoint

**Problem:** No health check endpoint. After deploy, there is no automated way to verify DB connectivity without hitting admin.

**Fix:**
Create `src/app/api/health/route.ts`:

```ts
import { NextResponse } from 'next/server';

export async function GET() {
  let db = false;
  try {
    // run a lightweight query — e.g. SELECT 1
    // import your db client here
    db = true;
  } catch {
    db = false;
  }
  const status = db ? 'ok' : 'degraded';
  return NextResponse.json({ status, db }, { status: db ? 200 : 503 });
}
```

Use this URL in Hostinger health check config and any uptime monitoring.

- [x] Done

---

### 8. Warn When PASSWORD_PEPPER Is Missing in Production

**Problem:** `PASSWORD_PEPPER` is optional but omitting it weakens scrypt hashing. There is no startup warning.

**Files to check:**
- `src/services/env.ts`
- App startup (can use `instrumentation.ts` if on Next.js 15+, or add to `src/db/client.ts` init)

**Fix:**
In `env.ts` or app startup:
```ts
if (process.env.NODE_ENV === 'production' && !process.env.PASSWORD_PEPPER) {
  console.warn('[security] PASSWORD_PEPPER is not set. Scrypt hashing is weaker without it. Set this in production.');
}
```

- [x] Done

---

## P3 — Low (Backlog)

### 9. File Store Stale Lock Detection

**Problem:** If the process crashes mid-write, the write lock in `fileStore.ts` can be left dangling, blocking future writes.

**Files to check:**
- `src/features/cms/fileStore.ts`

**Fix:**
1. Store the lock as a file with a timestamp (e.g. `.content.lock` containing a unix timestamp).
2. On lock acquisition, check if an existing lock is older than a threshold (e.g. 10 seconds).
3. If stale, log a warning and clear it before proceeding.

```ts
const LOCK_TTL_MS = 10_000;
// on acquire: if lock file exists and mtime > TTL, delete and proceed
```

- [x] Done

---

### 10. Bootstrap Client Config Validation

**Problem:** `npm run bootstrap:client -- --config <file>` has no schema validation. Malformed JSON produces cryptic errors.

**Files to check:**
- `src/features/bootstrap/` (entry point: `bootstrap-client.ts`)

**Fix:**
1. Add a zod schema for the config shape at the top of the bootstrap entry point.
2. Parse the JSON through the schema before proceeding.
3. On failure, print a clear error listing which fields are missing or invalid, then exit with code 1.

- [x] Done

---

### 11. Add Size Audit to Pre-Deploy Check

**Problem:** `npm run check` skips bundle size auditing. Bundle bloat goes undetected until production.

**Fix:**
Add a new script to `package.json`:
```json
"check:deploy": "npm run check && npm run build && npm run audit:size"
```

Update `docs/deployment-handoff.md` to tell operators to run `npm run check:deploy` before every production deploy instead of `npm run check` alone.

- [x] Done

---

## Verification Checklist (Run After All Fixes)

- [ ] `npm run check` passes (lint + typecheck + test)
- [ ] `npm run build` succeeds
- [ ] `/api/health` returns `{ status: 'ok', db: true }`
- [ ] Contact form rejects after 5 rapid submissions (test with curl)
- [ ] Update a sitemap setting → `/sitemap.xml` reflects it without redeploy
- [ ] Delete a media file that is referenced → get 409 response
- [ ] Delete an unreferenced media file → succeeds
- [ ] `CMS_DB_POOL_MAX=2` in env → pool respects it (check logs)
- [ ] CI workflow runs and passes on a test PR
- [ ] `PASSWORD_PEPPER` missing in prod env → warning appears in logs
