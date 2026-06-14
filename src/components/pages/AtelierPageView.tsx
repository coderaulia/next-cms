'use client';

import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './atelier-page-view.module.css';

const disciplines = [
  {
    number: '01',
    title: 'Brand Identity',
    description:
      'Name, mark, voice, and system. We build identities that scale from a business card to a billboard — coherent in every context, recognisable at every size.',
    tags: ['Logo', 'Typography', 'Colour system', 'Brand guidelines'],
  },
  {
    number: '02',
    title: 'Web Experience',
    description:
      'Design-led custom builds. Not templates — bespoke sites that load fast, read clearly, and convert visitors into clients.',
    tags: ['Landing pages', 'Marketing sites', 'Portfolio sites'],
  },
  {
    number: '03',
    title: 'UI & Product Design',
    description:
      'Interfaces for SaaS, mobile, and dashboard products. Figma-to-handoff with component libraries your developers will thank you for.',
    tags: ['Design systems', 'Figma', 'Prototyping', 'Dev handoff'],
  },
  {
    number: '04',
    title: 'Creative Direction',
    description:
      'For brands that need a guiding eye — not just execution. We take the creative lead on campaigns, photoshoots, and brand rollouts.',
    tags: ['Campaigns', 'Art direction', 'Photography brief'],
  },
  {
    number: '05',
    title: 'Motion & Digital',
    description:
      'Animation that earns attention — not just fills silence. Explainers, micro-interactions, and social content that moves the brand forward.',
    tags: ['After Effects', 'Lottie', 'Social content'],
  },
  {
    number: '06',
    title: 'Print & Collateral',
    description:
      'Annual reports, decks, brochures, packaging. Physical brand materials designed with the same precision as your digital presence.',
    tags: ['Packaging', 'Print design', 'Presentations'],
  },
] as const;

const steps = [
  {
    step: '01',
    phase: 'Discover',
    title: 'We learn before we draw.',
    description:
      'Every project starts with context — your market, your audience, your ambition. We ask the questions most studios skip, because understanding the brief deeply is the work.',
    duration: '1–2 weeks',
    deliverables: ['Brand audit', 'Competitive landscape', 'Creative brief', 'Kick-off workshop'],
  },
  {
    step: '02',
    phase: 'Design',
    title: 'Iteration is the method.',
    description:
      'Multiple directions, not one "solution." You see divergent thinking, then we refine toward clarity. No black-box reveals — you are in the room the whole time.',
    duration: '2–4 weeks',
    deliverables: ['Concept directions', 'Design iterations', 'Weekly reviews', 'Prototype'],
  },
  {
    step: '03',
    phase: 'Deliver',
    title: 'We ship what works.',
    description:
      'Every asset organised, named, and documented. Files your team can actually use without calling us every week. And post-launch, we are still around.',
    duration: '1–2 weeks',
    deliverables: ['Master asset library', 'Brand guidelines', 'Dev handoff', 'Launch support'],
  },
] as const;

const principles = [
  'Design earns its place. Every decision has a reason.',
  'Good craft is invisible. You notice it when it is missing.',
  'Complexity is a failure of thinking. Simple is harder.',
  'We work for the audience, not the award jury.',
] as const;

function GridLines() {
  return (
    <div className={styles.gridLines} aria-hidden="true">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} />
      ))}
    </div>
  );
}

export function AtelierPageView() {
  const { setMode } = useCursorMode();

  return (
    <main className={styles.root}>
      <Reveal as="section" className={styles.hero}>
        <GridLines />

        <div className={styles.heroMeta}>
          <span className={styles.studioPill}>
            <span className={styles.studioMark}>◈</span>
            VANAILA ATELIER · DESIGN STUDIO
          </span>
          <span className={styles.status}>
            <span className={styles.statusDot}>●</span>
            JAKARTA · TAKING ON NEW PROJECTS
          </span>
        </div>

        <h1 className={styles.heroTitle}>
          Where brand
          <br />
          meets <span className={styles.serifClay}>craft.</span>
        </h1>

        <div className={styles.heroFoot}>
          <p>
            Vanaila Atelier is a boutique design studio creating identities, digital experiences, and
            visual systems for brands that want to be remembered.
          </p>
          <div className={styles.actions}>
            <Link
              href="/portfolio"
              className={styles.primaryButton}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>See selected work</span>
              <span className={styles.arrow}>→</span>
            </Link>
            <Link
              href="/contact?interest=atelier"
              className={styles.ghostButton}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Start a project
            </Link>
          </div>
          <div className={styles.heroNote}>
            <span className={styles.noteDot}>●</span>
            <span>Boutique studio · Est. 2016 · 120+ brands shaped</span>
          </div>
        </div>

        <div className={styles.heroDeco} aria-hidden="true">
          <div className={styles.decoRing} />
          <div className={styles.decoLetterWrap}>
            <span className={styles.decoLetter}>A</span>
          </div>
          <div className={styles.decoGrid}>
            {Array.from({ length: 9 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          <div className={styles.decoLabel}>
            <span>VANAILA</span>
            <span>ATELIER</span>
            <span>MMXVI</span>
          </div>
        </div>
      </Reveal>

      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              BRAND IDENTITY &nbsp;◆&nbsp; WEB EXPERIENCE &nbsp;◆&nbsp; UI DESIGN &nbsp;◆&nbsp;
              CREATIVE DIRECTION &nbsp;◆&nbsp; MOTION &nbsp;◆&nbsp; PRINT &nbsp;◆&nbsp; ART
              DIRECTION &nbsp;◆&nbsp;
            </span>
          ))}
        </div>
      </div>

      <Reveal as="section" className={styles.disciplines}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.eyebrow}>[ WHAT WE MAKE ]</span>
            <h2>
              Six disciplines.
              <br />
              <i>One studio.</i>
            </h2>
          </div>
          <p>
            We don&apos;t try to do everything. We do these six things with uncommon care — to a
            standard most agencies reserve for their biggest clients.
          </p>
        </div>
        <div className={styles.disciplineGrid}>
          {disciplines.map((disc) => (
            <article
              key={disc.number}
              className={styles.disciplineCard}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <div className={styles.discTop}>
                <span className={styles.discNumber}>{disc.number}</span>
                <span className={styles.discArrow}>↗</span>
              </div>
              <h3>{disc.title}</h3>
              <p>{disc.description}</p>
              <div className={styles.tags}>
                {disc.tags.map((tag) => (
                  <span key={tag}>{tag}</span>
                ))}
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className={styles.process}>
        <div className={styles.processHead}>
          <span className={styles.eyebrow}>[ HOW WE WORK ]</span>
          <h2>
            No black boxes.
            <br />
            No <i>surprises.</i>
          </h2>
        </div>
        <StaggerGroup className={styles.processSteps}>
          {steps.map((s) => (
            <StaggerItem key={s.step} className={styles.processStep}>
              <div className={styles.stepLeft}>
                <span className={styles.stepNumber}>{s.step}</span>
                <span className={styles.stepPhase}>{s.phase}</span>
              </div>
              <div className={styles.stepContent}>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
                <div className={styles.stepMeta}>
                  <div className={styles.stepDuration}>
                    <span className={styles.metaLabel}>DURATION</span>
                    <span className={styles.metaValue}>{s.duration}</span>
                  </div>
                  <ul className={styles.deliverables}>
                    {s.deliverables.map((d) => (
                      <li key={d}>
                        <span className={styles.delivTick}>→</span> {d}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      <Reveal as="section" className={styles.manifesto}>
        <GridLines />
        <div className={styles.manifestoInner}>
          <span className={styles.manifestoEyebrow}>[ PRINCIPLES ]</span>
          <h2 className={styles.manifestoTitle}>
            How we think
            <br />
            about <i>design.</i>
          </h2>
          <StaggerGroup as="ul" className={styles.principleList}>
            {principles.map((p, i) => (
              <StaggerItem key={i} as="li" className={styles.principleItem}>
                <span className={styles.principleIndex}>{String(i + 1).padStart(2, '0')}</span>
                <span>{p}</span>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </Reveal>

      <Reveal as="section" className={styles.cta}>
        <GridLines />
        <span className={`${styles.eyebrow} ${styles.ctaEyebrow}`}>[ START ]</span>
        <h2 className={styles.ctaTitle}>
          Have a project
          <br />
          <span>in mind?</span>
        </h2>
        <div className={styles.ctaFoot}>
          <p>
            We take on a small number of projects at a time — intentionally. When you work with
            Atelier, you get the studio, not a junior who received your brief on their third day.
          </p>
          <div className={styles.ctaActions}>
            <Link
              href="/contact?interest=atelier"
              className={`${styles.primaryButton} ${styles.largeButton}`}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Start a project</span>
              <span className={styles.arrow}>→</span>
            </Link>
            <Link
              href="/portfolio"
              className={styles.secondaryLink}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              or explore our work
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
