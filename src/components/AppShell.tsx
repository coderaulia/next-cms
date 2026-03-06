'use client';

import { usePathname } from 'next/navigation';

import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  siteName: string;
  navItems: NavItem[];
  children: React.ReactNode;
};

export function AppShell({ siteName, navItems, children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <>
      <SiteHeader siteName={siteName} navItems={navItems} />
      <div className="v2-page">{children}</div>
      <SiteFooter siteName={siteName} />
    </>
  );
}
