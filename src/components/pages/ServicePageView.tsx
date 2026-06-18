'use client';

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { useCursorMode } from '@/components/CustomCursor';
import { Link } from '@/i18n/navigation';
import type { LandingPage } from '@/features/cms/types';

import { sectionWithFallback } from './sectionContent';

type ServicePageViewProps = {
  page: LandingPage;
};

type ServiceText = {
  title: string;
  sub: string;
  lede: string;
  blocks: { k: string; v: string }[];
};

// Structural (non-translatable) service metadata. Display copy lives in
// messages under `service.items` (same order) and is pulled via t.raw().
const SERVICE_META: Array<{
  n: string;
  accent: string;
  tone: 'cream' | 'ink' | 'blue' | 'lime';
  tag: string;
  tags: string[];
  href?: string;
}> = [
  { n: '01', accent: '#0033FF', tone: 'cream', tag: 'WEB', tags: ['React', 'Next.js', 'WordPress', 'Headless CMS'], href: '/website-development' },
  { n: '02', accent: '#FF5B22', tone: 'ink', tag: 'WEB-APP', tags: ['Python', 'React', 'PostgreSQL', 'REST', 'CRM'], href: '/custom-business-tools' },
  { n: '03', accent: '#C8E64B', tone: 'blue', tag: 'COMMERCE', tags: ['WooCommerce', 'Midtrans', 'Stripe', 'Inventory'], href: '/secure-online-shops' },
  { n: '04', accent: '#0033FF', tone: 'lime', tag: 'GROWTH', tags: ['A/B testing', 'Analytics', 'Lead capture', 'SEO'] },
  { n: '05', accent: '#FF5B22', tone: 'ink', tag: 'MOBILE', tags: ['React Native', 'iOS', 'Android'], href: '/mobile-business-app' },
  { n: '06', accent: '#0A0E1A', tone: 'cream', tag: 'INFRASTRUCTURE', tags: ['Google Workspace', 'M365', 'DNS', 'Deliverability'], href: '/official-business-email' },
];

const TRUST_META = [
  { tone: 'ink', glyph: '◐' },
  { tone: 'blue', glyph: '◑' },
  { tone: 'lime', glyph: '◒' },
];

const PRODUCT_META = [
  { n: '01', href: '/hris' },
  { n: '02', href: '/psikotest' },
  { n: '03', href: '/flowraze' },
  { n: '04', href: '/atelier' },
];

export function ServicePageView({ page }: ServicePageViewProps) {
  const { setMode } = useCursorMode();
  const t = useTranslations('service');
  const serviceItems = t.raw('items') as ServiceText[];
  const trustItems = t.raw('trust') as Array<{ k: string; v: string }>;
  const productItems = t.raw('products') as Array<{ title: string; desc: string }>;
  const templateItems = t.raw('templates') as Array<{ title: string; desc: string }>;

  const heroSection = sectionWithFallback(page, 0, {
    id: 'service-hero',
    heading: 'Built to grow your business, not just your tech stack.',
    body: t('heroBody'),
    ctaLabel: t('heroCta'),
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
          {t('h1Line1')}
          <br />
          <em>{t('h1Accent1')}</em>,
          <br />
          not just <del>{t('h1Strike')}</del>
          <br />
          <em>{t('h1Accent2')}</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>{heroSection.body}</p>
          <div className="v-svc-actions">
            <Link
              href="/contact?interest=website"
              className="v-svc-btn-primary"
              data-analytics-event="cta_click"
              data-analytics-label="Service hero primary CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{t('heroCta')}</span>
              <span>→</span>
            </Link>
            <Link
              href="/portfolio"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {t('heroSecondaryCta')}
            </Link>
          </div>
        </div>

        <div className="v-svc-index">
          {SERVICE_META.map((svc) => (
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
      {SERVICE_META.map((svc, index) => {
        const text = serviceItems[index];

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
              <h2>{text.title}</h2>
              <span className="v-svc-block-sub">{text.sub}</span>
            </div>

            <p className="v-svc-lede">{text.lede}</p>

            <div className="v-svc-deliverables">
              {text.blocks.map((block, bi) => (
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
                {svc.tags.map((tag) => (
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
                    {t('learnMore')} <span>→</span>
                  </Link>
                )}
                <Link
                  href="/contact?interest=website"
                  className="v-svc-discuss-link"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {t('discussLink')} <span>→</span>
                </Link>
              </div>
            </div>
          </section>
        );
      })}

      {/* PRODUCTS CROSS-REFERENCE */}
      <section className="v-svc-block v-svc-block-cream" style={{ '--accent': '#0A0E1A' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">●</span>
          <span className="v-svc-block-tag">{t('productsTag')}</span>
        </div>

        <div className="v-svc-block-head">
          <h2>{t('productsHeading')}</h2>
          <span className="v-svc-block-sub">{t('productsSub')}</span>
        </div>

        <p className="v-svc-lede">{t('productsLede')}</p>

        <div className="v-svc-deliverables">
          {PRODUCT_META.map((product, index) => (
            <div key={product.n} className="v-svc-deliverable">
              <div className="v-svc-deliverable-header">
                <span>{product.n}</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{productItems[index].title}</h3>
              <p>{productItems[index].desc}</p>
              <Link
                href={product.href}
                className="v-svc-discuss-link"
                style={{ marginTop: 8 }}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                {t('learnMore')} <span>→</span>
              </Link>
            </div>
          ))}
        </div>

        <Link
          href="/products"
          className="v-svc-discuss-link"
          style={{ marginTop: 32, display: 'inline-flex' }}
          onMouseEnter={() => setMode('link')}
          onMouseLeave={() => setMode('default')}
        >
          {t('productsAllLink')} <span>→</span>
        </Link>
      </section>

      {/* TEMPLATES CROSS-REFERENCE */}
      <section className="v-svc-block v-svc-block-ink" style={{ '--accent': '#C8E64B' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">◈</span>
          <span className="v-svc-block-tag">{t('templatesTag')}</span>
        </div>

        <div className="v-svc-block-head">
          <h2>{t('templatesHeading')}</h2>
          <span className="v-svc-block-sub">{t('templatesSub')}</span>
        </div>

        <p className="v-svc-lede">{t('templatesLede')}</p>

        <div className="v-svc-deliverables">
          {templateItems.map((item, index) => (
            <div key={index} className="v-svc-deliverable">
              <div className="v-svc-deliverable-header">
                <span>{String(index + 1).padStart(2, '0')}</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>

        <Link
          href="/templates"
          className="v-svc-discuss-link"
          style={{ marginTop: 32, display: 'inline-flex' }}
          onMouseEnter={() => setMode('link')}
          onMouseLeave={() => setMode('default')}
        >
          {t('templatesAllLink')} <span>→</span>
        </Link>
      </section>

      {/* WHY US */}
      <section className="v-svc-why">
        <div className="v-svc-why-head">
          <span className="v-svc-why-eyebrow">{t('trustEyebrow')}</span>
          <h2>
            {t('trustHeadingLine1')}
            <br />
            {t('trustHeadingLine2')} <em>{t('trustHeadingAccent')}</em>
          </h2>
        </div>
        <div className="v-svc-why-grid">
          {trustItems.map((trust, i) => (
            <div key={trust.k} className={`v-svc-why-cell v-svc-why-${TRUST_META[i].tone}`}>
              <span className="v-svc-why-n">0{i + 1}</span>
              <h3>{trust.k}</h3>
              <p>{trust.v}</p>
              <div className="v-svc-why-glyph">{TRUST_META[i].glyph}</div>
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
          {t('ctaHeadingLine1')}
          <br />
          {t('ctaHeadingLine2')} <span className="v-svc-cta-blue">{t('ctaHeadingAccent')}</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>{t('ctaBody')}</p>
          <div className="v-svc-cta-actions">
            <Link
              href="/contact?interest=website"
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              data-analytics-event="cta_click"
              data-analytics-label="Service footer primary CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{t('ctaButton')}</span>
              <span>→</span>
            </Link>
            <a
              href="mailto:care@vanaila.com"
              className="v-svc-cta-mail"
              data-analytics-event="cta_click"
              data-analytics-label="Service footer email CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {t('ctaEmail')}
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
