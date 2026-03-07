import Link from 'next/link';

import type { SiteSettings } from '@/features/cms/types';

type SiteFooterProps = {
  siteName: string;
  settings: SiteSettings;
};

const fallbackNavigator = [
  { href: '/', label: 'Home' },
  { href: '/about', label: 'About Us' },
  { href: '/service', label: 'Services' },
  { href: '/blog', label: 'Insights' },
  { href: '/partnership', label: 'Partnership' },
  { href: '/contact', label: 'Contact' }
];

const fallbackServices = [
  { href: '/website-development', label: 'Website Development' },
  { href: '/secure-online-shops', label: 'Secure Online Shops' },
  { href: '/mobile-business-app', label: 'Mobile Business App' },
  { href: '/official-business-email', label: 'Official Business Email' },
  { href: '/custom-business-tools', label: 'Custom Business Tools' }
];

export function SiteFooter({ siteName, settings }: SiteFooterProps) {
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;

  const navigatorLinks = settings.navigation.footerNavigatorLinks.filter((link) => link.enabled);
  const serviceLinks = settings.navigation.footerServiceLinks.filter((link) => link.enabled);
  const footerNavigator =
    navigatorLinks.length > 0
      ? navigatorLinks.map((link) => ({ href: link.href, label: link.label }))
      : fallbackNavigator;
  const footerServices =
    serviceLinks.length > 0
      ? serviceLinks.map((link) => ({ href: link.href, label: link.label }))
      : fallbackServices;

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
              <div className="w-12 h-12 bg-gradient-to-br from-vanailaNavy to-deepSlate rounded-xl flex items-center justify-center text-white font-display font-black text-2xl rotate-3 shadow-lg">
                V
              </div>
              <span className="font-display text-3xl font-black tracking-tighter text-deepSlate">
                {brandName}
                <span className="text-electricBlue">.</span>
              </span>
            </div>
            <p className="text-slate-500 font-light text-lg max-w-md mb-8 leading-relaxed">
              {settings.branding.footerTagline}
            </p>
            <div className="flex space-x-6">
              {socialLinks.map((item) => (
                <Link key={`${item.icon}-${item.href}`} className={item.className} href={item.href}>
                  <span className="material-symbols-outlined text-3xl">{item.icon}</span>
                </Link>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Navigator
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              {footerNavigator.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link className="hover:text-electricBlue transition-colors" href={item.href}>
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-display font-bold text-deepSlate text-xs mb-8 uppercase tracking-[0.3em] flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" /> Services
            </h5>
            <ul className="space-y-4 text-sm text-slate-500 font-medium uppercase tracking-wider">
              {footerServices.map((item) => (
                <li key={`${item.href}-${item.label}`}>
                  <Link className="hover:text-electricBlue transition-colors" href={item.href}>
                    {item.label}
                  </Link>
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
