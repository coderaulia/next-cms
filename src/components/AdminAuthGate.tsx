'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getAdminSession, getCachedAdminSession } from '@/features/cms/adminClientAuth';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

type AdminAuthGateProps = {
  children: (user: AdminSessionUser) => ReactNode;
};

function loginHref(pathname: string) {
  const next = pathname.startsWith('/admin') ? pathname : '/admin';
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
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
        if (!cancelled) {
          setReady(true);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [pathname, router]);

  if (!ready) {
    return (
      <div className="admin-auth-loading">
        <div className="admin-auth-loading-panel">
          <span className="admin-chip admin-chip-muted">Loading admin</span>
          <p className="admin-subtle">Restoring your session.</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children(user)}</>;
}