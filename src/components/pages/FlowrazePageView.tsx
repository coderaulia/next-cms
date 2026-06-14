'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './flowraze-page-view.module.css';

const FLOWRAZE_URL = 'https://flowraze.app';

const features = [
  {
    number: '01',
    title: 'Lead Management',
    description:
      'Track every prospect from first touch to handoff. Status, source, owner — never lose a lead in a spreadsheet again.',
    tags: ['Status', 'Source', 'Assignment'],
  },
  {
    number: '02',
    title: 'Visual Deal Pipeline',
    description:
      'Custom pipelines and stages on a Kanban board. Drag deals from prospect to close — your sales team sees the whole game at a glance.',
    tags: ['Kanban', 'Custom stages', 'Forecast'],
  },
  {
    number: '03',
    title: 'Campaign Tracking',
    description:
      'Connect marketing spend to revenue. See which campaigns actually generate leads — and which deals they turned into.',
    tags: ['Attribution', 'ROI', 'Channels'],
  },
  {
    number: '04',
    title: 'Activity & Audit',
    description:
      'Log calls, notes, follow-ups against every lead. A complete audit trail for compliance, coaching, and handovers.',
    tags: ['Calls', 'Notes', 'Tasks'],
  },
  {
    number: '05',
    title: 'Team Performance',
    description:
      'Per-rep reporting on leads assigned, deals won, and revenue closed. Coach with data, not gut feel.',
    tags: ['Per-rep', 'Targets', 'Leaderboards'],
  },
  {
    number: '06',
    title: 'API, Webhooks & Export',
    description:
      'Push to your data warehouse. Pull from your tools. CSV and PDF export for everyone else — no vendor lock-in.',
    tags: ['REST API', 'Webhooks', 'CSV / PDF'],
  },
] as const;

const deepDives = [
  {
    eyebrow: '[ A ] LEADS',
    label: 'LEADS',
    kicker: 'Every lead, in one place.',
    title: (
      <>
        Stop losing leads to <i>scattered inboxes.</i>
      </>
    ),
    description:
      'Filterable, sortable, and exportable. One-click WhatsApp from any row. Status badges that map to your real sales motion — not a generic vendor template.',
    bullets: ['Filter by status, source, owner', 'WhatsApp from any row', 'CSV / PDF export'],
    image: '/flowraze/leads.png',
    alt: 'Flowraze lead management table',
    layout: 'right',
    tone: 'paper',
  },
  {
    eyebrow: '[ B ] DEALS PIPELINE',
    label: 'DEALS PIPELINE',
    kicker: 'Kanban that closes deals.',
    title: (
      <>
        See revenue <i>moving</i> — in real time.
      </>
    ),
    description:
      'Stages you define, weighted forecast you can trust, deal-card editing without leaving the board. Built for the way your team actually works.',
    bullets: ['Custom stages per pipeline', 'Drag & drop deal cards', 'Forecast by stage probability'],
    image: '/flowraze/deals.png',
    alt: 'Flowraze deal pipeline Kanban board',
    layout: 'left',
    tone: 'ink',
  },
  {
    eyebrow: '[ C ] ANALYTICS',
    label: 'ANALYTICS',
    kicker: 'Funnel-grade insight.',
    title: (
      <>
        The numbers behind <i>the growth.</i>
      </>
    ),
    description:
      'Conversion funnel, campaign attribution, revenue forecast, lead velocity. Built-in dashboards that answer the questions your CEO actually asks.',
    bullets: ['Conversion funnel by stage', 'Lead velocity & forecast', 'Attribution by campaign'],
    image: '/flowraze/analytics.png',
    alt: 'Flowraze analytics dashboard',
    layout: 'right',
    tone: 'paper',
  },
] as const;

const stack = [
  { layer: 'Frontend', tech: 'React 18 · TypeScript · Vite · Tailwind · Recharts' },
  { layer: 'Backend', tech: 'Node.js · Express · TypeScript · Prisma ORM' },
  { layer: 'Database', tech: 'PostgreSQL 14+' },
  { layer: 'Auth & API', tech: 'JWT · API Key · Webhooks' },
  { layer: 'Payments', tech: 'Midtrans · Multi-tenant Billing' },
] as const;

const stats = [
  { number: '13', label: 'Modules included', detail: 'Leads, deals, campaigns, analytics & more' },
  { number: '0', label: 'Per-seat surprise fees', detail: 'Flat pricing. Predictable bill.' },
  { number: '80', label: 'Automated tests', detail: 'Shipped with confidence' },
] as const;

function GridLines() {
  return (
    <div className={styles.gridLines} aria-hidden="true">
      {Array.from({ length: 12 }, (_, index) => (
        <span key={index} />
      ))}
    </div>
  );
}

export function FlowrazePageView() {
  const { setMode } = useCursorMode();
  const [activeFeature, setActiveFeature] = useState(0);

  return (
    <main className={styles.root}>
      <Reveal as="section" className={styles.hero}>
        <GridLines />

        <div className={styles.heroMeta}>
          <span className={styles.productPill}>
            <span className={styles.productMark}>▦</span>
            FLOWRAZE · GROWTH ENGINE
          </span>
          <span className={styles.status}>
            <span className={styles.statusDot}>●</span> MULTI-TENANT · v1.0 SHIPPING
          </span>
        </div>

        <h1 className={styles.heroTitle}>
          The CRM that
          <br />
          shows you what&apos;s
          <br />
          <span className={styles.serifBlue}>driving revenue</span>
          <br />— and what&apos;s <span className={styles.strike}>draining it.</span>
        </h1>

        <div className={styles.heroFoot}>
          <p>
            Flowraze unifies leads, deals, campaigns, and team performance into one clear system. Stop juggling
            spreadsheets. Start making decisions that move the number.
          </p>
          <div className={styles.actions}>
            <a
              className={styles.primaryButton}
              href={FLOWRAZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start free — no card required</span>
              <span className={styles.arrow}>→</span>
            </a>
            <a
              className={styles.ghostButton}
              href="#features"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              ▶ Watch 2-min demo
            </a>
          </div>
          <div className={styles.heroCredits}>
            <span className={styles.creditDot}>●</span>
            <span>Trusted by 2,400+ revenue teams across Indonesia</span>
          </div>
        </div>

        <div
          className={styles.heroShot}
          onMouseEnter={() => setMode('view')}
          onMouseLeave={() => setMode('default')}
        >
          <div className={styles.shotFrame}>
            <Image
              src="/flowraze/dashboard.png"
              alt="Flowraze dashboard"
              width={1920}
              height={963}
              sizes="(max-width: 1100px) calc(100vw - 48px), 50vw"
              priority
            />
          </div>

          <div className={`${styles.annotation} ${styles.annotationOne}`}>
            <span className={styles.annotationDot} />
            <div>
              <span className={styles.annotationKey}>Live revenue</span>
              <span className={styles.annotationValue}>Closed-won, updating in real time</span>
            </div>
          </div>
          <div className={`${styles.annotation} ${styles.annotationTwo}`}>
            <span className={`${styles.annotationDot} ${styles.limeDot}`} />
            <div>
              <span className={styles.annotationKey}>Target overview</span>
              <span className={styles.annotationValue}>Quarterly pacing at a glance</span>
            </div>
          </div>
          <div className={`${styles.annotation} ${styles.annotationThree}`}>
            <span className={`${styles.annotationDot} ${styles.orangeDot}`} />
            <div>
              <span className={styles.annotationKey}>Conversion rate</span>
              <span className={styles.annotationValue}>Won deals ÷ leads, by source</span>
            </div>
          </div>
        </div>
      </Reveal>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>
              LEADS &nbsp;◆&nbsp; DEALS &nbsp;◆&nbsp; CAMPAIGNS &nbsp;◆&nbsp; ANALYTICS &nbsp;◆&nbsp; TARGETS
              &nbsp;◆&nbsp; TEAM PERFORMANCE &nbsp;◆&nbsp; API &amp; WEBHOOKS &nbsp;◆&nbsp;
            </span>
          ))}
        </div>
      </div>

      <Reveal as="section" className={styles.stats}>
        <div className={styles.statsHead}>
          <span className={styles.eyebrow}>[ WHY FLOWRAZE ]</span>
          <h2>
            One platform.
            <br />
            <i>Every</i> growth motion.
          </h2>
        </div>
        <StaggerGroup className={styles.statsGrid}>
          {stats.map((stat) => (
            <StaggerItem key={stat.label} className={styles.statCard}>
              <span className={styles.statNumber}>{stat.number}</span>
              <h3>{stat.label}</h3>
              <p>{stat.detail}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      <Reveal as="section" id="features" className={styles.features}>
        <div className={styles.featuresHead}>
          <div>
            <span className={`${styles.eyebrow} ${styles.eyebrowLight}`}>
              [ FEATURES ] BUILT FOR REVENUE TEAMS
            </span>
            <h2>
              Six disciplines.
              <br />
              One <i>growth engine.</i>
            </h2>
          </div>
          <p>
            Every module is built to work together — and to work with the tools you already pay for. No
            &quot;professional&quot; tier paywalls, no contact-sales gates.
          </p>
        </div>
        <div className={styles.featureGrid}>
          {features.map((feature, index) => (
            <article
              key={feature.number}
              className={`${styles.featureCard} ${activeFeature === index ? styles.featureActive : ''}`}
              onMouseEnter={() => {
                setMode('link');
                setActiveFeature(index);
              }}
              onMouseLeave={() => setMode('default')}
              onFocus={() => setActiveFeature(index)}
              tabIndex={0}
            >
              <div className={styles.featureTop}>
                <span className={styles.featureNumber}>{feature.number}</span>
                <span className={styles.featureArrow}>↗</span>
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              <div className={styles.tags}>
                {feature.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      {deepDives.map((deepDive) => (
        <Reveal
          as="section"
          key={deepDive.eyebrow}
          className={`${styles.deepDive} ${deepDive.tone === 'ink' ? styles.deepInk : styles.deepPaper} ${
            deepDive.layout === 'left' ? styles.deepLeft : ''
          }`}
        >
          <div className={styles.deepText}>
            <span className={styles.eyebrow}>{deepDive.eyebrow}</span>
            <span className={styles.deepKicker}>{deepDive.kicker}</span>
            <h2>{deepDive.title}</h2>
            <p>{deepDive.description}</p>
            <ul className={styles.bullets}>
              {deepDive.bullets.map((bullet) => (
                <li key={bullet}>
                  <span className={styles.tick}>→</span> {bullet}
                </li>
              ))}
            </ul>
            <a
              className={styles.deepLink}
              href={FLOWRAZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              See it in action <span>→</span>
            </a>
          </div>
          <div
            className={styles.deepShot}
            onMouseEnter={() => setMode('view')}
            onMouseLeave={() => setMode('default')}
          >
            <div className={styles.shotLabel}>
              <span className={styles.shotDot} />
              {deepDive.label}
            </div>
            <Image
              src={deepDive.image}
              alt={deepDive.alt}
              width={1920}
              height={963}
              sizes="(max-width: 1100px) calc(100vw - 48px), 55vw"
            />
          </div>
        </Reveal>
      ))}

      <Reveal as="section" className={styles.stack}>
        <div className={styles.stackHead}>
          <span className={styles.eyebrow}>[ UNDER THE HOOD ]</span>
          <h2>
            Engineered, not <i>assembled.</i>
          </h2>
          <p>
            Modern stack, type-safe end-to-end, shipped with 80 automated tests. The kind of foundation your team
            can build on for years.
          </p>
        </div>
        <StaggerGroup className={styles.stackTable}>
          {stack.map((row, index) => (
            <StaggerItem key={row.layer} className={styles.stackRow}>
              <span className={styles.stackLayer}>
                {String(index + 1).padStart(2, '0')} · {row.layer}
              </span>
              <span className={styles.stackTech}>{row.tech}</span>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      <Reveal as="section" className={styles.cta}>
        <GridLines />
        <span className={`${styles.eyebrow} ${styles.ctaEyebrow}`}>[ READY ]</span>
        <h2>
          Spin up your
          <br />
          <span>growth engine —</span>
          <br />
          in under five minutes.
        </h2>
        <div className={styles.ctaFoot}>
          <p>
            Free to start. No credit card. No demo gate. Multi-tenant from day one — invite your team, define your
            pipeline, and start closing.
          </p>
          <div className={styles.ctaActions}>
            <a
              className={`${styles.primaryButton} ${styles.largeButton}`}
              href={FLOWRAZE_URL}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start free — no card required</span>
              <span className={styles.arrow}>→</span>
            </a>
            <Link
              href="/contact?interest=flowraze"
              className={styles.mailLink}
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
