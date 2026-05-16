# Security Work Completed

Updated: 2026-05-15

- Analytics abuse controls are in place: public page-view and event endpoints now have rate limiting and server-side string length caps; custom analytics events also require same-origin requests.
- Rate-limit identity now uses `TRUSTED_PROXY_COUNT` so `X-Forwarded-For` is not blindly trusted.
- Media upload validation now rejects unsupported or missing MIME types, rejects SVG, enforces size server-side, and checks file magic bytes.
- Admin authorization is tighter: permission checks reuse the resolved session, contact submissions require `content:read`, and status changes require `content:edit`.
- Admin auth hardening is done: production legacy header auth is disabled, fallback password comparison is timing-safe, optional `PASSWORD_PEPPER` is supported, and old hashes upgrade after login.
- Session hygiene is done: fallback sessions warn and cap memory use, and admins can use **Sign out all devices** from Sessions.
- Security headers and request hardening are done: legacy `X-XSS-Protection` is set, CSRF origin/referer logic is documented in code, and webhook delivery avoids logging request headers or tokens.
