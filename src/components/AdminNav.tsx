'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';

export function AdminNav() {
  const pathname = usePathname();
  const router = useRouter();

  const handleLogout = () => {
    localStorage.removeItem('cms_admin_token');
    router.replace('/admin');
    router.refresh();
  };

  const linkClass = (href: string) => (pathname.startsWith(href) ? 'active' : '');

  return (
    <nav className="admin-nav">
      <Link href="/admin" className={linkClass('/admin')}>
        Dashboard
      </Link>
      <Link href="/admin/pages" className={linkClass('/admin/pages')}>
        Pages
      </Link>
      <Link href="/admin/blog" className={linkClass('/admin/blog')}>
        Blog
      </Link>
      <button type="button" onClick={handleLogout}>
        Logout
      </button>
    </nav>
  );
}
