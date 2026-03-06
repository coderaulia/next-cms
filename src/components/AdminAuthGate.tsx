'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { getAdminSession } from '@/features/cms/adminClientAuth';
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
  const [user, setUser] = useState<AdminSessionUser | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;

    getAdminSession()
      .then((sessionUser) => {
        if (cancelled) return;

        if (sessionUser) {
          setUser(sessionUser);
          return;
        }

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

  if (!ready || !user) {
    return <p>Checking admin access...</p>;
  }

  return <>{children(user)}</>;
}
