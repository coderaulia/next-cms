'use client';

import Link from 'next/link';

import { siteProfile } from '@/config/site-profile';
import type { SiteSettings } from '@/features/cms/types';

import { useCursorMode } from './CustomCursor';

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
  const { setMode } = useCursorMode();
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const brandLogo = settings.branding.headerLogo || settings.organizationLogo;

  const mapLink = (link: NavItem): NavItem => ({
    href: link.href,
    label: link.label,
    children: link.children?.filter((c) => c.enabled).map(mapLink),
  });

  const configuredLinks = settings.navigation.headerLinks.filter((l) => l.enabled).map(mapLink);
  const links = configuredLinks.length > 0 ? configuredLinks : navItems;

  return (
    <header
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '22px 48px',
        borderBottom: '1px solid rgba(10,14,26,0.12)',
        position: 'sticky',
        top: 0,
        background: 'rgba(244,244,240,0.88)',
        backdropFilter: 'blur(12px)',
        zIndex: 100,
        fontFamily: 'var(--font-tight, sans-serif)',
        letterSpacing: '-0.011em',
      }}
    >
      {/* Logo + sub-mark */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
        <Link
          href="/"
          className="no-underline"
          onMouseEnter={() => setMode('link')}
          onMouseLeave={() => setMode('default')}
        >
          {brandLogo ? (
            <img
              src={brandLogo}
              alt={brandName}
              style={{ height: 36, width: 'auto', maxWidth: 160, objectFit: 'contain' }}
            />
          ) : (
            <span style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <span
                style={{
                  fontFamily: 'var(--font-serif, Georgia)',
                  fontSize: 26,
                  fontStyle: 'italic',
                  letterSpacing: '-0.02em',
                  color: '#0A0E1A',
                  lineHeight: 1,
                }}
              >
                {brandName.toLowerCase()}
              </span>
              <span style={{ color: '#0033FF', fontSize: 22, lineHeight: 1 }}>●</span>
            </span>
          )}
        </Link>
        <span
          style={{
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.1em',
            color: 'rgba(10,14,26,0.55)',
            paddingLeft: 14,
            borderLeft: '1px solid rgba(10,14,26,0.12)',
          }}
        >
          {siteProfile.brand.wordmark.replace('.', '').toUpperCase()} · SINCE 2018
        </span>
      </div>

      {/* Nav links */}
      <nav className="hidden md:flex" style={{ gap: 36 }}>
        {links.map((link) => (
          <Link
            key={`${link.href}-${link.label}`}
            href={link.href}
            className="no-underline"
            style={{ fontSize: 14, color: '#0A0E1A', transition: 'color 0.2s' }}
            onMouseEnter={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#0033FF';
              setMode('link');
            }}
            onMouseLeave={(e) => {
              (e.currentTarget as HTMLAnchorElement).style.color = '#0A0E1A';
              setMode('default');
            }}
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* CTA pill */}
      <Link
        href={settings.navigation.headerCtaHref || '/contact'}
        className="no-underline hidden md:inline-flex items-center"
        style={{
          background: '#0A0E1A',
          color: '#F4F4F0',
          padding: '10px 18px',
          borderRadius: 999,
          fontSize: 13,
          gap: 10,
          transition: 'background 0.2s',
        }}
        data-analytics-event="cta_click"
        data-analytics-label={settings.navigation.headerCtaLabel || 'Header CTA'}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#0033FF';
          setMode('link');
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = '#0A0E1A';
          setMode('default');
        }}
      >
        {settings.navigation.headerCtaLabel || 'Free consultation'}
        <span>→</span>
      </Link>

      {/* Mobile CTA */}
      <Link
        href={settings.navigation.headerCtaHref || '/contact'}
        className="md:hidden no-underline"
        style={{
          background: '#0A0E1A',
          color: '#F4F4F0',
          padding: '8px 16px',
          borderRadius: 999,
          fontSize: 12,
        }}
        data-analytics-event="cta_click"
        data-analytics-label={settings.navigation.headerCtaLabel || 'Mobile header CTA'}
      >
        {settings.navigation.headerCtaLabel || 'Contact'}
      </Link>
    </header>
  );
}
