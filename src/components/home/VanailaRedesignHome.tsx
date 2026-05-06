'use client';

import Link from 'next/link';
import type { CSSProperties } from 'react';

import type { HeroBlock, LandingPage, PortfolioProject, PrimaryCtaBlock, SolutionsGridBlock, ValueTripletBlock, WhySplitBlock } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

type VanailaRedesignHomeProps = {
  page: LandingPage;
  projects: PortfolioProject[];
};

const serviceAccents = ['#0033FF', '#FF5B22', '#0A0E1A', '#C8E64B', '#2D5FFF'];
const fallbackClients = ['Greenretech', 'Biliamind', 'Maza Adventure', 'Rumah Psikologi', 'HR Performance'];
const whyTones = ['ink', 'blue', 'cream', 'lime', 'orange'] as const;

function findBlock<T extends { type: string }>(page: LandingPage, type: T['type']): T | null {
  return (page.homeBlocks?.find((block) => block.enabled && block.type === type) as T | undefined) ?? null;
}

function splitHeroTitle(page: LandingPage) {
  const hero = findBlock<HeroBlock>(page, 'hero');
  const primary = hero?.titlePrimary || 'Your business online.';
  const accent = hero?.titleAccent || 'Faster, smarter, and built to scale.';
  return { hero, primary, accent };
}

export function VanailaRedesignHome({ page, projects }: VanailaRedesignHomeProps) {
  const { setMode } = useCursorMode();
  const { hero, accent } = splitHeroTitle(page);
  const values = findBlock<ValueTripletBlock>(page, 'value_triplet');
  const solutions = findBlock<SolutionsGridBlock>(page, 'solutions_grid');
  const why = findBlock<WhySplitBlock>(page, 'why_split');
  const cta = findBlock<PrimaryCtaBlock>(page, 'primary_cta');
  const featuredProjects = projects.slice(0, 4);
  const clientNames =
    projects.length > 0
      ? projects.slice(0, 8).map((project) => project.clientName || project.title)
      : fallbackClients;

  return (
    <main className="v-home">
      {/* ── Hero ── */}
      <Reveal as="section" className="v-home-hero">
        <div className="v-home-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <div className="v-home-hero-meta">
          <span>[ 01 / Home ]</span>
          <span>Est. 2018 / 8+ years / 30+ projects</span>
          <span className="v-home-status">Start your solution projects</span>
        </div>
        <h1 className="v-home-hero-title">
          <span>{accent.replace('Scaled Results.', 'Faster, smarter,')}</span>
          <br />
          and built to <del>struggle.</del>
          <br />
          <span>scale.</span>
        </h1>
        <div className="v-home-hero-foot">
          <p>
            {hero?.description ||
              'Vanaila Digital helps you reclaim your time. We build high-speed websites and custom business tools that work as hard as you do.'}
          </p>
          <div className="v-home-actions">
            <Link
              className="v-home-btn v-home-btn-primary"
              href={hero?.primaryCtaHref || '/contact'}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {hero?.primaryCtaLabel || 'Book your free consultation'}
              <span>-&gt;</span>
            </Link>
            <Link
              className="v-home-btn v-home-btn-ghost"
              href={hero?.secondaryCtaHref || '/portfolio'}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {hero?.secondaryCtaLabel || 'See our work'}
            </Link>
          </div>
        </div>
        <div className="v-home-ticker">
          <div className="v-home-ticker-track">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index}>Business websites / Custom tools / Online shops / Mobile apps / Business email / </span>
            ))}
          </div>
        </div>
      </Reveal>

      {/* ── Promise ── */}
      <Reveal as="section" className="v-home-promise">
        <div className="v-home-section-head v-home-section-head-light">
          <span>[ 02 ] The Vanaila Promise</span>
          <h2>
            Tech that <i>just works.</i>
          </h2>
          <p>You should not have to worry about how your website works. You just need it to perform.</p>
        </div>
        <StaggerGroup className="v-home-promise-grid">
          {(values?.items ?? []).slice(0, 3).map((item, index) => (
            <StaggerItem as="article" className={`v-home-promise-card v-home-promise-card-${index + 1}`} key={item.id}>
              <span>Pillar {index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      {/* ── Services ── */}
      <Reveal as="section" className="v-home-services" id="services">
        <div className="v-home-section-head v-home-section-head-light v-home-section-head-split">
          <div>
            <span>[ 03 ] Solutions</span>
            <h2>
              Solutions built for your <i>growth.</i>
            </h2>
          </div>
          <p>{solutions?.subheading || 'Engineered solutions for modern business infrastructure.'}</p>
        </div>
        <StaggerGroup className="v-home-service-grid">
          {(solutions?.items ?? []).map((service, index) => (
            <StaggerItem key={service.id}>
              <Link
                className="v-home-service-card"
                href={service.ctaHref || '/service'}
                style={{ '--accent': serviceAccents[index % serviceAccents.length] } as CSSProperties}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span className="v-home-service-top">
                  <small>{service.number || String(index + 1).padStart(2, '0')}</small>
                  <b>-&gt;</b>
                </span>
                <h3>{service.title}</h3>
                <p>{service.text}</p>
                <span className="v-home-service-label">{service.ctaLabel}</span>
                <span className="v-home-service-bar" />
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal>
          <Link className="v-home-text-link v-home-text-link-light" href="/service">
            Explore all solutions <span>-&gt;</span>
          </Link>
        </Reveal>
      </Reveal>

      {/* ── Work ── */}
      <Reveal as="section" className="v-home-work">
        <div className="v-home-section-head v-home-section-head-split">
          <div>
            <span>[ 04 ] Selected Work</span>
            <h2>
              Real businesses, <i>real results.</i>
            </h2>
          </div>
          <p>2024 - 2026 / {Math.max(projects.length, 4)} delivered stories in the CMS.</p>
        </div>
        <StaggerGroup className="v-home-work-grid">
          {featuredProjects.map((project, index) => (
            <StaggerItem key={project.id}>
              <Link
                className={`v-home-work-card v-home-work-card-${index + 1}`}
                href={`/portfolio/${project.seo.slug}`}
                onMouseEnter={() => setMode('view')}
                onMouseLeave={() => setMode('default')}
              >
                <div className="v-home-work-image">
                  {project.coverImage ? (
                    <img src={project.coverImage} alt={project.title} decoding="async" loading="lazy" />
                  ) : (
                    <span>{project.serviceType}</span>
                  )}
                </div>
                <div className="v-home-work-meta">
                  <span>{project.serviceType}</span>
                  <h3>{project.title}</h3>
                  <p>{project.summary}</p>
                </div>
              </Link>
            </StaggerItem>
          ))}
        </StaggerGroup>
        <Reveal>
          <Link className="v-home-text-link" href="/portfolio">
            View our full portfolio <span>-&gt;</span>
          </Link>
        </Reveal>
      </Reveal>

      {/* ── Why ── */}
      <Reveal as="section" className="v-home-why">
        <div className="v-home-section-head v-home-section-head-split">
          <span>[ 05 ] Why Vanaila Digital</span>
          <h2>
            Five reasons growing businesses <i>choose us.</i>
          </h2>
        </div>
        <StaggerGroup className="v-home-why-grid">
          {(why?.bullets ?? []).slice(0, 5).map((item, index) => (
            <StaggerItem
              as="article"
              className={`v-home-why-card v-home-why-${whyTones[index % whyTones.length]}`}
              key={item.id}
            >
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b aria-hidden />
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      {/* ── Logos ── */}
      <Reveal as="section" className="v-home-logos">
        <div className="v-home-logos-head">
          <span>[ 06 ] Trusted by Companies</span>
          <span>SMEs / Corporations / Non-profits</span>
        </div>
        <Reveal className="v-home-logo-marquee" preset="fadeIn">
          <div className="v-home-logo-track">
            {[...clientNames, ...clientNames].map((client, index) => (
              <span key={`${client}-${index}`}>
                {client}
                <i aria-hidden />
              </span>
            ))}
          </div>
        </Reveal>
        <div className="v-home-logo-actions">
          <Link href="/portfolio">View our portfolio -&gt;</Link>
          <Link href="/contact">Let&apos;s talk growth -&gt;</Link>
        </div>
      </Reveal>

      {/* ── CTA ── */}
      <Reveal as="section" className="v-home-cta">
        <div className="v-home-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <span className="v-home-cta-eye">[ 07 ] Ready to grow?</span>
        <h2>
          {cta?.heading || "Let's build"}
          <br />
          <span>{cta?.description || 'something that works as hard as you do.'}</span>
        </h2>
        <div className="v-home-cta-foot">
          <p>{cta?.accentText || 'Join the organizations that trust Vanaila Digital with their brand.'}</p>
          <Link
            className="v-home-btn v-home-btn-primary v-home-btn-large"
            href={cta?.ctaHref || '/contact'}
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            {cta?.ctaLabel || 'Claim free consultation call'}
            <span>-&gt;</span>
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
