# React CMS — Codebase Audit

> **Build status:** TypeScript ✅ | ESLint ✅ | Vitest 53/53 ✅
>
> The project compiles and passes all tests. The issues below are logic, security, architecture, and resilience flaws that slip under those checks.

---

## 1. Security Flaws

### 1.1 Admin Token Comparison Is Not Timing-Safe 🔴 Critical

[isValidAdminToken](file:///d:/web/react-cms/src/features/cms/adminAuth.ts#L416-L420) uses a plain `===` string comparison:

```typescript
export function isValidAdminToken(token: string | null) {
  const input = normalize(token);
  const expected = normalize(env.adminToken);
  return input.length > 0 && expected.length > 0 && input === expected;
}
```

This is vulnerable to **timing attacks**. An attacker can measure response times to progressively guess the token character-by-character. The password path correctly uses `timingSafeEqual`, but the legacy token path does not.

**Fix:** Use `crypto.timingSafeEqual` on fixed-length hashes of both values.

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

### 1.4 CSRF Cookie Is `httpOnly: false` by Design 🟠 Medium

[middleware.ts L46](file:///d:/web/react-cms/middleware.ts#L44-L51) sets the CSRF cookie with `httpOnly: false`. This is **intentional** (client JS must read it), but it means any XSS vulnerability allows CSRF token theft, completely bypassing CSRF protection.

The CSP allows `'unsafe-inline'` for scripts (L12), which significantly increases XSS attack surface. Combined, this weakens the CSRF defense substantially.

**Fix:** Remove `'unsafe-inline'` from `script-src` and use nonces instead.

---

### 1.5 Rate Limiter Keyed by `x-forwarded-for` — Easily Spoofable 🟠 Medium

[getClientIdentifier](file:///d:/web/react-cms/src/services/requestSecurity.ts#L72-L76) trusts `x-forwarded-for` and `x-real-ip` headers directly:

```typescript
export function getClientIdentifier(request: Request) {
  const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
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
  if (!mimeType) return true;  // ← BYPASSES TYPE CHECK
  return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
}
```

An attacker can upload arbitrary files (HTML, SVG with scripts, executables) by simply omitting the `Content-Type`.

**Fix:** Default to rejection when MIME type is missing, or infer type from the file extension.

---

## 2. Data Integrity & Race Conditions

### 2.1 File Store Has No Concurrency Protection 🔴 Critical

[fileStore.ts](file:///d:/web/react-cms/src/features/cms/fileStore.ts) performs read-modify-write cycles on `data/content.json` with no locking mechanism:

```typescript
export async function updateBlogPost(id, payload) {
  const content = await readContent();    // ← READ
  // ... modify content ...
  await writeContent(content);            // ← WRITE (clobbers concurrent changes)
}
```

Every mutation function (create/update/delete for blog posts, portfolio projects, pages, settings) follows this pattern. Under concurrent admin requests, **data loss is certain** — the last writer wins, silently discarding all intervening changes.

**Fix:** Use a file lock (e.g., `proper-lockfile`) or a write-through queue.

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

### 2.3 `bootstrapPromise` in `dbStore.ts` Can Swallow Errors Permanently 🟡 High

[ensureDbBootstrap](file:///d:/web/react-cms/src/features/cms/dbStore.ts#L539-L655) sets `bootstrapPromise = null` in the `finally` block only for the initial caller. But if the promise rejects, **all concurrent waiters** at L547 (`await bootstrapPromise`) will also reject, potentially crashing request handlers. After that, `bootstrapPromise` is null again, so the next request will retry — but the partial bootstrap state is unknown.

---

### 2.4 `normalizeAdminRole` Defaults Unknown Roles to `super_admin` 🟡 High

[normalizeAdminRole](file:///d:/web/react-cms/src/features/cms/adminPermissions.ts#L31-L37):

```typescript
export function normalizeAdminRole(value: string | null | undefined): AdminRole {
  const normalized = (value ?? '').trim().toLowerCase();
  if (normalized === 'admin' || normalized === 'editor' || normalized === 'analyst') {
    return normalized;
  }
  return 'super_admin';  // ← ANY garbage value gets FULL permissions
}
```

If a database corruption or import bug produces an unexpected role string (e.g., `"viewer"`, `"moderator"`, or empty string), the user silently receives **super_admin privileges**.

**Fix:** Default to the least-privileged role (`analyst`), or throw on unrecognized values.

---

## 3. Functional Bugs

### 3.1 Scheduled Content Is Never Actually Triggered 🔴 Critical

The CMS has full scheduling infrastructure — `scheduledPublishAt`, `scheduledUnpublishAt` fields, `isStatusContentLive()` / `isPageLive()` checks in [publicationState.ts](file:///d:/web/react-cms/src/features/cms/publicationState.ts) — but **there is no cron job, background worker, or revalidation trigger** that ever runs these checks on a schedule.

- `isStatusContentLive()` correctly filters at read time, so scheduled items appear/disappear for public visitors only when the **cache is invalidated**.
- `revalidatePublicCmsCache()` is only called on admin mutations (save, delete, publish).
- `unstable_cache` entries have **no `revalidate` TTL** set — they persist indefinitely until an explicit `revalidateTag()` call.

**Result:** A post scheduled for 3:00 PM will remain invisible until _someone_ edits _any_ content in the admin panel.

**Fix:** Either add a periodic revalidation (cron API route or `revalidate: 60` TTL on cached functions) or remove the scheduling UI to avoid misleading admins.

---

### 3.2 `validateBlogPost` Never Returns `null` for Missing Required Fields 🟠 Medium

[validateBlogPost](file:///d:/web/react-cms/src/features/cms/validators.ts#L366-L398) only checks `isObject(payload)` but never validates that critical fields like `id` or `title` are non-empty. The `asString()` helper silently converts missing values to `""`:

```typescript
export function validateBlogPost(payload: unknown): BlogPost | null {
  if (!isObject(payload)) return null;
  // No check for empty title, empty id, etc.
  return {
    id: asString(payload.id),  // Could be ""
    title: asString(payload.title),  // Could be ""
    ...
  };
}
```

Compare with `validatePortfolioProject` which correctly rejects empty titles (`if (!title) return null`). Blog posts don't get this treatment.

**Fix:** Add `const title = asString(payload.title).trim(); if (!title) return null;` like portfolio does.

---

### 3.3 Blog `queryBlogPosts` Uses Tags as "Categories" 🟠 Medium

[fileStore.ts L129-L136](file:///d:/web/react-cms/src/features/cms/fileStore.ts#L129-L136) and L145-L148 treat `tags` as categories for filtering:

```typescript
const categories = Array.from(
  new Set(
    content.blogPosts
      .flatMap((post) => post.tags)  // ← tags used as categories
      ...
  )
);
```

The CMS has a proper `Category` entity with its own CRUD, but the blog query system completely ignores it. The `categories` table exists in the schema but is never joined to blog post queries.

---

### 3.4 `postCategoriesTable` Has No Primary Key 🟠 Medium

[schema.ts L116-L126](file:///d:/web/react-cms/src/db/schema.ts#L116-L126):

```typescript
export const postCategoriesTable = pgTable('post_categories', {
  postId: text('post_id').notNull(),
  categoryId: text('category_id').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true, mode: 'string' }).notNull()
  // ← No primary key defined
});
```

Drizzle requires tables to have a primary key for proper ORM operations. The composite unique index exists, but this is not a PK. This can cause issues with Drizzle's `.onConflictDoUpdate()` and introspection.

---

### 3.5 Sitemap Generates Invalid URLs When `baseUrl` Is Empty 🟠 Medium

[sitemap.ts L29](file:///d:/web/react-cms/src/app/sitemap.ts#L29):

```typescript
url: `${settings.baseUrl}${page.seo.slug ? `/${page.seo.slug}` : ''}`
```

If `settings.baseUrl` is empty (which `asSafeBaseUrl` allows via `env.ts` fallback to `http://localhost:3000`), the sitemap will contain `http://localhost:3000/about` URLs in production. There's no guard preventing this from being served to search engines.

---

### 3.6 `editorSchedule.ts` Has a Timezone Bug 🟠 Medium

[toDatetimeLocalValue](file:///d:/web/react-cms/src/features/cms/editorSchedule.ts#L5-L18):

```typescript
export function toDatetimeLocalValue(value: string | null | undefined) {
  ...
  const offsetMinutes = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offsetMinutes * 60_000);
  return localDate.toISOString().slice(0, 16);
}
```

This runs **server-side** where `getTimezoneOffset()` returns the server's timezone, not the admin user's timezone. An admin in Jakarta (UTC+7) editing scheduled times on a server in UTC will see times offset by 7 hours.

---

## 4. Architectural Issues

### 4.1 `loadCmsStoreModules()` Is Called on Every Single Operation 🟡 High

Every function in [contentStore.ts](file:///d:/web/react-cms/src/features/cms/contentStore.ts) calls `loadCmsStoreModules()`:

```typescript
export async function getBlogPosts(includeDrafts = false) {
  const { contentStore } = await loadCmsStoreModules();
  ...
}
```

This re-evaluates `isDatabaseMode()` 30+ times per admin page load. While `isDatabaseMode()` itself is cheap, the file-mode path performs `Promise.all([import('./fileStore'), import('./fileCollectionsStore')])` on every call. Module imports are cached by Node, but the Promise allocation and resolution is not free.

**Fix:** Cache the resolved modules in a module-level variable.

---

### 4.2 `storeShared.normalizeSettings` Uses Loose Object Spread 🟠 Medium

[normalizeSettings](file:///d:/web/react-cms/src/features/cms/storeShared.ts#L57-L132) does:

```typescript
const next: SiteSettings = {
  ...defaults,
  ...source,  // ← Spreads ALL unknown properties from untrusted input
  general: { ...defaults.general, ...general },
  ...
} as SiteSettings;
```

The `...source` spread copies **any arbitrary keys** from the input into the settings object. This could inject unexpected properties that downstream code might interpret incorrectly, or bloat the JSONB payload in the database.

---

### 4.3 Revision Deduplication Uses Full JSON Serialization 🟠 Medium

[captureContentRevision](file:///d:/web/react-cms/src/features/cms/contentRevisions.ts#L284-L288) compares revisions by serializing the entire payload:

```typescript
if (latest && payloadSignature(latest.payload) === payloadSignature(input.payload)) {
  return toSummary(latest);
}

function payloadSignature(payload: CmsRevisionPayload) {
  return JSON.stringify(payload);  // Full-site payloads can be 100KB+
}
```

For `full_site` revisions, this serializes the **entire CMS content** twice (latest + incoming) on every save. This is O(n) in content size and generates significant GC pressure.

**Fix:** Use a hash (SHA-256) of the serialized content instead of comparing raw strings.

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

### 5.3 `tsconfig.json` Includes Too Broadly 🟢 Low

```json
"include": ["**/*.ts", "**/*.tsx", ...]
```

This includes `scripts/*.ts` (CLI tools with `tsx` shims, `process.exit()` calls, etc.) in the main TypeScript project. These scripts use different runtime assumptions than the Next.js app.

---

## 6. Dead Code & Tech Debt

### 6.1 Legacy Aliases on `SiteSettings` 🟠 Medium

[types.ts L396-L401](file:///d:/web/react-cms/src/features/cms/types.ts#L396-L401):

```typescript
export type SiteSettings = {
  ...
  // Legacy aliases retained for backward compatibility in existing renderers.
  siteName: string;
  baseUrl: string;
  organizationName: string;
  organizationLogo: string;
  defaultOgImage: string;
};
```

These duplicate `general.siteName`, `general.baseUrl`, and `seo.defaultOgImage`. They're synced in `normalizeSettings` and `validateSiteSettings`, creating **two sources of truth** that must stay in sync. Any code reading `settings.siteName` vs `settings.general.siteName` can get different values if normalization is bypassed.

---

### 6.2 Duplicate `isObject` / `extractErrorCode` / `nowIso` Definitions 🟢 Low

- `isObject` is defined in both [validators.ts L45](file:///d:/web/react-cms/src/features/cms/validators.ts#L45) and [storeShared.ts L13](file:///d:/web/react-cms/src/features/cms/storeShared.ts#L13)
- `extractErrorCode` is defined in both [adminAuth.ts L81](file:///d:/web/react-cms/src/features/cms/adminAuth.ts#L81) and [contentRevisions.ts L45](file:///d:/web/react-cms/src/features/cms/contentRevisions.ts#L45)
- `nowIso` is defined in both [storeShared.ts L11](file:///d:/web/react-cms/src/features/cms/storeShared.ts#L11) and [importExport.ts L55](file:///d:/web/react-cms/src/features/cms/importExport.ts#L55)

---

### 6.3 `branding.headerLogo` / `branding.footerLogo` Asset Resolution Missing 🟢 Low

[resolveSettingsAssetUrls](file:///d:/web/react-cms/src/features/cms/assetUrls.ts#L85-L95) resolves `organizationLogo` and `defaultOgImage`, but does **not** resolve `branding.headerLogo`, `branding.footerLogo`, or `branding.siteIcon`. If these are stored as relative `media/` paths, they won't get rewritten to the CDN base URL.

---

## 7. Performance Concerns

### 7.1 File Store Reads Entire Content on Every Operation 🟡 High

Every single operation in `fileStore.ts` — even reading a single blog post by ID — parses the **entire** `content.json` file:

```typescript
export async function getBlogPostById(id: string) {
  const content = await readContent();  // Parses ALL content
  return content.blogPosts.find((post) => post.id === id) ?? null;
}
```

As content grows, this becomes O(n) for every read operation.

---

### 7.2 `revalidatePublicCmsCache` Revalidates Everything 🟠 Medium

[revalidatePublicCmsCache](file:///d:/web/react-cms/src/features/cms/publicCache.ts#L167-L181) invalidates **all** cache tags and **all** path patterns on every single admin mutation — even if only a blog post title changed. This forces re-rendering of the entire site on every save.

---

### 7.3 No Session Cleanup / Expiry Sweep 🟠 Medium

`admin_sessions`, `admin_login_lockouts`, `request_rate_limits`, `analytics_events`, and `page_404_log` tables grow unboundedly. There is no cleanup mechanism, scheduled purge, or TTL-based deletion for expired records.

---

## Summary Table

| # | Finding | Severity | Category |
|---|---------|----------|----------|
| 1.1 | Admin token timing-unsafe comparison | 🔴 Critical | Security |
| 1.2 | Double `getAdminSession` call + TOCTOU | 🟡 High | Security |
| 1.3 | Plaintext password comparison in fallback | 🟡 High | Security |
| 1.4 | CSRF + `unsafe-inline` script-src | 🟠 Medium | Security |
| 1.5 | Rate limiter spoofable via headers | 🟠 Medium | Security |
| 1.6 | Media upload bypasses type check | 🟠 Medium | Security |
| 2.1 | File store has no write locking | 🔴 Critical | Data Integrity |
| 2.2 | DB rate limiter race condition | 🟡 High | Data Integrity |
| 2.3 | Bootstrap promise error handling | 🟡 High | Data Integrity |
| 2.4 | Unknown roles default to super_admin | 🟡 High | Data Integrity |
| 3.1 | Scheduled content never triggers | 🔴 Critical | Functional |
| 3.2 | Blog validator accepts empty required fields | 🟠 Medium | Functional |
| 3.3 | Tags used as categories, real Categories unused | 🟠 Medium | Functional |
| 3.4 | `postCategoriesTable` missing primary key | 🟠 Medium | Functional |
| 3.5 | Sitemap generates localhost URLs | 🟠 Medium | Functional |
| 3.6 | Schedule editor timezone bug | 🟠 Medium | Functional |
| 4.1 | Store modules resolved on every call | 🟡 High | Architecture |
| 4.2 | Settings normalization spreads unknown keys | 🟠 Medium | Architecture |
| 4.3 | Revision dedup via full JSON comparison | 🟠 Medium | Architecture |
| 4.4 | 64KB hardcoded default content | 🟢 Low | Architecture |
| 5.1 | `next lint` deprecated | 🟠 Medium | Tooling |
| 5.2 | Bundle analyzer version mismatch | 🟢 Low | Tooling |
| 5.3 | tsconfig includes scripts | 🟢 Low | Tooling |
| 6.1 | Legacy settings aliases | 🟠 Medium | Tech Debt |
| 6.2 | Duplicate utility functions | 🟢 Low | Tech Debt |
| 6.3 | Branding assets not URL-resolved | 🟢 Low | Tech Debt |
| 7.1 | File store full-parse on every read | 🟡 High | Performance |
| 7.2 | Cache invalidation is all-or-nothing | 🟠 Medium | Performance |
| 7.3 | No session/rate-limit table cleanup | 🟠 Medium | Performance |
