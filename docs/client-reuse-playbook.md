# Client Reuse Playbook

This guide explains how to reuse this CMS for a new client, new industry, and new design direction while keeping the same dynamic admin workflow.

## 1) Start a New Client Implementation

1. Create a new branch for the client project.
2. Install and run:
```bash
npm install
npm run dev
```
3. Set environment values in `.env.local`:
- `NEXT_PUBLIC_SITE_URL`
- `CMS_ADMIN_TOKEN`
- Optional organization values:
  - `CMS_ORG_NAME`
  - `CMS_ORG_LOGO`

## 2) Choose Content Storage

Current default is file storage (`data/content.json`).

Recommended for production clients:
1. Move to Neon PostgreSQL.
2. Keep the same CMS payload shapes (`settings`, `pages`, `blogPosts`) so UI/admin stays compatible.
3. Use JSONB for flexible fields (`seo`, `sections`, `homeBlocks`).

Until Neon migration is complete, keep file storage for local/staging.

## 3) Define Client Content Model

For each new client:
1. List required public pages (example: `home`, `about`, `service`, `contact`, `partnership`, service detail pages).
2. Add new page IDs in:
- `src/features/cms/types.ts` (`PageId`)
- `src/features/cms/validators.ts` (`PAGE_IDS`)
3. Add page seeds in:
- `src/features/cms/defaultContent.ts`
4. Ensure initial runtime content includes those pages:
- `data/content.json` (or seed/migration script if DB-backed)

Rule: every public page must be represented in CMS and editable in Admin.

## 4) Wire Dynamic Rendering

1. Add/adjust page view components in `src/components/pages/*`.
2. Map page IDs to renderers in:
- `src/app/[slug]/page.tsx`
3. Ensure `seo.slug` is unique and routable.
4. Update admin pages ordering in:
- `src/app/api/admin/pages/route.ts`

## 5) Redesign UI (Without Breaking CMS)

Use this approach when adapting to a new Figma/screenshot style:

1. Keep data contracts stable.
- Do not remove CMS fields unless all consumers are updated.

2. Replace structure/classes inside view components only.
- Home typed blocks:
  - `src/components/home/blocks/*`
- Non-home page views:
  - `src/components/pages/*`

3. Centralize visual system:
- `src/app/globals.css` (tokens, shared utility classes)
- `tailwind.config.mjs` (theme colors, fonts, shadows)

4. Keep components dynamic.
- Text, links, badges, lists, and CTA labels should come from CMS fields.
- Hardcoded fallback values are allowed only as safety defaults.

## 6) Header/Footer and Admin Separation

Public shell and admin shell must stay separate:

1. Public pages:
- `SiteHeader` + `SiteFooter`

2. Admin pages:
- No public navbar/footer
- Dedicated admin UI only
- Admin login page: `/admin/login`

Current shell logic:
- `src/components/AppShell.tsx`
- `src/app/layout.tsx`

## 7) Admin Adaptation for New Client

When page types change:

1. Make sure page entries appear in Admin Pages list.
2. Verify `PageEditorForm` can edit all required section fields.
3. If new structured block types are needed, extend:
- `HomeBlockType` and block interfaces
- Validation (`validators.ts`)
- Home block renderer + admin editor controls

Also keep Website Settings aligned with client needs:
- General, Writing, Reading, Discussion, Media, Permalinks, Meta Tags, Sitemaps
- Ensure runtime behavior respects settings in:
  - `src/features/cms/seo.ts`
  - `src/app/robots.ts`
  - `src/app/sitemap.ts`

## 8) SEO and Launch Requirements

Before launch:

1. Validate each page/post has:
- `metaTitle`
- `metaDescription`
- slug
- canonical (if needed)
- social image

2. Verify:
- `/sitemap.xml`
- `/robots.txt`
- JSON-LD output

3. Run quality gates:
```bash
npm run check
npm run build
```

## 9) New Client Delivery Checklist

1. Branding applied (logo, fonts, colors).
2. All required pages editable in admin.
3. Blog workflow tested (draft/publish/unpublish).
4. Website Settings configured for target domain/timezone/indexing behavior.
5. Public responsive checks (mobile/tablet/desktop).
6. SEO sanity checks complete.
7. Admin token rotated and documented for client.

## 10) Recommended Workflow Per Client

1. Implement schema/pages first.
2. Connect admin editability.
3. Implement design fidelity pass.
4. Run QA and SEO checks.
5. Deploy to staging.
6. Client UAT.
7. Production release.
