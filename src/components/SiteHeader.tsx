import Link from 'next/link';

import type { SiteSettings } from '@/features/cms/types';

type NavItem = {
  href: string;
  label: string;
};

type SiteHeaderProps = {
  siteName: string;
  navItems: NavItem[];
  settings: SiteSettings;
};

export function SiteHeader({ siteName, navItems, settings }: SiteHeaderProps) {
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const configuredLinks = settings.navigation.headerLinks
    .filter((link) => link.enabled)
    .map((link) => ({ href: link.href, label: link.label }));
  const links = configuredLinks.length > 0 ? configuredLinks : navItems;

  return (
    <header className="sticky w-full z-[100] top-0 bg-white/80 backdrop-blur-md border-b border-white/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20 md:h-24">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer no-underline">
            <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-lg md:text-xl rotate-3 shadow-lg group-hover:rotate-12 transition-transform duration-500">
              V
            </div>
            <span className="font-display text-lg md:text-xl font-black tracking-tighter text-deepSlate">
              {brandName}
              <span className="text-electricBlue">.</span>
            </span>
          </Link>

          <nav className="hidden md:flex space-x-8 items-center" aria-label="Primary navigation">
            {links.map((link) => (
              <Link
                key={`${link.href}-${link.label}`}
                className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-electricBlue transition-colors"
                href={link.href}
              >
                {link.label}
              </Link>
            ))}
            <Link
              className="px-6 py-2.5 bg-vanailaNavy text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-blue-900/20 hover:bg-deepSlate transition-all border border-slate-700 no-underline"
              href={settings.navigation.headerCtaHref || '/contact'}
            >
              {settings.navigation.headerCtaLabel || 'Book Consultation'}
            </Link>
          </nav>

          <Link
            href={settings.navigation.headerCtaHref || '/contact'}
            className="md:hidden px-4 py-2 bg-vanailaNavy text-white text-[10px] font-bold uppercase tracking-widest rounded-full"
          >
            {settings.navigation.headerCtaLabel || 'Contact'}
          </Link>
        </div>
      </div>
    </header>
  );
}
