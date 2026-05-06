'use client';

import { usePathname } from 'next/navigation';

import type { SiteSettings } from '@/features/cms/types';

import { CustomCursorProvider } from './CustomCursor';
import { SiteFooter } from './SiteFooter';
import { SiteHeader } from './SiteHeader';

type NavItem = {
  href: string;
  label: string;
};

type AppShellProps = {
  siteName: string;
  navItems: NavItem[];
  settings: SiteSettings;
  children: React.ReactNode;
};

export function AppShell({ siteName, navItems, settings, children }: AppShellProps) {
  const pathname = usePathname();
  const isAdminRoute = pathname === '/admin' || pathname.startsWith('/admin/');

  if (isAdminRoute) {
    return <>{children}</>;
  }

  return (
    <CustomCursorProvider>
      <div className="v-cursor-none" style={{ background: '#F4F4F0' }}>
        <SiteHeader siteName={siteName} navItems={navItems} settings={settings} />
        <div className="v2-page">{children}</div>
        <SiteFooter siteName={siteName} settings={settings} />
      </div>
    </CustomCursorProvider>
  );
}
