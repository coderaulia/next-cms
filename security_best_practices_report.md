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
