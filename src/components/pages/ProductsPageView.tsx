'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';

const products = [
  {
    n: 'PRODUCT 01',
    pill: 'Assessment & Hiring',
    name: 'Psikotest',
    tagline: (
      <>
        The Complete <em>Psychometric Hiring</em> &amp; Talent Assessment Platform.
      </>
    ),
    desc: 'Deploy 21 pre-built psychometric tests (DISC, IQ, Kraepelin) or import your proprietary instruments via CSV. Screen candidates on an interactive ATS Kanban pipeline, save 80% on admin time, and generate SIPP-compliant branded PDF reports automatically.',
    features: ['21 Instruments & CSV', 'ATS Kanban Pipeline', 'Multi-Test Batteries', 'SIPP Psychologist Sign-Off', 'DISC', 'IQ Screening', 'Live Quizzes', 'White-label'],
    img: '/psikotest/psikotest-saas.png',
    shotLabel: 'HIRING PIPELINE',
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
  {
    n: 'PRODUCT 04',
    pill: 'Browser Studio',
    name: 'Vanaila Studio',
    tagline: (
      <>
        One tab. Every <em>creative &amp; document tool</em> you actually use.
      </>
    ),
    desc: '18 in-browser utilities including Document Studio, CV & Resume Builder, Social Content Generator, Client-Side PDF Merge, and WASM OCR. Zero server uploads, zero accounts needed, 100% client-side privacy.',
    features: ['Document Studio', 'ATS Resume Builder', 'Social Content', 'PDF Merge & Split', 'PDF to Image', 'WASM OCR', 'Zero Server Uploads'],
    img: '/atelier/atelier-home.png',
    shotLabel: 'CREATOR SUITE',
    tone: 'orange',
    dotColor: '#C8581A',
    href: '/atelier',
    cta: 'Explore Vanaila Studio',
  },
  {
    n: 'PRODUCT 05',
    pill: 'Online Learning · Coming Soon',
    name: 'Vanaila LMS',
    tagline: (
      <>
        Learn skills that open doors — <em>managed in one unified LMS</em>.
      </>
    ),
    desc: 'Complete learning management system for academies, corporate training, and online educators. Feature-packed course catalog, video lesson player, curriculum builder, quiz engine, and automated verifiable certificates.',
    features: ['Course Catalog', 'Curriculum Authoring', 'Video Lessons', 'Quiz Engine', 'Automated Certs', 'Multi-Tenant', 'Indonesian Gateways'],
    img: '/lms/lms-marketing.png',
    shotLabel: 'LMS PLATFORM',
    tone: 'blue',
    dotColor: '#06B6D4',
    href: '/lms',
    cta: 'Explore Vanaila LMS (Coming Soon)',
  },
  {
    n: 'PRODUCT 06',
    pill: 'Desktop Audio',
    name: 'MuzikPlayer',
    tagline: (
      <>
        Pure Hi-Fi sound, <em>Libadwaita Slate design</em> — for Linux audiophiles.
      </>
    ),
    desc: 'A modern desktop music player for local libraries, built with Compose Desktop (Kotlin/JVM). Features bit-perfect PipeWire direct streaming, LRC synchronized lyrics, peak waveform rendering, and instant library navigation.',
    features: ['PipeWire Direct', '1:1 Bit-Perfect', 'LRC Lyrics', 'Waveform Cache', 'FLAC / ALAC / DSD', 'Compose Desktop', 'MPRIS', 'ListenBrainz'],
    img: '/muzikplayer/muzikplayer-hero.png',
    shotLabel: 'AUDIO ENGINE',
    tone: 'slate',
    dotColor: '#00E5FF',
    href: '/muzikplayer',
    cta: 'Explore MuzikPlayer',
  },
  {
    n: 'PRODUCT 07',
    pill: 'AI Workstation',
    name: 'VanailaChat',
    tagline: (
      <>
        Privacy-first AI workspace &amp; native desktop client for <em>local and cloud LLMs</em>.
      </>
    ),
    desc: 'Brings ChatGPT, Claude, and GitHub Copilot directly into your local machine and web workstation with zero telemetry. 100% offline with Ollama, swappable Pi and DeepSeek live coding harnesses, persistent vector memory, and native Linux desktop support.',
    features: ['100% Free & Local AI', 'Pi & DeepSeek Coding Harnesses', 'Native Linux Edition', 'Zero Telemetry & Local SQLite', 'Multi-Model Cloud', 'Persistent Memory'],
    img: '/vanailachat/hero-mockup.png',
    shotLabel: 'AI WORKSTATION',
    tone: 'blue',
    dotColor: '#0033FF',
    href: '/vanailachat',
    cta: 'Explore VanailaChat',
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
          <span className="prods-hero-status">● 6 PRODUCTS LIVE · 1 COMING SOON</span>
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
            Dedicated software platforms and creative utilities, one engineering bar. Built to solve
            specific operational bottlenecks or empower creative workflows — psychometric assessments,
            workforce management, revenue CRM, in-browser document tools, online learning academies, and privacy-first AI.
          </p>
          <div className="prods-hero-counts">
            <div className="prods-hero-count">
              <span className="prods-hero-count-n">6</span>
              <span className="prods-hero-count-label">Live products</span>
            </div>
            <div className="prods-hero-count">
              <span className="prods-hero-count-n">1</span>
              <span className="prods-hero-count-label">Coming soon</span>
            </div>
          </div>
        </div>
        <div className="prods-ticker">
          <div className="prods-ticker-track">
            {Array.from({ length: 4 }).map((_, i) => (
              <span key={i}>
                PSIKOTEST &nbsp;◆&nbsp; HR SUITE &nbsp;◆&nbsp; FLOWRAZE &nbsp;◆&nbsp; VANAILA STUDIO &nbsp;◆&nbsp;
                VANAILA LMS &nbsp;◆&nbsp; MUZIKPLAYER &nbsp;◆&nbsp; VANAILACHAT &nbsp;◆&nbsp;
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
            Purpose-built software.
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
            <span className="prods-cta-mail">or email care@vanaila.com</span>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
