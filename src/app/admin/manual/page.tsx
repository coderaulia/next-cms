'use client';

import { AdminShell } from '@/components/AdminShell';

const sections = [
  { id: 'getting-in', label: 'Getting In' },
  { id: 'navigation', label: 'Navigation' },
  { id: 'dashboard', label: 'Dashboard' },
  { id: 'settings', label: 'Settings' },
  { id: 'pages', label: 'Pages' },
  { id: 'posts', label: 'Posts' },
  { id: 'portfolio', label: 'Portfolio' },
  { id: 'media', label: 'Media Library' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'audit', label: 'Audit Log' },
  { id: 'team', label: 'Team' },
  { id: 'checklist', label: 'Pre-Publish Checklist' },
];

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#f0f6ff',
      border: '1px solid #c5d9f5',
      borderRadius: 12,
      padding: '10px 14px',
      color: '#1e3a6e',
      fontSize: '0.9rem',
      marginTop: 10,
    }}>
      <strong>Tip:</strong> {children}
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div style={{
      background: '#fffbea',
      border: '1px solid #f0d96b',
      borderRadius: 12,
      padding: '10px 14px',
      color: '#5c4a00',
      fontSize: '0.9rem',
      marginTop: 10,
    }}>
      <strong>Note:</strong> {children}
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
          <span style={{
            minWidth: 26,
            height: 26,
            borderRadius: '50%',
            background: '#21385d',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '0.8rem',
            fontWeight: 700,
            flexShrink: 0,
            marginTop: 1,
          }}>{i + 1}</span>
          <span style={{ paddingTop: 3 }}>{item}</span>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 6 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.9rem' }}>
          <span style={{ color: '#6b8bbf', marginTop: 4, flexShrink: 0 }}>▸</span>
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RoleBadge({ role, color }: { role: string; color: string }) {
  return (
    <code style={{
      background: color,
      borderRadius: 6,
      padding: '2px 8px',
      fontSize: '0.8rem',
      fontWeight: 600,
    }}>{role}</code>
  );
}

function SectionAnchor({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <section id={id} className="admin-card" style={{ scrollMarginTop: 80 }}>
      <h2 style={{ margin: '0 0 16px', fontSize: '1.15rem', color: '#0f2240' }}>{title}</h2>
      {children}
    </section>
  );
}

export default function AdminManualPage() {
  return (
    <AdminShell
      title="Admin Manual"
      description="How to use every part of the admin panel."
    >
      {() => (
        <div style={{ display: 'grid', gridTemplateColumns: '180px 1fr', gap: 24, alignItems: 'start' }}>

          {/* Sticky TOC */}
          <nav style={{
            position: 'sticky',
            top: 80,
            background: '#fff',
            border: '1px solid #d2dced',
            borderRadius: 16,
            padding: '14px 0',
            boxShadow: '0 4px 12px rgba(17,37,65,0.06)',
          }}>
            <p style={{ margin: '0 14px 10px', fontSize: '0.7rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#8fa3c0' }}>Contents</p>
            {sections.map(s => (
              <a key={s.id} href={`#${s.id}`} style={{
                display: 'block',
                padding: '5px 14px',
                fontSize: '0.85rem',
                color: '#3a5a8c',
                textDecoration: 'none',
                borderRadius: 8,
                margin: '0 4px',
              }}
              onMouseEnter={e => (e.currentTarget.style.background = '#f0f6ff')}
              onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
              >{s.label}</a>
            ))}
          </nav>

          {/* Content */}
          <div className="admin-form-wrap">

            <SectionAnchor id="getting-in" title="Getting In">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/login</code> and sign in with your email and password.</p>
              <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: '0.9rem' }}>Your role controls what you can access:</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { role: 'super_admin', color: '#fde8ff', desc: 'Full access — content, settings, media, analytics, audit, and team management' },
                  { role: 'admin', color: '#e8f0ff', desc: 'Content, settings, media, analytics, and audit' },
                  { role: 'editor', color: '#e8fff0', desc: 'Content and media only' },
                  { role: 'analyst', color: '#fff8e8', desc: 'Dashboard and analytics only' },
                ].map(({ role, color, desc }) => (
                  <div key={role} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 12 }}>
                    <RoleBadge role={role} color={color} />
                    <span style={{ fontSize: '0.88rem', color: '#374151' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <Note>First login on a fresh database? Your account is created automatically from the <code>CMS_ADMIN_EMAIL</code> and <code>CMS_ADMIN_PASSWORD</code> environment variables.</Note>
            </SectionAnchor>

            <SectionAnchor id="navigation" title="Navigation">
              <p style={{ margin: '0 0 12px', color: '#374151' }}>The sidebar links to every module:</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Dashboard', 'Your home base — start here'],
                  ['Posts', 'Blog posts'],
                  ['Pages', 'Static marketing pages'],
                  ['Portfolio', 'Case studies'],
                  ['Media Library', 'All uploaded files'],
                  ['Categories', 'Organize posts'],
                  ['Contact Leads', 'Form submissions'],
                  ['Analytics', 'Traffic and conversions'],
                  ['Audit Log', 'Full change history'],
                  ['Team', 'Manage admin users'],
                  ['Settings', 'Site-wide configuration'],
                ].map(([name, desc]) => (
                  <div key={name} style={{ padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240' }}>{name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <Note>Comment controls live under <strong>Settings → Discussion</strong>. There is no separate comments moderation screen.</Note>
            </SectionAnchor>

            <SectionAnchor id="dashboard" title="Dashboard">
              <p style={{ margin: '0 0 12px', color: '#374151' }}>Go to <code>/admin</code>. Your starting point for any session.</p>
              <Bullets items={[
                <><strong>First-run checklist</strong> — shown after a fresh deployment, walks you through initial setup</>,
                <><strong>Scheduled queue</strong> — content about to go live or be unpublished</>,
                <><strong>Analytics snapshot</strong> — at-a-glance traffic and conversions</>,
                <><strong>Content health warnings</strong> — missing SEO, unset alt text, broken references</>,
                <><strong>Recent activity</strong> — what changed and who changed it</>,
              ]} />
              <Tip>Check here first after a deployment or content handoff to catch anything that needs attention.</Tip>
            </SectionAnchor>

            <SectionAnchor id="settings" title="Settings">
              <p style={{ margin: '0 0 12px', color: '#374151' }}>Go to <code>/admin/settings</code>. Each tab saves independently.</p>
              <div style={{ display: 'grid', gap: 6 }}>
                {[
                  ['General', 'Site name, timezone, contact info'],
                  ['Writing', 'Default categories, editor behavior'],
                  ['Reading', 'Homepage, posts per page, visibility'],
                  ['Discussion', 'Comments on/off, moderation rules'],
                  ['Media', 'Upload size limits and storage paths'],
                  ['Permalinks', 'URL structure for posts and pages'],
                  ['Meta Tags', 'Default SEO title/description patterns'],
                  ['Sitemaps', 'Sitemap generation and exclusions'],
                ].map(([tab, desc]) => (
                  <div key={tab} style={{ display: 'flex', gap: 12, padding: '9px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 10 }}>
                    <span style={{ fontWeight: 600, minWidth: 110, fontSize: '0.88rem', color: '#0f2240' }}>{tab}</span>
                    <span style={{ fontSize: '0.88rem', color: '#6b7280' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <Note>Switching tabs before saving discards unsaved changes in the current tab. Settings have full revision history — restore any previous version from the revisions panel.</Note>
            </SectionAnchor>

            <SectionAnchor id="pages" title="Pages">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/pages</code> and open any page.</p>
              <Bullets items={[
                <><strong>Autosave + manual save</strong> — use <code>Ctrl+S</code> / <code>Cmd+S</code> or the Save button</>,
                <><strong>Dirty-state indicator</strong> — the editor tells you when you have unsaved changes</>,
                <><strong>Preview mode</strong> — see the live-rendered page before publishing</>,
                <><strong>Scheduled publish/unpublish</strong> — set a date and the system handles it</>,
                <><strong>Revision history</strong> — every save is versioned; restore any previous version</>,
              ]} />

              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', color: '#0f2240' }}>Home page extras</h3>
              <Bullets items={[
                'Add, remove, reorder, or toggle homepage blocks (hero, value triplet, solutions grid, etc.)',
                <>Pick a theme token: <code>light</code>, <code>blue-soft</code>, or <code>mist</code></>,
                'Edit each block\'s content directly in the block editor',
              ]} />

              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', color: '#0f2240' }}>All other pages</h3>
              <Bullets items={[
                <>Layout toggle per section: <code>stacked</code> (image above/below text) or <code>split</code> (side by side)</>,
                'Heading, body copy, CTA button, and media fields per section',
                'Alt text field on every image',
              ]} />
            </SectionAnchor>

            <SectionAnchor id="posts" title="Posts">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/blog</code>.</p>
              <Steps items={[
                'Click "New Post" to create a draft',
                'Add content, set SEO title/description, pick categories',
                'Use preview mode to see the rendered post',
                'Publish immediately, keep as draft, or schedule for a future date',
                'Restore from revision history if you need to undo a change',
              ]} />
              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', color: '#0f2240' }}>Finding posts</h3>
              <Bullets items={[
                'Search by title or author name',
                'Filter by status: draft / published / scheduled',
                'Filter by category',
                'Sort by date',
                'Select multiple for bulk publish or move-to-draft',
              ]} />
            </SectionAnchor>

            <SectionAnchor id="portfolio" title="Portfolio">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/portfolio</code>. Works like Posts with a few extras.</p>
              <Steps items={[
                'Click "New Project" to create a draft case study',
                'Upload a cover image and gallery, set SEO, choose publication state',
                'Use preview mode',
                'Publish immediately or schedule',
                'Restore from revision history if needed',
              ]} />
              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', color: '#0f2240' }}>List extras</h3>
              <Bullets items={[
                'Tag filter — organize by technology, industry, etc.',
                'Featured filter — surface specific projects in featured sections',
                'Bulk actions: publish, draft, feature, unfeature',
              ]} />
            </SectionAnchor>

            <SectionAnchor id="media" title="Media Library">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/media</code>. Central home for every image and file on the site.</p>
              <Bullets items={[
                <><strong>Alt text required</strong> on every upload — enforced, not optional</>,
                <><strong>Duplicate detection</strong> — files are checked by checksum, no accidental duplicates</>,
                <><strong>Replace without breaking URLs</strong> — swap the file; all existing references stay intact</>,
                <><strong>"Where used" panel</strong> — click any asset to see every page and post referencing it</>,
                <><strong>Delete blocked</strong> when an asset is still referenced — remove the reference first</>,
                <><strong>Storage quota</strong> — default 1 GB; uploads blocked once exceeded (set via <code>CMS_STORAGE_QUOTA_MB</code>)</>,
              ]} />
              <Tip>You don&apos;t need to open the media library to add images. Every image field in the page/post/portfolio editor has a built-in upload button and library picker.</Tip>
              <h3 style={{ margin: '18px 0 10px', fontSize: '0.95rem', color: '#0f2240' }}>Storage providers</h3>
              <p style={{ margin: '0 0 8px', fontSize: '0.88rem', color: '#6b7280' }}>First matching provider wins:</p>
              <Steps items={[
                'Cloudflare R2 — set all R2_* environment variables',
                'Supabase Storage — set all SUPABASE_* environment variables',
                'Local disk — fallback only; not suitable for containerized or serverless hosting',
              ]} />
            </SectionAnchor>

            <SectionAnchor id="analytics" title="Analytics">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/analytics</code>.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                {[
                  ['Page views', 'Total pages viewed'],
                  ['Unique visitors', 'Distinct people visiting'],
                  ['CTA clicks', 'Marketing button interactions'],
                  ['Contact leads', 'Form submissions'],
                  ['Top content', 'Most-visited pages and posts'],
                  ['Top conversions', 'Pages driving the most leads'],
                  ['Referrers', 'Where your traffic comes from'],
                  ['UTM attribution', 'Campaign tracking breakdown'],
                ].map(([metric, desc]) => (
                  <div key={metric} style={{ padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240' }}>{metric}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </SectionAnchor>

            <SectionAnchor id="audit" title="Audit Log">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/audit</code>. Full record of every change made in the admin.</p>
              <Bullets items={[
                'Content create, edit, and delete',
                'Publish and unpublish events',
                'Media uploads, replacements, and deletes',
                'Settings saves',
                'Revision restores',
                'Team membership changes',
              ]} />
              <Tip>When something breaks unexpectedly, check the audit log first — it&apos;ll show exactly what changed and who changed it.</Tip>
            </SectionAnchor>

            <SectionAnchor id="team" title="Team Management">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Go to <code>/admin/team</code>. Super admin only.</p>
              <Bullets items={[
                'Create accounts — set name, email, password, and role',
                'Edit users — update name, role, or password',
                'Delete accounts no longer needed',
              ]} />
              <Note>You cannot delete your own account. You cannot remove the last <code>super_admin</code> — at least one must always exist.</Note>
            </SectionAnchor>

            <SectionAnchor id="checklist" title="Pre-Publish Checklist">
              <p style={{ margin: '0 0 14px', color: '#374151' }}>Run through this before hitting publish or setting a schedule:</p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  ['SEO title and description', 'Filled in and descriptive'],
                  ['Slug', 'Correct URL structure'],
                  ['Social image', 'Set for link previews on social media'],
                  ['Alt text', 'All images have alt text'],
                  ['Preview mode', 'Page looks as expected'],
                  ['Schedule times', 'Publish and unpublish times are correct (if scheduling)'],
                  ['Dashboard warnings', 'No content health warnings showing'],
                ].map(([item, hint]) => (
                  <label key={item} style={{ display: 'flex', gap: 12, alignItems: 'flex-start', padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 12, cursor: 'pointer' }}>
                    <input type="checkbox" style={{ width: 'auto', marginTop: 2, accentColor: '#21385d', flexShrink: 0 }} />
                    <span>
                      <span style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240' }}>{item}</span>
                      <span style={{ fontSize: '0.8rem', color: '#6b7280', display: 'block', marginTop: 1 }}>{hint}</span>
                    </span>
                  </label>
                ))}
              </div>
            </SectionAnchor>

          </div>
        </div>
      )}
    </AdminShell>
  );
}
