# Admin Guide

A practical guide to managing your site from the admin panel.

---

## Getting In

Go to `/admin/login` and sign in with your email and password.

**Your role determines what you can see and do:**

| Role | What you can access |
|------|---------------------|
| `super_admin` | Everything, including team management |
| `admin` | Content, settings, media, analytics, audit |
| `editor` | Content and media only |
| `analyst` | Dashboard and analytics only |

> **First time on a fresh database?** The first login automatically creates your admin account from the `CMS_ADMIN_EMAIL` and `CMS_ADMIN_PASSWORD` environment variables.

---

## Where Things Live

The sidebar gives you access to everything:

- **Dashboard** — your home base; start here after any deployment
- **Posts** — blog posts
- **Pages** — static marketing pages (home, about, services, etc.)
- **Portfolio** — case studies
- **Media Library** — all uploaded images and files
- **Categories** — organize posts
- **Contact Leads** — form submissions from visitors
- **Analytics** — traffic, conversions, referrers
- **Audit Log** — history of every change made
- **Team** — manage admin users
- **Settings** — site-wide configuration

> **Looking for comment controls?** They're under **Settings → Discussion**, not a separate screen.

---

## Dashboard

Go to `/admin`.

Your starting point for any session. It shows you:

- A **first-run checklist** when you've just set up the site
- **Scheduled content** — posts or pages about to go live or be unpublished
- **Analytics snapshot** — at-a-glance traffic and conversions
- **Content health warnings** — missing SEO, broken references, etc.
- **Recent activity** — what changed and who changed it

Check here first after a deployment or content handoff to catch anything that needs attention.

---

## Settings

Go to `/admin/settings`.

Settings are organized into tabs:

| Tab | What you'll configure |
|-----|----------------------|
| **General** | Site name, timezone, contact info |
| **Writing** | Default categories, editor behavior |
| **Reading** | Homepage, posts per page, visibility |
| **Discussion** | Comments on/off, moderation rules |
| **Media** | Upload sizes and storage paths |
| **Permalinks** | URL structure for posts and pages |
| **Meta Tags** | Default SEO title/description patterns |
| **Sitemaps** | Sitemap generation and exclusions |

**A few things worth knowing:**
- Each tab saves independently — switching tabs before saving will lose unsaved changes
- Settings have revision history. If something breaks after a change, open the revisions panel and restore a previous version
- The Reading and Writing tabs load their dropdowns lazily — give them a moment if they appear empty

---

## Editing Content

### Pages

Go to `/admin/pages` and open any page.

The page editor gives you:

- **Autosave** with manual save (`Ctrl+S` / `Cmd+S`)
- **Dirty-state indicator** — the editor tells you when you have unsaved changes
- **Preview mode** — see exactly how the page looks before publishing
- **Scheduled publish/unpublish** — set a date and the system handles it
- **Revision history** — every save is versioned; restore any previous version

**For the home page specifically**, you can:
- Add, remove, reorder, or toggle homepage blocks (hero, value triplet, solutions grid, etc.)
- Pick a theme token: `light`, `blue-soft`, or `mist`
- Edit each block's content directly

**For all other pages**, each section has:
- A layout toggle: `stacked` (image above/below text) or `split` (side by side)
- Heading, body copy, CTA button, and media fields
- Alt text for every image

---

### Posts

Go to `/admin/blog`.

**Typical workflow:**
1. **Create a draft** — click "New Post"
2. **Write and edit** — add content, set SEO title/description, pick categories
3. **Preview** — use preview mode to see the rendered post
4. **Publish** — publish immediately, save as draft, or schedule for later
5. **Revise** — if you need to undo a change, restore from revision history

**Finding posts in the list:**
- Search by title or author name
- Filter by status (draft / published / scheduled)
- Filter by category
- Sort by date
- Select multiple posts for bulk publish or move-to-draft

---

### Portfolio

Go to `/admin/portfolio`.

Works the same as Posts, with a few extras:
- **Cover image and gallery** — upload or pick from the media library
- **Featured flag** — mark projects to surface them in featured sections
- **Tag filter** — organize by technology, industry, or whatever you use

**Bulk actions available:** publish, move to draft, feature, unfeature.

---

## Media Library

Go to `/admin/media`.

A central home for every image and file on the site.

**Uploading:**
- Alt text is required on every upload — this is enforced, not optional
- Duplicate files are detected by checksum — you won't end up with duplicate copies

**Managing assets:**
- Click any asset to see its details: dimensions, file size, aspect ratio, storage location, and **where it's used on the site**
- You can **replace** an asset (swap the file) without changing its URL — all existing references stay intact
- You **cannot delete** an asset that's still referenced somewhere — remove the reference first

**Storage limits:**
- Default quota is 1 GB (configurable via `CMS_STORAGE_QUOTA_MB`)
- Uploads and replacements are blocked once you exceed the quota

> **Tip:** You don't need to open the media library to add images to a page. Every image field in the page/post/portfolio editor has a built-in upload button and library picker.

**Where files are stored** (first matching provider wins):
1. **Cloudflare R2** — set all `R2_*` environment variables
2. **Supabase Storage** — set all `SUPABASE_*` environment variables
3. **Local disk** — fallback only; not suitable for production hosting on containers or serverless

---

## Analytics

Go to `/admin/analytics`.

Covers your key traffic and conversion metrics:

- **Page views and unique visitors**
- **CTA clicks** — tracked on marketing call-to-action buttons
- **Contact leads** — form submissions
- **Top content** — your most-visited pages and posts
- **Top conversions** — which pages drive the most leads or CTA clicks
- **Referrers** — where your traffic is coming from
- **Campaign attribution** — UTM parameter breakdown for any paid or email campaigns

---

## Audit Log

Go to `/admin/audit`.

A full record of every change made in the admin. Useful for:
- Understanding what changed when something breaks
- Seeing who made a specific edit
- Confirming that a scheduled action fired

Covers: content create/edit/delete, publish/unpublish, media changes, settings saves, revision restores, and team changes.

---

## Team Management

Go to `/admin/team`. *(Super admin only.)*

- **Invite new users** — create accounts with name, email, password, and role
- **Edit users** — update their name, role, or password
- **Remove users** — delete accounts you no longer need

**Built-in guardrails:**
- You cannot delete your own account
- You cannot remove the last `super_admin` — there must always be at least one

---

## Pre-Publish Checklist

Before you hit publish (or set a schedule), run through this quickly:

- [ ] SEO title and description are filled in and make sense
- [ ] The slug looks right and matches expected URL structure
- [ ] Social image is set (used for link previews on social media)
- [ ] All images have alt text
- [ ] Preview mode matches what you expect
- [ ] If scheduling: publish and unpublish times are correct
- [ ] No content health warnings showing on the dashboard
