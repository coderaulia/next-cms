'use client';

import type { ComponentType } from 'react';
import { Suspense } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  Activity,
  ArrowLeftRight,
  BarChart3,
  BookOpen,
  Briefcase,
  Code2,
  Database,
  ExternalLink,
  Files,
  FileText,
  Image as ImageIcon,
  Inbox,
  KeyRound,
  LayoutDashboard,
  Link2,
  LogOut,
  Map,
  MessageSquare,
  Settings,
  ShieldCheck,
  Tags,
  Users,
  X
} from 'lucide-react';

import { siteProfile } from '@/config/site-profile';
import { logoutAdmin } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { formatAdminRoleLabel } from '@/features/cms/adminPermissions';
import type { AdminPermission } from '@/features/cms/types';

type NavItem = {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  permission?: AdminPermission;
};

const coreLinks: NavItem[] = [
  { href: '/admin', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/admin/blog', label: 'Posts', icon: FileText, permission: 'content:edit' },
  { href: '/admin/pages', label: 'Pages', icon: Files, permission: 'content:edit' },
  { href: '/admin/portfolio', label: 'Portfolio', icon: Briefcase, permission: 'content:edit' }
];

const siteManagementLinks: NavItem[] = [
  { href: '/admin/data', label: 'Data & Backup', icon: Database, permission: 'data:manage' },
  { href: '/admin/settings', label: 'Settings', icon: Settings, permission: 'settings:edit' },
  { href: '/admin/contact-submissions', label: 'Contact Leads', icon: Inbox },
  { href: '/admin/categories', label: 'Categories', icon: Tags, permission: 'taxonomy:edit' },
  { href: '/admin/media', label: 'Media Library', icon: ImageIcon, permission: 'media:edit' },
  { href: '/admin/team', label: 'Team', icon: Users, permission: 'team:manage' },
  { href: '/admin/sessions', label: 'Sessions', icon: KeyRound, permission: 'team:manage' },
  { href: '/admin/analytics', label: 'Analytics', icon: BarChart3, permission: 'analytics:view' },
  { href: '/admin/audit', label: 'Audit Log', icon: ShieldCheck, permission: 'audit:view' },
  { href: '/admin/manual', label: 'Manual', icon: BookOpen },
  { href: '/admin/settings?tab=discussion', label: 'Comments', icon: MessageSquare, permission: 'settings:edit' }
];

const seoLinks: NavItem[] = [
  { href: '/admin/settings?tab=permalinks', label: 'Permalinks', icon: Link2, permission: 'settings:edit' },
  { href: '/admin/settings?tab=seo', label: 'Meta Tags', icon: Code2, permission: 'settings:edit' },
  { href: '/admin/settings?tab=sitemap', label: 'Sitemaps', icon: Map, permission: 'settings:edit' },
  { href: '/admin/link-checker', label: 'Link Checker', icon: Activity, permission: 'analytics:view' },
  { href: '/admin/redirects', label: 'Redirects', icon: ArrowLeftRight, permission: 'settings:edit' }
];

function initialsForUser(user: AdminSessionUser) {
  const source = user.displayName.trim() || user.email.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AD';
}

type AdminNavProps = {
  user: AdminSessionUser | null;
  isOpen?: boolean;
  onClose?: () => void;
};

function AdminNavContent({ user, isOpen, onClose }: AdminNavProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const router = useRouter();
  const permissionSet = new Set(user?.permissions ?? []);

  const isActive = (href: string) => {
    const [hrefPath, hrefQuery] = href.split('?');
    const targetTab = hrefQuery ? new URLSearchParams(hrefQuery).get('tab') : null;
    const currentTab = searchParams.get('tab');

    if (targetTab) {
      return pathname === hrefPath && currentTab === targetTab;
    }

    if (href === '/admin/settings') {
      return pathname === '/admin/settings' && (!currentTab || currentTab === 'general');
    }

    if (href === '/admin') {
      return pathname === '/admin';
    }

    return pathname === hrefPath || pathname.startsWith(`${hrefPath}/`);
  };

  const canAccess = (permission?: AdminPermission) => !permission || permissionSet.has(permission);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className={`admin-sidebar ${isOpen ? 'open' : ''}`}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
        <Link href="/admin" className="admin-logo" onClick={onClose}>
          <span className="v2-brand-mark">{siteProfile.brand.mark}</span>
          <span>{siteProfile.brand.wordmark}</span>
        </Link>
        {onClose ? (
          <button
            type="button"
            className="admin-sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={18} />
          </button>
        ) : null}
      </div>

      <div className="admin-sidebar-scroll">
        <p className="admin-side-title">Core Content</p>
        <ul className="admin-nav-list">
          {coreLinks.filter((item) => canAccess(item.permission)).map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);
            return (
              <li key={item.label}>
                <Link
                  href={item.href}
                  className={`admin-nav-link ${active ? 'active' : ''}`}
                  onClick={onClose}
                >
                  <Icon size={18} className="admin-nav-icon" />
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>

        {siteManagementLinks.some((item) => canAccess(item.permission)) ? (
          <>
            <p className="admin-side-title">Site Management</p>
            <ul className="admin-nav-list">
              {siteManagementLinks.filter((item) => canAccess(item.permission)).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`admin-nav-link ${active ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Icon size={18} className="admin-nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}

        {seoLinks.some((item) => canAccess(item.permission)) ? (
          <>
            <p className="admin-side-title">Basic SEO</p>
            <ul className="admin-nav-list">
              {seoLinks.filter((item) => canAccess(item.permission)).map((item) => {
                const Icon = item.icon;
                const active = isActive(item.href);
                return (
                  <li key={item.label}>
                    <Link
                      href={item.href}
                      className={`admin-nav-link ${active ? 'active' : ''}`}
                      onClick={onClose}
                    >
                      <Icon size={18} className="admin-nav-icon" />
                      <span>{item.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </>
        ) : null}
      </div>

      <div className="admin-sidebar-footer">
        <Link
          href="/"
          target="_blank"
          rel="noopener noreferrer"
          className="admin-nav-link"
          title="Open live public site in new tab"
          onClick={onClose}
          style={{ color: '#94a3b8', fontSize: '0.82rem', minHeight: '34px' }}
        >
          <ExternalLink size={16} className="admin-nav-icon" />
          <span>View Live Site</span>
        </Link>

        {user ? (
          <>
            <div className="admin-user-card">
              <span className="admin-user-avatar">{initialsForUser(user)}</span>
              <div style={{ minWidth: 0, flex: 1 }}>
                <strong style={{ display: 'block', fontSize: '0.82rem', color: '#f8fafc', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.displayName}
                </strong>
                <p style={{ margin: 0, fontSize: '0.72rem', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {user.email}
                </p>
                <span className="admin-chip admin-chip-muted" style={{ marginTop: 4, height: 18, fontSize: '0.65rem' }}>
                  {formatAdminRoleLabel(user.role)}
                </span>
              </div>
            </div>
            <button type="button" className="admin-logout" onClick={handleLogout}>
              <LogOut size={16} />
              <span>Logout</span>
            </button>
          </>
        ) : (
          <div className="admin-user-card">
            <span className="admin-user-avatar admin-skeleton" style={{ width: 32, height: 32 }} />
            <div style={{ flex: 1 }}>
              <span className="admin-skeleton" style={{ display: 'block', height: 14, width: '70%', marginBottom: 4 }} />
              <span className="admin-skeleton" style={{ display: 'block', height: 12, width: '90%' }} />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}

export function AdminNav(props: AdminNavProps) {
  return (
    <Suspense
      fallback={
        <aside className={`admin-sidebar ${props.isOpen ? 'open' : ''}`}>
          <div className="admin-logo">
            <span className="v2-brand-mark">{siteProfile.brand.mark}</span>
            <span>{siteProfile.brand.wordmark}</span>
          </div>
          <div className="admin-sidebar-scroll" />
        </aside>
      }
    >
      <AdminNavContent {...props} />
    </Suspense>
  );
}
