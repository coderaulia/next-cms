import Link from 'next/link';

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
    children: link.children?.filter((c) => c.enabled).map(mapLink),
  });

  const navigatorLinks = settings.navigation.footerNavigatorLinks.filter((l) => l.enabled);
  const serviceLinks = settings.navigation.footerServiceLinks.filter((l) => l.enabled);
  const footerNavigator =
    navigatorLinks.length > 0 ? navigatorLinks.map(mapLink) : siteProfile.navigation.fallbackNavigator;
  const footerServices =
    serviceLinks.length > 0 ? serviceLinks.map(mapLink) : siteProfile.navigation.fallbackServices;

  const copyright =
    settings.branding.copyrightText.trim() || `© ${new Date().getFullYear()} ${brandName}.`;

  return (
    <footer
      className="v-site-footer"
      style={{
        background: '#0A0E1A',
        color: '#F4F4F0',
        fontFamily: 'var(--font-tight, sans-serif)',
      }}
    >
      <div className="v-footer-grid">
        <div>
          {footerLogo ? (
            <img
              src={footerLogo}
              alt={brandName}
              style={{ height: 48, width: 'auto', maxWidth: 220, objectFit: 'contain', marginBottom: 16, borderRadius: 0 }}
            />
          ) : (
            <div style={{ marginBottom: 16, lineHeight: 1 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif, Georgia)',
                  fontSize: 52,
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                  color: '#F4F4F0',
                }}
              >
                {brandName.toLowerCase()}
              </span>
              <span style={{ color: '#0033FF', fontSize: 44 }}>●</span>
            </div>
          )}
          <p style={{ fontSize: 14, color: 'rgba(244,244,240,0.6)', margin: '16px 0 0', lineHeight: 1.5 }}>
            {settings.branding.footerTagline || 'Faster, smarter, and built to scale.'}
          </p>
        </div>

        <div className="v-footer-links-grid">
          {[
            { title: 'Company', items: footerNavigator as NavLink[] },
            { title: 'Solutions', items: footerServices as NavLink[] },
          ].map(({ title, items }) => (
            <div key={title}>
              <h5
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: 'rgba(244,244,240,0.5)',
                  margin: '0 0 18px',
                  textTransform: 'uppercase',
                  fontWeight: 500,
                }}
              >
                {title}
              </h5>
              {items.map((item) => (
                <Link
                  key={`${item.href}-${item.label}`}
                  href={item.href}
                  className="no-underline block"
                  style={{ fontSize: 14, color: 'rgba(244,244,240,0.85)', padding: '4px 0' }}
                >
                  {item.label}
                </Link>
              ))}
            </div>
          ))}

          <div>
            <h5
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 11,
                letterSpacing: '0.1em',
                color: 'rgba(244,244,240,0.5)',
                margin: '0 0 18px',
                textTransform: 'uppercase',
                fontWeight: 500,
              }}
            >
              Connect
            </h5>
            {[
              { href: settings.social.instagramHref, label: 'Instagram' },
              { href: settings.social.chatHref, label: 'WhatsApp' },
              { href: settings.social.websiteHref, label: 'Website' },
              { href: settings.social.emailHref, label: settings.social.emailHref?.replace('mailto:', '') || 'Email' },
            ]
              .filter((s) => s.href)
              .map((s) => (
                <Link
                  key={s.href}
                  href={s.href!}
                  className="no-underline block"
                  style={{ fontSize: 14, color: 'rgba(244,244,240,0.85)', padding: '4px 0' }}
                >
                  {s.label}
                </Link>
              ))}
          </div>
        </div>
      </div>

      <div className="v-footer-bottom">
        <span>{copyright}</span>
        <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap' }}>
          {settings.branding.footerBadgePrimary && <span>{settings.branding.footerBadgePrimary}</span>}
          {settings.branding.footerBadgeSecondary && (
            <span style={{ opacity: 0.6 }}>{settings.branding.footerBadgeSecondary}</span>
          )}
        </div>
      </div>
    </footer>
  );
}
