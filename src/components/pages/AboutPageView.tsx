'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import type { LandingPage } from '@/features/cms/types';

import { paragraphs, sectionWithFallback, splitAccent } from './sectionContent';

type AboutPageViewProps = {
  page: LandingPage;
};

const storyStats = [
  { k: '8+', v: 'Years building and shipping software' },
  { k: '30+', v: 'Projects across web, app, and commerce' },
  { k: '3', v: 'Standards we never cut: speed, security, scale' }
];

const pillarTones = ['ink', 'blue', 'lime'] as const;

export function AboutPageView({ page }: AboutPageViewProps) {
  const { setMode } = useCursorMode();

  const hero = sectionWithFallback(page, 0, {
    id: 'about-hero',
    heading: 'A Decade of|Engineering Excellence',
    body: 'For 8+ years we have built websites, apps, and tools for businesses that need them to actually work — fast, secure, and built to grow. No jargon, no disappearing after launch.',
    ctaLabel: 'About Vanaila',
    ctaHref: '/about',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const story = sectionWithFallback(page, 1, {
    id: 'about-story',
    heading: 'How we got here',
    body: "Vanaila Digital started with one observation: too many businesses were forced to choose between a site that looked good and one that actually worked.\n\nFor 8+ years we've built both into the same product — and stuck around to maintain it long after launch.",
    ctaLabel: '2018',
    ctaHref: 'Founded in Indonesia',
    mediaImage: '',
    mediaAlt: 'We prioritize speed, security, and stability above all else, ensuring your digital presence is as reliable as it is beautiful.',
    layout: 'split'
  });
  const vision = sectionWithFallback(page, 2, {
    id: 'about-vision',
    heading: 'Our Vision',
    body: 'A web where fast, reliable, well-built software is normal for every business — not a luxury only big companies can afford.',
    ctaLabel: 'Vision',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const mission = sectionWithFallback(page, 3, {
    id: 'about-mission',
    heading: 'Our Mission',
    body: 'Give growing businesses software that scales without drama — clear pricing, plain-language updates, and code they fully own.',
    ctaLabel: 'Mission',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarsIntro = sectionWithFallback(page, 4, {
    id: 'about-pillars-intro',
    heading: 'What we stand for',
    body: 'Three principles that guide every decision we make — for every client, every sprint, and every launch.',
    ctaLabel: 'Principles',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillars = [
    sectionWithFallback(page, 5, {
      id: 'about-pillar-1',
      heading: 'We build for next year, not just launch day',
      body: "Every project is built to scale and stay easy to maintain — so you're not paying to rebuild it from scratch in 12 months.",
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 6, {
      id: 'about-pillar-2',
      heading: 'We treat your project like our own',
      body: 'From how it looks on a phone to how fast the database responds, the details get the same care we give our own products.',
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 7, {
      id: 'about-pillar-3',
      heading: 'We measure what actually matters',
      body: 'Success is your load times, your conversion rates, and your growth — not how clever the tech looks under the hood.',
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];
  const quote = sectionWithFallback(page, 8, {
    id: 'about-quote',
    heading: 'The best software disappears — your team just gets their time back, and your customers just get what they came for.',
    body: 'Whether you are a startup finding your footing or an established company cleaning up years of patchwork tools, we turn the messy problem into software that quietly works.',
    ctaLabel: 'Founder Note',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const cta = sectionWithFallback(page, 9, {
    id: 'about-cta',
    heading: "Let's build|something that lasts",
    body: 'Work with a team that builds software like it has to last — because what we build, we maintain.',
    ctaLabel: 'Start your project',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, 'Engineering Excellence');
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, 'Digital Potential');
  const storyParts = paragraphs(story.body);

  return (
    <main className="v-svc">
      <Reveal as="section" className="v-svc-hero">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <nav className="v-svc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/" onMouseEnter={() => setMode('link')} onMouseLeave={() => setMode('default')}>
            Home
          </Link>
          <span>/</span>
          <span>About</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ ABOUT / VANAILA DIGITAL ]</span>
          <span>ENGINEERING CULTURE / BUSINESS CLARITY</span>
          <span className="v-svc-status">BOOKING NEW PROJECTS</span>
        </div>

        <h1 className="v-svc-h1">
          {heroPrimary}
          <br />
          <em>{heroAccent}</em>
          <br />
          for brands that <del>guess.</del>
          <br />
          <em>grow.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>{hero.body}</p>
          <div className="v-svc-actions">
            <Link
              href="#story"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Read our story</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href="/service"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Explore services
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-block v-svc-block-ink" id="story" style={{ '--accent': '#C8E64B' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">01</span>
          <span className="v-svc-block-tag">{story.ctaLabel || '2018'}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{story.heading}</h2>
          <span className="v-svc-block-sub">{story.ctaHref || 'Founded in Indonesia'}</span>
        </div>
        <p className="v-svc-lede">{storyParts[0] || story.body}</p>
        <div className="v-svc-deliverables">
          {storyStats.map((item) => (
            <article className="v-svc-deliverable" key={item.k}>
              <div className="v-svc-deliverable-header">
                <span>{item.k}</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{item.v}</h3>
              <p>{storyParts[1] || story.mediaAlt}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-block v-svc-block-cream" id="direction" style={{ '--accent': '#0033FF' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">02</span>
          <span className="v-svc-block-tag">Direction</span>
        </div>
        <div className="v-svc-block-head">
          <h2>What we are building toward.</h2>
          <span className="v-svc-block-sub">Vision / Mission</span>
        </div>
        <div className="v-svc-deliverables">
          {[vision, mission].map((item, index) => (
            <article className="v-svc-deliverable" key={item.id}>
              <div className="v-svc-deliverable-header">
                <span>0{index + 1}</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-why" id="values">
        <div className="v-svc-why-head">
          <span className="v-svc-why-eyebrow">[ 03 ] {pillarsIntro.ctaLabel || 'Principles'}</span>
          <h2>
            {pillarsIntro.heading}
            <br />
            <em>in practice.</em>
          </h2>
        </div>
        <div className="v-svc-why-grid">
          {pillars.map((item, index) => (
            <article className={`v-svc-why-cell v-svc-why-${pillarTones[index % pillarTones.length]}`} key={item.id}>
              <span className="v-svc-why-n">{item.ctaLabel || `0${index + 1}`}</span>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
              <div className="v-svc-why-glyph" aria-hidden>
                {index + 1}
              </div>
            </article>
          ))}
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-block v-svc-block-blue" style={{ '--accent': '#C8E64B' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">04</span>
          <span className="v-svc-block-tag">{quote.ctaLabel || 'Founder Note'}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{quote.heading.replace(/"/g, '').trim()}</h2>
          <span className="v-svc-block-sub">Build with care.</span>
        </div>
        <p className="v-svc-lede">{quote.body}</p>
      </Reveal>

      <Reveal as="section" className="v-svc-cta">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className="v-svc-cta-eye">[ NEXT STEP ]</span>
        <h2>
          {ctaPrimary}
          <br />
          <span className="v-svc-cta-blue">{ctaAccent}</span>
        </h2>
        <div className="v-svc-cta-foot">
          <p>{cta.body}</p>
          <div className="v-svc-cta-actions">
            <Link
              href={cta.ctaHref || '/contact'}
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{cta.ctaLabel || 'Claim free consultation'}</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
