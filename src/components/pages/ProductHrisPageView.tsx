'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import type { LandingPage } from '@/features/cms/types';

const pillars = [
  {
    n: '01',
    tag: 'Performance Suite',
    tone: 'tone-blue',
    title: <>KPI Management <em>that closes</em> the loop.</>,
    desc: 'Define what good looks like, assign weighted targets, and approve manager changes through a real workflow — not a shared spreadsheet that nobody trusts by quarter end.',
    items: ['Per-role KPI definitions', 'Monthly target overrides', 'HR-approval governance', 'Achievement records with audit trail'],
  },
  {
    n: '02',
    tag: 'Training Need Analysis',
    tone: 'tone-ink',
    title: <>Competency <em>assessments</em> tied to actual roles.</>,
    desc: 'Score every employee against the exact competencies their position requires — with evidence captured in-line. The result is a TNA you can actually plan training against, not a personality test.',
    items: ['Per-position competency rubrics', 'Evidence-backed scoring 1–10', 'Manager and self-assessment paths', 'Gap analysis ready for L&D'],
  },
  {
    n: '03',
    tag: 'HR Documents',
    tone: 'tone-orange',
    title: <>Letters &amp; contracts <em>generated</em> from live data.</>,
    desc: "PKWTT, PKWT, SK, certificates, payroll memos — pulled from the employee record, signed, exported to A4 PDF. No copy-paste from last quarter's template.",
    items: ['Database-synced templates', 'A4 live preview', 'E-sign placeholder fields', 'Versioned template editor'],
  },
];

const modules = [
  { n: '01', name: 'KPI Management', desc: 'Centralized KPI library per position with weighting, monthly overrides, and HR approval gating on manager edits.', tags: ['Workflow', 'Approval', 'Per-role'] },
  { n: '02', name: 'KPI Records', desc: 'Monthly achievement entry against target. Auto-calculates attainment percentage, status, and trend across periods.', tags: ['Records', 'Attainment', 'Trend'] },
  { n: '03', name: 'Competency Assessment', desc: 'Score employees against position-specific competencies. Evidence textarea on every rubric line. Saves directly to the employee timeline.', tags: ['TNA', 'Evidence', 'Per-position'] },
  { n: '04', name: 'HR Documents', desc: 'Generate PKWTT, PKWT, SK, certificates and payroll letters from employee data with side-by-side A4 preview and template editor.', tags: ['PKWTT', 'PKWT', 'A4'] },
  { n: '05', name: 'Probation & PIP', desc: 'Auto-generate probation drafts from KPI scores. Decision and PIP plans tied to a configurable threshold and pass minimum.', tags: ['Probation', 'PIP', 'Threshold'] },
  { n: '06', name: 'Division Insights', desc: 'Department-level dashboards: active KPIs, employees without records, six-month trend, and Excel / PDF export per division.', tags: ['Division', 'Trend', 'Export'] },
  { n: '07', name: 'Employee Directory', desc: 'Single source of truth for ownership, reporting lines, access roles, and assessment status. Search, filter, import, export.', tags: ['Directory', 'Roles', 'Import'] },
];

const deepDives = [
  {
    eyebrow: '[ A ] PERFORMANCE MANAGEMENT',
    kicker: 'KPI Management, end-to-end.',
    title: <>A KPI library that <em>scales</em> past 50 roles — without becoming a spreadsheet.</>,
    desc: 'Define KPIs per position once, override per employee per month when reality demands, and route manager edits through HR approval. Every change is timestamped, every value attaches to an effective period, every role inherits sensible defaults.',
    bullets: ['Position-level KPI definitions with target, unit and effective period', 'Monthly per-employee overrides without breaking the global default', 'KPI Governance toggle: require HR approval on manager changes', 'Approval queue with one-click accept / reject + audit trail'],
    img: '/hris/hris-kpi-management.jpeg',
    alt: 'HR Suite — KPI Management workspace',
    side: 'right',
    tone: 'cream',
  },
  {
    eyebrow: '[ B ] TRAINING NEED ANALYSIS',
    kicker: 'Competency, not personality.',
    title: <>Score the <em>skills</em> the role actually demands.</>,
    desc: 'Pick a position. The competency rubric for that role loads inline — API Design, Database Optimization, Service Reliability for a Backend Engineer; different rubric for QA, Sales, or Finance. Rate 1–10, attach evidence, save once. The gap goes straight into the training plan.',
    bullets: ['Per-position competency rubrics, not a generic checklist', '1–10 proficiency scale with Novice → Expert anchors', 'Evidence field on every dimension — score with proof', 'Submissions write back to the employee assessment record'],
    img: '/hris/hris-assessment.jpeg',
    alt: 'HR Suite — Competency Assessment',
    side: 'left',
    tone: 'ink',
  },
  {
    eyebrow: '[ C ] HR DOCUMENTS',
    kicker: 'Live preview. Live data.',
    title: <>Generate <em>PKWTT</em> in under a minute — properly.</>,
    desc: "Pick the document type, pick the template, pick the subject. The A4 preview renders on the right with the employee's name, contract type, signer, and date already filled in. Edit the template once and every future letter inherits the change.",
    bullets: ['Bundled Indonesian templates: PKWTT, PKWT, SK, Surat Keterangan', 'Side-by-side A4 preview while you edit the template', 'E-sign placeholder regions for approver and acknowledger', 'Versioned template editor — synced with the database'],
    img: '/hris/hris-documents.jpeg',
    alt: 'HR Suite — HR Documents with live A4 preview',
    side: 'right',
    tone: 'cream',
  },
  {
    eyebrow: '[ D ] PROBATION & PIP',
    kicker: 'Decisions, not folders.',
    title: <>Probation reviews that <em>compute themselves</em>.</>,
    desc: "Set a PIP threshold and a pass minimum. The system pulls the three-month KPI score for every probationer, flags anyone below the line, and generates a draft PIP plan. HR adds context and signs — they don't hunt through email for last month's scores.",
    bullets: ['Auto-generate probation draft from rolling KPI scores', 'Configurable PIP threshold and pass minimum per period', 'Attendance entries roll into the same probation record', 'Export probation review packet as Excel or PDF'],
    img: '/hris/hris-probation.jpeg',
    alt: 'HR Suite — Probation & PIP management',
    side: 'left',
    tone: 'ink',
  },
];

const stats = [
  { n: '7', label: 'Integrated modules', sub: 'Performance, Records, TNA, Docs, Probation, Insights, Directory', tone: '' },
  { n: '4', label: 'Distinct roles', sub: 'Super Admin · HR · Manager · Employee — separate surfaces', tone: 'pk-stat-ink' },
  { n: '0', label: 'Spreadsheets needed', sub: 'Every KPI, score, and letter lives in one auditable record', tone: 'pk-stat-blue' },
];

const flow = [
  { n: '01', t: 'Define', d: 'HR builds the KPI library per position with weighting, unit, and effective period. Templates ship pre-seeded.', actor: 'HR · Admin' },
  { n: '02', t: 'Assign', d: 'Managers set monthly targets per employee or inherit the position default. HR approves the changes that need approving.', actor: 'Manager · HR' },
  { n: '03', t: 'Assess', d: 'Monthly competency assessment runs against the position rubric. Score 1–10 with evidence. Records save to the employee timeline.', actor: 'Manager · Employee' },
  { n: '04', t: 'Record', d: 'Actual values logged against target every period. Attainment percentage and status compute automatically — no formula maintenance.', actor: 'Manager' },
  { n: '05', t: 'Decide', d: 'Probation drafts, PIP plans, and HR letters generate from the same data. Export to PDF, sign, file. Cycle restarts on the 1st.', actor: 'HR · Director' },
];

const roles = [
  { tag: '[ ROLE 01 ]', t: 'Super Admin', d: 'Operates the workspace, governance, and module configuration.', items: ['Module toggles', 'Governance rules', 'Seat management', 'Audit logs'], tone: 'pk-tone-cream' },
  { tag: '[ ROLE 02 ]', t: 'HR', d: 'Owns the people record end-to-end — from KPIs to letters.', items: ['KPI library', 'Approve manager edits', 'Generate documents', 'Probation reviews'], tone: 'pk-tone-ink' },
  { tag: '[ ROLE 03 ]', t: 'Manager', d: 'Sets targets, runs assessments, owns team performance.', items: ['Set targets', 'Score team', 'Submit KPI records', 'Review probation'], tone: 'pk-tone-blue' },
  { tag: '[ ROLE 04 ]', t: 'Employee', d: 'Sees their own KPIs, scores, letters — nothing more.', items: ['View targets', 'Self-assessment', 'Download letters', 'Acknowledge sign-off'], tone: 'pk-tone-orange' },
];

type ProductHrisPageViewProps = {
  page?: LandingPage;
};

export function ProductHrisPageView(_props: ProductHrisPageViewProps) {
  const { setMode } = useCursorMode();

  return (
    <main className="pk-page hr-page">

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
            HR SUITE · PERFORMANCE INFRASTRUCTURE
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono, monospace)',
              fontSize: 11,
              letterSpacing: '0.1em',
              color: 'var(--pk-orange)',
            }}
          >
            ● MULTI-TENANT · A4 EXPORT · v1.0
          </span>
        </div>

        <h1 className="pk-hero-h1">
          KPIs, competencies,
          <br />
          and <em>HR letters —</em>
          <br />
          <span className="pk-underline">finally in one record.</span>
        </h1>

        <div className="pk-hero-foot">
          <p>
            Vanaila HR Suite replaces the spreadsheet your HR team is quietly maintaining.
            Performance management, training need analysis, and HR documents — engineered around
            one employee record, one approval workflow, one audit trail.
          </p>
          <div className="pk-hero-actions">
            <Link
              href="/contact?interest=hris"
              className="pk-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Request a demo</span>
              <span className="pk-btn-arrow">→</span>
            </Link>
            <Link
              href="/contact?interest=hris"
              className="pk-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              ▶ See the 90-second tour
            </Link>
          </div>
          <div className="pk-hero-credits">
            <span className="pk-credit-dot">●</span>
            <span>For HR · People-ops · Operations directors</span>
          </div>
        </div>

        {/* Product shot with annotations */}
        <div className="pk-hero-shot">
          <div className="pk-hero-shot-frame">
            <Image
              src="/hris/hris-kpi-management.jpeg"
              alt="HR Suite — KPI Management workspace"
              width={1200}
              height={800}
              priority
              style={{ display: 'block', width: '100%', height: 'auto' }}
            />
          </div>
          <div className="pk-anno pk-anno-1">
            <span className="pk-anno-dot" />
            <div>
              <span className="pk-anno-k">Per-role library</span>
              <span className="pk-anno-v">KPIs scoped to each position</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-2">
            <span className="pk-anno-dot pk-anno-dot-blue" />
            <div>
              <span className="pk-anno-k">Monthly overrides</span>
              <span className="pk-anno-v">Per-employee target per period</span>
            </div>
          </div>
          <div className="pk-anno pk-anno-3">
            <span className="pk-anno-dot pk-anno-dot-orange" />
            <div>
              <span className="pk-anno-k">Governance</span>
              <span className="pk-anno-v">HR approval on manager edits</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* TICKER */}
      <div className="pk-ticker">
        <div className="pk-ticker-track">
          {Array.from({ length: 4 }).map((_, i) => (
            <span key={i}>
              KPI MANAGEMENT &nbsp;◆&nbsp; KPI RECORDS &nbsp;◆&nbsp; TNA &nbsp;◆&nbsp; COMPETENCY
              ASSESSMENT &nbsp;◆&nbsp; HR DOCUMENTS &nbsp;◆&nbsp; PKWTT · PKWT · SK &nbsp;◆&nbsp;
              PROBATION &amp; PIP &nbsp;◆&nbsp; DIVISION INSIGHTS &nbsp;◆&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* STATS */}
      <Reveal as="section" className="pk-stats">
        <div className="pk-stats-head">
          <span className="pk-eyebrow">[ WHAT YOU GET ]</span>
          <h2>
            One record.
            <br />
            <em>Seven</em> modules. <em>Zero</em> spreadsheets.
          </h2>
        </div>
        <div className="pk-stats-grid">
          {stats.map((s) => (
            <div key={s.n} className={`pk-stat-card ${s.tone}`}>
              <span className="pk-stat-n">{s.n}</span>
              <h3>{s.label}</h3>
              <p>{s.sub}</p>
            </div>
          ))}
        </div>
      </Reveal>

      {/* THREE PILLARS */}
      <Reveal as="section" className="hr-pillars">
        <div className="hr-pillars-head">
          <div>
            <span className="pk-eyebrow">[ THREE PILLARS ]</span>
            <h2>
              Performance.
              <br />
              Assessment. <em>Documentation.</em>
            </h2>
          </div>
          <p>
            Most HR software does one of these well. Vanaila HR Suite engineers all three around
            the same employee record — so a KPI score in March becomes the evidence inside the
            probation letter in May.
          </p>
        </div>
        <div className="hr-pillars-grid">
          {pillars.map((p) => (
            <div key={p.n} className={`hr-pillar ${p.tone}`}>
              <div className="hr-pillar-top">
                <span className="hr-pillar-n">{p.n}</span>
                <span className="hr-pillar-tag">{p.tag}</span>
              </div>
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
              <ul>
                {p.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      {/* MODULE TABLE */}
      <Reveal as="section" className="pk-types">
        <div className="pk-types-head">
          <div>
            <span className="pk-eyebrow pk-eyebrow-light">[ MODULES ]</span>
            <h2>
              Seven modules.
              <br />
              One <em>operating record.</em>
            </h2>
          </div>
          <p>
            You can adopt one module on day one and the rest on month three. Everything shares the
            same employee record, role permissions, and approval chain — so onboarding the next
            module is configuration, not migration.
          </p>
        </div>
        <div className="pk-types-table">
          {modules.map((m) => (
            <div
              key={m.n}
              className="pk-types-row"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span className="pk-types-n">{m.n}</span>
              <span className="pk-types-name">{m.name}</span>
              <p className="pk-types-desc">{m.desc}</p>
              <div className="pk-types-tags">
                {m.tags.map((tag) => (
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
          key={i}
          as="section"
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
              href="/contact?interest=hris"
              className="pk-deep-link"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              See it in action <span>→</span>
            </Link>
          </div>
          <div className="pk-deep-shot">
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                fontFamily: 'var(--font-mono, monospace)',
                fontSize: 10,
                letterSpacing: '0.14em',
                textTransform: 'uppercase',
                opacity: 0.6,
                marginBottom: 12,
              }}
            >
              <span
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--pk-orange)',
                  display: 'inline-block',
                  flexShrink: 0,
                }}
              />
              {d.eyebrow.split(']')[1]?.trim()}
            </div>
            <Image
              src={d.img}
              alt={d.alt}
              width={1200}
              height={800}
              style={{ display: 'block', width: '100%', height: 'auto', borderRadius: 8 }}
            />
          </div>
        </Reveal>
      ))}

      {/* BEFORE / AFTER */}
      <Reveal as="section" className="hr-vs">
        <div className="hr-vs-head">
          <div>
            <span className="pk-eyebrow pk-eyebrow-light">[ STOP RUNNING HR LIKE THIS ]</span>
            <h2>
              The spreadsheet stack
              <br />
              vs. <em>the record of truth.</em>
            </h2>
          </div>
          <p>
            Be honest about what your HR team does between the 25th and the 1st. Now imagine doing
            it from one screen, with one source of truth, and no Slack hunt for the latest version
            of &quot;KPI_Q1_v8_FINAL_final.xlsx&quot;.
          </p>
        </div>
        <div className="hr-vs-grid">
          <div className="hr-vs-card before">
            <span className="hr-vs-card-tag">[ Before — the spreadsheet stack ]</span>
            <h4>Twelve tabs, three Slack threads, one missed letter.</h4>
            <ul>
              <li>KPI targets live in someone&apos;s Google Sheet</li>
              <li>Letters drafted in Word, last version unknown</li>
              <li>Probation tracked in a separate spreadsheet</li>
              <li>No audit trail — only Slack receipts</li>
              <li>Manager edits emailed to HR, then forgotten</li>
            </ul>
          </div>
          <div className="hr-vs-card after">
            <span className="hr-vs-card-tag">[ After — vanaila HR Suite ]</span>
            <h4>
              One <em>record</em> per employee. One workflow per change.
            </h4>
            <ul>
              <li>KPI library versioned per role, audit-trailed</li>
              <li>Letters generated from live data with A4 preview</li>
              <li>Probation drafts auto-compose from KPI score</li>
              <li>Every edit timestamped and approval-routed</li>
              <li>Manager changes gated by HR Governance toggle</li>
            </ul>
          </div>
        </div>
      </Reveal>

      {/* PERFORMANCE CYCLE */}
      <Reveal as="section" className="pk-flow">
        <div className="pk-flow-head">
          <span className="pk-eyebrow">[ THE PERFORMANCE CYCLE ]</span>
          <h2>
            Five movements from
            <br />
            <em>target</em> to decision.
          </h2>
          <p>
            The same five-step loop runs every period — monthly for KPIs, quarterly for
            assessments, on-cycle for probation. Configure once. Run forever. Audit anything.
          </p>
        </div>
        <div className="pk-flow-steps">
          {flow.map((f) => (
            <div key={f.n} className="pk-flow-step">
              <span className="pk-flow-step-n">{f.n}</span>
              <h3>{f.t}</h3>
              <p>{f.d}</p>
              <span className="pk-flow-actor">{f.actor}</span>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ROLES */}
      <Reveal as="section" className="pk-roles">
        <div className="pk-roles-head">
          <span className="pk-eyebrow">[ FOUR ROLES, FOUR SURFACES ]</span>
          <h2>
            One workspace.
            <br />
            <em>Four</em> permissions, by design.
          </h2>
        </div>
        <div className="pk-roles-grid">
          {roles.map((r) => (
            <div key={r.t} className={`pk-role-card ${r.tone}`}>
              <span className="pk-role-tag">{r.tag}</span>
              <h3>{r.t}</h3>
              <p>{r.d}</p>
              <ul>
                {r.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </Reveal>

      {/* ROADMAP */}
      <Reveal as="section" className="hr-roadmap">
        <div className="hr-roadmap-head">
          <div>
            <span className="pk-eyebrow">[ ROADMAP ]</span>
            <h2>
              Shipping next.
              <br />
              And the one <em>after that.</em>
            </h2>
          </div>
          <p>
            HR Suite ships in the open. What you adopt today, you don&apos;t outgrow tomorrow —
            these are the modules already on the build board, plus the door we keep open for the
            workflow only your team has.
          </p>
        </div>
        <div className="hr-roadmap-grid">

          {/* In development */}
          <div className="hr-road-col status-progress">
            <span className="hr-road-status">
              <span className="dot" />
              In development · Q3 2026
            </span>
            <div className="hr-road-features">
              <div className="hr-road-feat">
                <div className="hr-road-feat-top">
                  <span className="hr-road-feat-n">FEAT · 08</span>
                  <span className="hr-road-feat-eta">~ 6 weeks</span>
                </div>
                <h4>Manpower <em>Planning</em></h4>
                <p>Headcount forecasting against budget, role gap mapping, and approval routing — fed straight from the employee record and KPI library.</p>
                <div className="hr-road-bar">
                  <div className="hr-road-bar-track">
                    <div className="hr-road-bar-fill" style={{ width: '62%' }} />
                  </div>
                  <span className="hr-road-bar-pct">62%</span>
                </div>
              </div>
              <div className="hr-road-feat">
                <div className="hr-road-feat-top">
                  <span className="hr-road-feat-n">FEAT · 09</span>
                  <span className="hr-road-feat-eta">~ 8 weeks</span>
                </div>
                <h4>Recruitment <em>ATS</em></h4>
                <p>Job requisitions, candidate pipeline, interview scorecards — closing the loop into the same Employee Directory once a hire is confirmed.</p>
                <div className="hr-road-bar">
                  <div className="hr-road-bar-track">
                    <div className="hr-road-bar-fill" style={{ width: '38%' }} />
                  </div>
                  <span className="hr-road-bar-pct">38%</span>
                </div>
              </div>
            </div>
          </div>

          {/* Coming soon */}
          <div className="hr-road-col status-soon">
            <span className="hr-road-status">
              <span className="dot" />
              Coming soon · Q4 2026
            </span>
            <div className="hr-road-features">
              <div className="hr-road-feat">
                <div className="hr-road-feat-top">
                  <span className="hr-road-feat-n">FEAT · 10</span>
                  <span className="hr-road-feat-eta">DESIGN</span>
                </div>
                <h4>Live <em>Attendance</em></h4>
                <p>Selfie-verified, geofence-locked clock-in. Photo + GPS coordinates attached to every punch, with anti-spoof checks and shift rosters.</p>
              </div>
            </div>
          </div>

          {/* Custom on request */}
          <div className="hr-road-col status-custom hr-road-custom">
            <span className="hr-road-status">
              <span className="dot" />
              On request · Custom build
            </span>
            <h3 className="hr-road-custom-h">
              Your <em>workflow</em>, engineered in.
            </h3>
            <p>
              Have a payroll rule, governance flow, or compliance template that doesn&apos;t fit a
              generic HRIS? Vanaila ships custom modules against the same record — quoted per scope,
              delivered with the rest of the suite.
            </p>
            <Link
              href="/contact?interest=hris-custom"
              className="hr-road-custom-cta"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Brief us on your workflow <span>→</span>
            </Link>
          </div>

        </div>
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
          Run your next
          <br />
          <span className="pk-cta-blue">performance review —</span>
          <br />
          without the spreadsheet.
        </h2>
        <div className="pk-cta-foot">
          <p>
            Provisioned in 48 hours. Seeded with Indonesian KPI and competency templates so your
            HR team can pilot the loop before they migrate. No card. No long contract.
          </p>
          <div className="pk-cta-actions">
            <Link
              href="/contact?interest=hris"
              className="pk-btn-primary pk-btn-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Request a demo</span>
              <span className="pk-btn-arrow">→</span>
            </Link>
            <Link
              href="/contact?interest=hris"
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
