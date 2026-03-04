'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

const siteModules = ['Categories', 'Media Library', 'Comments'];
const seoModules = ['Permalinks', 'Meta Tags', 'Sitemaps'];

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) =>
    pathname === href || (href !== '/admin' && pathname.startsWith(href));

  const handleLogout = () => {
    localStorage.removeItem('cms_admin_token');
    router.replace('/admin');
    router.refresh();
  };

  return (
    <aside className="admin-sidebar">
      <div>
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
          {siteModules.map((name) => (
            <li key={name}>
              <span className="admin-nav-disabled">{name}</span>
            </li>
          ))}
        </ul>

        <p className="admin-side-title">Basic SEO</p>
        <ul className="admin-nav-list">
          {seoModules.map((name) => (
            <li key={name}>
              <span className="admin-nav-disabled">{name}</span>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <div className="admin-user-card">
          <span className="admin-user-avatar">AD</span>
          <div>
            <strong>Administrator</strong>
            <p className="muted">care@vanaila.com</p>
          </div>
        </div>
      </div>

      <button type="button" className="admin-logout" onClick={handleLogout}>
        Logout
      </button>
    </aside>
  );
}
