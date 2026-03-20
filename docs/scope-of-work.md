# Scope of Work: Marketing CMS (React/Next.js)

Historical note:
- This is the original scoping document from the early build.
- The current repository now exceeds this baseline with portfolio management, media workflows, analytics, audit logging, revisions, team management, and Supabase-backed media support.
- Use `docs/admin-usage.md`, `docs/deployment-handoff.md`, and `docs/client-reuse-playbook.md` as the current operating docs.

## 1. Project Overview

Build a ready-to-use CMS focused on marketing websites, with editable landing pages (Home, About, Service, Contact) and a manageable blog, controlled from an admin panel and optimized for SEO using free/open-source libraries.

## 2. Objectives

- Enable non-technical admins to edit landing page content from CMS.
- Enable full blog management from CMS (create, edit, publish, unpublish).
- Implement technical SEO essentials for marketing visibility.
- Keep implementation on free/open-source libraries only.

## 3. Scope of Work

### Phase 1 - Discovery

- Review current CMS structure and define required content model.
- Define editable fields for each landing page and blog entities.
- Define SEO field requirements per page/post (meta title, meta description, slug, canonical, social image).

### Phase 2 - Design

- Define admin UX for landing page editor and blog editor.
- Define front-end template behavior for page sections and blog listing/detail.
- Define SEO output rules and URL structure.

### Phase 3 - Development

- Implement CMS-managed landing page data model and admin CRUD.
- Implement CMS-managed blog model and admin CRUD (draft/publish workflow).
- Connect CMS content to public pages (Home, About, Service, Contact, Blog, Blog Detail).
- Implement technical SEO features:
  - page/post metadata controls
  - clean slugs
  - canonical tags
  - Open Graph/Twitter tags
  - XML sitemap generation
  - robots.txt
  - structured data (Organization/WebSite + BlogPosting where relevant)
- Ensure dependencies are free/open-source libraries.

### Phase 4 - Testing

- Validate admin edit flows for landing pages and blog.
- Validate published content rendering across desktop/mobile.
- Validate SEO tags/sitemap/robots output.
- Validate basic performance and indexing readiness.

### Phase 5 - Deployment

- Prepare production build and deployment checklist.
- Configure environment variables and SEO-related runtime settings.
- Provide handoff documentation for content team/admin users.

## 4. Deliverables

- Updated CMS codebase with landing-page content management.
- Updated CMS codebase with blog content management.
- SEO module/configuration integrated into public pages.
- Admin usage guide (content editing + publishing flow).
- Deployment/handover documentation.

## 5. Assumptions

- Brand assets, page copy, and blog content are provided by client (or placeholders used).
- Hosting/domain/DNS and deployment access are available.
- If contact form email delivery is required, SMTP/provider credentials are provided.
- Single-language implementation unless otherwise specified.
- Only free/open-source libraries are required (no paid/proprietary UI or SEO plugins).

## 6. Out of Scope (Default Protections)

- Ongoing maintenance/retainer after launch.
- Copywriting and content strategy.
- Off-page SEO (backlinks, outreach, PR).
- Paid ads setup/management.
- Paid third-party service costs (hosting, email provider, CDN, domain).
- Major design overhaul beyond agreed templates/rounds.
- Multi-tenant/multi-site architecture.

## 7. Timeline Estimate

- Phase 1 Discovery: 3-5 business days
- Phase 2 Design: 4-7 business days
- Phase 3 Development: 15-25 business days
- Phase 4 Testing: 5-7 business days
- Phase 5 Deployment: 2-3 business days
- Estimated total: 5 to 8 weeks (depends on content readiness and feedback turnaround)

## 8. Acceptance Criteria

- Admin can edit and publish dynamic content for Home, About, Service, Contact without code changes.
- Section-level updates are possible including structure and color controls.
- Admin can create/edit/publish blog posts from CMS.
- Each page/post supports editable SEO fields and outputs valid tags in HTML.
- XML sitemap includes all published pages/posts; robots.txt is accessible.
- Public pages are responsive and render correctly on modern browsers.
- No paid/proprietary libraries are introduced.

## 9. Risks & Dependencies

- Delays in final content/assets from client.
- SEO impact depends on content quality and ongoing strategy beyond technical setup.
- Hosting constraints may affect performance and caching setup.
- Scope growth risk if additional page types/features are introduced mid-project.

## 10. Pricing Structure

Milestone-based billing:
- 20% at kickoff
- 30% after Discovery/Design sign-off
- 35% after Development complete on staging
- 15% after final acceptance/deployment

Change requests outside approved scope are handled via separate estimate/change order.

## Open Items To Confirm

- Preferred deployment target (current hosting stack)
- Required user roles/permissions in admin panel
- Whether contact form includes CRM/email integration
- SEO target market/language (single region vs multi-region)
