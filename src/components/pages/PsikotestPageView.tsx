'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

const assessmentTypes = [
  {
    n: '01',
    name: 'DISC Personality Assessment',
    desc: 'Forced-choice behavioural profiling with normalized D, I, S, C dimensions, team fit insights, and report-ready interpretations.',
    tags: ['Personality', 'Bundled', 'Auto-score'],
  },
  {
    n: '02',
    name: 'Cognitive & IQ Screening (ICAR)',
    desc: 'Timed 60-item cognitive test with anti-cheating delivery — randomized item presentation and strict timer control.',
    tags: ['Cognitive', 'Timed', 'Anti-cheat'],
  },
  {
    n: '03',
    name: 'Kraepelin Concentration & Speed',
    desc: 'Continuous calculation endurance test assessing mental pace, error stability, and work resilience under pressure.',
    tags: ['Speed', 'Accuracy', 'Endurance'],
  },
  {
    n: '04',
    name: 'Big 5 Personality (OCEAN)',
    desc: 'Five-trait personality model with normalized scores across openness, conscientiousness, extraversion, agreeableness, and neuroticism.',
    tags: ['OCEAN', 'Normative Bands', 'Psychometric'],
  },
  {
    n: '05',
    name: '16PF Personality Factors',
    desc: 'Comprehensive multi-factor inventory mapping 16 primary personality traits and career orientation dynamics.',
    tags: ['16PF', 'Deep Profile', 'Workplace'],
  },
  {
    n: '06',
    name: 'Proprietary CSV Import & Custom',
    desc: 'Upload your company’s proprietary questionnaires via CSV. Psikotest automatically sets delivery rubrics, subscales, and review keys.',
    tags: ['CSV Import', 'Proprietary', 'Custom Rubrics'],
  },
  {
    n: '07',
    name: 'Interactive Live Quizzes',
    desc: 'Real-time quiz sessions with room codes, live animated leaderboards, avatar generation, and team competition modes.',
    tags: ['Real-time', 'Leaderboard', 'Team Mode'],
  },
];

const deepDives = [
  {
    eyebrow: '[ A ] ATS HIRING KANBAN',
    kicker: 'Interactive candidate pipeline.',
    title: ['Screen candidates across ', <em key="em">6 hiring stages</em>, ' — seamlessly.'],
    desc: 'Track candidate flow through Applied, Screened, Tested, Review, Interview, and Offered. Instant score snapshots, subscale percentiles, and bulk progression cut 80% off HR administrative time.',
    bullets: [
      'Interactive drag-and-drop Kanban candidate pipeline',
      'Continuous multi-test batteries (/b/:token) in one unified candidate link',
      'Automated status updates, stage tracking, and candidate screening tags',
    ],
    img: '/psikotest/psikotest-saas.png',
    link: 'https://psikotest.vanaila.com/saas#hiring-pipeline',
    linkLabel: 'Explore Kanban Demo',
    side: 'right' as const,
    tone: 'cream' as const,
  },
  {
    eyebrow: '[ B ] 21-INSTRUMENT TEST CATALOG',
    kicker: 'Scientifically validated & ready to deploy.',
    title: ['The most complete psychometric ', <em key="em">library in Indonesia</em>, '.'],
    desc: 'Deploy 21 ready-to-use instruments or upload proprietary instruments via CSV. Covers personality (DISC, 16PF, Big 5), cognitive (IQ 60 items), concentration (Kraepelin), and workplace safety culture (COPSOQ III, NOSACQ-50).',
    bullets: [
      '21 pre-built instruments spanning personality, cognitive, and HSE',
      'CSV importer for proprietary company scales and customized rubrics',
      'Scientifically backed normative bands, percentiles, and automatic scoring',
    ],
    img: '/psikotest/psikotest-catalog.png',
    link: 'https://psikotest.vanaila.com/tests',
    linkLabel: 'Browse 21-Test Catalog',
    side: 'left' as const,
    tone: 'ink' as const,
  },
  {
    eyebrow: '[ C ] CANDIDATE EXPERIENCE',
    kicker: 'Zero friction, mobile-first, bilingual.',
    title: ['A test experience candidates ', <em key="em">actually finish</em>, '.'],
    desc: 'Candidates receive a single tokenized link (/b/:token). No app download or forced account creation. Transparent consent terms, strict anti-cheating protections, and effortless Indonesian ↔ English toggling.',
    bullets: [
      'Tokenized continuous multi-test batteries in a single sitting',
      'Bilingual interface: English & Indonesian per candidate link',
      'Anti-cheating protections: page-by-page delivery and copy lock',
    ],
    img: '/psikotest/psikotest-landing.png',
    link: 'https://psikotest.vanaila.com/',
    linkLabel: 'Try Candidate Experience',
    side: 'right' as const,
    tone: 'cream' as const,
  },
  {
    eyebrow: '[ D ] SIPP PSYCHOLOGIST SIGN-OFF',
    kicker: 'Legally compliant, fully branded.',
    title: ['Generate SIPP-compliant ', <em key="em">branded PDF reports</em>, ' automatically.'],
    desc: 'Licensed psychologists (SIPP/SIKIP) review auto-scored findings and attach signed interpretations. Export custom-branded PDF reports or white-label the entire portal with your company branding and domain.',
    bullets: [
      'Psychologist review queue with draft interpretation editor',
      'SIPP-licensed sign-off meeting Indonesian UU PLP No. 23/2022 standards',
      'White-label portal with custom branding, logo, and domain',
    ],
    img: '/psikotest/dashboard-assessment.png',
    link: 'https://psikotest.vanaila.com/white-label',
    linkLabel: 'Explore White-label',
    side: 'left' as const,
    tone: 'ink' as const,
  },
];

const flowSteps = [
  {
    n: '01',
    t: 'Assemble test battery',
    d: 'Select from 21 pre-built instruments or import via CSV. Configure timer rules, subscales, and norm bands.',
    actor: 'HR · Recruiter',
  },
  {
    n: '02',
    t: 'Generate tokenized link',
    d: 'Deploy continuous multi-test batteries via /b/:token. One single link per candidate or cohort batch.',
    actor: 'HR · Recruiter',
  },
  {
    n: '03',
    t: 'Candidate completes test',
    d: 'Bilingual consent, anti-cheating sequential delivery, and automated page-by-page responses.',
    actor: 'Candidate',
  },
  {
    n: '04',
    t: 'Screen on ATS Kanban',
    d: 'Review candidates across 6 pipeline stages. Real-time scores, dimension percentiles, and tags.',
    actor: 'HR Team',
  },
  {
    n: '05',
    t: 'SIPP Sign-Off & Branded PDF',
    d: 'Licensed psychologists finalize interpretation. Download SIPP-compliant branded PDF reports.',
    actor: 'Psychologist · HR',
  },
];

const roles = [
  {
    tag: '[ ROLE 01 ]',
    t: 'HR & Talent Acquisition',
    d: 'Run hiring pipelines and screening from one interactive workspace.',
    items: ['21 test catalog & CSV import', 'Interactive ATS Kanban pipeline', 'Continuous test batteries (/b/:token)', 'Branded PDF export'],
    tone: 'pk-tone-cream',
  },
  {
    tag: '[ ROLE 02 ]',
    t: 'Candidate & Participant',
    d: 'Frictionless, mobile-optimized assessment flow with zero app installs.',
    items: ['Single tokenized link', 'Transparent consent & privacy', 'Anti-cheating timed flow', 'Instant profile snapshot'],
    tone: 'pk-tone-ink',
  },
  {
    tag: '[ ROLE 03 ]',
    t: 'Licensed Psychologist',
    d: 'Clinical review, normative scoring validation, and SIPP sign-off.',
    items: ['Psychologist review queue', 'Auto-calculated norm scores', 'Interpretation editor', 'SIPP compliance sign-off'],
    tone: 'pk-tone-blue',
  },
  {
    tag: '[ ROLE 04 ]',
    t: 'Organization Admin',
    d: 'Enterprise control, multi-tenancy, and complete white-labeling.',
    items: ['Custom domain & white-label', 'Branded certificates & reports', 'Team seats & role permissions', 'Audit logs & analytics'],
    tone: 'pk-tone-orange',
  },
];

const tickerItems = [
  '21 READY-TO-USE INSTRUMENTS',
  '◆',
  'CSV INSTRUMENT IMPORT',
  '◆',
  'INTERACTIVE ATS HIRING KANBAN',
  '◆',
  'CONTINUOUS MULTI-TEST BATTERIES (/B/:TOKEN)',
  '◆',
  'SIPP-LICENSED PSYCHOLOGIST SIGN-OFF',
  '◆',
  'DISC PERSONALITY',
  '◆',
  'COGNITIVE & IQ SCREENING',
  '◆',
  'KRAEPELIN CONCENTRATION',
  '◆',
  'INTERACTIVE LIVE QUIZZES',
  '◆',
  'WHITE-LABEL HR WORKSPACE',
  '◆',
  'BRANDED PDF REPORTS',
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
            VANILA PSIKOTEST · SAAS ASSESSMENT PLATFORM
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.1em',
              color: '#0033FF',
            }}
          >
            ● 21 INSTRUMENTS · ATS KANBAN · SIPP COMPLIANT
          </span>
        </div>

        <h1 className="pk-hero-h1">
          The Complete
          <br />
          <em>Psychometric Hiring</em>
          <br />
          &amp; Talent Assessment
          <br />
          <span className="pk-underline">Platform.</span>
        </h1>

        <div className="pk-hero-foot">
          <p>
            Deploy 21 pre-built psychometric tests (DISC, IQ, Kraepelin) or import your proprietary
            instruments via CSV. Screen candidates on an interactive ATS Kanban pipeline, save 80% on
            admin time, and generate SIPP-compliant branded PDF reports automatically.
          </p>
          <div className="pk-hero-actions">
            <a
              href="https://psikotest.vanaila.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start Free HR Workspace</span>
              <span className="pk-btn-arrow">→</span>
            </a>
            <a
              href="https://psikotest.vanaila.com/saas#hiring-pipeline"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              ▶ Explore Kanban Demo
            </a>
            <a
              href="https://psikotest.vanaila.com/white-label"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Explore White-label
            </a>
          </div>
          <div className="pk-hero-credits">
            <span className="pk-credit-dot">●</span>
            <span>21 Ready Instruments &amp; CSV Import · ATS Kanban · SIPP-Compliant</span>
          </div>
        </div>

        {/* Product shot */}
        <div className="pk-hero-shot">
          <div className="pk-hero-shot-frame">
            <Image
              src="/psikotest/psikotest-saas.png"
              alt="Vanaila Psikotest - The Complete Psychometric Hiring & Talent Assessment Platform"
              width={1024}
              height={640}
              priority
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
          <div className="pk-anno pk-anno-1">
            <span className="pk-anno-dot" />
            <div>
              <span className="pk-anno-k">Assessment Builder</span>
              <span className="pk-anno-v">21 Pre-built Tests or Custom CSV</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-2">
            <span className="pk-anno-dot pk-anno-dot-blue" />
            <div>
              <span className="pk-anno-k">Tokenized Battery</span>
              <span className="pk-anno-v">Single Link /b/hiring-batch-2026</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-3">
            <span className="pk-anno-dot pk-anno-dot-orange" />
            <div>
              <span className="pk-anno-k">ATS Kanban Pipeline</span>
              <span className="pk-anno-v">Screen across 6 hiring stages</span>
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
            Purpose-built for hiring.
            <br />
            <em>Engineered</em> for psychometrics.
          </h2>
        </div>
        <StaggerGroup className="pk-stats-grid">
          <StaggerItem className="pk-stat-card">
            <span className="pk-stat-n">21</span>
            <h3>Ready instruments &amp; CSV</h3>
            <p>DISC, IQ ICAR, Kraepelin, Big 5, 16PF, and proprietary uploads</p>
          </StaggerItem>
          <StaggerItem className="pk-stat-card pk-stat-ink">
            <span className="pk-stat-n">80%</span>
            <h3>Admin time saved</h3>
            <p>Automated test scoring, ATS stage progression &amp; PDF reports</p>
          </StaggerItem>
          <StaggerItem className="pk-stat-card pk-stat-blue">
            <span className="pk-stat-n">100%</span>
            <h3>SIPP-compliant reports</h3>
            <p>Licensed psychologist sign-off matching Indonesian UU PLP No. 23/2022</p>
          </StaggerItem>
        </StaggerGroup>
      </Reveal>

      {/* ASSESSMENT TYPES */}
      <Reveal as="section" className="pk-types">
        <div className="pk-types-head">
          <div>
            <span className="pk-eyebrow pk-eyebrow-light">[ ASSESSMENT LIBRARY ]</span>
            <h2>
              21 Ready instruments.
              <br />
              Plus <em>proprietary CSV import.</em>
            </h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <p>
              Deploy scientifically validated psychometric instruments out of the box, or import your
              organization&apos;s custom questionnaires. Screen candidates in unified continuous test
              batteries or run live interactive sessions.
            </p>
            <div>
              <a
                href="https://psikotest.vanaila.com/tests"
                target="_blank"
                rel="noopener noreferrer"
                className="pk-btn-primary"
                style={{ display: 'inline-flex' }}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>Browse All 21 Tests in Catalog</span>
                <span className="pk-btn-arrow">→</span>
              </a>
            </div>
          </div>
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
            <a
              href={d.link}
              target="_blank"
              rel="noopener noreferrer"
              className="pk-deep-link"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {d.linkLabel} <span>→</span>
            </a>
          </div>
          <div className="pk-deep-shot">
            <div className="pk-shot-label">
              <span className="pk-shot-dot" />
              {d.eyebrow.split(']')[1]?.trim()}
            </div>
            <Image
              src={d.img}
              alt={d.kicker}
              width={1024}
              height={640}
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
            interpretation; HR owns candidate screening; candidates never need an account.
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
        <span className="pk-eyebrow pk-cta-eye">[ READY TO SCALE HIRING ]</span>
        <h2>
          Launch your psychometric
          <br />
          <span className="pk-cta-blue">hiring pipeline —</span>
          <br />
          in less than 5 minutes.
        </h2>
        <div className="pk-cta-foot">
          <p>
            Start with your free HR workspace. Deploy DISC, IQ, and Kraepelin tests or import
            proprietary instruments via CSV. Save 80% admin time with automated ATS screening and
            SIPP-compliant reports.
          </p>
          <div className="pk-cta-actions">
            <a
              href="https://psikotest.vanaila.com/signup"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-btn-primary pk-btn-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start Free HR Workspace</span>
              <span className="pk-btn-arrow">→</span>
            </a>
            <a
              href="https://psikotest.vanaila.com/white-label"
              target="_blank"
              rel="noopener noreferrer"
              className="pk-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Explore White-label
            </a>
            <Link
              href="/contact?interest=psikotest"
              className="pk-cta-mail"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              or contact enterprise sales
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
