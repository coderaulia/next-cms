# Production Audit Report

Date: 2026-05-22

## Executive Summary

This project is closer to client deployment after the first critical/high pass. The known high-severity Next.js advisories, red local gates, password-pepper mismatch, file-mode collection write race, and unbounded analytics dashboard read have been addressed. Remaining production work is mostly operational or architectural: nonce-based CSP keeps public pages dynamic, large content catalogs still need SQL-level query optimization, and client launches still need backups, monitoring, and edge controls.

## Critical / Release Blocking

1. **Resolved: known high-severity Next.js production advisories**
   - Fix: upgraded `next`, `@next/bundle-analyzer`, `eslint-config-next`, and `@next/eslint-plugin-next` to `16.2.6`.
   - Verification: `npm audit --omit=dev --json` now reports no critical or high production vulnerabilities. A moderate PostCSS advisory remains through Next's internal dependency.

2. **Resolved: release gate failures**
   - Fix: removed the unused admin data import/argument, switched internal legal links to `next/link`, aligned client IP behavior with the tests, and hardened the settings fetch guard in `BlogEditorForm`.
   - Verification: `npm run check` passes.

3. **Resolved: password pepper implementation/documentation mismatch**
   - Fix: new admin password hashes are versioned as `v2:` and derive a pepper key from any long random string. Legacy hashes remain readable, including prior hex-pepper hashes.
   - Documentation: `.env.example`, `README.md`, `docs/deployment-handoff.md`, and `docs/security-hardening.md` now describe the current expectation.

## High Priority

4. **Almost all public pages are dynamic**
   - Evidence: `src/app/layout.tsx:88` calls `headers()` to read the nonce, and `middleware.ts:12` / `middleware.ts:48` generate a nonce-based CSP per request.
   - Evidence: `npm run build` marks `/`, `/[slug]`, `/blog`, `/blog/[slug]`, `/portfolio`, and most public routes as dynamic (`ƒ`).
   - Recommendation: Keep the CSP, but decide whether client sites need CDN-static pages. If yes, move nonce handling to a narrower surface or use a static-compatible CSP strategy for public pages.

5. **Database queries load whole collections and filter in memory**
   - Evidence: `src/features/cms/dbStore.ts:675` and `src/features/cms/dbStore.ts:687` load all posts/projects; `queryBlogPosts` and `queryPortfolioProjects` filter/paginate in memory at `src/features/cms/dbStore.ts:835` and `src/features/cms/dbStore.ts:1041`.
   - Recommendation: Push filtering, sorting, pagination, and related-post queries into SQL before client deployments with large blogs or portfolios.

6. **Resolved for local file-mode collection/media mutations**
   - Fix: `fileStore` now exposes a lock-backed `updateContent` helper that reads fresh from disk inside the write lock. File-mode category and media mutations use it.
   - Remaining note: local JSON persistence is still documented as development-only for client production.

7. **Partially mitigated: analytics dashboard bottleneck**
   - Fix: analytics summaries now cap reads to the newest 20,000 rows for the requested window.
   - Remaining recommendation: add retention, bot filtering, aggregation tables/materialized views, and SQL-level summary queries before high-traffic client launches.

## Medium Priority

8. **Upload parsing still buffers multipart form data**
   - Evidence: `src/app/api/admin/media/upload/route.ts:45` calls `request.formData()` before file processing; `src/services/mediaStorage.ts:22` caps files at 10 MB and blocks SVG at `src/services/mediaStorage.ts:26`, which is good.
   - Recommendation: Keep the MIME/magic-byte checks, but enforce upload limits at the reverse proxy/platform too.

9. **Redirect management exists but does not appear wired into request handling**
   - Evidence: redirect CRUD exists in `src/app/api/admin/redirects/route.ts:43`, but repository search only finds CRUD/admin references, not runtime redirect application.
   - Recommendation: Implement runtime redirect lookup or hide the feature until it works end to end.

10. **Local file revisions are not locked**
    - Evidence: `src/features/cms/contentRevisions.ts:324` reads and writes `content-revisions.json` without the file-store lock.
    - Recommendation: Use the same lock approach as content writes or keep revisions database-only in production.

## Positive Findings

- `npm run build` succeeds on Next.js 16.2.6.
- `npm run audit:size` completes.
- Admin state-changing routes consistently go through `assertAdminRequest` / `assertAdminPermission`, which include origin and CSRF checks (`src/features/cms/adminAuth.ts:539-568`).
- Public contact submission has origin, CSRF, body-size, validation, and rate limiting (`src/app/api/contact/route.ts:16-30`).
- Media upload blocks SVG, enforces file size, MIME allowlist, and magic-byte checks (`src/services/mediaStorage.ts:22-174`).
- Public CMS cache uses tagged `unstable_cache` with a 60-second TTL for scheduled publishing (`src/features/cms/publicCache.ts:67-137`).
- Production build succeeds after current typecheck passes.

## Production Feature Gaps For Client Deployments

1. Backups and restore drills for Postgres and object storage.
2. Monitoring and alerting for uptime, API errors, DB pool saturation, upload failures, and webhook failures.
3. SQL-backed search/filtering and pagination for blog, portfolio, analytics, media, and audit logs.
4. Object storage as the only supported production media path; local disk should remain development-only.
5. Staging/preview environment with separate credentials and content.
6. Client handoff flow: rotate bootstrap admin credentials, require strong password policy, document owner recovery.
7. Redirects, scheduled publishing, and analytics should have end-to-end tests.
8. Rate limiting should be enforced at both app and edge/WAF layers.

## October 2026 Security Advisory Remediation (CVE-2026-111497 / Node2Shell & Related Flaws)

Date: 2026-10-24

### 1. Key Vulnerabilities Addressed
- **CVE-2026-111497 (High)**: Out-of-bounds write in Node.js's native Brotli decoder (`c/dec/decode.c`) leading to potential RCE when decompressing untrusted streams.
- **CVE-2026-106069 & CVE-2026-105483 (High)**: TLS certificate hostname validation bypasses via loose IP resolution and fullwidth Unicode digits.
- **CVE-2026-105482 (High)**: `dns.resolve` truncating names containing NUL (`\0`) characters.
- **Medium & Low Flaws**: Socket keep-alive processing (CVE-2026-105481), IPv4 validation, and permission model bypasses.

### 2. Remediation Implemented
1. **Node Runtime Constraints (`package.json` & `.nvmrc`)**:
   - Updated `engines.node` to `">=22.23.4 <23.0.0 || >=24.22.1 <25.0.0 || >=26.12.1"`.
   - Updated `.nvmrc` to `22.23.4`.
   - Pinned `.github/workflows/ci.yml` to resolve Node version via `.nvmrc`.
   - Removed documentation referencing Node 20.x (which is EOL and receives no official patches).
2. **Application Defense-in-Depth for Brotli Decoder RCE**:
   - `src/proxy.ts`: Added pre-routing guard rejecting incoming requests with `Content-Encoding: br` / `brotli` (HTTP 415), preventing unneeded compressed body handling.
   - `src/services/requestSecurity.ts`: Hardened `readJsonWithLimit` to reject non-identity `Content-Encoding`.
   - `src/services/contactNotifications.ts`: Explicitly configured `Accept-Encoding: gzip, deflate` on outbound webhook `fetch()` calls to prevent Node's HTTP client from requesting/handling Brotli-compressed responses from external servers.
3. **URL & NUL-Byte Sanitization**:
   - `src/proxy.ts`: Blocked requests with NUL bytes (`\0` or `%00`) in URL paths/queries (HTTP 400).
   - `src/features/cms/validators.ts`: Hardened `isSafeAbsoluteUrl` and `asSafeHref` against NUL bytes and control characters to prevent DNS truncation bypasses.
   - `src/services/contactNotifications.ts`: Added validation guarding outbound webhook URLs against NUL bytes and unsupported protocols.
4. **Dependency Vulnerability Fixes**:
   - Ran `npm audit fix` resolving 4 high vulnerabilities: updated `zod` to `>=4.6.7` (fixing GHSA-mrhx-c7xc-m3w5 DoS) and `markdown-it` to `14.3.3` (fixing GHSA-vfgh-jcmw-g37q and GHSA-gfr2-rv44-r23c). `npm audit` reports 0 vulnerabilities.

