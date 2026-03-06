'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

import { clearAdminToken } from '@/features/cms/adminClientAuth';

const siteManagementLinks = [
  { href: '/admin/settings', label: 'Settings' },
  { href: '/admin/settings?tab=writing', label: 'Categories' },
  { href: '/admin/settings?tab=media', label: 'Media Library' },
  { href: '/admin/settings?tab=discussion', label: 'Comments' }
];

const seoLinks = [
  { href: '/admin/settings?tab=permalinks', label: 'Permalinks' },
  { href: '/admin/settings?tab=seo', label: 'Meta Tags' },
  { href: '/admin/settings?tab=sitemap', label: 'Sitemaps' }
];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href.split('?')[0]));

  const handleLogout = () => {
    clearAdminToken();
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
          <span className="admin-user-avatar">AD</span>
          <div>
            <strong>Administrator</strong>
            <p className="muted">care@vanaila.com</p>
          </div>
        </div>

        <button type="button" className="admin-logout" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </aside>
  );
}
