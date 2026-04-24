import Link from 'next/link';

import { SymbolIcon } from '@/components/ui/symbol-icon';
import { siteProfile } from '@/config/site-profile';
import type { SiteSettings } from '@/features/cms/types';

type NavLink = {
  href: string;
  label: string;
  enabled?: boolean;
  children?: NavLink[];
};

type SiteFooterProps = {
  siteName: string;
  settings: SiteSettings;
};

export function SiteFooter({ siteName, settings }: SiteFooterProps) {
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const footerLogo = settings.branding.footerLogo || settings.branding.headerLogo || settings.organizationLogo;

  const mapLink = (link: NavLink): NavLink => ({
    href: link.href,
    label: link.label,
    children: link.children?.filter((c) => c.enabled).map(mapLink)
  });

  const navigatorLinks = settings.navigation.footerNavigatorLinks.filter((link) => link.enabled);
  const serviceLinks = settings.navigation.footerServiceLinks.filter((link) => link.enabled);
  const footerNavigator =
    navigatorLinks.length > 0
      ? navigatorLinks.map(mapLink)
      : siteProfile.navigation.fallbackNavigator;
  const footerServices =
    serviceLinks.length > 0
      ? serviceLinks.map(mapLink)
      : siteProfile.navigation.fallbackServices;

  const socialLinks = [
    {
      href: settings.social.chatHref || '/contact',
      icon: 'chat',
      className:
        'text-slate-300 hover:text-emerald-400 transition-colors transform hover:scale-110 duration-300'
    },
    {
      href: settings.social.instagramHref || '/contact',
      icon: 'photo_camera',
      className:
        'text-slate-300 hover:text-pink-400 transition-colors transform hover:scale-110 duration-300'
    },
    {
      href: settings.social.websiteHref || '/contact',
      icon: 'public',
      className:
        'text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300'
    },
    {
      href: settings.social.emailHref || '/contact',
      icon: 'alternate_email',
      className:
        'text-slate-300 hover:text-electricBlue transition-colors transform hover:scale-110 duration-300'
    }
  ];

  const copyright =
    settings.branding.copyrightText.trim() || `© ${new Date().getFullYear()} ${brandName}.`;

  return (
    <footer className="bg-white pt-32 pb-12 relative overflow-hidden border-t border-slate-100">
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-2/3 shard-gradient-soft blur-[120px] opacity-20 pointer-events-none" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid md:grid-cols-4 gap-12 md:gap-24 mb-24">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-4 mb-8">
              {footerLogo ? (
                <img src={footerLogo} alt={brandName} className="h-12 w-auto max-w-[220px] object-contain" />
              ) : (
                <>
                  <div className="w-12 h-12 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-2xl rotate-3 shadow-lg">
                    {siteProfile.brand.mark}
                  </div>
                  <span className="font-display text-3xl font-black tracking-tighter text-deepSlate">
                    {brandName}
                    <span className="text-electricBlue">.</span>
                  </span>
                </>
              )}
            </div>
            <p className="text-slate-500 font-light text-lg max-w-md mb-8 leading-relaxed">
              {settings.branding.footerTagline}
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <Link
                  key={`${item.icon}-${item.href}`}
                  className={item.className}
                  href={item.href}
                  data-analytics-event="cta_click"
                  data-analytics-label={`Footer ${item.icon}`}
                >
                  <SymbolIcon className="text-3xl" name={item.icon} />
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Navigator
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              {(footerNavigator as NavLink[]).map((item) => (
                <li key={`${item.href}-${item.label}`} className="flex flex-col gap-2">
                  <Link className="hover:text-electricBlue transition-colors" href={item.href}>
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <ul className="pl-4 space-y-3 mt-1 border-l-2 border-slate-100/50">
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}>
                          <Link className="text-xs text-slate-400 hover:text-electricBlue transition-colors" href={child.href}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Services
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              {(footerServices as NavLink[]).map((item) => (
                <li key={`${item.href}-${item.label}`} className="flex flex-col gap-2">
                  <Link className="hover:text-electricBlue transition-colors" href={item.href}>
                    {item.label}
                  </Link>
                  {item.children && item.children.length > 0 && (
                    <ul className="pl-4 space-y-3 mt-1 border-l-2 border-slate-100/50">
                      {item.children.map((child) => (
                        <li key={`${child.href}-${child.label}`}>
                          <Link className="text-xs text-slate-400 hover:text-electricBlue transition-colors" href={child.href}>
                            {child.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="pt-12 border-t border-slate-100 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
          <p>{copyright}</p>
          <div className="flex gap-8">
            <span className="text-vanailaNavy/80">{settings.branding.footerBadgePrimary}</span>
            <span className="text-slate-500/60">{settings.branding.footerBadgeSecondary}</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
