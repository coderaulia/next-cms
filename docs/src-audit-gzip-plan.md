# Source Audit And Gzip Plan

Audit date: 2026-04-18

## Biggest `src` files

Top raw-size offenders from the current audit:

1. `src/features/cms/defaultContent.ts` at about 54 KB
2. `src/app/admin/settings/page.tsx` at about 50 KB
3. `src/app/globals.css` at about 49 KB
4. `src/features/cms/dbStore.ts` at about 39 KB
5. `src/features/bootstrap/clientStarter.ts` at about 37 KB
6. `src/components/forms/PageEditorForm.tsx` at about 33 KB
7. `src/features/cms/validators.ts` at about 26 KB
8. `src/app/admin/media/page.tsx` at about 24 KB
9. `src/components/forms/PortfolioEditorForm.tsx` at about 23 KB
10. `src/components/forms/BlogEditorForm.tsx` at about 21 KB

## What We Changed

- Added `npm run audit:src` to report `src/` file sizes with gzip estimates.
- Updated `npm run audit:size` so build output now reports both raw and gzipped sizes.
- Lazy-loaded the large admin editor forms for page, blog, and portfolio editor routes so those routes do not eagerly pull the full editor form code into the initial route chunk.

## Refactor Plan

1. Split `defaultContent.ts` into page-specific seed modules and load them through a small index file. This reduces merge friction and keeps server-only seed data isolated from unrelated CMS code.
2. Break `admin/settings/page.tsx` into tab-level client components. The `general`, `writing`, `reading`, `seo`, and `sitemap` sections are natural split points.
3. Extract reusable editor sections from `PageEditorForm.tsx`, `BlogEditorForm.tsx`, and `PortfolioEditorForm.tsx` into shared field groups. The current files are large enough that maintenance cost is now a bigger risk than byte size alone.
4. Review `globals.css` for admin-only styles that can move closer to the admin surface, and for repeated utility patterns that can become component classes or tokens.
5. Re-check bundle output after each split with `npm run build:audit` so we keep actual route payloads moving down instead of only reducing source-file length.

## Gzip Notes

`next.config.ts` already has `compress: true`, so runtime gzip response compression is enabled. The new scripts make that visible during audits by reporting gzipped sizes directly, which is the best way to verify compression impact during local performance work.
