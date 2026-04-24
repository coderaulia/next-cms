import Link from 'next/link';

import { siteProfile } from '@/config/site-profile';
import type { SiteSettings } from '@/features/cms/types';

type NavItem = {
  href: string;
  label: string;
  enabled?: boolean;
  children?: NavItem[];
};

type SiteHeaderProps = {
  siteName: string;
  navItems: NavItem[];
  settings: SiteSettings;
};

export function SiteHeader({ siteName, navItems, settings }: SiteHeaderProps) {
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const brandLogo = settings.branding.headerLogo || settings.organizationLogo;
  
  const mapLink = (link: NavItem): NavItem => ({
    href: link.href,
    label: link.label,
    children: link.children?.filter((c) => c.enabled).map(mapLink)
  });

  const configuredLinks = settings.navigation.headerLinks
    .filter((link) => link.enabled)
    .map(mapLink);
    
  const links = configuredLinks.length > 0 ? configuredLinks : navItems;

  return (
    <header className="sticky w-full z-[100] top-0 bg-white/80 backdrop-blur-md border-b border-white/40">
      <div className="max-w-7xl mx-auto px-6 lg:px-12">
        <div className="flex justify-between items-center h-20 md:h-24">
          <Link href="/" className="flex items-center gap-3 md:gap-4 group cursor-pointer no-underline">
            {brandLogo ? (
              <img
                src={brandLogo}
                alt={brandName}
                className="h-10 md:h-12 w-auto max-w-[180px] object-contain"
              />
            ) : (
              <>
                <div className="w-9 h-9 md:w-10 md:h-10 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-lg md:text-xl rotate-3 shadow-lg group-hover:rotate-12 transition-transform duration-500">
                  {siteProfile.brand.mark}
                </div>
                <span className="font-display text-lg md:text-xl font-black tracking-tighter text-deepSlate">
                  {brandName}
                  <span className="text-electricBlue">.</span>
                </span>
              </>
            )}
          </Link>

          <nav className="hidden md:flex space-x-8 items-center" aria-label="Primary navigation">
            {links.map((link) => {
              if (link.children && link.children.length > 0) {
                return (
                  <div key={`${link.href}-${link.label}`} className="relative group">
                    <button
                      className="text-[10px] font-bold uppercase tracking-widest text-slate-600 group-hover:text-electricBlue transition-colors flex items-center gap-1.5 py-2"
                    >
                      {link.label}
                      <svg className="w-3 h-3 text-slate-400 group-hover:text-electricBlue transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </button>
                    <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                      <div className="bg-white border border-slate-100 shadow-xl rounded-2xl p-2 w-48 flex flex-col gap-1">
                        {link.children.map((child) => (
                          <Link
                            key={`${child.href}-${child.label}`}
                            href={child.href}
                            className="block px-4 py-3 text-xs font-semibold text-slate-600 hover:text-electricBlue hover:bg-slate-50 rounded-xl transition-colors no-underline"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    </div>
                  </div>
                );
              }

              return (
                <Link
                  key={`${link.href}-${link.label}`}
                  className="text-[10px] font-bold uppercase tracking-widest text-slate-600 hover:text-electricBlue transition-colors"
                  href={link.href}
                >
                  {link.label}
                </Link>
              );
            })}
            <Link
              className="px-6 py-2.5 bg-vanailaNavy text-white text-[10px] font-bold uppercase tracking-widest rounded-full hover:shadow-lg hover:shadow-blue-900/20 hover:bg-deepSlate transition-all border border-slate-700 no-underline"
              href={settings.navigation.headerCtaHref || '/contact'}
              data-analytics-event="cta_click"
              data-analytics-label={settings.navigation.headerCtaLabel || 'Header CTA'}
            >
              {settings.navigation.headerCtaLabel || 'Book Consultation'}
            </Link>
          </nav>

          <Link
            href={settings.navigation.headerCtaHref || '/contact'}
            className="md:hidden px-4 py-2 bg-vanailaNavy text-white text-[10px] font-bold uppercase tracking-widest rounded-full"
            data-analytics-event="cta_click"
            data-analytics-label={settings.navigation.headerCtaLabel || 'Mobile header CTA'}
          >
            {settings.navigation.headerCtaLabel || 'Contact'}
          </Link>
        </div>
      </div>
    </header>
  );
}
