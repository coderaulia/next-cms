'use client';

import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

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
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const brandLogo = settings.branding.headerLogo || settings.organizationLogo;

  const mapLink = (link: NavItem): NavItem => ({
    href: link.href,
    label: link.label,
    children: link.children?.filter((c) => c.enabled).map(mapLink),
  });

  const configuredLinks = settings.navigation.headerLinks.filter((l) => l.enabled).map(mapLink);
  const links = configuredLinks.length > 0 ? configuredLinks : navItems;

  const closeMobileMenu = useCallback(() => setMobileMenuOpen(false), []);

  // Detect whether inline nav fits in the available header space
  useEffect(() => {
    const header = headerRef.current;
    const nav = navRef.current;
    const brand = brandRef.current;
    const cta = ctaRef.current;
    if (!header || !nav || !brand) return;

    const checkOverflow = () => {
      const headerWidth = header.clientWidth;
      const padding = 96; // 48px each side
      const brandWidth = brand.scrollWidth;
      const ctaWidth = cta ? cta.scrollWidth + 24 : 0; // 24px gap
      const navWidth = nav.scrollWidth;
      const gap = 72; // gaps between brand, nav, cta

      const needed = brandWidth + navWidth + ctaWidth + gap + padding;
      setCollapsed(needed > headerWidth);
    };

    checkOverflow();

    const observer = new ResizeObserver(checkOverflow);
    observer.observe(header);

    return () => observer.disconnect();
  }, [links]);

  // Lock body scroll when mobile menu is open
  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileMenuOpen]);

  return (
    <>
      <header
        ref={headerRef}
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
        className="v-site-header"
      >
        {/* Logo + sub-mark */}
        <div ref={brandRef} style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
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
          {!collapsed && (
            <span
              style={{
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                letterSpacing: '0.1em',
                color: 'rgba(10,14,26,0.55)',
                paddingLeft: 14,
                borderLeft: '1px solid rgba(10,14,26,0.12)',
                whiteSpace: 'nowrap',
              }}
            >
              {siteProfile.brand.wordmark.replace('.', '').toUpperCase()} · SINCE 2018
            </span>
          )}
        </div>

        {/* Nav links (inline — hidden when collapsed) */}
        <nav
          ref={navRef}
          style={{
            display: 'flex',
            gap: 36,
            whiteSpace: 'nowrap',
            visibility: collapsed ? 'hidden' : 'visible',
            position: collapsed ? 'absolute' : 'static',
            pointerEvents: collapsed ? 'none' : 'auto',
          }}
        >
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

        {/* CTA pill (inline — hidden when collapsed) */}
        {!collapsed && (
          <Link
            ref={ctaRef}
            href={settings.navigation.headerCtaHref || '/contact'}
            className="no-underline inline-flex items-center"
            style={{
              background: '#0A0E1A',
              color: '#F4F4F0',
              padding: '10px 18px',
              borderRadius: 999,
              fontSize: 13,
              gap: 10,
              transition: 'background 0.2s',
              whiteSpace: 'nowrap',
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
        )}

        {/* Hamburger button (shown only when collapsed) */}
        {collapsed && (
          <button
            type="button"
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileMenuOpen}
            style={{
              background: 'none',
              border: 'none',
              padding: 8,
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 5,
              justifyContent: 'center',
              alignItems: 'center',
              width: 40,
              height: 40,
            }}
          >
            <span
              style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#0A0E1A',
                borderRadius: 2,
                transition: 'transform 0.3s, opacity 0.3s',
                transform: mobileMenuOpen ? 'rotate(45deg) translate(2.5px, 2.5px)' : 'none',
              }}
            />
            <span
              style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#0A0E1A',
                borderRadius: 2,
                transition: 'opacity 0.3s',
                opacity: mobileMenuOpen ? 0 : 1,
              }}
            />
            <span
              style={{
                display: 'block',
                width: 22,
                height: 2,
                background: '#0A0E1A',
                borderRadius: 2,
                transition: 'transform 0.3s, opacity 0.3s',
                transform: mobileMenuOpen ? 'rotate(-45deg) translate(2.5px, -2.5px)' : 'none',
              }}
            />
          </button>
        )}
      </header>

      {/* Collapsed menu overlay */}
      {collapsed && mobileMenuOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            top: 0,
            zIndex: 99,
            background: 'rgba(244,244,240,0.98)',
            backdropFilter: 'blur(12px)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 32,
            fontFamily: 'var(--font-tight, sans-serif)',
            paddingTop: 80,
          }}
        >
          <nav
            style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              gap: 28,
            }}
          >
            {links.map((link) => (
              <Link
                key={`mobile-${link.href}-${link.label}`}
                href={link.href}
                className="no-underline"
                onClick={closeMobileMenu}
                style={{
                  fontSize: 20,
                  color: '#0A0E1A',
                  fontWeight: 500,
                  letterSpacing: '-0.01em',
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          <Link
            href={settings.navigation.headerCtaHref || '/contact'}
            className="no-underline"
            onClick={closeMobileMenu}
            style={{
              background: '#0A0E1A',
              color: '#F4F4F0',
              padding: '12px 24px',
              borderRadius: 999,
              fontSize: 14,
              fontWeight: 500,
              marginTop: 8,
            }}
            data-analytics-event="cta_click"
            data-analytics-label={settings.navigation.headerCtaLabel || 'Mobile header CTA'}
          >
            {settings.navigation.headerCtaLabel || 'Free consultation'}
          </Link>
        </div>
      )}
    </>
  );
}
