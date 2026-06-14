'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';

const products = [
  {
    n: 'PRODUCT 01',
    pill: 'Assessment',
    name: 'Psikotest',
    tagline: (
      <>
        Assessment delivery, scoring, and <em>interpretation</em> — in one workspace.
      </>
    ),
    desc: 'The assessment infrastructure your HR team and licensed psychologists actually want to use. Invite by link, run DISC · IQ · Big 5 · Workload · Custom, and release reports with reviewer-written interpretation.',
    features: ['DISC', 'IQ', 'Big 5', 'Workload', 'Custom', 'Live Quiz', 'Bilingual', 'PDF Export'],
    img: '/psikotest/dashboard-assessment.png',
    shotLabel: 'WORKSPACE',
    tone: 'blue',
    dotColor: '#C8E64B',
    href: '/psikotest',
    cta: 'Explore Psikotest',
  },
  {
    n: 'PRODUCT 02',
    pill: 'Performance',
    name: 'HR Suite',
    tagline: (
      <>
        KPIs, competencies, and <em>HR letters</em> — finally in one record.
      </>
    ),
    desc: 'Replaces the spreadsheet your HR team is quietly maintaining. Performance management, training need analysis, and HR documents — engineered around one employee record, one approval workflow, one audit trail.',
    features: ['KPI Management', 'TNA', 'HR Documents', 'Probation', 'PIP', 'Division Insights', 'A4 Export'],
    img: '/hris/hris-kpi-management.jpeg',
    shotLabel: 'KPI MANAGEMENT',
    tone: 'orange',
    dotColor: '#0A0E1A',
    href: '/hris',
    cta: 'Explore HR Suite',
  },
  {
    n: 'PRODUCT 03',
    pill: 'Growth',
    name: 'Flowraze',
    tagline: (
      <>
        The CRM that shows you what&apos;s <em>driving revenue</em> — and what&apos;s draining it.
      </>
    ),
    desc: 'Unifies leads, deals, campaigns, and team performance into one clear system. Stop juggling spreadsheets. Start making decisions that move the number.',
    features: ['Leads', 'Deals Pipeline', 'Campaigns', 'Analytics', 'Targets', 'Team Performance', 'API'],
    img: '/flowraze/dashboard.png',
    shotLabel: 'DASHBOARD',
    tone: 'ink',
    dotColor: '#FF5B22',
    href: '/flowraze',
    cta: 'Explore Flowraze',
  },
];

const approach = [
  {
    n: '01',
    t: 'Problem-first',
    d: "We don't start with a framework — we start with the pain point your team is drowning in. The product comes from understanding the workflow, not imposing one.",
    g: '◎',
  },
  {
    n: '02',
    t: 'Multi-tenant from day one',
    d: "Every product ships with workspace isolation, role-based access, and audit trails. You don't outgrow us — we scale with your org chart.",
    g: '◬',
  },
  {
    n: '03',
    t: 'Indonesian-first',
    d: 'Built for the regulatory landscape, employment law, and business customs of Indonesia. Bilingual where needed, compliant where required.',
    g: '◈',
  },
  {
    n: '04',
    t: 'Engineered, not assembled',
    d: "Type-safe codebases, automated tests, real CI/CD. These aren't agency projects — they're products we operate and maintain alongside you.",
    g: '◉',
  },
];

const upcoming = [
  {
    tag: 'Exploring',
    title: (
      <>
        Attendance <em>&amp; Time</em>
      </>
    ),
    desc: 'Selfie-verified, geofence-locked clock-in. Photo + GPS attached to every punch, with shift rosters and overtime calc.',
    tone: 'cream',
    g: '◐',
  },
  {
    tag: 'Planned',
    title: (
      <>
        Recruitment <em>ATS</em>
      </>
    ),
    desc: 'Job requisitions, candidate pipeline, interview scorecards — closing the loop into the Employee Directory once a hire confirms.',
    tone: 'ink',
    g: '◑',
  },
  {
    tag: 'Your idea here',
    title: (
      <>
        Custom <em>product</em>
      </>
    ),
    desc: "Have a workflow that no off-the-shelf tool covers? We scope, design, and ship custom SaaS products — quoted per engagement.",
    tone: 'blue',
    g: '◒',
  },
];

export function ProductsPageView() {
  const { setMode } = useCursorMode();

  return (
    <main className="prods-page">
      {/* HERO */}
      <Reveal as="section" className="prods-hero">
        <div className="prods-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="prods-grid-col" />
          ))}
        </div>
        <div className="prods-hero-meta">
          <span>[ PRODUCTS ]</span>
          <span>MULTI-TENANT · ENGINEERED · INDONESIA-FIRST</span>
          <span className="prods-hero-status">● 3 PRODUCTS LIVE</span>
        </div>
        <h1 className="prods-hero-h1">
          Software that
          <br />
          <em>runs</em> your business —
          <br />
          not the other way around.
        </h1>
        <div className="prods-hero-foot">
          <p>
            Three products, one engineering bar. Each one built to solve a specific operational
            problem for growing Indonesian businesses — assessment delivery, performance management,
            and revenue growth.
          </p>
          <div className="prods-hero-counts">
            <div className="prods-hero-count">
              <span className="prods-hero-count-n">3</span>
              <span className="prods-hero-count-label">Live products</span>
            </div>
            <div className="prods-hero-count">
              <span className="prods-hero-count-n">2+</span>
              <span className="prods-hero-count-label">In development</span>
            </div>
          </div>
        </div>
        <div className="prods-ticker">
          <div className="prods-ticker-track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i}>
                PSIKOTEST &nbsp;◆&nbsp; HR SUITE &nbsp;◆&nbsp; FLOWRAZE &nbsp;◆&nbsp; ASSESSMENT
                &nbsp;◆&nbsp; PERFORMANCE &nbsp;◆&nbsp; CRM &nbsp;◆&nbsp; MULTI-TENANT &nbsp;◆&nbsp;
                ENGINEERED &nbsp;◆&nbsp;
              </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* PRODUCT CARDS */}
      <section className="prods-products">
        <Reveal className="prods-products-head">
          <span className="prods-eyebrow">[ 01 ] OUR PRODUCTS</span>
          <h2>
            Three products.
            <br />
            One engineering <em>bar.</em>
          </h2>
        </Reveal>

        {products.map((p) => (
          <Reveal key={p.n}>
            <Link
              href={p.href}
              className={`prods-card prods-card-${p.tone}`}
              onMouseEnter={() => setMode('view')}
              onMouseLeave={() => setMode('default')}
            >
              <div className="prods-card-info">
                <div className="prods-card-top">
                  <span className="prods-card-n">{p.n}</span>
                  <span className="prods-card-pill">{p.pill}</span>
                </div>
                <div className="prods-card-name">{p.name}</div>
                <h3 className="prods-card-tagline">{p.tagline}</h3>
                <p className="prods-card-desc">{p.desc}</p>
                <div className="prods-card-features">
                  {p.features.map((f) => (
                    <span key={f}>{f}</span>
                  ))}
                </div>
                <span className="prods-card-cta">
                  {p.cta} <span className="prods-arrow">→</span>
                </span>
              </div>
              <div className="prods-card-shot">
                <div className="prods-card-shot-label">
                  <span className="prods-card-shot-dot" style={{ background: p.dotColor }} />
                  {p.shotLabel}
                </div>
                <div className="prods-card-shot-frame">
                  <Image
                    src={p.img}
                    alt={p.name}
                    width={1200}
                    height={800}
                    style={{ display: 'block', width: '100%', height: 'auto' }}
                  />
                </div>
              </div>
            </Link>
          </Reveal>
        ))}
      </section>

      {/* APPROACH */}
      <Reveal as="section" className="prods-approach">
        <div className="prods-approach-head">
          <div>
            <span className="prods-eyebrow prods-eyebrow-light">[ 02 ] HOW WE BUILD</span>
            <h2>
              Product <em>principles</em>
              <br />
              we ship by.
            </h2>
          </div>
          <p>
            Every Vanaila product shares the same engineering DNA — multi-tenant isolation,
            role-based access, audit trails, and Indonesian-first compliance. The bar doesn&apos;t
            lower because the product is different.
          </p>
        </div>
        <div className="prods-approach-grid">
          {approach.map((a) => (
            <div key={a.n} className="prods-approach-cell">
              <span className="prods-approach-n">{a.n}</span>
              <h3>{a.t}</h3>
              <p>{a.d}</p>
              <span className="prods-approach-glyph">{a.g}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* COMING SOON */}
      <Reveal as="section" className="prods-soon">
        <div className="prods-soon-head">
          <span className="prods-eyebrow">[ 03 ] WHAT&apos;S NEXT</span>
          <h2>
            On the <em>build board.</em>
          </h2>
        </div>
        <div className="prods-soon-grid">
          {upcoming.map((u) => (
            <div key={u.tag} className={`prods-soon-card prods-soon-card-${u.tone}`}>
              <span className="prods-soon-tag">
                <span className="prods-soon-dot" />
                {u.tag}
              </span>
              <h3>{u.title}</h3>
              <p>{u.desc}</p>
              <span className="prods-soon-glyph">{u.g}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="prods-cta">
        <div className="prods-grid prods-cta-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="prods-grid-col" />
          ))}
        </div>
        <span className="prods-eyebrow prods-cta-eye">[ NEED SOMETHING DIFFERENT? ]</span>
        <h2>
          Let&apos;s build the
          <br />
          product your team
          <br />
          <span className="prods-cta-blue">actually needs.</span>
        </h2>
        <div className="prods-cta-foot">
          <p>
            Don&apos;t see the tool that fits? We scope, design, and ship custom SaaS products for
            Indonesian businesses — same engineering bar, same multi-tenant architecture, quoted per
            engagement.
          </p>
          <div className="prods-cta-actions">
            <Link
              href="/contact?interest=webapp"
              className="prods-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Brief us on your workflow</span>
              <span className="prods-arrow">→</span>
            </Link>
            <span className="prods-cta-mail">or email hi@vanaila.com</span>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
