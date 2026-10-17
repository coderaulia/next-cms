'use client';

import { useState } from 'react';
import {
  ArrowUp,
  BarChart3,
  Briefcase,
  Check,
  CheckSquare,
  ChevronRight,
  Compass,
  FileText,
  Files,
  Image as ImageIcon,
  Info,
  KeyRound,
  LayoutDashboard,
  Lightbulb,
  Settings,
  Shield,
  ShieldCheck,
  Users
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';

const sections = [
  { id: 'getting-in', label: 'Getting In', icon: KeyRound },
  { id: 'navigation', label: 'Navigation', icon: Compass },
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'settings', label: 'Settings', icon: Settings },
  { id: 'pages', label: 'Pages', icon: Files },
  { id: 'posts', label: 'Posts', icon: FileText },
  { id: 'portfolio', label: 'Portfolio', icon: Briefcase },
  { id: 'media', label: 'Media Library', icon: ImageIcon },
  { id: 'analytics', label: 'Analytics', icon: BarChart3 },
  { id: 'audit', label: 'Audit Log', icon: ShieldCheck },
  { id: 'team', label: 'Team', icon: Users },
  { id: 'checklist', label: 'Pre-Publish Checklist', icon: CheckSquare }
];

function Tip({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: '#eff6ff',
        border: '1px solid #bfdbfe',
        borderRadius: 14,
        padding: '12px 16px',
        color: '#1e3a8a',
        fontSize: '0.88rem',
        marginTop: 12,
        lineHeight: 1.5
      }}
    >
      <Lightbulb size={18} color="#2563eb" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong style={{ color: '#1d4ed8' }}>Tip: </strong>
        {children}
      </div>
    </div>
  );
}

function Note({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 12,
        background: '#fffbeb',
        border: '1px solid #fde68a',
        borderRadius: 14,
        padding: '12px 16px',
        color: '#92400e',
        fontSize: '0.88rem',
        marginTop: 12,
        lineHeight: 1.5
      }}
    >
      <Info size={18} color="#d97706" style={{ flexShrink: 0, marginTop: 2 }} />
      <div>
        <strong style={{ color: '#b45309' }}>Note: </strong>
        {children}
      </div>
    </div>
  );
}

function Steps({ items }: { items: string[] }) {
  return (
    <ol style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 10 }}>
      {items.map((item, i) => (
        <li
          key={i}
          style={{
            display: 'flex',
            gap: 12,
            alignItems: 'flex-start',
            padding: '8px 12px',
            background: '#f8fafc',
            borderRadius: 10,
            border: '1px solid #e2e8f0'
          }}
        >
          <span
            style={{
              minWidth: 24,
              height: 24,
              borderRadius: '50%',
              background: '#2563eb',
              color: '#fff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.78rem',
              fontWeight: 700,
              flexShrink: 0,
              marginTop: 1
            }}
          >
            {i + 1}
          </span>
          <span style={{ fontSize: '0.88rem', color: '#1e293b', lineHeight: 1.4, paddingTop: 2 }}>
            {item}
          </span>
        </li>
      ))}
    </ol>
  );
}

function Bullets({ items }: { items: (string | React.ReactNode)[] }) {
  return (
    <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'grid', gap: 8 }}>
      {items.map((item, i) => (
        <li key={i} style={{ display: 'flex', gap: 10, alignItems: 'flex-start', fontSize: '0.88rem', color: '#334155' }}>
          <ChevronRight size={16} color="#2563eb" style={{ flexShrink: 0, marginTop: 3 }} />
          <span style={{ lineHeight: 1.45 }}>{item}</span>
        </li>
      ))}
    </ul>
  );
}

function RoleBadge({ role, color }: { role: string; color: string }) {
  return (
    <span
      style={{
        background: color,
        borderRadius: 8,
        padding: '3px 10px',
        fontSize: '0.78rem',
        fontWeight: 700,
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6
      }}
    >
      <Shield size={12} />
      <span>{role}</span>
    </span>
  );
}

function SectionAnchor({
  id,
  title,
  icon: Icon,
  children
}: {
  id: string;
  title: string;
  icon: React.ComponentType<{ size?: number }>;
  children: React.ReactNode;
}) {
  return (
    <section id={id} className="admin-card" style={{ scrollMarginTop: 90, padding: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16, borderBottom: '1px solid #f1f5f9', paddingBottom: 12 }}>
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: 10,
            background: '#eff6ff',
            color: '#2563eb',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Icon size={18} />
        </div>
        <h2 style={{ margin: 0, color: '#0f2240', fontSize: '1.25rem' }}>{title}</h2>
      </div>
      {children}
    </section>
  );
}

function InteractiveChecklist() {
  const checklistData = [
    { id: 'seo', item: 'SEO title and description', hint: 'Filled in and descriptive with keyword targeting' },
    { id: 'slug', item: 'URL Slug structure', hint: 'Clean, lowercase, hyphens only, no trailing slashes' },
    { id: 'social', item: 'Social sharing image (OG)', hint: 'Valid 1200x630px image set for link previews' },
    { id: 'alt', item: 'Image Alt Text', hint: 'All images have descriptive alt text for accessibility' },
    { id: 'preview', item: 'Live Preview inspection', hint: 'Page inspected on mobile and desktop viewports' },
    { id: 'schedule', item: 'Publication schedule', hint: 'Publish and unpublish times verified in local timezone' },
    { id: 'health', item: 'Health status clean', hint: 'Zero errors or missing references in content health report' }
  ];

  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const toggle = (id: string) => {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const doneCount = Object.values(checked).filter(Boolean).length;
  const total = checklistData.length;
  const pct = Math.round((doneCount / total) * 100);

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <span className="admin-subtle" style={{ fontSize: '0.85rem' }}>
          Interactive pre-flight check ({doneCount}/{total} completed)
        </span>
        <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.75rem', fontWeight: 600 }}>
          {pct}%
        </span>
      </div>

      <div style={{ height: 6, background: '#e2e8f0', borderRadius: 999, overflow: 'hidden', marginBottom: 14 }}>
        <div
          style={{
            width: `${pct}%`,
            height: '100%',
            background: 'linear-gradient(90deg, #3b82f6, #10b981)',
            borderRadius: 999,
            transition: 'width 0.3s ease'
          }}
        />
      </div>

      <div style={{ display: 'grid', gap: 8 }}>
        {checklistData.map(({ id, item, hint }) => {
          const isDone = Boolean(checked[id]);
          return (
            <label
              key={id}
              onClick={() => toggle(id)}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                padding: '10px 14px',
                background: isDone ? '#f0fdf4' : '#f8fbff',
                border: isDone ? '1px solid #bbf7d0' : '1px solid #d8e2f1',
                borderRadius: 12,
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
            >
              <input
                type="checkbox"
                checked={isDone}
                onChange={() => {}}
                style={{ width: 'auto', marginTop: 3, accentColor: '#16a34a', flexShrink: 0 }}
              />
              <div style={{ flex: 1 }}>
                <span style={{ fontWeight: 600, fontSize: '0.88rem', color: isDone ? '#166534' : '#0f2240', textDecoration: isDone ? 'line-through' : 'none' }}>
                  {item}
                </span>
                <span style={{ fontSize: '0.78rem', color: '#64748b', display: 'block', marginTop: 2 }}>
                  {hint}
                </span>
              </div>
              {isDone && <Check size={16} color="#16a34a" />}
            </label>
          );
        })}
      </div>
    </div>
  );
}

export default function AdminManualPage() {
  const [activeSection, setActiveSection] = useState('getting-in');

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AdminShell
      title="Admin Operations Manual"
      description="Comprehensive operator documentation and guide for the CMS administration panel."
    >
      {() => (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(200px, 240px) 1fr', gap: 24, alignItems: 'start' }}>
          {/* Sticky Navigation TOC */}
          <nav
            style={{
              position: 'sticky',
              top: 80,
              background: '#fff',
              border: '1px solid #d2dced',
              borderRadius: 18,
              padding: '16px 12px',
              boxShadow: '0 4px 14px rgba(17,37,65,0.05)',
              display: 'flex',
              flexDirection: 'column',
              gap: 4
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px 10px', borderBottom: '1px solid #f1f5f9', marginBottom: 6 }}>
              <Compass size={16} color="#2563eb" />
              <span style={{ fontSize: '0.75rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.08em', color: '#64748b' }}>
                Manual Chapters
              </span>
            </div>

            {sections.map((s) => {
              const Icon = s.icon;
              const isSelected = activeSection === s.id;
              return (
                <a
                  key={s.id}
                  href={`#${s.id}`}
                  onClick={() => setActiveSection(s.id)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '7px 10px',
                    fontSize: '0.84rem',
                    fontWeight: isSelected ? 600 : 500,
                    color: isSelected ? '#1d4ed8' : '#334155',
                    textDecoration: 'none',
                    borderRadius: 10,
                    background: isSelected ? '#eff6ff' : 'transparent',
                    transition: 'all 0.15s ease'
                  }}
                  onMouseEnter={(e) => {
                    if (!isSelected) e.currentTarget.style.background = '#f8fafc';
                  }}
                  onMouseLeave={(e) => {
                    if (!isSelected) e.currentTarget.style.background = 'transparent';
                  }}
                >
                  <Icon size={15} />
                  <span>{s.label}</span>
                </a>
              );
            })}

            <div style={{ borderTop: '1px solid #f1f5f9', marginTop: 10, paddingTop: 10 }}>
              <button
                type="button"
                onClick={scrollToTop}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 6,
                  padding: '7px 10px',
                  borderRadius: 8,
                  fontSize: '0.78rem',
                  color: '#64748b',
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  cursor: 'pointer'
                }}
              >
                <ArrowUp size={13} />
                <span>Back to top</span>
              </button>
            </div>
          </nav>

          {/* Documentation Content Sections */}
          <div className="admin-form-wrap">
            {/* 1. Getting In */}
            <SectionAnchor id="getting-in" title="Getting In & Authentication" icon={KeyRound}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Authenticate at <code>/admin/login</code> with your authorized CMS administrator credentials.
              </p>
              <p style={{ margin: '0 0 10px', fontWeight: 600, fontSize: '0.9rem', color: '#0f2240' }}>
                Your administrative role determines feature availability:
              </p>
              <div style={{ display: 'grid', gap: 8 }}>
                {[
                  { role: 'super_admin', color: '#fde8ff', desc: 'Full root access — content, site settings, media assets, analytics, audit trail & team accounts' },
                  { role: 'admin', color: '#e8f0ff', desc: 'Operations access — content, site settings, media, analytics & audit logs' },
                  { role: 'editor', color: '#e8fff0', desc: 'Editorial access — pages, posts, portfolio & media library only' },
                  { role: 'analyst', color: '#fff8e8', desc: 'Reporting access — command-center dashboard & visitor analytics only' }
                ].map(({ role, color, desc }) => (
                  <div key={role} style={{ display: 'flex', gap: 12, alignItems: 'center', padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 12 }}>
                    <RoleBadge role={role} color={color} />
                    <span style={{ fontSize: '0.85rem', color: '#374151' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <Note>
                First deployment on a clean database? The root administrator account is bootstrapped automatically from <code>CMS_ADMIN_EMAIL</code> and <code>CMS_ADMIN_PASSWORD</code> environment variables.
              </Note>
            </SectionAnchor>

            {/* 2. Navigation */}
            <SectionAnchor id="navigation" title="Navigation & Workspace" icon={Compass}>
              <p style={{ margin: '0 0 12px', color: '#374151', fontSize: '0.9rem' }}>
                The persistent left sidebar anchors every content module in the CMS:
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  ['Dashboard', 'Command center with KPIs & alerts'],
                  ['Pages', 'Core marketing landing pages & blocks'],
                  ['Posts', 'Articles, categories & publication queue'],
                  ['Portfolio', 'Client case studies & showcase projects'],
                  ['Media Library', 'CDN storage & alt-text verification'],
                  ['Categories', 'Taxonomy organization for blog posts'],
                  ['Contact Leads', 'Public form inquiries & client leads'],
                  ['Analytics', 'Traffic trajectories & conversion funnels'],
                  ['Audit Log', 'Security audit events & change trail'],
                  ['Team', 'User provisioning & role permissions'],
                  ['Settings', 'Site branding, SEO & sitemap patterns']
                ].map(([name, desc]) => (
                  <div key={name} style={{ padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 12 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240' }}>{name}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
              <Note>
                Comments moderation and discussion rules are configured under <strong>Settings &rarr; Discussion</strong>.
              </Note>
            </SectionAnchor>

            {/* 3. Dashboard */}
            <SectionAnchor id="dashboard" title="Command Center Dashboard" icon={LayoutDashboard}>
              <p style={{ margin: '0 0 12px', color: '#374151', fontSize: '0.9rem' }}>
                Located at <code>/admin</code>. Your home base for every content session.
              </p>
              <Bullets
                items={[
                  <><strong>First-run checklist</strong> &mdash; shown after deployment, tracks required launch configurations</>,
                  <><strong>Scheduled queue</strong> &mdash; upcoming automated publication and takedown events</>,
                  <><strong>Analytics snapshot</strong> &mdash; real-time 30-day views, unique visitors, and top content</>,
                  <><strong>Content health warnings</strong> &mdash; detects missing SEO tags, unset alt texts, or broken links</>,
                  <><strong>Recent activity audit</strong> &mdash; tracks administrative modifications and logins</>
                ]}
              />
              <Tip>Check the dashboard before starting work to catch any pending content health alerts or scheduled items.</Tip>
            </SectionAnchor>

            {/* 4. Settings */}
            <SectionAnchor id="settings" title="Site Settings & Configuration" icon={Settings}>
              <p style={{ margin: '0 0 12px', color: '#374151', fontSize: '0.9rem' }}>
                Located at <code>/admin/settings</code>. Configuration tabs save independently.
              </p>
              <div style={{ display: 'grid', gap: 6 }}>
                {[
                  ['General', 'Brand name, timezone, public inquiry address'],
                  ['Writing', 'Default categories and rich-text behaviors'],
                  ['Reading', 'Homepage designation, pagination & indexing'],
                  ['Discussion', 'Comment permissions and spam prevention'],
                  ['Media', 'Upload quota limits and storage backend paths'],
                  ['Permalinks', 'Canonical URL path patterns for posts and pages'],
                  ['Meta Tags', 'Global title templates and default social OG image'],
                  ['Sitemaps', 'Automatic XML sitemap generation and exclusions']
                ].map(([tab, desc]) => (
                  <div key={tab} style={{ display: 'flex', gap: 12, padding: '9px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 10 }}>
                    <span style={{ fontWeight: 600, minWidth: 110, fontSize: '0.88rem', color: '#0f2240' }}>{tab}</span>
                    <span style={{ fontSize: '0.85rem', color: '#6b7280' }}>{desc}</span>
                  </div>
                ))}
              </div>
              <Note>Save each tab before switching. All settings maintain revision versions that can be restored at any time.</Note>
            </SectionAnchor>

            {/* 5. Pages */}
            <SectionAnchor id="pages" title="Landing Pages & Blocks" icon={Files}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/pages</code> to edit marketing pages.
              </p>
              <Bullets
                items={[
                  <><strong>Autosave + manual save</strong> &mdash; press <code>Ctrl+S</code> or <code>Cmd+S</code> to persist changes</>,
                  <><strong>Dirty-state indicator</strong> &mdash; highlights unsaved draft modifications</>,
                  <><strong>Live preview mode</strong> &mdash; inspect live responsive layouts before publishing</>,
                  <><strong>Scheduled publishing</strong> &mdash; define exact release and unpublish timestamps</>,
                  <><strong>Revision rollbacks</strong> &mdash; restore prior snapshots with one click</>
                ]}
              />

              <h3 style={{ margin: '18px 0 10px', color: '#0f2240', fontSize: '1rem' }}>Homepage Modular Blocks</h3>
              <Bullets
                items={[
                  'Add, reorder, or toggle homepage blocks (Hero, Value Triplet, Solutions Grid, etc.)',
                  <>Choose color theme tokens: <code>light</code>, <code>blue-soft</code>, or <code>mist</code></>,
                  'Edit copy, CTA buttons, and background artwork directly in the visual block builder'
                ]}
              />
            </SectionAnchor>

            {/* 6. Posts */}
            <SectionAnchor id="posts" title="Blog Posts & Editorial" icon={FileText}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/blog</code> to manage publications.
              </p>
              <Steps
                items={[
                  'Click "New Post" to create a fresh draft',
                  'Draft markdown or rich-text copy, configure SEO metadata, and assign categories',
                  'Trigger preview mode to inspect rendered layout',
                  'Publish immediately, save as draft, or schedule for a future release date',
                  'Use revision history to audit or roll back edits'
                ]}
              />
              <Tip>Use bulk selection checkboxes to publish or move multiple articles to draft status simultaneously.</Tip>
            </SectionAnchor>

            {/* 7. Portfolio */}
            <SectionAnchor id="portfolio" title="Portfolio & Case Studies" icon={Briefcase}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/portfolio</code>. Showcase client projects with media galleries.
              </p>
              <Steps
                items={[
                  'Click "New Project" to start a draft case study',
                  'Upload cover images, project gallery items, client details, and technology tags',
                  'Toggle "Featured" to highlight on the homepage showcase',
                  'Publish or schedule release timing'
                ]}
              />
            </SectionAnchor>

            {/* 8. Media Library */}
            <SectionAnchor id="media" title="Media Library & Assets" icon={ImageIcon}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/media</code>. Centralized repository for all images and documents.
              </p>
              <Bullets
                items={[
                  <><strong>Alt text required</strong> &mdash; enforced on every upload for web accessibility</>,
                  <><strong>Duplicate checksum detection</strong> &mdash; prevents redundant storage waste</>,
                  <><strong>Stable replace</strong> &mdash; swap an image file while keeping all live published URLs intact</>,
                  <><strong>Where-used references</strong> &mdash; see every page and post embedding an asset</>,
                  <><strong>Delete protection</strong> &mdash; prevents removing assets currently in use</>
                ]}
              />
              <Tip>Image fields in the page and post editors feature an inline media selector and direct upload dropzone.</Tip>
            </SectionAnchor>

            {/* 9. Analytics */}
            <SectionAnchor id="analytics" title="Analytics & Conversions" icon={BarChart3}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/analytics</code> for traffic and conversion reporting.
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 10 }}>
                {[
                  ['Page views', 'Total content impressions across all pages'],
                  ['Unique visitors', 'Distinct browser sessions over selected timeframe'],
                  ['CTA clicks', 'Direct interactions with call-to-action buttons'],
                  ['Contact leads', 'Completed inquiry and lead submissions'],
                  ['Top content', 'Highest trafficked pages and blog posts'],
                  ['Referrers', 'External traffic sources and search engines'],
                  ['Devices', 'Desktop vs. mobile vs. tablet visitor shares'],
                  ['Campaign attribution', 'UTM tracking parameters and campaigns']
                ].map(([metric, desc]) => (
                  <div key={metric} style={{ padding: '10px 14px', background: '#f8fbff', border: '1px solid #d8e2f1', borderRadius: 10 }}>
                    <div style={{ fontWeight: 600, fontSize: '0.88rem', color: '#0f2240' }}>{metric}</div>
                    <div style={{ fontSize: '0.78rem', color: '#6b7280', marginTop: 2 }}>{desc}</div>
                  </div>
                ))}
              </div>
            </SectionAnchor>

            {/* 10. Audit Log */}
            <SectionAnchor id="audit" title="Security & Audit Trail" icon={ShieldCheck}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/audit</code>. Cryptographically auditable log of administrative actions.
              </p>
              <Bullets
                items={[
                  'Content creation, modification, and deletion events',
                  'Publish and unpublish actions with timestamps',
                  'Media asset uploads, replacements, and purges',
                  'Site configuration changes and rollbacks',
                  'User logins and team membership updates'
                ]}
              />
              <Tip>Whenever an unexpected change occurs on a page, consult the audit log to view the exact user, IP address, and timestamp.</Tip>
            </SectionAnchor>

            {/* 11. Team */}
            <SectionAnchor id="team" title="Team & Access Control" icon={Users}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Access at <code>/admin/team</code>. Super admin permissions required.
              </p>
              <Bullets
                items={[
                  'Provision new team members with email, password, and assigned role',
                  'Update user display names, email addresses, and security roles',
                  'Revoke credentials and deactivate inactive staff accounts'
                ]}
              />
              <Note>You cannot delete your own active session account or remove the final remaining super administrator.</Note>
            </SectionAnchor>

            {/* 12. Pre-Publish Checklist */}
            <SectionAnchor id="checklist" title="Pre-Publish Verification Checklist" icon={CheckSquare}>
              <p style={{ margin: '0 0 14px', color: '#374151', fontSize: '0.9rem' }}>
                Run through this pre-flight checklist before launching new content or scheduling a campaign:
              </p>
              <InteractiveChecklist />
            </SectionAnchor>
          </div>
        </div>
      )}
    </AdminShell>
  );
}
