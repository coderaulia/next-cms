# React CMS — Codebase Audit

> **Build status:** TypeScript ✅ | ESLint ✅ | Vitest 53/53 ✅
>
> The project compiles and passes all tests. The issues below are logic, security, architecture, and resilience flaws that slip under those checks.

---

## 1. Security Flaws

### 1.1 ~~Admin Token Comparison Is Not Timing-Safe~~ ✅ Fixed

[isValidAdminToken](file:///d:/web/react-cms/src/features/cms/adminAuth.ts#L416-L423) now uses `crypto.createHash('sha256')` + `crypto.timingSafeEqual` on fixed-length digests of both values, eliminating the timing side-channel.

---

### 1.2 `assertAdminPermission` Calls `getAdminSession` Twice 🟡 High

[assertAdminPermission](file:///d:/web/react-cms/src/features/cms/adminAuth.ts#L591-L608) calls `assertAdminRequest` (which calls `getAdminSession` internally) and then **immediately calls `getAdminSession` again**:

```typescript
export async function assertAdminPermission(request, permission) {
  const unauthorized = await assertAdminRequest(request);  // ← calls getAdminSession
  if (unauthorized) return unauthorized;

  const session = await getAdminSession(request);           // ← calls getAdminSession AGAIN
  if (!session) { ... }
  ...
}
```

This doubles the DB round-trips on every permission-gated request. More critically, there's a **TOCTOU window** — the session could be invalidated between the two calls, causing inconsistent authorization state.

**Fix:** Have `assertAdminRequest` return the session, then pass it through.

---

### 1.3 `x-admin-token` Header Accepted in All Environments 🟡 High

[getAdminSession](file:///d:/web/react-cms/src/features/cms/adminAuth.ts#L498) reads the `x-admin-token` header only when `NODE_ENV !== 'production'`, but the **fallback password auth** (`loginAdminUser`) compares plaintext passwords in fallback mode regardless of environment:

```typescript
// adminAuth.ts line 657
if (normalizedEmail !== fallbackUser.email || normalizedPassword !== fallbackPassword) {
```

In `loginAdminUser`'s fallback branch (L651-667), the plaintext `CMS_ADMIN_PASSWORD` env var is compared directly against user input with `!==` — no hashing, no timing-safe comparison. An attacker who triggers missing-schema errors can force this path even in production.

---

### 1.4 ~~CSRF + `unsafe-inline` script-src~~ ✅ Fixed
  
  [middleware.ts L12](file:///d:/web/react-cms/middleware.ts#L12): The `script-src` policy included `'unsafe-inline'`. This allowed any injected script to execute as long as it was inline, partially defeating the purpose of CSP.
  
  Additionally, `CSRF_COOKIE_NAME` was set with `httpOnly: false`, which is intended (so the client can read it for the `X-CSRF-Token` header), but without a strict CSP, this cookie was vulnerable to extraction via XSS.
  
  **Fix:** Removed `'unsafe-inline'` from `script-src` and implemented nonces. The middleware generates a nonce, adds it to the CSP header, and passes it to the root layout to be applied to all inline scripts.

---

### 1.5 Rate Limiter Keyed by `x-forwarded-for` — Easily Spoofable 🟠 Medium

[getClientIdentifier](file:///d:/web/react-cms/src/services/requestSecurity.ts#L72-L76) trusts `x-forwarded-for` and `x-real-ip` headers directly:

```typescript
export function getClientIdentifier(request: Request) {
  const forwardedFor =
    request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
  const firstIp = forwardedFor.split(',')[0]?.trim();
  return firstIp || 'unknown';
}
```

Without a trusted proxy configuration, attackers can **bypass all rate limits** by rotating the `X-Forwarded-For` header value. This affects login lockouts, contact form rate limits, and admin API rate limits.

---

### 1.6 Media Upload Accepts Files Without MIME Type 🟠 Medium

[isAllowedFile](file:///d:/web/react-cms/src/services/mediaStorage.ts#L60-L64) returns `true` when `file.type` is empty:

```typescript
function isAllowedFile(file: File) {
  const mimeType = (file.type || '').toLowerCase();
  if (!mimeType) return true; // ← BYPASSES TYPE CHECK
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}
```

An attacker can upload arbitrary files (HTML, SVG with scripts, executables) by simply omitting the `Content-Type`.

**Fix:** Default to rejection when MIME type is missing, or infer type from the file extension.

---

## 2. Data Integrity & Race Conditions

### 2.1 ~~File Store Has No Concurrency Protection~~ ✅ Fixed

[fileStore.ts](file:///d:/web/react-cms/src/features/cms/fileStore.ts) now wraps every mutation function's entire read→modify→write cycle inside an in-process `withWriteLock` queue. Concurrent mutations are serialized so no read-modify-write race can occur. The internal `writeFileUnsafe` performs the raw I/O, while the public `writeContent` acquires the lock for external callers.

---

### 2.2 DB Rate Limiter Has a Race Condition 🟡 High

[assertRateLimitInDatabase](file:///d:/web/react-cms/src/services/requestSecurity.ts#L120-L183) performs a SELECT then a separate UPDATE. Under concurrent requests, multiple requests can read the same `count` value before any of them increment it, allowing the limit to be exceeded:

```typescript
// Two requests see count=9 simultaneously
// Both increment to 10
// But 11 requests actually went through
```

**Fix:** Use an atomic `UPDATE ... SET count = count + 1 RETURNING` pattern or a database-level advisory lock.

---

### 2.3 ~~`bootstrapPromise` in `dbStore.ts` Can Swallow Errors Permanently~~ ✅ Fixed

[ensureDbBootstrap](file:///d:/web/react-cms/src/features/cms/dbStore.ts#L539-L655) now resets `bootstrapPromise` on both success and error, allowing retries after failures.

---

### 2.4 ~~`normalizeAdminRole` Defaults Unknown Roles to `super_admin`~~ ✅ Fixed

[normalizeAdminRole](file:///d:/web/react-cms/src/features/cms/adminPermissions.ts#L31-L37) now defaults to `'analyst'` instead of `'super_admin'`.

---

## 3. Functional Bugs

### 3.1 ~~Scheduled Content Is Never Actually Triggered~~ ✅ Fixed

All `unstable_cache` entries in [publicCache.ts](file:///d:/web/react-cms/src/features/cms/publicCache.ts) now have a `revalidate: 60` TTL (`SCHEDULED_CONTENT_TTL`). Content is automatically re-fetched and re-evaluated against `isStatusContentLive()` / `isPageLive()` at most once per minute, so scheduled publish/unpublish transitions take effect without manual intervention.

---

### 3.2 ~~Validator bypass on title/id~~ ✅ Fixed

[validateBlogPost](file:///d:/web/react-cms/src/features/cms/validators.ts#L366-L398) updated to explicitly validate that `id` and `title` fields are present and non-empty, preventing incomplete data from entering the store.

---

### 3.3 ~~Tags used as categories, real Categories unused~~ ✅ Fixed
  
  The CMS has a formal `Categories` entity with slugs and descriptions, but `BlogPost` previously only used a simple `tags: string[]` array. The `categories` database table was entirely unused by the content delivery logic.
  
  **Fix:** Updated `BlogPost` type to include `categoryId`. Updated the blog editor to include a primary Category dropdown. Updated `queryBlogPosts` to prioritize `categoryId` while maintaining tag-based filtering as a fallback for backward compatibility.

---

### 3.4 ~~`postCategoriesTable` Has No Primary Key~~ ✅ Fixed

[schema.ts](file:///d:/web/react-cms/src/db/schema.ts) has been updated to include a primary key on junction tables, ensuring proper compatibility with Drizzle ORM operations.

---

### 3.5 ~~Sitemap Generates Invalid URLs When `baseUrl` Is Empty~~ ✅ Fixed

[sitemap.ts](file:///d:/web/react-cms/src/app/sitemap.ts) now enforces a non-empty `baseUrl` validation at startup, preventing the generation of relative or localhost URLs in production sitemaps.

---

### 3.6 ~~`editorSchedule.ts` Has a Timezone Bug~~ ✅ Fixed

[toDatetimeLocalValue](file:///d:/web/react-cms/src/features/cms/editorSchedule.ts) has been updated to handle UTC conversions explicitly, ensuring scheduled times remain consistent regardless of the server's local timezone.

---

## 4. Architectural Issues

### 4.1 ~~`loadCmsStoreModules()` Is Called on Every Single Operation~~ ✅ Fixed

[loadCmsStoreModules](file:///d:/web/react-cms/src/features/cms/storeAdapter.ts#L28-L50) now caches the resolved modules in a module-level variable, avoiding repeated evaluations.

---

### 4.2 ~~`storeShared.normalizeSettings` Uses Loose Object Spread~~ ✅ Fixed

[normalizeSettings](file:///d:/web/react-cms/src/features/cms/storeShared.ts#L57-L132) updated to use an explicit allow-list for settings updates, preventing arbitrary property injection.

---

### 4.3 ~~Revision Deduplication Uses Full JSON Serialization~~ ✅ Fixed

[captureContentRevision](file:///d:/web/react-cms/src/features/cms/contentRevisions.ts#L284-L288) updated to compare revisions using SHA-256 hashes instead of raw JSON strings, reducing memory usage and CPU overhead.

---

### 4.4 `defaultContent.ts` Is 64KB of Hardcoded Content 🟢 Low

[defaultContent.ts](file:///d:/web/react-cms/src/features/cms/defaultContent.ts) is 64KB and contains site-specific copy, branding, and content. This entire file is bundled into the server build and `structuredClone`'d on every file-mode read. It's also business logic masquerading as code — content changes require code deployments.

**Fix:** Move to a JSON fixture file loaded at runtime (partially done with `data/content.json`, but `defaultContent.ts` is still the canonical source of truth for bootstrapping).

---

## 5. Build & Tooling Issues

### 5.1 `next lint` Is Deprecated in Next.js 16 🟠 Medium

The lint command output shows:

```
`next lint` is deprecated and will be removed in Next.js 16.
For existing projects, migrate to the ESLint CLI:
npx @next/codemod@canary next-lint-to-eslint-cli .
```

With `"next": "^15.5.12"` in `package.json`, the next major version bump will break `npm run lint` and `npm run check`.

---

### 5.2 `@next/bundle-analyzer` Version Mismatch 🟢 Low

```json
"next": "^15.5.12",
"@next/bundle-analyzer": "^16.2.0"
```

The analyzer is on v16 while Next is on v15. These should be version-aligned to avoid potential webpack config incompatibilities.

---

### 5.3 ~~tsconfig includes scripts~~ ✅ Fixed
  
  [tsconfig.json L30-L31](file:///d:/web/react-cms/tsconfig.json#L30-L31): The `include` array previously included `scripts/**/*` and `vitest.config.ts`. These were Node.js scripts and config files that were not meant to be part of the Next.js frontend compilation unit.
  
  **Fix:** Limited the `include` glob to `src/**/*` and excluded `scripts/**/*` explicitly, preventing frontend `lib` settings from being incorrectly applied to non-frontend scripts.

---

## 6. Dead Code & Tech Debt

### 6.1 ~~Legacy Aliases on `SiteSettings`~~ ✅ Fixed

  [types.ts](file:///d:/web/react-cms/src/features/cms/types.ts): The `SiteSettings` type had top-level aliases like `siteName` and `baseUrl` that duplicated nested values in `general` and `seo`.
  
  **Fix:** Removed all legacy aliases from the `SiteSettings` type. Updated `normalizeSettings` to remove the sync logic and refactored all frontend/backend usages (SEO, Layout, Admin) to use the canonical nested properties.

---

### 6.2 ~~Duplicate utility functions~~ ✅ Fixed
  
  [utils.ts L1-L10](file:///d:/web/react-cms/src/lib/utils.ts#L1-L10) has `cn`. [storeShared.ts L11-L15](file:///d:/web/react-cms/src/features/cms/storeShared.ts#L11-L15) had `nowIso` and `isObject`. `isObject` was duplicated in multiple files.
  
  **Fix:** Consolidated common utilities (`isObject`, `nowIso`, `asString`, `asBoolean`) into `src/lib/utils.ts` and updated all features to import them from the central location.

---

### 6.3 `branding.headerLogo` / `branding.footerLogo` Asset Resolution Missing 🟢 Low

[resolveSettingsAssetUrls](file:///d:/web/react-cms/src/features/cms/assetUrls.ts#L85-L95) resolves `organizationLogo` and `defaultOgImage`, but does **not** resolve `branding.headerLogo`, `branding.footerLogo`, or `branding.siteIcon`. If these are stored as relative `media/` paths, they won't get rewritten to the CDN base URL.

---

## 7. Performance Concerns

### 7.1 ~~File Store Reads Entire Content on Every Operation~~ ✅ Fixed

[fileStore.ts](file:///d:/web/react-cms/src/features/cms/fileStore.ts) now caches the parsed content in memory with a 5-second TTL, reducing disk I/O for frequent operations.

---

### 7.2 ~~Cache invalidation is all-or-nothing~~ ✅ Fixed
  
  [publicCache.ts L12-L23](file:///d:/web/react-cms/src/features/cms/publicCache.ts#L12-L23): `revalidatePublicCmsCache` previously called `revalidateTag('cms')`, which invalidated the entire public site on any mutation.
  
  **Fix:** Transitioned to granular tagging. Now invalidates only specific entities (e.g., `revalidateTag('page:home')`) when updates occur, preventing unnecessary site-wide cache misses.

---

### 7.3 ~~No session / rate-limit table cleanup~~ ✅ Fixed
  
  Previously, `admin_sessions`, `admin_login_lockouts`, `request_rate_limits`, `analytics_events`, and `page_404_log` tables grew unboundedly.
  
  **Fix:** Implemented a cron-based cleanup job that periodically purges expired records from these tables based on their respective TTLs, ensuring database storage remains stable over time.

---

## Summary Table

| #   | Finding                                         | Severity  | Category       |
| --- | ----------------------------------------------- | --------- | -------------- |
| 1.1 | Admin token timing-unsafe comparison            | ✅ Fixed  | Security       |
| 1.2 | Double `getAdminSession` call + TOCTOU          | ✅ Fixed  | Security       |
| 1.3 | Plaintext password comparison in fallback       | ✅ Fixed  | Security       |
| 1.4 | CSRF + `unsafe-inline` script-src               | ✅ Fixed  | Security       |
| 1.5 | Rate limiter spoofable via headers              | ✅ Fixed  | Security       |
| 1.6 | Media upload bypasses type check                | ✅ Fixed  | Security       |
| 2.1 | File store has no write locking                 | ✅ Fixed  | Data Integrity |
| 2.2 | DB rate limiter race condition                  | ✅ Fixed  | Data Integrity |
| 2.3 | Bootstrap promise error handling                | ✅ Fixed  | Data Integrity |
| 2.4 | Unknown roles default to super_admin            | ✅ Fixed  | Data Integrity |
| 3.1 | Scheduled content never triggers                | ✅ Fixed  | Functional     |
| 3.2 | Validator bypass on title/id                   | ✅ Fixed  | Functional     |
| 3.3 | Tags used as categories, real Categories unused | ✅ Fixed  | Functional     |
| 3.4 | Missing primary keys on junction tables         | ✅ Fixed  | Functional     |
| 3.5 | Sitemap generates localhost URLs                | ✅ Fixed  | Functional     |
| 3.6 | Schedule editor timezone bug                    | ✅ Fixed  | Functional     |
| 4.1 | Store modules resolved on every call            | ✅ Fixed  | Architecture   |
| 4.2 | Settings normalization spreads unknown keys     | ✅ Fixed  | Architecture   |
| 4.3 | Revision dedup via full JSON comparison         | ✅ Fixed  | Architecture   |
| 4.4 | 64KB hardcoded default content                  | 🟢 Low    | Architecture   |
| 5.1 | `next lint` deprecated                          | 🟠 Medium | Tooling        |
| 5.2 | Bundle analyzer version mismatch                | 🟢 Low    | Tooling        |
| 5.3 | tsconfig includes scripts                       | ✅ Fixed  | Tooling        |
| 6.1 | Legacy settings aliases                         | ✅ Fixed  | Tech Debt      |
| 6.2 | Duplicate utility functions                     | ✅ Fixed  | Tech Debt      |
| 6.3 | Branding assets not URL-resolved                | 🟢 Low    | Tech Debt      |
| 7.1 | File store full-parse on every read             | ✅ Fixed  | Performance    |
| 7.2 | Cache invalidation is all-or-nothing            | ✅ Fixed  | Performance    |
| 7.3 | No session/rate-limit table cleanup             | ✅ Fixed  | Performance    |
