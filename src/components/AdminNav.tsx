'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { logoutAdmin } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

const siteManagementLinks = [
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/contact-submissions', label: 'Contact Leads' },
  { href: '/admin/categories', label: 'Categories' },
  { href: '/admin/media', label: 'Media Library' },
  { href: '/admin/settings?tab=discussion', label: 'Comments' }
];

const seoLinks = [
  { href: '/admin/settings?tab=permalinks', label: 'Permalinks' },
  { href: '/admin/settings?tab=seo', label: 'Meta Tags' },
  { href: '/admin/settings?tab=sitemap', label: 'Sitemaps' }
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

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href.split('?')[0]));

  const handleLogout = async () => {
    await logoutAdmin();
    router.replace('/admin/login');
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <div className="admin-sidebar-scroll">
        <Link href="/admin" className="admin-logo">
          <span className="v2-brand-mark">V</span>
          <span>vanaila.</span>
        </Link>

        <p className="admin-side-title">Core Content</p>
        <ul className="admin-nav-list">
          <li>
            <Link href="/admin" className={`admin-nav-link ${isActive('/admin') ? 'active' : ''}`}>
              Dashboard
            </Link>
          </li>
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
        </ul>

        <p className="admin-side-title">Site Management</p>
        <ul className="admin-nav-list">
          {siteManagementLinks.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>

        <p className="admin-side-title">Basic SEO</p>
        <ul className="admin-nav-list">
          {seoLinks.map((item) => (
            <li key={item.label}>
              <Link href={item.href} className={`admin-nav-link ${isActive(item.href) ? 'active' : ''}`}>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="admin-sidebar-footer">
        <div className="admin-user-card">
          <span className="admin-user-avatar">{initialsForUser(user)}</span>
          <div>
            <strong>{user.displayName}</strong>
            <p className="muted">{user.email}</p>
          </div>
        </div>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
