'use client';

import { useTranslations } from 'next-intl';
import type { CSSProperties } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';
import { Link } from '@/i18n/navigation';
import type { LandingPage } from '@/features/cms/types';

import { paragraphs, sectionWithFallback, splitAccent } from './sectionContent';

type AboutPageViewProps = {
  page: LandingPage;
};

const pillarTones = ['ink', 'blue', 'lime'] as const;

export function AboutPageView({ page }: AboutPageViewProps) {
  const { setMode } = useCursorMode();
  const t = useTranslations('about');

  const storyStats = [
    { k: '8+', v: t('stat1') },
    { k: '30+', v: t('stat2') },
    { k: '3', v: t('stat3') }
  ];

  const hero = sectionWithFallback(page, 0, {
    id: 'about-hero',
    heading: t('heroHeading'),
    body: t('heroBody'),
    ctaLabel: 'About Vanaila',
    ctaHref: '/about',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const story = sectionWithFallback(page, 1, {
    id: 'about-story',
    heading: t('storyHeading'),
    body: t('storyBody'),
    ctaLabel: t('storyTag'),
    ctaHref: t('storySub'),
    mediaImage: '',
    mediaAlt: 'We prioritize speed, security, and stability above all else, ensuring your digital presence is as reliable as it is beautiful.',
    layout: 'split'
  });
  const vision = sectionWithFallback(page, 2, {
    id: 'about-vision',
    heading: t('visionHeading'),
    body: t('visionBody'),
    ctaLabel: 'Vision',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const mission = sectionWithFallback(page, 3, {
    id: 'about-mission',
    heading: t('missionHeading'),
    body: t('missionBody'),
    ctaLabel: 'Mission',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarsIntro = sectionWithFallback(page, 4, {
    id: 'about-pillars-intro',
    heading: t('pillarsHeading'),
    body: 'Three principles that guide every decision we make — for every client, every sprint, and every launch.',
    ctaLabel: t('pillarsEyebrowLabel'),
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillars = [
    sectionWithFallback(page, 5, {
      id: 'about-pillar-1',
      heading: t('pillar1Heading'),
      body: t('pillar1Body'),
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 6, {
      id: 'about-pillar-2',
      heading: t('pillar2Heading'),
      body: t('pillar2Body'),
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 7, {
      id: 'about-pillar-3',
      heading: t('pillar3Heading'),
      body: t('pillar3Body'),
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];
  const quote = sectionWithFallback(page, 8, {
    id: 'about-quote',
    heading: t('quoteHeading'),
    body: t('quoteBody'),
    ctaLabel: t('quoteTag'),
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const cta = sectionWithFallback(page, 9, {
    id: 'about-cta',
    heading: "Let's build|something that lasts",
    body: t('ctaBody'),
    ctaLabel: t('ctaButton'),
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
          <span>{t('metaCulture')}</span>
          <span className="v-svc-status">{t('metaStatus')}</span>
        </div>

        <h1 className="v-svc-h1">
          {heroPrimary}
          <br />
          <em>{heroAccent}</em>
          <br />
          {t('h1Mid')} <del>{t('h1Strike')}</del>
          <br />
          <em>{t('h1Accent')}</em>
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
              <span>{t('readStory')}</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href="/service"
              className="v-svc-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {t('exploreServices')}
            </Link>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="v-svc-block v-svc-block-ink" id="story" style={{ '--accent': '#C8E64B' } as CSSProperties}>
        <div className="v-svc-block-marker">
          <span className="v-svc-block-n">01</span>
          <span className="v-svc-block-tag">{story.ctaLabel || t('storyTag')}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{story.heading}</h2>
          <span className="v-svc-block-sub">{story.ctaHref || t('storySub')}</span>
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
          <span className="v-svc-block-tag">{t('directionTag')}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{t('directionHeading')}</h2>
          <span className="v-svc-block-sub">{t('directionSub')}</span>
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
          <span className="v-svc-why-eyebrow">[ 03 ] {pillarsIntro.ctaLabel || t('pillarsEyebrowLabel')}</span>
          <h2>
            {pillarsIntro.heading}
            <br />
            <em>{t('pillarsAccent')}</em>
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
          <span className="v-svc-block-tag">{quote.ctaLabel || t('quoteTag')}</span>
        </div>
        <div className="v-svc-block-head">
          <h2>{quote.heading.replace(/"/g, '').trim()}</h2>
          <span className="v-svc-block-sub">{t('quoteSub')}</span>
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
              <span>{cta.ctaLabel || t('ctaButton')}</span>
              <span>-&gt;</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
