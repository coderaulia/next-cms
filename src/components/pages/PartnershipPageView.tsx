'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import type { LandingPage } from '@/features/cms/types';

import { sectionWithFallback, splitAccent } from './sectionContent';

type PartnershipPageViewProps = {
  page: LandingPage;
};

const programAccents = ['#0033FF', '#FF5B22', '#C8E64B'] as const;
const standardTones = ['ink', 'blue', 'lime', 'ink'] as const;

export function PartnershipPageView({ page }: PartnershipPageViewProps) {
  const { setMode } = useCursorMode();

  const hero = sectionWithFallback(page, 0, {
    id: 'hero',
    heading: 'Build the Future|Scale with Vanaila.',
    body: 'Join our network of elite technical agencies and referral partners. Let us deliver extraordinary digital infrastructure together.',
    ctaLabel: 'Ecosystem Partnership',
    ctaHref: '/partnership',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const programIntro = sectionWithFallback(page, 1, {
    id: 'program-intro',
    heading: 'Partnership Tracks',
    body: 'Choose the model that fits your team and growth strategy.',
    ctaLabel: 'Program',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const programCards = [
    sectionWithFallback(page, 2, {
      id: 'program-1',
      heading: 'Referral Alpha',
      body: 'Earn 30% commission from net project profit for every qualified client you refer. No cap, no complexity — just introduce, and we handle the rest.',
      ctaLabel: 'Referral',
      ctaHref: '/contact?interest=partnership',
      mediaImage: '',
      mediaAlt: 'Qualified lead / 30% net profit / recurring trust',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 3, {
      id: 'program-2',
      heading: 'Technical Alliance',
      body: 'Embed our lead architects into your project workflow with white-label support.',
      ctaLabel: 'Alliance',
      ctaHref: '/contact?interest=partnership',
      mediaImage: '',
      mediaAlt: 'Delivery bench / architecture support / escalation',
      layout: 'split'
    }),
    sectionWithFallback(page, 4, {
      id: 'program-3',
      heading: 'Service Expansion',
      body: 'We integrate your software, cloud platform, or managed service directly into our client projects — giving your product real-world adoption and recurring revenue.',
      ctaLabel: 'Expansion',
      ctaHref: '/contact?interest=partnership',
      mediaImage: '',
      mediaAlt: 'Product adoption / embedded integration / recurring revenue',
      layout: 'stacked'
    })
  ];

  const standardsIntro = sectionWithFallback(page, 5, {
    id: 'standards-intro',
    heading: 'Our Selection Standard',
    body: 'We partner with teams that share our standards for engineering quality.',
    ctaLabel: 'Standards',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const standards = [
    sectionWithFallback(page, 6, {
      id: 'standard-1',
      heading: 'Excellence',
      body: 'Proven high-performance delivery track record.',
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 7, {
      id: 'standard-2',
      heading: 'Integrity',
      body: 'Transparent communication and milestone discipline.',
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 8, {
      id: 'standard-3',
      heading: 'Innovation',
      body: 'Commitment to modern stacks and cloud-native delivery.',
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 9, {
      id: 'standard-4',
      heading: 'Growth',
      body: 'Long-term vision for mutual ecosystem expansion.',
      ctaLabel: '04',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const perksIntro = sectionWithFallback(page, 10, {
    id: 'perks-intro',
    heading: 'Ecosystem Perks',
    body: 'Beyond collaboration, we provide resources for partners to thrive.',
    ctaLabel: 'Perks',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const perks = [
    sectionWithFallback(page, 11, {
      id: 'perk-1',
      heading: 'Architecture Audits',
      body: 'Free consultation for complex cloud infrastructure designs.',
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 12, {
      id: 'perk-2',
      heading: 'Priority Support',
      body: 'Direct line to senior architects for emergency escalations.',
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 13, {
      id: 'perk-3',
      heading: 'Co-Marketing',
      body: 'We actively promote your software and services to our client base — through case studies, project showcases, and joint campaigns that drive adoption.',
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const cta = sectionWithFallback(page, 14, {
    id: 'cta',
    heading: 'Ready to Build Partner Value?|Join our ecosystem network.',
    body: 'Tell us your capabilities and we will map the best collaboration model for your team.',
    ctaLabel: 'Start Partnership Discussion',
    ctaHref: '/contact?interest=partnership',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, 'Scale with Vanaila.');
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, 'Join our ecosystem network.');
  const partnershipContactHref = '/contact?interest=partnership';
  const finalCtaHref = !cta.ctaHref || cta.ctaHref === '/contact' ? partnershipContactHref : cta.ctaHref;

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
          <span>Partnership</span>
        </nav>

        <div className="v-svc-hero-meta">
          <span>[ PARTNERSHIP / ECOSYSTEM ]</span>
          <span>REFERRAL / ALLIANCE / EXPANSION</span>
          <span className="v-svc-status">PARTNER INTAKE OPEN</span>
        </div>

        <h1 className="v-svc-h1">
          {heroPrimary}
          <br />
          <em>{heroAccent}</em>
          <br />
          without <del>handoff chaos.</del>
          <br />
          <em>shared delivery.</em>
        </h1>

        <div className="v-svc-hero-foot">
          <p>{hero.body}</p>
          <div className="v-svc-actions">
            <Link
              href="#tracks"
              className="v-svc-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Compare tracks</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href="/contact?interest=partnership"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Start a discussion
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-block v-svc-block-blue" id="tracks" style={{ '--accent': '#C8E64B' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">01</span>
          <span className="v-svc-block-tag">{programIntro.ctaLabel || 'Program'}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{programIntro.heading}</h2>
          <span className="v-svc-block-sub">Choose your fit.</span>
        </div>
        <p className="v-svc-lede">{programIntro.body}</p>
        <div className="v-svc-deliverables">
          {programCards.map((card, index) => {
            const tags = (card.mediaAlt || '')
              .split('/')
              .map((tag) => tag.trim())
              .filter(Boolean);

            return (
              <article className="v-home-service-card" key={card.id} style={{ '--accent': programAccents[index % programAccents.length] } as CSSProperties}>
                <span className="v-home-service-top">
                  <small>{String(index + 1).padStart(2, '0')}</small>
                  <b>-&gt;</b>
                </span>
                <h3>{card.heading}</h3>
                <p>{card.body}</p>
                <span className="v-home-service-label">{card.ctaLabel || 'Partner track'}</span>
                <span className="v-home-service-bar" />
                <div className="v-svc-tags" aria-label={`${card.heading} focus areas`}>
                  {tags.map((tag) => (
                    <span key={tag}>{tag}</span>
                  ))}
                </div>
              </article>
            );
          })}
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-why">
        <div className="v-svc-why-head">
          <span className="v-svc-why-eyebrow">[ 02 ] {standardsIntro.ctaLabel || 'Standards'}</span>
          <h2>
            {standardsIntro.heading}
            <br />
            <em>before we shake hands.</em>
          </h2>
        </div>
        <div className="v-svc-why-grid">
          {standards.map((item, index) => (
            <article className={`v-svc-why-cell v-svc-why-${standardTones[index % standardTones.length]}`} key={item.id}>
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

      <Reveal as="section" className="v-svc-block v-svc-block-ink" style={{ '--accent': '#FF5B22' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">03</span>
          <span className="v-svc-block-tag">{perksIntro.ctaLabel || 'Perks'}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{perksIntro.heading}</h2>
          <span className="v-svc-block-sub">Built for leverage.</span>
        </div>
        <p className="v-svc-lede">{perksIntro.body}</p>
        <div className="v-svc-deliverables">
          {perks.map((item) => (
            <article className="v-svc-deliverable" key={item.id}>
              <div className="v-svc-deliverable-header">
                <span>{item.ctaLabel}</span>
                <span className="v-svc-deliverable-bar" />
              </div>
              <h3>{item.heading}</h3>
              <p>{item.body}</p>
            </article>
          ))}
        </div>
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
              href={finalCtaHref}
              className="v-svc-btn-primary v-svc-btn-primary-lg"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{cta.ctaLabel || 'Start Partnership Discussion'}</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
