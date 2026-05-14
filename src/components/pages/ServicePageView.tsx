'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { useCursorMode } from '@/components/CustomCursor';
import type { LandingPage } from '@/features/cms/types';

import { sectionWithFallback } from './sectionContent';

type ServicePageViewProps = {
  page: LandingPage;
};

type ServiceDef = {
  n: string;
  accent: string;
  tone: 'cream' | 'ink' | 'blue' | 'lime';
  tag: string;
  title: string;
  sub: string;
  lede: string;
  blocks: { k: string; v: string }[];
  tags: string[];
  href?: string;
};

const SERVICE_DEFAULTS: ServiceDef[] = [
  {
    n: '01', accent: '#0033FF', tone: 'cream', tag: 'WEB',
    title: 'Website Development',
    sub: 'React & WordPress',
    lede: 'High-performance digital presence, built with the right tool for the job.',
    blocks: [
      { k: 'Framework-Powered Sites', v: 'React-based builds for projects that demand maximum speed and SEO. We shift work from the browser to a build step — ultra-lightweight, instantly fast.' },
      { k: 'Custom WordPress Solutions', v: 'For teams that need an intuitive CMS, we build secure, custom-themed WordPress environments — content updates without technical friction.' },
    ],
    tags: ['React', 'Next.js', 'WordPress', 'Headless CMS'],
    href: '/website-development',
  },
  {
    n: '02', accent: '#FF5B22', tone: 'ink', tag: 'WEB-APP',
    title: 'Custom Business Tools',
    sub: 'Python & React',
    lede: 'Complex, data-driven applications tailored to your internal or customer-facing workflows.',
    blocks: [
      { k: 'Frontend', v: 'React and modern JavaScript for dynamic, responsive interfaces that hold up under real-world load.' },
      { k: 'Backend', v: 'Python for secure, scalable server-side logic and clean API design — built to integrate.' },
      { k: 'Ecosystem Integration', v: 'We connect your app with the CRMs, databases, and automation workflows you already rely on.' },
    ],
    tags: ['Python', 'React', 'PostgreSQL', 'REST', 'CRM'],
    href: '/custom-business-tools',
  },
  {
    n: '03', accent: '#C8E64B', tone: 'blue', tag: 'COMMERCE',
    title: 'Secure Online Shops',
    sub: 'WooCommerce & Custom Stores',
    lede: 'Complete retail ecosystems connecting your products to your customers — and your back office.',
    blocks: [
      { k: 'Payment Gateway Integration', v: 'Seamless Midtrans for the Indonesian market, Stripe for international transactions — checkout that just works.' },
      { k: 'Operational Stability', v: 'Architectures built to handle high-traffic sales events and complex multi-channel inventory without breaking.' },
    ],
    tags: ['WooCommerce', 'Midtrans', 'Stripe', 'Inventory'],
    href: '/secure-online-shops',
  },
  {
    n: '04', accent: '#0033FF', tone: 'lime', tag: 'GROWTH',
    title: 'High-Conversion Landing Pages',
    sub: 'Marketing-led builds',
    lede: 'Pages designed to turn paid traffic into pipeline — for commercial and non-profit campaigns alike.',
    blocks: [
      { k: 'Performance Focused', v: "Engineered for speed so paid clicks and social traffic don't bounce before the page paints." },
      { k: 'Conversion Optimization', v: 'Structured around UX principles that lift lead generation, sign-ups, and engagement — measurable, iterable.' },
    ],
    tags: ['A/B testing', 'Analytics', 'Lead capture', 'SEO'],
  },
  {
    n: '05', accent: '#FF5B22', tone: 'ink', tag: 'MOBILE',
    title: 'Mobile Business App',
    sub: 'React Native',
    lede: 'Reach customers on iOS and Android with a single, high-fidelity codebase.',
    blocks: [
      { k: 'Cross-Platform Efficiency', v: 'React Native delivers native-like performance with the cost-efficiency of one codebase — ship once, run everywhere.' },
      { k: 'Enterprise Features', v: 'Push notifications, location services, and offline data sync — your app keeps working anywhere your users are.' },
    ],
    tags: ['React Native', 'iOS', 'Android'],
    href: '/mobile-business-app',
  },
  {
    n: '06', accent: '#0A0E1A', tone: 'cream', tag: 'INFRASTRUCTURE',
    title: 'Official Business Email',
    sub: 'Email · Domain · Workspace',
    lede: "Establish digital authority and secure your team's day-to-day communications.",
    blocks: [
      { k: 'Company Email Setup', v: 'Professional Google Workspace deployment — enterprise-grade email, cloud storage, and collaboration on yourcompany.com.' },
      { k: 'Professional Mail Services', v: 'Reliable business email on your own domain, configured for high deliverability and security from day one.' },
    ],
    tags: ['Google Workspace', 'M365', 'DNS', 'Deliverability'],
    href: '/official-business-email',
  },
];

const TRUST_ITEMS = [
  { k: 'Versatile expertise', v: 'Our portfolio spans agile SMEs, large corporate entities, and mission-driven non-profits.', tone: 'ink', glyph: '◐' },
  { k: 'Ecosystem ready', v: 'We know the Indonesian tech landscape — your tools integrate cleanly with local payment and logistics providers.', tone: 'blue', glyph: '◑' },
  { k: '8+ years of technical leadership', v: 'Nearly a decade of hands-on development experience. Every line of code is an asset, not a liability.', tone: 'lime', glyph: '◒' },
];

export function ServicePageView({ page }: ServicePageViewProps) {
  const { setMode } = useCursorMode();

  const heroSection = sectionWithFallback(page, 0, {
    id: 'service-hero',
    heading: 'Tailored digital infrastructure, built around your goals.',
    body: "End-to-end technical solutions engineered for performance and scale. We don't sell one-size-fits-all — we choose the optimal stack for your goals, whether you're a high-growth startup, a global corporation, or a mission-driven non-profit.",
    ctaLabel: 'Claim free consultation',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked',
  });

  return (
    <main className="v-svc">
      {/* HERO */}
      <section className="v-svc-hero">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <nav className="v-svc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
            Home
          </Link>
          <span>/</span>
          <span>Solutions</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ SOLUTIONS / 06 SERVICES ]</span>
          <span>END-TO-END · STACK-AGNOSTIC</span>
          <span className="v-svc-status">● BOOKING NEW PROJECTS</span>
        </div>

        <h1 className="v-svc-h1">
          Tailored digital
          <br />
          <em>infrastructure</em>,
          <br />
          built around <del>templates.</del>
          <br />
          <em>your goals.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>{heroSection.body}</p>
          <div className="v-svc-actions">
            <Link
              href="/contact"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Claim free consultation</span>
              <span>→</span>
            </Link>
            <Link
              href="/portfolio"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              See selected work
            </Link>
          </div>
        </div>

        <div className="v-svc-index">
          {SERVICE_DEFAULTS.map((svc) => (
            <a
              key={svc.n}
              href={`#svc-${svc.n}`}
              className="v-svc-pill"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span className="v-svc-pill-n">{svc.n}</span>
              <span>{svc.tag}</span>
            </a>
          ))}
        </div>
      </section>

      {/* SERVICE BLOCKS */}
      {SERVICE_DEFAULTS.map((svc) => {
        const tags = svc.tags;

        return (
          <section
            id={`svc-${svc.n}`}
            key={svc.n}
            className={`v-svc-block v-svc-block-${svc.tone}`}
            style={{ '--accent': svc.accent } as CSSProperties}
          >
            <div className="v-svc-block-marker">
              <span className="v-svc-block-n">{svc.n}</span>
              <span className="v-svc-block-tag">{svc.tag}</span>
            </div>

            <div className="v-svc-block-head">
              <h2>{svc.title}</h2>
              <span className="v-svc-block-sub">{svc.sub}</span>
            </div>

            <p className="v-svc-lede">{svc.lede}</p>

            <div className="v-svc-deliverables">
              {svc.blocks.map((block, bi) => (
                <div key={bi} className="v-svc-deliverable">
                  <div className="v-svc-deliverable-header">
                    <span>{String(bi + 1).padStart(2, '0')}</span>
                    <span className="v-svc-deliverable-bar" />
                  </div>
                  <h3>{block.k}</h3>
                  <p>{block.v}</p>
                </div>
              ))}
            </div>

            <div className="v-svc-block-foot">
              <div className="v-svc-tags">
                {tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
              <div className="v-svc-block-links">
                {svc.href && (
                  <Link
                    href={svc.href}
                    className="v-svc-discuss-link"
                    onMouseEnter={() => setMode('link')}
                    onMouseLeave={() => setMode('default')}
                  >
                    Learn more <span>→</span>
                  </Link>
                )}
                <Link
                  href="/contact"
                  className="v-svc-discuss-link"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  Discuss this solution <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* WHY US */}
      <section className="v-svc-why">
        <div className="v-svc-why-head">
          <span className="v-svc-why-eyebrow">[ TRUST ] WHY ORGANIZATIONS CHOOSE VANAILA</span>
          <h2>
            Eight years of
            <br />
            engineering, <em>compounding.</em>
          </h2>
        </div>
        <div className="v-svc-why-grid">
          {TRUST_ITEMS.map((trust, i) => (
            <div key={trust.k} className={`v-svc-why-cell v-svc-why-${trust.tone}`}>
              <span className="v-svc-why-n">0{i + 1}</span>
              <h3>{trust.k}</h3>
              <p>{trust.v}</p>
              <div className="v-svc-why-glyph">{trust.glyph}</div>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="v-svc-cta">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>
        <span className="v-svc-cta-eye">[ NEXT STEP ]</span>
        <h2>
          Pick a discipline,
          <br />
          or <span className="v-svc-cta-blue">compose them.</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>
            Tell us what you&apos;re building. We&apos;ll come back within two business days with a recommended stack
            and an honest scope — free, no commitment.
          </p>
          <div className="v-svc-cta-actions">
            <Link
              href="/contact"
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Claim free consultation</span>
              <span>→</span>
            </Link>
            <a
              href="mailto:care@vanaila.com"
              className="v-svc-cta-mail"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              or email care@vanaila.com
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
