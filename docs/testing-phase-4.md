# Phase 4 Testing Checklist

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
- Production build succeeds

## Manual Validation: Admin Flows

1. Login at `/admin` with `CMS_ADMIN_TOKEN`.
2. Verify admin sidebar:
   - working modules: Dashboard, Posts, Pages
   - planned modules visible as disabled placeholders
3. Edit each landing page:
   - change section heading/body
   - for homepage, add/reorder/toggle typed blocks and update payload fields
   - for other pages, switch layout (`stacked`/`split`) and adjust content
   - save and confirm public page updates
4. Create a new blog draft:
   - add title/excerpt/content/SEO fields
   - save and publish
5. Validate posts table filters:
   - search by title/author
   - status filter
   - category filter
   - date sort + pagination with URL query sync
6. Confirm published post appears on `/blog`.
7. Unpublish post and confirm it disappears from public blog list/detail.

## Manual Validation: SEO

1. Verify page source for:
   - title/meta description
   - canonical
   - Open Graph and Twitter tags
2. Verify `/sitemap.xml` contains all published pages/posts only.
3. Verify `/robots.txt` is accessible and references sitemap.
4. Verify JSON-LD:
   - Organization + WebSite on public pages
   - BlogPosting on blog detail pages

## Responsive Checks

Validate layout on:
- Mobile width (375px)
- Tablet width (768px)
- Desktop width (1440px)

Focus on:
- navigation wrapping behavior
- homepage block layout stacking on mobile
- form usability in admin pages
