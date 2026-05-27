'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

const assessmentTypes = [
  {
    n: '01',
    name: 'DISC Personality',
    desc: 'Forced-choice behavioural profiling with normalized D, I, S, C dimensions and report-ready interpretations.',
    tags: ['Personality', 'Bundled', 'Auto-score'],
  },
  {
    n: '02',
    name: 'IQ Cognitive',
    desc: 'Timed multiple-choice cognitive screening with anti-cheating delivery — questions load one page at a time.',
    tags: ['Cognitive', 'Timed', 'Anti-copy'],
  },
  {
    n: '03',
    name: 'Big 5 (OCEAN)',
    desc: 'Five-trait personality model with normalized scores across openness, conscientiousness, extraversion, agreeableness, neuroticism.',
    tags: ['OCEAN', 'Normalized', 'Trait'],
  },
  {
    n: '04',
    name: 'Workload / Stress',
    desc: 'Structured workload and wellbeing monitoring designed for teams and ongoing employee programs.',
    tags: ['Wellbeing', 'Longitudinal', 'Team'],
  },
  {
    n: '05',
    name: 'Custom Assessment',
    desc: 'Upload your own instrument. Psikotest handles delivery, scoring rubrics, and reviewer-written interpretations.',
    tags: ['Custom', 'Reviewer', 'Multi-scale'],
  },
  {
    n: '06',
    name: 'Live Quiz',
    desc: 'Real-time quiz sessions with a room code, animated leaderboard, generated avatars, and optional team mode.',
    tags: ['Real-time', 'Leaderboard', 'Team mode'],
  },
];

const deepDives = [
  {
    eyebrow: '[ A ] WORKSPACE',
    kicker: 'One workspace, every cohort.',
    title: ['See every assessment ', <em key="em">in motion</em>, ' — at a glance.'],
    desc: 'Active, draft, closed. Participant counts, capacity, and a recent activity feed. A control surface designed for HR and people-ops who run rolling cohorts, not one-shot tests.',
    bullets: [
      'Filter by status, capacity, owner',
      'Plan & usage with seat and record limits',
      'Real-time activity feed across reviewers',
    ],
    img: '/psikotest/dashboard-assessment.png',
    side: 'right' as const,
    tone: 'cream' as const,
  },
  {
    eyebrow: '[ B ] GUIDED CREATION',
    kicker: 'Compliance-aware from step one.',
    title: ['A wizard that ', <em key="em">protects</em>, ' participants and your org.'],
    desc: 'Five-step guided flow with pre-filled compliance defaults — purpose statements, consent copy, identity fields, and visibility rules. Bundled templates for DISC, IQ, Big 5, and Workload come ready to publish.',
    bullets: [
      'Five-step guided flow with progress tracking',
      'Pre-filled consent and privacy defaults',
      'Bundled templates: DISC · IQ · Big 5 · Workload',
    ],
    img: '/psikotest/new-assessment.png',
    side: 'left' as const,
    tone: 'ink' as const,
  },
  {
    eyebrow: '[ C ] PARTICIPANT EXPERIENCE',
    kicker: 'Calm, clinical, bilingual.',
    title: ['A participant flow that ', <em key="em">earns</em>, ' consent — not just collects it.'],
    desc: 'Every participant sees purpose, administration mode, interpretation use, and contact info before they begin. Switch EN ↔ ID with one click. No account required — a single link is all you send.',
    bullets: [
      'Explicit purpose · administration · interpretation panels',
      'Bilingual: English & Indonesian, per-link',
      'No participant accounts — link or QR is enough',
    ],
    img: '/psikotest/assessment.png',
    side: 'right' as const,
    tone: 'cream' as const,
  },
  {
    eyebrow: '[ D ] LIVE QUIZ',
    kicker: 'Room code in, leaderboard out.',
    title: ['Real-time sessions for ', <em key="em">training rooms</em>, ' and onboarding.'],
    desc: 'Per-question timer, shuffled order per participant, and an optional team mode with shared leaderboards. Built for live training, induction, and certification — not just async assessments.',
    bullets: [
      'Per-question and default timers',
      'Optional shuffled-order anti-collusion',
      'Team mode with shared leaderboard · CSV export',
    ],
    img: '/psikotest/newquiz.png',
    side: 'left' as const,
    tone: 'ink' as const,
  },
];

const flowSteps = [
  {
    n: '01',
    t: 'Create session',
    d: 'HR drafts an assessment with the five-step wizard. Bundled template or custom upload.',
    actor: 'HR · Owner',
  },
  {
    n: '02',
    t: 'Invite participants',
    d: 'Share one link or a QR code. No participant accounts. Capacity tracked in your plan.',
    actor: 'HR · Owner',
  },
  {
    n: '03',
    t: 'Participant completes',
    d: 'Bilingual consent, identity form, then a paged-protected assessment delivery.',
    actor: 'Participant',
  },
  {
    n: '04',
    t: 'Reviewer interprets',
    d: 'Licensed psychologist writes interpretation before the report is released. Auto-score where appropriate.',
    actor: 'Reviewer',
  },
  {
    n: '05',
    t: 'Release & export',
    d: 'Choose visibility — HR only, participant summary, or both. PDF report or CSV for analysis.',
    actor: 'HR · Owner',
  },
];

const roles = [
  {
    tag: '[ ROLE 01 ]',
    t: 'HR · Owner',
    d: 'Run the full lifecycle from one workspace.',
    items: ['Create assessments', 'Invite participants', 'Export reports', 'Manage team seats'],
    tone: 'pk-tone-cream',
  },
  {
    tag: '[ ROLE 02 ]',
    t: 'Participant',
    d: 'No account. No friction. A single guided flow.',
    items: ['Open link', 'Review consent', 'Complete in 1 sitting', 'Get summary if shared'],
    tone: 'pk-tone-ink',
  },
  {
    tag: '[ ROLE 03 ]',
    t: 'Reviewer',
    d: 'Licensed psychologists write the interpretation.',
    items: ['Reviewer queue', 'Auto-scored draft', 'Interpretation editor', 'Release control'],
    tone: 'pk-tone-blue',
  },
  {
    tag: '[ ROLE 04 ]',
    t: 'Platform admin',
    d: 'Operate the multi-tenant platform itself.',
    items: ['Customer accounts', 'Manual payment approval', 'Monitoring', 'Notifications'],
    tone: 'pk-tone-orange',
  },
];

const tickerItems = [
  'DISC',
  '◆',
  'IQ',
  '◆',
  'BIG 5 (OCEAN)',
  '◆',
  'WORKLOAD',
  '◆',
  'CUSTOM',
  '◆',
  'LIVE QUIZ',
  '◆',
  'REVIEWER QUEUE',
  '◆',
  'PDF · CSV EXPORT',
  '◆',
];

export function PsikotestPageView() {
  const { setMode } = useCursorMode();

  return (
    <main className="pk-page">
      {/* HERO */}
      <Reveal as="section" className="pk-hero">
        <div className="pk-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="pk-grid-col" />
          ))}
        </div>

        <div className="pk-hero-meta">
          <span className="pk-product-pill">
            <span className="pk-product-mark">◉</span>
            PSIKOTEST · ASSESSMENT INFRASTRUCTURE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.1em',
              color: '#0033FF',
            }}
          >
            ● MULTI-TENANT · BILINGUAL · v1.0
          </span>
        </div>

        <h1 className="pk-hero-h1">
          Assessment
          <br />
          delivery, scoring,
          <br />
          and <em>interpretation —</em>
          <br />
          <span className="pk-underline">in one workspace.</span>
        </h1>

        <div className="pk-hero-foot">
          <p>
            Psikotest is the assessment infrastructure your HR team and licensed psychologists
            actually want to use. Invite by link, run DISC · IQ · Workload · Custom, and release
            reports with reviewer-written interpretation.
          </p>
          <div className="pk-hero-actions">
            <Link
              href="/contact?interest=psikotest"
              className="pk-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start free — no card required</span>
              <span className="pk-btn-arrow">→</span>
            </Link>
            <Link
              href="/contact"
              className="pk-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              ▶ Book a 20-min walkthrough
            </Link>
          </div>
          <div className="pk-hero-credits">
            <span className="pk-credit-dot">●</span>
            <span>For HR teams · Licensed psychologists · Org-wide cohorts</span>
          </div>
        </div>

        {/* Product shot */}
        <div className="pk-hero-shot">
          <div className="pk-hero-shot-frame">
            <Image
              src="/psikotest/dashboard-assessment.png"
              alt="Psikotest workspace dashboard"
              width={1200}
              height={800}
              priority
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
          <div className="pk-anno pk-anno-1">
            <span className="pk-anno-dot" />
            <div>
              <span className="pk-anno-k">Active session</span>
              <span className="pk-anno-v">Capacity tracked in real time</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-2">
            <span className="pk-anno-dot pk-anno-dot-blue" />
            <div>
              <span className="pk-anno-k">Plan &amp; usage</span>
              <span className="pk-anno-v">Seats, records, and capacity</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-3">
            <span className="pk-anno-dot pk-anno-dot-orange" />
            <div>
              <span className="pk-anno-k">Compliance banner</span>
              <span className="pk-anno-v">Templates are demos — not validated</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* TICKER */}
      <div className="pk-ticker">
        <div className="pk-ticker-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>{tickerItems.join('  ')}&nbsp;&nbsp;</span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <Reveal as="section" className="pk-stats">
        <div className="pk-stats-head">
          <span className="pk-eyebrow">[ WHY PSIKOTEST ]</span>
          <h2>
            One platform.
            <br />
            <em>Four</em> roles. <em>Six</em> formats.
          </h2>
        </div>
        <StaggerGroup className="pk-stats-grid">
          <StaggerItem className="pk-stat-card">
            <span className="pk-stat-n">6</span>
            <h3>Assessment formats</h3>
            <p>DISC, IQ, Big 5, Workload, Custom, Live Quiz</p>
          </StaggerItem>
          <StaggerItem className="pk-stat-card pk-stat-ink">
            <span className="pk-stat-n">4</span>
            <h3>Distinct roles</h3>
            <p>HR · Participant · Reviewer · Platform admin</p>
          </StaggerItem>
          <StaggerItem className="pk-stat-card pk-stat-blue">
            <span className="pk-stat-n">2</span>
            <h3>Languages out of box</h3>
            <p>English and Indonesian — per assessment link</p>
          </StaggerItem>
        </StaggerGroup>
      </Reveal>

      {/* ASSESSMENT TYPES */}
      <Reveal as="section" className="pk-types">
        <div className="pk-types-head">
          <div>
            <span className="pk-eyebrow pk-eyebrow-light">[ ASSESSMENT FORMATS ]</span>
            <h2>
              Six formats.
              <br />
              One <em>delivery engine.</em>
            </h2>
          </div>
          <p>
            Bundled templates ship ready to publish for demos and pilots. Bring your own validated
            instrument when you go to production — Psikotest handles the rest.
          </p>
        </div>
        <div className="pk-types-table">
          {assessmentTypes.map((t) => (
            <div
              key={t.n}
              className="pk-types-row"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span className="pk-types-n">{t.n}</span>
              <span className="pk-types-name">{t.name}</span>
              <p className="pk-types-desc">{t.desc}</p>
              <div className="pk-types-tags">
                {t.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* DEEP DIVES */}
      {deepDives.map((d, i) => (
        <Reveal
          as="section"
          key={i}
          className={`pk-deep pk-deep-${d.tone} pk-deep-${d.side}`}
        >
          <div className="pk-deep-text">
            <span className={`pk-eyebrow${d.tone === 'ink' ? ' pk-eyebrow-light' : ''}`}>
              {d.eyebrow}
            </span>
            <span className="pk-deep-kicker">{d.kicker}</span>
            <h2>{d.title}</h2>
            <p>{d.desc}</p>
            <ul className="pk-deep-bullets">
              {d.bullets.map((b) => (
                <li key={b}>
                  <span className="pk-deep-tick">→</span> {b}
                </li>
              ))}
            </ul>
            <Link
              href="/contact?interest=psikotest"
              className="pk-deep-link"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              See it in action <span>→</span>
            </Link>
          </div>
          <div className="pk-deep-shot">
            <div className="pk-shot-label">
              <span className="pk-shot-dot" />
              {d.eyebrow.split(']')[1]?.trim()}
            </div>
            <Image
              src={d.img}
              alt={d.kicker}
              width={1200}
              height={900}
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
        </Reveal>
      ))}

      {/* WORKFLOW */}
      <Reveal as="section" className="pk-flow">
        <div className="pk-flow-head">
          <span className="pk-eyebrow">[ ASSESSMENT LIFECYCLE ]</span>
          <h2>
            Five steps from
            <br />
            invite to <em>released report.</em>
          </h2>
          <p>
            Every assessment moves through the same auditable path. Psychologists own
            interpretation; HR owns visibility; participants never need an account.
          </p>
        </div>
        <StaggerGroup className="pk-flow-steps">
          {flowSteps.map((f) => (
            <StaggerItem key={f.n} className="pk-flow-step">
              <span className="pk-flow-step-n">{f.n}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <span className="pk-flow-actor">{f.actor}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      {/* ROLES */}
      <Reveal as="section" className="pk-roles">
        <div className="pk-roles-head">
          <span className="pk-eyebrow">[ BUILT FOR FOUR ROLES ]</span>
          <h2>
            One workspace.
            <br />
            <em>Four</em> distinct experiences.
          </h2>
        </div>
        <StaggerGroup className="pk-roles-grid">
          {roles.map((r) => (
            <StaggerItem key={r.t} className={`pk-role-card ${r.tone}`}>
              <span className="pk-role-tag">{r.tag}</span>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
              <ul>
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      {/* CTA */}
      <Reveal as="section" className="pk-cta">
        <div className="pk-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="pk-grid-col" />
          ))}
        </div>
        <span className="pk-eyebrow pk-cta-eye">[ READY ]</span>
        <h2>
          Launch your first
          <br />
          <span className="pk-cta-blue">assessment cohort —</span>
          <br />
          before next Monday.
        </h2>
        <div className="pk-cta-foot">
          <p>
            Free to start. No credit card. Bundled DISC, IQ, Big 5, and Workload templates are
            ready for demo runs the moment your workspace is provisioned.
          </p>
          <div className="pk-cta-actions">
            <Link
              href="/contact?interest=psikotest"
              className="pk-btn-primary pk-btn-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start free — no card required</span>
              <span className="pk-btn-arrow">→</span>
            </Link>
            <Link
              href="/contact"
              className="pk-cta-mail"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              or talk to a founder
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
