'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getCachedAdminSession, getAdminSession } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

import { AdminNav } from './AdminNav';
import { NotificationBell } from './admin/NotificationBell';

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

  return (
    <main className="admin-page">
      <div className="admin-shell">
        <AdminNav user={user} />
        <section className="admin-main">
          <header className="admin-main-header">
            <div>
              <h1>{title}</h1>
              {description ? <p>{description}</p> : null}
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
                <span className="admin-chip admin-chip-muted">Loading admin</span>
                <p className="admin-subtle">Restoring your session.</p>
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
