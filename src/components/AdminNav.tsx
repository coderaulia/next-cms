'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { siteProfile } from '@/config/site-profile';
import { logoutAdmin } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { formatAdminRoleLabel } from '@/features/cms/adminPermissions';
import type { AdminPermission } from '@/features/cms/types';

const siteManagementLinks: Array<{ href: string; label: string; permission?: AdminPermission }> = [
  { href: '/admin/settings', label: 'Settings', permission: 'settings:edit' },
  { href: '/admin/contact-submissions', label: 'Contact Leads' },
  { href: '/admin/categories', label: 'Categories', permission: 'taxonomy:edit' },
  { href: '/admin/media', label: 'Media Library', permission: 'media:edit' },
  { href: '/admin/analytics', label: 'Analytics', permission: 'analytics:view' },
  { href: '/admin/audit', label: 'Audit Log', permission: 'audit:view' },
  { href: '/admin/settings?tab=discussion', label: 'Comments', permission: 'settings:edit' }
];

const seoLinks: Array<{ href: string; label: string; permission?: AdminPermission }> = [
  { href: '/admin/settings?tab=permalinks', label: 'Permalinks', permission: 'settings:edit' },
  { href: '/admin/settings?tab=seo', label: 'Meta Tags', permission: 'settings:edit' },
  { href: '/admin/settings?tab=sitemap', label: 'Sitemaps', permission: 'settings:edit' }
];

function initialsForUser(user: AdminSessionUser) {
  const source = user.displayName.trim() || user.email.trim();
  const parts = source.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase() ?? '').join('') || 'AD';
}

type AdminNavProps = {
  user: AdminSessionUser;
};

export function AdminNav({ user }: AdminNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const permissionSet = new Set(user.permissions);

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href.split('?')[0]));
  const canAccess = (permission?: AdminPermission) => !permission || permissionSet.has(permission);

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-scroll">
        <Link href="/admin" className="admin-logo">
          <span className="v2-brand-mark">{siteProfile.brand.mark}</span>
          <span>{siteProfile.brand.wordmark}</span>
        </Link>

        <p className="admin-side-title">Core Content</p>
        <ul className="admin-nav-list">
          <li>
            <Link href="/admin" className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
          {canAccess('content:edit') ? (
            <>
              <li>
                <Link
                  href="/admin/blog"
                  className={`admin-nav-link ${isActive('/admin/blog') ? 'active' : ''}`}
                >
                  Posts
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/pages"
                  className={`admin-nav-link ${isActive('/admin/pages') ? 'active' : ''}`}
                >
                  Pages
                </Link>
              </li>
              <li>
                <Link
                  href="/admin/portfolio"
                  className={`admin-nav-link ${isActive('/admin/portfolio') ? 'active' : ''}`}
                >
                  Portfolio
                </Link>
              </li>
            </>
          ) : null}
        </ul>

        {siteManagementLinks.some((item) => canAccess(item.permission)) ? (
          <>
            <p className="admin-side-title">Site Management</p>
            <ul className="admin-nav-list">
              {siteManagementLinks.filter((item) => canAccess(item.permission)).map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}

        {seoLinks.some((item) => canAccess(item.permission)) ? (
          <>
            <p className="admin-side-title">Basic SEO</p>
            <ul className="admin-nav-list">
              {seoLinks.filter((item) => canAccess(item.permission)).map((item) => (
                <li key={item.label}>
                  <Link href={item.href} className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </>
        ) : null}
      </div>

      <div className="admin-sidebar-footer">
        <div className="admin-user-card">
          <span className="admin-user-avatar">{initialsForUser(user)}</span>
          <div>
            <strong>{user.displayName}</strong>
            <p className="muted">{user.email}</p>
            <span className="admin-chip admin-chip-muted">{formatAdminRoleLabel(user.role)}</span>
          </div>
        </div>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
