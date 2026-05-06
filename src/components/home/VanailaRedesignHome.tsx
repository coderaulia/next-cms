'use client';

import Link from 'next/link';
import {
  forwardRef,
  useEffect,
  useRef,
  useState,
  type ComponentPropsWithoutRef,
  type CSSProperties,
  type RefObject,
  type ReactNode
} from 'react';

import type { HeroBlock, LandingPage, PortfolioProject, PrimaryCtaBlock, SolutionsGridBlock, ValueTripletBlock, WhySplitBlock } from '@/features/cms/types';

import { useCursorMode } from '@/components/CustomCursor';

type VanailaRedesignHomeProps = {
  page: LandingPage;
  projects: PortfolioProject[];
};

const serviceAccents = ['#0033FF', '#FF5B22', '#0A0E1A', '#C8E64B', '#2D5FFF'];
const fallbackClients = ['Greenretech', 'Biliamind', 'Maza Adventure', 'Rumah Psikologi', 'HR Performance'];
const whyTones = ['ink', 'blue', 'cream', 'lime', 'orange'] as const;

const fadeUp = {
  hidden: { opacity: 0, y: 32 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as [number, number, number, number] } },
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5, ease: 'easeOut' as const } },
};

const stagger = {
  visible: { transition: { staggerChildren: 0.1 } },
};

const staggerSlow = {
  visible: { transition: { staggerChildren: 0.15 } },
};

type MotionOnlyProps = {
  animate?: unknown;
  initial?: unknown;
  transition?: unknown;
  variants?: unknown;
};

function omitMotionProps<T extends MotionOnlyProps>(props: T) {
  const { animate, initial, transition, variants, ...rest } = props;
  void animate;
  void initial;
  void transition;
  void variants;
  return rest;
}

const MotionDiv = forwardRef<HTMLDivElement, ComponentPropsWithoutRef<'div'> & MotionOnlyProps>((props, ref) => (
  <div ref={ref} {...omitMotionProps(props)} />
));
MotionDiv.displayName = 'MotionDiv';

const MotionSection = forwardRef<HTMLElement, ComponentPropsWithoutRef<'section'> & MotionOnlyProps>((props, ref) => (
  <section ref={ref} {...omitMotionProps(props)} />
));
MotionSection.displayName = 'MotionSection';

const MotionHeading = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h1'> & MotionOnlyProps>((props, ref) => (
  <h1 ref={ref} {...omitMotionProps(props)} />
));
MotionHeading.displayName = 'MotionHeading';

const MotionSubheading = forwardRef<HTMLHeadingElement, ComponentPropsWithoutRef<'h2'> & MotionOnlyProps>((props, ref) => (
  <h2 ref={ref} {...omitMotionProps(props)} />
));
MotionSubheading.displayName = 'MotionSubheading';

const MotionArticle = forwardRef<HTMLElement, ComponentPropsWithoutRef<'article'> & MotionOnlyProps>((props, ref) => (
  <article ref={ref} {...omitMotionProps(props)} />
));
MotionArticle.displayName = 'MotionArticle';

const MotionSpan = forwardRef<HTMLSpanElement, ComponentPropsWithoutRef<'span'> & MotionOnlyProps>((props, ref) => (
  <span ref={ref} {...omitMotionProps(props)} />
));
MotionSpan.displayName = 'MotionSpan';

const motion = {
  article: MotionArticle,
  div: MotionDiv,
  h1: MotionHeading,
  h2: MotionSubheading,
  section: MotionSection,
  span: MotionSpan
};

function useInViewOnce(ref: RefObject<HTMLElement | null>, rootMargin = '-80px') {
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node || inView) return undefined;

    if (!('IntersectionObserver' in window)) {
      setInView(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [inView, ref, rootMargin]);

  return inView;
}

function Section({ children, className, id }: { children: ReactNode; className?: string; id?: string }) {
  const ref = useRef<HTMLElement>(null);
  const inView = useInViewOnce(ref);
  return (
    <motion.section ref={ref} className={className} id={id} initial="hidden" animate={inView ? 'visible' : 'hidden'} variants={stagger}>
      {children}
    </motion.section>
  );
}

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
  const clientNames = projects.length > 0 ? projects.slice(0, 8).map((project) => project.clientName || project.title) : fallbackClients;

  return (
    <main className="v-home">
      {/* ── Hero ── */}
      <Section className="v-home-hero">
        <div className="v-home-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <motion.div className="v-home-hero-meta" variants={fadeUp}>
          <span>[ 01 / Home ]</span>
          <span>Est. 2018 / 8+ years / 30+ projects</span>
          <span className="v-home-status">Start your solution projects</span>
        </motion.div>
        <motion.h1 className="v-home-hero-title" variants={fadeUp} transition={{ delay: 0.1 }}>
          <span>{accent.replace('Scaled Results.', 'Faster, smarter,')}</span>
          <br />
          and built to <del>struggle.</del>
          <br />
          <span>scale.</span>
        </motion.h1>
        <motion.div className="v-home-hero-foot" variants={fadeUp} transition={{ delay: 0.2 }}>
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
        </motion.div>
        <motion.div className="v-home-ticker" variants={fadeIn} transition={{ delay: 0.4 }}>
          <div className="v-home-ticker-track">
            {Array.from({ length: 4 }).map((_, index) => (
              <span key={index}>Business websites / Custom tools / Online shops / Mobile apps / Business email / </span>
            ))}
          </div>
        </motion.div>
      </Section>

      {/* ── Promise ── */}
      <Section className="v-home-promise">
        <motion.div className="v-home-section-head v-home-section-head-light" variants={fadeUp}>
          <span>[ 02 ] The Vanaila Promise</span>
          <h2>
            Tech that <i>just works.</i>
          </h2>
          <p>You should not have to worry about how your website works. You just need it to perform.</p>
        </motion.div>
        <motion.div className="v-home-promise-grid" variants={staggerSlow}>
          {(values?.items ?? []).slice(0, 3).map((item, index) => (
            <motion.article className={`v-home-promise-card v-home-promise-card-${index + 1}`} key={item.id} variants={fadeUp}>
              <span>Pillar {index + 1}</span>
              <strong>{item.title}</strong>
              <p>{item.text}</p>
            </motion.article>
          ))}
        </motion.div>
      </Section>

      {/* ── Services ── */}
      <Section className="v-home-services" id="services">
        <motion.div className="v-home-section-head v-home-section-head-light v-home-section-head-split" variants={fadeUp}>
          <div>
            <span>[ 03 ] Solutions</span>
            <h2>
              Solutions built for your <i>growth.</i>
            </h2>
          </div>
          <p>{solutions?.subheading || 'Engineered solutions for modern business infrastructure.'}</p>
        </motion.div>
        <motion.div className="v-home-service-grid" variants={stagger}>
          {(solutions?.items ?? []).map((service, index) => (
            <motion.div key={service.id} variants={fadeUp}>
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
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link className="v-home-text-link v-home-text-link-light" href="/service">
            Explore all solutions <span>-&gt;</span>
          </Link>
        </motion.div>
      </Section>

      {/* ── Work ── */}
      <Section className="v-home-work">
        <motion.div className="v-home-section-head v-home-section-head-split" variants={fadeUp}>
          <div>
            <span>[ 04 ] Selected Work</span>
            <h2>
              Real businesses, <i>real results.</i>
            </h2>
          </div>
          <p>2024 - 2026 / {Math.max(projects.length, 4)} delivered stories in the CMS.</p>
        </motion.div>
        <motion.div className="v-home-work-grid" variants={stagger}>
          {featuredProjects.map((project, index) => (
            <motion.div key={project.id} variants={fadeUp}>
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
            </motion.div>
          ))}
        </motion.div>
        <motion.div variants={fadeUp}>
          <Link className="v-home-text-link" href="/portfolio">
            View our full portfolio <span>-&gt;</span>
          </Link>
        </motion.div>
      </Section>

      {/* ── Why ── */}
      <Section className="v-home-why">
        <motion.div className="v-home-section-head v-home-section-head-split" variants={fadeUp}>
          <span>[ 05 ] Why Vanaila Digital</span>
          <h2>
            Five reasons growing businesses <i>choose us.</i>
          </h2>
        </motion.div>
        <motion.div className="v-home-why-grid" variants={stagger}>
          {(why?.bullets ?? []).slice(0, 5).map((item, index) => (
            <motion.article className={`v-home-why-card v-home-why-${whyTones[index % whyTones.length]}`} key={item.id} variants={fadeUp}>
              <span>{String(index + 1).padStart(2, '0')}</span>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <b aria-hidden />
            </motion.article>
          ))}
        </motion.div>
      </Section>

      {/* ── Logos ── */}
      <Section className="v-home-logos">
        <motion.div className="v-home-logos-head" variants={fadeUp}>
          <span>[ 06 ] Trusted by Companies</span>
          <span>SMEs / Corporations / Non-profits</span>
        </motion.div>
        <motion.div className="v-home-logo-marquee" variants={fadeIn}>
          <div className="v-home-logo-track">
            {[...clientNames, ...clientNames].map((client, index) => (
              <span key={`${client}-${index}`}>
                {client}
                <i aria-hidden />
              </span>
            ))}
          </div>
        </motion.div>
        <motion.div className="v-home-logo-actions" variants={fadeUp}>
          <Link href="/portfolio">View our portfolio -&gt;</Link>
          <Link href="/contact">Let's talk growth -&gt;</Link>
        </motion.div>
      </Section>

      {/* ── CTA ── */}
      <Section className="v-home-cta">
        <div className="v-home-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
        <motion.span className="v-home-cta-eye" variants={fadeUp}>
          [ 07 ] Ready to grow?
        </motion.span>
        <motion.h2 variants={fadeUp} transition={{ delay: 0.1 }}>
          {cta?.heading || "Let's build"}
          <br />
          <span>{cta?.description || 'something that works as hard as you do.'}</span>
        </motion.h2>
        <motion.div className="v-home-cta-foot" variants={fadeUp} transition={{ delay: 0.2 }}>
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
        </motion.div>
      </Section>
    </main>
  );
}
