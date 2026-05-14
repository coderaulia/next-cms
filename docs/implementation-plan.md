# Security Implementation Plan

Audit date: 2026-05-13  
Scope: Next.js 16.2 App Router CMS — all API routes, forms, auth, file upload, headers

---

## Severity Legend

| Level | Meaning |
|-------|---------|
| **Critical** | Exploitable now, fix before next deploy |
| **High** | Significant abuse vector, fix this sprint |
| **Medium** | Best-practice gap, fix next sprint |
| **Low** | Hardening / hygiene, backlog |

---

## Critical

### C-1 — Analytics endpoints completely unprotected

**Files:** `src/app/api/analytics/page-view/route.ts`, `src/app/api/analytics/event/route.ts`  
**Issue:** Both POST endpoints have zero authentication, zero CSRF protection, zero rate limiting. Any external actor can flood analytics DB with fake data or mount a DoS.

**Fix:**
- Add `assertRateLimit(request, 'analytics', 60, 60_000)` (60 req/min per IP) as minimum
- For page-view: acceptable as a public beacon, but add rate limiting + input length caps
- For event endpoint: add `assertAdminRequest` or restrict to internal-origin only via CSRF token check

```ts
// page-view/route.ts — add at top of POST handler
const rateLimitFailure = await assertRateLimit(request, 'analytics-pv', 60, 60_000);
if (rateLimitFailure) return rateLimitFailure;
```

**Tasks:**
- [ ] Add rate limiting to both analytics routes
- [ ] Add max-length validation on all string fields (visitorId, sessionId, referrer, utm* — cap at 512 chars)
- [ ] Consider moving `/api/analytics/event` behind admin auth if only admin dashboards call it

---

### C-2 — X-Forwarded-For spoofing bypasses all IP-based controls

**File:** `src/services/requestSecurity.ts:75`  
**Issue:** `getClientIdentifier()` blindly trusts the `X-Forwarded-For` header. Any attacker can set `X-Forwarded-For: 1.2.3.4` to impersonate a different IP, defeating:
- Contact form rate limit (10/min)
- Login lockout (5 attempts / 15-min window)
- All other `assertRateLimit` calls

```ts
// CURRENT — spoofable
const forwardedFor = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '';
```

**Fix:**
- Read `TRUSTED_PROXY_COUNT` from env (default 0 for direct deploys, 1 if behind Vercel/Cloudflare/nginx)
- Take the Nth-from-right IP in the `X-Forwarded-For` chain based on trusted proxy count
- Fall back to a stable identifier (e.g., CSRF client ID) when no reliable IP is available

```ts
// env.ts — add
trustedProxyCount: z.coerce.number().default(0).parse(process.env.TRUSTED_PROXY_COUNT),

// requestSecurity.ts — replace getClientIdentifier
function getClientIp(request: Request): string {
  const count = env.trustedProxyCount;
  if (count === 0) {
    // Direct connection — ignore X-Forwarded-For entirely
    return request.headers.get('x-real-ip') || 'unknown';
  }
  const chain = (request.headers.get('x-forwarded-for') || '').split(',').map(s => s.trim());
  // Rightmost `count` entries are added by trusted proxies
  const ip = chain[chain.length - count];
  return ip || 'unknown';
}
```

**Tasks:**
- [ ] Add `TRUSTED_PROXY_COUNT` env var (document in `.env.example`)
- [ ] Rewrite `getClientIdentifier()` to use trusted-proxy-aware IP extraction
- [ ] Update login lockout in `adminAuth.ts` to use same function
- [ ] Test with `TRUSTED_PROXY_COUNT=0` (direct) and `=1` (behind proxy)

---

## High

### H-1 — File upload validates MIME type only (client-supplied)

**File:** `src/services/mediaStorage.ts:62-66`  
**Issue:** `isAllowedFile()` checks `file.type` which is set by the client. Attacker can upload `malware.html` with `Content-Type: image/jpeg`. Also, SVG is allowed — SVGs can contain `<script>` tags (stored XSS if served directly).

```ts
// CURRENT — trusts client MIME
return ALLOWED_MIME_PREFIXES.some((prefix) => mimeType.startsWith(prefix));
```

**Fix:**
- Read first 12 bytes of file buffer and check magic bytes
- Block SVG uploads or run them through a sanitizer (DOMPurify server-side or strip `<script>`)
- Add max file size enforcement (already partially present — verify it's enforced server-side)

```ts
const MAGIC_BYTES: Record<string, Uint8Array[]> = {
  'image/jpeg': [new Uint8Array([0xFF, 0xD8, 0xFF])],
  'image/png':  [new Uint8Array([0x89, 0x50, 0x4E, 0x47])],
  'image/gif':  [new Uint8Array([0x47, 0x49, 0x46])],
  'image/webp': [new Uint8Array([0x52, 0x49, 0x46, 0x46])],
  'video/mp4':  [new Uint8Array([0x00, 0x00, 0x00, 0x18, 0x66, 0x74, 0x79, 0x70])],
};

async function validateFileMagicBytes(file: File, claimedMime: string): Promise<boolean> {
  const sigs = MAGIC_BYTES[claimedMime];
  if (!sigs) return false; // unknown MIME not in allowlist
  const buf = new Uint8Array(await file.slice(0, 12).arrayBuffer());
  return sigs.some(sig => sig.every((b, i) => buf[i] === b));
}
```

**Tasks:**
- [ ] Implement `validateFileMagicBytes()` in `mediaStorage.ts`
- [ ] Block SVG uploads entirely (remove `image/svg+xml` from allowed MIME if present) or add sanitization step
- [ ] Verify max file size is checked server-side (not just client-side)
- [ ] Add file extension allowlist check as secondary guard

---

### H-2 — Analytics string fields have no length limits

**Files:** `src/app/api/analytics/page-view/route.ts`, `src/app/api/analytics/event/route.ts`  
**Issue:** `visitorId`, `sessionId`, `referrer`, `utmSource`, `utmMedium`, `utmCampaign` are trimmed but not length-capped. Attacker can send megabyte-sized strings → DB bloat or query slowdowns.

**Fix:** Cap all analytics string inputs at reasonable lengths before touching the DB:

```ts
const MAX = { id: 128, path: 512, ref: 1024, utm: 256 };

function truncate(s: unknown, max: number): string {
  return String(s ?? '').trim().slice(0, max);
}

const visitorId  = truncate(body?.visitorId,  MAX.id);
const sessionId  = truncate(body?.sessionId,  MAX.id);
const referrer   = truncate(body?.referrer,   MAX.ref);
const utmSource  = truncate(body?.utmSource,  MAX.utm);
```

**Tasks:**
- [ ] Add `truncate()` helper to both analytics routes
- [ ] Apply length caps to all string fields before DB insert

---

## Medium

### M-1 — Missing granular permission check on contact submissions

**File:** `src/app/api/admin/contact-submissions/route.ts:6-14`  
**Issue:** Uses `assertAdminRequest()` (auth only) instead of `assertAdminPermission(session, 'content:read')`. Any authenticated user regardless of role can read all contact submissions.

**Fix:**

```ts
// Replace
const auth = await assertAdminRequest(request);
if (auth instanceof NextResponse) return auth;

// With
const session = await getAdminSession(request);
if (!session) return unauthorized();
const permError = assertAdminPermission(session, 'content:read');
if (permError) return permError;
```

**Tasks:**
- [ ] Audit all admin API routes — list which use `assertAdminRequest` vs `assertAdminPermission`
- [ ] Replace `assertAdminRequest` with role-gated `assertAdminPermission` calls where appropriate
- [ ] Add `content:read` permission to contact-submissions GET handler

---

### M-2 — Password hashing has no application-level pepper

**File:** `src/features/cms/adminAuth.ts:153-167`  
**Issue:** `hashAdminPassword()` uses scrypt with a random salt only. If the DB is compromised, attackers get unsalted hashes and can crack weak passwords offline with no additional secrets.

**Fix:** XOR or HMAC the derived key with a server-side pepper from env:

```ts
// env.ts — add
passwordPepper: z.string().min(32).parse(process.env.PASSWORD_PEPPER),

// adminAuth.ts
const pepper = Buffer.from(env.passwordPepper, 'hex');
const derived = (await scrypt(password, salt, 64)) as Buffer;
const peppered = Buffer.from(derived.map((b, i) => b ^ pepper[i % pepper.length]));
return `${salt}:${peppered.toString('hex')}`;
```

**Note:** Changing this requires a one-time migration: force all users to reset passwords, or verify old format and re-hash on next login.

**Tasks:**
- [ ] Add `PASSWORD_PEPPER` env var (32+ byte hex, document in `.env.example`)
- [ ] Update `hashAdminPassword()` and `verifyAdminPassword()` to apply pepper
- [ ] Decide migration strategy: force password reset vs transparent re-hash on login

---

### M-3 — Fallback in-memory session store is undocumented and volatile

**File:** `src/features/cms/adminAuth.ts:252-272`  
**Issue:** When DB is unavailable, sessions fall back to `global.__cmsAdminFallbackSessions` (plaintext in-memory Map). Sessions are lost on restart; can't be revoked; not shared across instances.

**Fix:**
- Add explicit warning log when fallback store activates
- Cap fallback store size (prevent unbounded growth)
- Document in runbook that DB downtime means sessions don't persist

```ts
if (!dbAvailable) {
  console.error('[auth] WARN: DB unavailable — using volatile in-memory session store. Sessions will not persist across restarts.');
  // cap at 500 sessions to prevent memory growth
  if (getFallbackSessionStore().size > 500) {
    const oldest = getFallbackSessionStore().keys().next().value;
    if (oldest) getFallbackSessionStore().delete(oldest);
  }
}
```

**Tasks:**
- [ ] Add warning log when fallback activates
- [ ] Cap fallback store at N entries (evict oldest)
- [ ] Add note to `CLAUDE.md` / ops runbook

---

### M-4 — No multi-device session invalidation on logout

**File:** `src/features/cms/adminAuth.ts:274-290`  
**Issue:** Logout deletes only the current session token. Other active sessions for the same user remain valid. No "logout all devices" capability.

**Fix:** Add `logoutAllSessions(userId)` that deletes all tokens for the user from `admin_sessions` table.

```ts
export async function logoutAllSessions(userId: string) {
  await db.delete(adminSessionsTable).where(eq(adminSessionsTable.userId, userId));
}
```

Expose via `POST /api/admin/auth/logout-all`.

**Tasks:**
- [ ] Add `logoutAllSessions()` to `adminAuth.ts`
- [ ] Add `POST /api/admin/auth/logout-all` route (requires auth)
- [ ] Add "Sign out all devices" button in admin profile settings

---

## Low

### L-1 — CSRF origin-check logic undocumented

**File:** `src/services/requestSecurity.ts:91-105`  
**Issue:** The OR logic `(origin matches) || (referer matches)` is correct but non-obvious. A developer could misread it and "simplify" it to `&&`, breaking CSRF protection.

**Tasks:**
- [ ] Add a single-line comment explaining the OR logic intent

---

### L-2 — X-XSS-Protection header not set

**File:** `middleware.ts` (security headers block)  
**Issue:** Modern CSP handles XSS but legacy browsers benefit from `X-XSS-Protection: 1; mode=block`.

**Tasks:**
- [ ] Add `X-XSS-Protection: 1; mode=block` to security headers in `middleware.ts`

---

### L-3 — Webhook token logged on failure

**File:** `src/services/contactNotifications.ts:34-36`  
**Issue:** If the webhook request fails and the error is logged with request details, the Bearer token may appear in logs.

**Tasks:**
- [ ] Ensure catch block logs only the error message, not request headers
- [ ] Scrub Authorization header from any error objects before logging

---

## Forms Inventory

All frontend forms are properly wired. No orphaned forms detected.

| Form | Endpoint | Auth | CSRF | Rate-limited |
|------|----------|------|------|-------------|
| ContactBriefForm | `POST /api/contact` | None (public) | ✅ | ✅ 10/min |
| ContactPageView | `POST /api/contact` | None (public) | ✅ | ✅ 10/min |
| AdminLoginForm | `POST /api/admin/auth` | None (public) | ✅ | ✅ lockout |
| BlogEditorForm | `PUT /api/admin/blog/[id]` | ✅ | ✅ | — |
| PageEditorForm | `PUT /api/admin/pages/[id]` | ✅ | ✅ | — |
| PortfolioEditorForm | `PUT /api/admin/portfolio/[id]` | ✅ | ✅ | — |
| OnboardingSteps | `POST /api/admin/settings` | ✅ | ✅ | — |

**Note:** Contact form rate limiting is bypassable via X-Forwarded-For spoofing — fix tracked in C-2.

---

## API Endpoints — Auth Coverage

| Route | Method | Auth | CSRF | Notes |
|-------|--------|------|------|-------|
| `/api/contact` | POST | None | ✅ | Public — correct |
| `/api/analytics/page-view` | POST | ❌ | ❌ | **Fix C-1** |
| `/api/analytics/event` | POST | ❌ | ❌ | **Fix C-1** |
| `/api/admin/auth` | POST | None | ✅ | Login — correct |
| `/api/admin/auth` | DELETE | ✅ | ✅ | Logout |
| `/api/admin/blog/*` | ALL | ✅ | ✅ | — |
| `/api/admin/pages/*` | ALL | ✅ | ✅ | — |
| `/api/admin/portfolio/*` | ALL | ✅ | ✅ | — |
| `/api/admin/contact-submissions` | GET | ✅ | — | Missing role check — **Fix M-1** |
| `/api/admin/settings` | ALL | ✅ | ✅ | — |
| `/api/admin/media/*` | ALL | ✅ | ✅ | File type — **Fix H-1** |
| `/api/admin/team/*` | ALL | ✅ | ✅ | — |

---

## Execution Order

| Priority | Item | Effort | Impact |
|----------|------|--------|--------|
| 1 | C-2 — IP spoofing fix | M | Closes rate-limit bypass on all endpoints |
| 2 | C-1 — Analytics rate limiting + auth | S | Closes open abuse vector |
| 3 | H-1 — File upload magic bytes | M | Prevents malicious upload bypass |
| 4 | H-2 — Analytics input length caps | S | Prevents DB bloat |
| 5 | M-1 — Granular permissions audit | S | Enforces least-privilege |
| 6 | M-2 — Password pepper | M | DB breach mitigation |
| 7 | M-3 — Fallback session safeguards | S | Operational resilience |
| 8 | M-4 — Multi-device logout | M | Session hygiene |
| 9 | L-1/L-2/L-3 — Low items | S | Hardening |

Effort: S = < 2h, M = 2–4h
