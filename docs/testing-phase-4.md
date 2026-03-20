# Current Admin Regression Checklist

This file replaces the older phase-only checklist and reflects the current admin surface.

## Automated Validation

Run:

```bash
npm run check
npm run build
```

Expected:
- ESLint passes
- TypeScript passes
- Vitest passes
- production build succeeds

## Manual Validation: Core Admin

1. Login at `/admin/login` with `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD`.
2. Verify sidebar modules:
   - Dashboard
   - Posts
   - Pages
   - Portfolio
   - Settings
   - Contact Leads
   - Categories
   - Media Library
   - Team
   - Analytics
   - Audit Log
3. Confirm Dashboard shows:
   - first-run checklist
   - scheduled content
   - analytics snapshot
   - content health
   - recent audit activity

## Manual Validation: Content Editors

1. Edit one page:
   - change copy
   - use preview mode
   - save
   - confirm revision entry exists
2. Edit one post:
   - change content and SEO
   - test category selection
   - schedule publish or unpublish
   - confirm revision entry exists
3. Edit one portfolio project:
   - update cover image and gallery
   - test preview mode
   - test schedule fields
   - confirm revision entry exists
4. Test restore from revision history for at least one content type.

## Manual Validation: Media

1. Upload an image directly from a page/post/portfolio form field.
2. Confirm the uploaded asset auto-selects back into the field.
3. Open `/admin/media` and verify:
   - alt text requirement
   - duplicate detection
   - replace-in-place
   - usage references
4. Attempt to delete an asset that is still in use and confirm delete is blocked.

## Manual Validation: Lists and Bulk Actions

1. Posts table:
   - search
   - status filter
   - category filter
   - bulk publish / move-to-draft
2. Portfolio table:
   - search
   - status filter
   - tag filter
   - featured filter
   - bulk publish / move-to-draft
   - bulk feature / unfeature

## Manual Validation: Settings

1. Save one value in each tab:
   - General
   - Writing
   - Reading
   - Discussion
   - Media
   - Permalinks
   - Meta Tags
   - Sitemaps
2. Reload and confirm values persist.
3. Confirm settings revisions can be restored.

## Manual Validation: Roles and Team

1. Open `/admin/team`.
2. Create a non-super-admin user.
3. Edit display name, role, and password.
4. Confirm self-delete is blocked.
5. Confirm removing the last `super_admin` is blocked.

## Manual Validation: Analytics and Audit

1. Visit public pages and click tracked CTAs.
2. Submit the contact form.
3. Open `/admin/analytics` and confirm:
   - page views
   - CTA clicks
   - contact leads
   - top conversions
   - referrers
   - campaign fields from UTM traffic if used
4. Open `/admin/audit` and confirm recent actions are recorded.

## SEO and Runtime Checks

1. Verify page source for:
   - title and description
   - canonical
   - Open Graph and Twitter tags
2. Verify:
   - `/sitemap.xml`
   - `/robots.txt`
   - JSON-LD output
3. If using draft preview, verify preview banner appears and can be exited.

## Responsive Checks

Validate:
- mobile `375px`
- tablet `768px`
- desktop `1440px`

Focus on:
- admin table overflow
- editor action toolbar
- media browser
- settings tabs
- team management table
