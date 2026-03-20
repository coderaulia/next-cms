'use client';

import { AdminShell } from '@/components/AdminShell';

export default function AdminManualPage() {
  return (
    <AdminShell
      title="Admin Manual"
      description="Complete guide to using the CMS admin panel."
    >
      {() => (
        <div className="admin-form-wrap">
          <section className="admin-card">
            <h2>Accessing Admin</h2>
            <ol className="admin-ordered-list">
              <li>Open <code>/admin/login</code>.</li>
              <li>Sign in with <code>CMS_ADMIN_EMAIL</code> and <code>CMS_ADMIN_PASSWORD</code> from <code>.env.local</code> or production env.</li>
              <li>In database mode, the first successful login bootstraps the first admin user if <code>admin_users</code> is empty.</li>
            </ol>
            <h3>Role-based Access</h3>
            <ul className="admin-plain-list">
              <li><strong>super_admin</strong>: full access, including Team management</li>
              <li><strong>admin</strong>: content, settings, media, analytics, audit</li>
              <li><strong>editor</strong>: content + media</li>
              <li><strong>analyst</strong>: dashboard + analytics + audit</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Sidebar Modules</h2>
            <ul className="admin-nav-modules">
              <li>Dashboard</li>
              <li>Posts</li>
              <li>Pages</li>
              <li>Portfolio</li>
              <li>Settings</li>
              <li>Contact Leads</li>
              <li>Categories</li>
              <li>Media Library</li>
              <li>Team</li>
              <li>Analytics</li>
              <li>Audit Log</li>
            </ul>
            <p className="admin-subtle">Settings shortcuts for Discussion, Permalinks, Meta Tags, and Sitemaps are also available.</p>
            <p className="admin-subtle">Note: Comment controls live under Settings &rarr; Discussion. There is no separate comments moderation screen yet.</p>
          </section>

          <section className="admin-card">
            <h2>Dashboard</h2>
            <p>Go to <code>/admin</code>.</p>
            <p>The dashboard includes:</p>
            <ul className="admin-plain-list">
              <li>First-run checklist</li>
              <li>Scheduled publish/unpublish queue</li>
              <li>Analytics snapshot</li>
              <li>Content health warnings</li>
              <li>Recent audit activity</li>
              <li>Quick links into the main admin modules</li>
            </ul>
            <p className="admin-tip">Use this page first after deployment or content handoff.</p>
          </section>

          <section className="admin-card">
            <h2>Website Settings</h2>
            <p>Go to <code>/admin/settings</code>.</p>
            <h3>Current tabs:</h3>
            <ul className="admin-plain-list">
              <li>General</li>
              <li>Writing</li>
              <li>Reading</li>
              <li>Discussion</li>
              <li>Media</li>
              <li>Permalinks</li>
              <li>Meta Tags</li>
              <li>Sitemaps</li>
            </ul>
            <h3>Important behavior:</h3>
            <ul className="admin-plain-list">
              <li>Settings save from the current tab, but the page degrades gracefully if Pages or Categories fail to load.</li>
              <li>Reading tab lazily loads page choices.</li>
              <li>Writing tab lazily loads category choices.</li>
              <li>Settings keep revision history and can be restored from the revisions panel.</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Editing Pages, Posts, and Portfolio</h2>

            <h3>Pages</h3>
            <p>Go to <code>/admin/pages</code> and open a page.</p>
            <h4>Current editor capabilities:</h4>
            <ul className="admin-plain-list">
              <li>Manual save plus autosave</li>
              <li>Dirty-state tracking</li>
              <li>Keyboard save shortcut (Ctrl+S / Cmd+S)</li>
              <li>Draft preview via preview mode</li>
              <li>Scheduled publish / scheduled unpublish</li>
              <li>Revision history and restore</li>
              <li>Direct image upload from image inputs</li>
              <li>Media library browsing from image inputs</li>
            </ul>
            <h4>Home page supports:</h4>
            <ul className="admin-plain-list">
              <li>Add/remove/reorder/enable homepage blocks</li>
              <li>Theme token selection (light, blue-soft, mist)</li>
              <li>Block-specific payload editing</li>
            </ul>
            <h4>Non-home pages support:</h4>
            <ul className="admin-plain-list">
              <li>Section editing</li>
              <li>Layout switching (stacked / split)</li>
              <li>Heading/body/CTA/media fields</li>
              <li>Media alt text editing</li>
            </ul>

            <h3>Posts</h3>
            <p>Go to <code>/admin/blog</code>.</p>
            <h4>Current post workflow:</h4>
            <ol className="admin-ordered-list">
              <li>Create draft</li>
              <li>Edit content + SEO</li>
              <li>Use preview mode</li>
              <li>Publish, unpublish, or schedule</li>
              <li>Restore previous revision if needed</li>
            </ol>
            <h4>Posts table supports:</h4>
            <ul className="admin-plain-list">
              <li>Search by title/author</li>
              <li>Status filter</li>
              <li>Category filter</li>
              <li>Date sort</li>
              <li>Pagination with URL-synced query state</li>
              <li>Bulk publish / move-to-draft</li>
            </ul>

            <h3>Portfolio</h3>
            <p>Go to <code>/admin/portfolio</code>.</p>
            <h4>Current portfolio workflow:</h4>
            <ol className="admin-ordered-list">
              <li>Create draft case study</li>
              <li>Edit cover image, gallery, SEO, and publication state</li>
              <li>Use preview mode</li>
              <li>Publish, unpublish, or schedule</li>
              <li>Restore previous revision if needed</li>
            </ol>
            <h4>Portfolio list supports:</h4>
            <ul className="admin-plain-list">
              <li>Search</li>
              <li>Status filter</li>
              <li>Tag filter</li>
              <li>Featured filter</li>
              <li>Date sort</li>
              <li>Bulk publish / move-to-draft</li>
              <li>Bulk feature / unfeature</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Media Library</h2>
            <p>Go to <code>/admin/media</code>.</p>
            <h3>Current media behavior:</h3>
            <ul className="admin-plain-list">
              <li>Image uploads require alt text</li>
              <li>Duplicate uploads are detected by checksum</li>
              <li>Managed assets can be replaced without changing their URL</li>
              <li>Selected assets show aspect ratio, size, and storage info</li>
              <li>Delete is blocked when the asset is still referenced</li>
              <li>The asset detail panel shows &quot;Where this asset is used&quot;</li>
            </ul>
            <p>Editors also support direct upload from page/post/portfolio image fields, so users do not need to open the media library first.</p>
          </section>

          <section className="admin-card">
            <h2>Analytics</h2>
            <p>Go to <code>/admin/analytics</code>.</p>
            <h3>Current analytics report includes:</h3>
            <ul className="admin-plain-list">
              <li>Page views</li>
              <li>Unique visitors</li>
              <li>CTA clicks</li>
              <li>Contact leads</li>
              <li>Top content paths</li>
              <li>Top conversions</li>
              <li>Referrers</li>
              <li>Campaign attribution from UTM parameters</li>
            </ul>
            <h3>Tracked conversion events currently include:</h3>
            <ul className="admin-plain-list">
              <li>CTA clicks on shared marketing CTAs</li>
              <li>Contact form submissions</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Audit Log</h2>
            <p>Go to <code>/admin/audit</code>.</p>
            <p>Audit log covers admin mutations such as:</p>
            <ul className="admin-plain-list">
              <li>Content create/update/delete</li>
              <li>Publish/unpublish</li>
              <li>Media upload/update/delete/replace</li>
              <li>Settings save</li>
              <li>Revision restore</li>
              <li>Team changes</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Team Management</h2>
            <p>Go to <code>/admin/team</code>.</p>
            <h3>Current team management supports:</h3>
            <ul className="admin-plain-list">
              <li>Create admin users</li>
              <li>Update display name, role, and password</li>
              <li>Delete admin users</li>
              <li>Block self-delete</li>
              <li>Block removing the last super_admin</li>
            </ul>
          </section>

          <section className="admin-card">
            <h2>Publishing Checklist</h2>
            <p>Before publishing or scheduling, confirm:</p>
            <ul className="admin-plain-list">
              <li>SEO title and description</li>
              <li>Slug and canonical behavior</li>
              <li>Social image</li>
              <li>Alt text on images</li>
              <li>Preview mode matches expectations</li>
              <li>Scheduled publish/unpublish times if using them</li>
              <li>Content health warnings from the dashboard</li>
            </ul>
          </section>
        </div>
      )}
    </AdminShell>
  );
}
