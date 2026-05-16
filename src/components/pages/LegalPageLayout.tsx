import Link from 'next/link';
import type { ReactNode } from 'react';

export type LegalSection = {
  heading: string;
  content: ReactNode;
};

type LegalPageLayoutProps = {
  title: string;
  subtitle: string;
  tag: string;
  effectiveDate: string;
  breadcrumb: string;
  sections: LegalSection[];
};

export function LegalPageLayout({
  title,
  subtitle,
  tag,
  effectiveDate,
  breadcrumb,
  sections
}: LegalPageLayoutProps) {
  return (
    <main style={{ background: '#F4F4F0', minHeight: '100vh' }}>
      {/* Hero */}
      <section
        style={{
          padding: 'clamp(48px, 8vw, 96px) clamp(20px, 5vw, 48px) clamp(40px, 6vw, 64px)',
          borderBottom: '1px solid rgba(10,14,26,0.1)',
          maxWidth: 900,
          margin: '0 auto',
        }}
      >
        <nav
          aria-label="Breadcrumb"
          style={{
            display: 'flex',
            gap: 10,
            alignItems: 'center',
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 11,
            letterSpacing: '0.08em',
            color: 'rgba(10,14,26,0.45)',
            marginBottom: 40,
          }}
        >
          <Link href="/" style={{ color: 'inherit', textDecoration: 'none' }}>
            Home
          </Link>
          <span>/</span>
          <span style={{ color: 'rgba(10,14,26,0.7)' }}>{breadcrumb}</span>
        </nav>

        <div
          style={{
            display: 'flex',
            gap: 24,
            marginBottom: 24,
            fontFamily: 'var(--font-mono, monospace)',
            fontSize: 10,
            letterSpacing: '0.12em',
            textTransform: 'uppercase',
            color: 'rgba(10,14,26,0.45)',
            flexWrap: 'wrap',
          }}
        >
          <span>[ {tag} ]</span>
          <span>Effective: {effectiveDate}</span>
        </div>

        <h1
          style={{
            fontFamily: 'var(--font-serif, Georgia)',
            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
            fontStyle: 'italic',
            letterSpacing: '-0.025em',
            lineHeight: 1.1,
            color: '#0A0E1A',
            margin: '0 0 24px',
          }}
        >
          {title}
        </h1>

        <p
          style={{
            fontFamily: 'var(--font-tight, sans-serif)',
            fontSize: 16,
            color: 'rgba(10,14,26,0.6)',
            lineHeight: 1.65,
            maxWidth: 600,
            margin: 0,
          }}
        >
          {subtitle}
        </p>
      </section>

      {/* Sections */}
      <section
        style={{
          maxWidth: 900,
          margin: '0 auto',
          padding: 'clamp(40px, 6vw, 64px) clamp(20px, 5vw, 48px)',
          display: 'flex',
          flexDirection: 'column',
          gap: 52,
        }}
      >
        {sections.map((section, index) => (
          <article key={index}>
            <div
              style={{
                display: 'flex',
                alignItems: 'baseline',
                gap: 14,
                marginBottom: 20,
                borderBottom: '1px solid rgba(10,14,26,0.08)',
                paddingBottom: 14,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono, monospace)',
                  fontSize: 11,
                  letterSpacing: '0.1em',
                  color: '#0033FF',
                  flexShrink: 0,
                }}
              >
                {String(index + 1).padStart(2, '0')}
              </span>
              <h2
                style={{
                  fontFamily: 'var(--font-tight, sans-serif)',
                  fontSize: 18,
                  fontWeight: 600,
                  letterSpacing: '-0.012em',
                  color: '#0A0E1A',
                  margin: 0,
                }}
              >
                {section.heading}
              </h2>
            </div>
            <div
              style={{
                fontFamily: 'var(--font-tight, sans-serif)',
                fontSize: 15,
                lineHeight: 1.78,
                color: 'rgba(10,14,26,0.72)',
              }}
            >
              {section.content}
            </div>
          </article>
        ))}
      </section>

      {/* Related Legal Links */}
      <section
        style={{
          background: '#0A0E1A',
          padding: 'clamp(32px, 5vw, 52px) clamp(20px, 5vw, 48px)',
          textAlign: 'center',
        }}
      >
        <p
          style={{
            fontFamily: 'var(--font-tight, sans-serif)',
            fontSize: 13,
            color: 'rgba(244,244,240,0.5)',
            margin: '0 0 12px',
          }}
        >
          Questions or data requests?
        </p>
        <a
          href="mailto:care@vanaila.com"
          style={{
            fontFamily: 'var(--font-tight, sans-serif)',
            fontSize: 16,
            color: '#F4F4F0',
            textDecoration: 'none',
            borderBottom: '1px solid rgba(244,244,240,0.25)',
            paddingBottom: 2,
          }}
        >
          care@vanaila.com →
        </a>
        <div
          style={{
            marginTop: 32,
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
            flexWrap: 'wrap',
          }}
        >
          {[
            { href: '/privacy-policy', label: 'Privacy Policy' },
            { href: '/terms', label: 'Terms of Service' },
            { href: '/data-collection', label: 'Data Collection' },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 12,
                color: 'rgba(244,244,240,0.45)',
                textDecoration: 'none',
                fontFamily: 'var(--font-mono, monospace)',
                letterSpacing: '0.06em',
              }}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
