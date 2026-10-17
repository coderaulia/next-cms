'use client';

import type { ReactNode } from 'react';
import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu } from 'lucide-react';

import { getCachedAdminSession, getAdminSession } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

import { AdminNav } from './AdminNav';
import { NotificationBell } from './admin/NotificationBell';
import { AdminLoading } from './admin/AdminLoading';

type AdminShellProps = {
  title: string;
  description?: string;
  actions?: ReactNode | ((user: AdminSessionUser) => ReactNode);
  children: (user: AdminSessionUser) => ReactNode;
};

function loginHref(pathname: string) {
  const next = pathname.startsWith('/admin') ? pathname : '/admin';
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

export function AdminShell({ title, description, actions, children }: AdminShellProps) {
  const pathname = usePathname();
  const router = useRouter();
  const cachedUser = getCachedAdminSession();
  const [user, setUser] = useState<AdminSessionUser | null>(cachedUser ?? null);
  const [ready, setReady] = useState(cachedUser !== undefined);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAdminSession()
      .then((sessionUser) => {
        if (cancelled) return;
        if (sessionUser) {
          setUser(sessionUser);
          return;
        }
        setUser(null);
        router.replace(loginHref(pathname));
      })
      .finally(() => {
        if (!cancelled) setReady(true);
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  const breadcrumbs = useMemo(() => {
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0 || (segments.length === 1 && segments[0] === 'admin')) {
      return [
        { label: 'Admin', href: '/admin', isLast: false },
        { label: 'Dashboard', href: '/admin', isLast: true }
      ];
    }

    const labelMap: Record<string, string> = {
      admin: 'Admin',
      blog: 'Posts',
      pages: 'Pages',
      portfolio: 'Portfolio',
      data: 'Data & Backup',
      settings: 'Settings',
      'contact-submissions': 'Contact Leads',
      categories: 'Categories',
      media: 'Media Library',
      team: 'Team',
      sessions: 'Sessions',
      analytics: 'Analytics',
      audit: 'Audit Log',
      manual: 'Manual',
      'link-checker': 'Link Checker',
      redirects: 'Redirects',
      new: 'New',
      edit: 'Edit'
    };

    let accHref = '';
    return segments.map((seg, index) => {
      accHref += `/${seg}`;
      const isLast = index === segments.length - 1;
      const formatted = labelMap[seg] || seg.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
      return {
        label: formatted,
        href: accHref,
        isLast
      };
    });
  }, [pathname]);

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <AdminNav user={user} isOpen={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />
        {mobileNavOpen ? (
          <div
            className="admin-sidebar-backdrop"
            onClick={() => setMobileNavOpen(false)}
            aria-hidden="true"
          />
        ) : null}
        <section className="admin-main">
          <header className="admin-main-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <button
                type="button"
                className="admin-mobile-nav-toggle"
                onClick={() => setMobileNavOpen((prev) => !prev)}
                aria-label="Toggle navigation menu"
              >
                <Menu size={20} />
              </button>
              <div className="admin-main-header-title-wrap">
                <nav aria-label="Breadcrumb" className="admin-breadcrumbs">
                  {breadcrumbs.map((crumb, idx) => (
                    <span key={crumb.href + idx} style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      {crumb.isLast ? (
                        <span className="admin-breadcrumb-current">{crumb.label}</span>
                      ) : (
                        <Link href={crumb.href} className="admin-breadcrumb-link">
                          {crumb.label}
                        </Link>
                      )}
                      {!crumb.isLast && <span className="admin-breadcrumb-separator">/</span>}
                    </span>
                  ))}
                </nav>
                <h1>{title}</h1>
                {description ? <p>{description}</p> : null}
              </div>
            </div>
            <div className="admin-main-header-actions">
              <NotificationBell />
              {user && actions ? (
                <div>{typeof actions === 'function' ? actions(user) : actions}</div>
              ) : null}
            </div>
          </header>
          {!ready ? (
            <div className="admin-auth-loading">
              <div className="admin-auth-loading-panel">
                <AdminLoading label="Restoring your session..." />
              </div>
            </div>
          ) : user ? (
            children(user)
          ) : null}
        </section>
      </div>
    </main>
  );
}
