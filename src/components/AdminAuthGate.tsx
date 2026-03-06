'use client';

import { ReactNode, useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';

import { clearAdminToken, readAdminToken, verifyAdminToken } from '@/features/cms/adminClientAuth';

type AdminAuthGateProps = {
  children: (token: string) => ReactNode;
};

function loginHref(pathname: string) {
  const next = pathname.startsWith('/admin') ? pathname : '/admin';
  return `/admin/login?next=${encodeURIComponent(next)}`;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [token, setToken] = useState<string>('');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const stored = readAdminToken();
    if (!stored) {
      router.replace(loginHref(pathname));
      setReady(true);
      return;
    }

    verifyAdminToken(stored)
      .then((ok) => {
        if (ok) {
          setToken(stored);
          return;
        }
        clearAdminToken();
        router.replace(loginHref(pathname));
      })
      .finally(() => setReady(true));
  }, [pathname, router]);

  if (!ready || !token) {
    return <p>Checking admin access...</p>;
  }

  return <>{children(token)}</>;
}
