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

1. Login at `/admin/login` with `CMS_ADMIN_TOKEN`.
2. Verify admin sidebar fills full viewport height and anchors footer actions at bottom.
3. Verify sidebar modules:
- Dashboard, Posts, Pages, Settings
- Settings shortcuts: Categories, Media Library, Comments, Permalinks, Meta Tags, Sitemaps
4. Edit each landing page:
- change section heading/body
- for homepage, add/reorder/toggle typed blocks and update payload fields
- for non-home pages, switch layout (`stacked`/`split`) and adjust content
- save and confirm public page updates
5. Create a new blog draft:
- add title/excerpt/content/SEO fields
- save and publish
6. Validate posts table filters:
- search by title/author
- status filter
- category filter
- date sort + pagination with URL query sync
7. Validate Website Settings save flow across tabs:
- General/Writing/Reading/Discussion/Media/Permalinks/Meta Tags/Sitemaps
- reload page and confirm persisted values
8. Confirm published post appears on `/blog`.
9. Unpublish post and confirm it disappears from public blog list/detail.

## Manual Validation: SEO

1. Verify page source for:
- title/meta description
- canonical
- Open Graph and Twitter tags
2. Verify `/sitemap.xml` behavior:
- reflects sitemap enabled/disabled
- reflects include pages/posts toggles
3. Verify `/robots.txt` behavior:
- references sitemap when enabled
- returns blocking rule when indexing is discouraged
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
- admin sidebar height and footer placement
- form usability in admin pages
