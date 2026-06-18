'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import { Link } from '@/i18n/navigation';
import { siteProfile } from '@/config/site-profile';
import type { SiteSettings } from '@/features/cms/types';

import { useCursorMode } from './CustomCursor';
import { LanguageToggle } from './LanguageToggle';

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
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const dropdownTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const brandRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);
  const brandName = siteName.endsWith('.') ? siteName.slice(0, -1) : siteName;
  const brandLogo = settings.branding.headerLogo || settings.organizationLogo;

  const mapLink = (link: NavItem): NavItem => ({
    href: link.href,
    label: link.label,
    children: link.children?.filter((c) => c.enabled !== false).map(mapLink),
  });

  const configuredLinks = settings.navigation.headerLinks.filter((l) => l.enabled).map(mapLink);
  const links = configuredLinks.length > 0 ? configuredLinks : navItems;

  const handleDropdownEnter = (label: string) => {
    if (dropdownTimeoutRef.current) {
      clearTimeout(dropdownTimeoutRef.current);
      dropdownTimeoutRef.current = null;
    }
    setOpenDropdown(label);
  };

  const handleDropdownLeave = () => {
    dropdownTimeoutRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 150);
  };

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
                fetchPriority="high"
                decoding="async"
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
          {links.map((link) =>
            link.children && link.children.length > 0 ? (
              <div
                key={`${link.href}-${link.label}`}
                style={{ position: 'relative' }}
                onMouseEnter={() => handleDropdownEnter(link.label)}
                onMouseLeave={handleDropdownLeave}
              >
                <button
                  type="button"
                  className="no-underline"
                  style={{
                    fontSize: 14,
                    color: openDropdown === link.label ? '#0033FF' : '#0A0E1A',
                    transition: 'color 0.2s',
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    fontFamily: 'inherit',
                    letterSpacing: 'inherit',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4,
                  }}
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                  aria-expanded={openDropdown === link.label}
                  aria-haspopup="true"
                >
                  {link.label}
                  <svg
                    width="10"
                    height="6"
                    viewBox="0 0 10 6"
                    fill="none"
                    style={{
                      transition: 'transform 0.2s',
                      transform: openDropdown === link.label ? 'rotate(180deg)' : 'rotate(0deg)',
                    }}
                  >
                    <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                {openDropdown === link.label && (
                  <div
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      paddingTop: 12,
                      zIndex: 110,
                    }}
                  >
                    <div
                      style={{
                        background: '#FFFFFF',
                        borderRadius: 12,
                        boxShadow: '0 8px 32px rgba(10,14,26,0.12), 0 2px 8px rgba(10,14,26,0.08)',
                        border: '1px solid rgba(10,14,26,0.08)',
                        padding: '8px 0',
                        minWidth: 180,
                      }}
                    >
                      {link.children.map((child) => (
                        <Link
                          key={`${child.href}-${child.label}`}
                          href={child.href}
                          className="no-underline block"
                          style={{
                            fontSize: 14,
                            color: '#0A0E1A',
                            padding: '10px 20px',
                            transition: 'background 0.15s, color 0.15s',
                          }}
                          onMouseEnter={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'rgba(0,51,255,0.06)';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#0033FF';
                            setMode('link');
                          }}
                          onMouseLeave={(e) => {
                            (e.currentTarget as HTMLAnchorElement).style.background = 'transparent';
                            (e.currentTarget as HTMLAnchorElement).style.color = '#0A0E1A';
                            setMode('default');
                          }}
                        >
                          {child.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
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
            )
          )}
        </nav>

        {/* Language toggle + CTA pill (inline — hidden when collapsed) */}
        {!collapsed && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <LanguageToggle />
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
          </div>
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
            {links.map((link) =>
              link.children && link.children.length > 0 ? (
                <div key={`mobile-${link.href}-${link.label}`} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 600,
                      letterSpacing: '0.08em',
                      textTransform: 'uppercase',
                      color: 'rgba(10,14,26,0.5)',
                    }}
                  >
                    {link.label}
                  </span>
                  {link.children.map((child) => (
                    <Link
                      key={`mobile-${child.href}-${child.label}`}
                      href={child.href}
                      className="no-underline"
                      onClick={closeMobileMenu}
                      style={{
                        fontSize: 18,
                        color: '#0A0E1A',
                        fontWeight: 500,
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {child.label}
                    </Link>
                  ))}
                </div>
              ) : (
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
              )
            )}
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

          <div style={{ marginTop: 8 }}>
            <LanguageToggle />
          </div>
        </div>
      )}
    </>
  );
}
