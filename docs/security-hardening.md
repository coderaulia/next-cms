# Security Hardening Notes

## Implemented

- Cookie-based admin sessions with `httpOnly`, `sameSite=lax`, and `secure` in production
- Legacy `x-admin-token` fallback disabled in production
- Same-origin enforcement for state-changing admin requests
- CSRF token validation for cookie-authenticated admin mutations
- Same-origin enforcement for public contact submissions
- Database-backed rate limiting when `DATABASE_URL` is available, with in-memory fallback if the database is unavailable
- Admin login lockout protection
- Trusted-proxy-aware client IP extraction for rate limits and audit logs
- Versioned admin password hashes with optional application-level password pepper
- Backward-compatible verification for legacy admin password hashes
- Full account session invalidation through "Sign out all devices"
- Server-side audit logging for admin mutations
- Role-based permissions for `super_admin`, `admin`, `editor`, and `analyst`
- Site-wide security headers via `middleware.ts`
- Upload MIME allowlist plus server-side magic-byte checks; SVG uploads are rejected
- File-mode content/category/media mutations use a lock-backed read-modify-write path to reduce local development races
- `no-store` cache policy on sensitive admin/contact responses
- JSON-LD serialization hardened to escape script-breaking characters
- CMS URL validation strips unsafe `javascript:`-style URLs from CTA, canonical, image, and base URLs
- Media deletion protection when an asset is still referenced in content

## Current Baseline Result

- No raw SQL string concatenation in app code; DB access goes through Drizzle
- No browser-storage admin sessions in the production path
- Admin shell remains isolated from the public shell
- Audit trails exist for content, settings, media, auth, and team mutations

## Still Recommended Before Public Launch

- Add upstream WAF/CDN/rate limiting at the hosting or DNS layer
- Rotate bootstrap admin credentials after first production login
- Restrict database and storage credentials to least privilege
- Add monitoring and alerting for production failures
- Add backup/export procedures for CMS content and media references
- Review production env vars for placeholder values and test credentials
- Use database mode and managed object storage for all client production deployments
- Monitor analytics table growth; dashboard summaries are capped to keep admin views responsive

## Operational Note

Application-level protections reduce abuse and brute-force risk. They are not a substitute for upstream network-layer protection.
