# Security Hardening Notes

## Implemented

- Cookie-based admin sessions with `httpOnly`, `sameSite=lax`, and `secure` in production
- Legacy `x-admin-token` fallback disabled in production
- Same-origin enforcement for all state-changing cookie-authenticated admin requests
- Same-origin enforcement for public contact submissions
- In-process rate limiting for:
  - admin login
  - contact form submissions
- Site-wide security headers via `middleware.ts`:
  - Content-Security-Policy
  - Strict-Transport-Security (production)
  - X-Frame-Options
  - X-Content-Type-Options
  - Referrer-Policy
  - Permissions-Policy
  - Cross-Origin-Opener-Policy
  - Cross-Origin-Resource-Policy
- `no-store` cache policy on admin pages and admin/contact API responses
- JSON-LD serialization hardened to escape script-breaking characters
- CMS URL validation strips unsafe `javascript:`-style URLs from:
  - CTA links
  - media/image URLs
  - canonical URLs
  - social image URLs
  - base URLs

## Current baseline result

- No direct `dangerouslySetInnerHTML` usage remains except JSON-LD, which is now escaped safely
- No raw SQL string concatenation found in app code; DB access is via Drizzle
- No browser storage-based admin session handling in production path
- Admin shell remains isolated from the public shell

## Still recommended before public launch

- Add upstream rate limiting/WAF/CDN at the hosting or DNS layer for real DDoS mitigation
- Rotate bootstrap admin credentials after first production login
- Restrict Supabase database user permissions to app-only needs
- Add server-side audit logging for admin mutations if you need forensic history
- Add malware/spam validation if you later enable file uploads or public comments
- Review all production env vars to ensure no test credentials remain

## Operational note

Application-level rate limiting helps with abuse and brute force. It is not full DDoS protection.
