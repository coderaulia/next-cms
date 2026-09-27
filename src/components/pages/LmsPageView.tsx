'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './lms-page-view.module.css';

const pillars = [
  {
    number: '01',
    title: 'Multi-Tenant White-Label',
    text: 'Run private corporate academies or commercial course marketplaces. Custom domains, isolated student databases, and tailored branded aesthetics.',
  },
  {
    number: '02',
    title: 'Zero-Buffering Video Pipeline',
    text: 'Engineered on high-speed CDN and modern web standards. Embed video lessons from YouTube, Vimeo, or private S3 buckets with sub-200ms TTFB globally.',
  },
  {
    number: '03',
    title: 'Automated Quizzes & Certs',
    text: 'Assess comprehension with modular multiple-choice and practical evaluations. Automatically generate tamper-proof digital completion certificates.',
  },
  {
    number: '04',
    title: 'Local Commerce & HRIS Ready',
    text: 'Native support for Indonesian payment gateways (Midtrans, Xendit, QRIS) and direct integration with corporate employee directories.',
  },
];

const tickerItems = [
  'Course Authoring',
  'Curriculum Builder',
  'Video Lesson Player',
  'Quiz Engine',
  'Automated Certificates',
  'Multi-Tenant LMS',
  'Instructor Studio',
  'Student Analytics',
  'Indonesian Payment Gateways',
];

export function LmsPageView() {
  const { setMode } = useCursorMode();

  return (
    <main className={styles.root}>
      {/* ── Hero ── */}
      <Reveal as="section" className={styles.hero}>
        <div className={styles.gridLines} aria-hidden>
          {Array.from({ length: 12 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>

        <div className={styles.heroMeta}>
          <span>[ 01 / PRODUCT ]</span>
          <div className={styles.productPill}>
            <span className={styles.statusDot} aria-hidden />
            <span>VANAILA LMS · COMING SOON</span>
          </div>
          <span>Q4 2026 RELEASE</span>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Learn skills that open doors —
            <br />
            <em>managed in one unified LMS.</em>
          </h1>
          <p className={styles.heroDesc}>
            Practical, expert-led online learning infrastructure for educators, corporate academies, and training providers.
            Deliver self-paced video courses, track student progression in real time, and award verifiable credentials.
          </p>

          <div className={styles.heroActions}>
            <Link
              href="/contact?interest=lms"
              className={styles.btnPrimary}
              data-analytics-event="cta_click"
              data-analytics-label="LMS Hero Waitlist CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Join Early Access Waitlist</span>
              <span>-&gt;</span>
            </Link>
            <Link
              href="/custom-business-tools"
              className={styles.btnGhost}
              data-analytics-event="cta_click"
              data-analytics-label="LMS Hero Custom Tools CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Custom Platform Architecture
            </Link>
          </div>

          <div className={styles.trustBadges}>
            <span>✓ Multi-Tenant White-Label</span>
            <span>✓ Zero-Buffering Video Delivery</span>
            <span>✓ Verifiable PDF Certificates</span>
          </div>
        </div>

        <div className={styles.heroVisual}>
          <Image
            src="/lms/lms-marketing.png"
            alt="Vanaila LMS Multi-Interface Showcase"
            width={1920}
            height={1080}
            className={styles.heroImg}
            priority
          />
        </div>
      </Reveal>

      {/* ── Ticker ── */}
      <div className={styles.ticker}>
        <div className={styles.tickerTrack}>
          {Array.from({ length: 3 }).map((_, i) => (
            <span key={i}>
              {tickerItems.join('  ◆  ')}  ◆  
            </span>
          ))}
        </div>
      </div>

      {/* ── Deep Dive 1: Learner Discovery ── */}
      <Reveal as="section" className={styles.section} id="learner-experience">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionEyebrow}>[ 02 / LEARNER PORTAL ]</span>
            <h2 className={styles.sectionTitle}>
              Student-centric discovery that <em>actually drives completion.</em>
            </h2>
          </div>
          <p className={styles.sectionDesc}>
            Frictionless course navigation with instant search, category filters, and cross-device lesson tracking
            so learners stay motivated from registration to graduation.
          </p>
        </div>

        <div className={styles.deepDiveCard}>
          <div className={styles.deepDiveImgWrap}>
            <Image
              src="/lms/lms-homepage.png"
              alt="Vanaila LMS Course Catalog and Learner Portal"
              width={1440}
              height={900}
              className={styles.deepDiveImg}
            />
          </div>

          <div className={styles.deepDiveInfo}>
            <span className={styles.deepDiveTag}>STUDENT EXPERIENCE</span>
            <h3 className={styles.deepDiveH3}>Catalog, Search &amp; Structured Curriculum</h3>
            <p className={styles.deepDiveText}>
              Learners explore topic-based tracks across Design, Development, Analytics, and Business.
              Each course showcases lesson counts, instructor credentials, and average ratings with continuous progress resuming.
            </p>

            <div className={styles.pillList}>
              <span className={styles.pillItem}>⚡ 250+ Expert-Led Courses</span>
              <span className={styles.pillItem}>🔍 Instant Filter &amp; Search</span>
              <span className={styles.pillItem}>📱 Mobile &amp; Tablet Responsive</span>
              <span className={styles.pillItem}>🎓 One-Click Certificate Release</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Deep Dive 2: Instructor Studio ── */}
      <Reveal as="section" className={styles.section} id="instructor-studio">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionEyebrow}>[ 03 / INSTRUCTOR STUDIO ]</span>
            <h2 className={styles.sectionTitle}>
              Course authoring designed for <em>educators, not engineers.</em>
            </h2>
          </div>
          <p className={styles.sectionDesc}>
            Build structured multi-chapter syllabi in minutes. Embed video lessons, publish learning modules,
            and monitor enrolled learner engagement without writing a line of code.
          </p>
        </div>

        <div className={`${styles.deepDiveCard} ${styles.deepDiveCardRev}`}>
          <div className={styles.deepDiveInfo}>
            <span className={styles.deepDiveTag}>COURSE CREATOR</span>
            <h3 className={styles.deepDiveH3}>Curriculum Builder &amp; Student Analytics</h3>
            <p className={styles.deepDiveText}>
              Instructors manage active courses, edit chapters and lesson descriptions, embed video streams from YouTube or private S3,
              and inspect detailed enrolled rosters to identify drop-off points.
            </p>

            <div className={styles.pillList}>
              <span className={styles.pillItem}>📝 Modular Curriculum Editor</span>
              <span className={styles.pillItem}>🎥 Multi-Source Video Embeds</span>
              <span className={styles.pillItem}>👥 Enrolled Learner Management</span>
              <span className={styles.pillItem}>📊 Per-Lesson Progress Tracking</span>
            </div>
          </div>

          <div className={styles.deepDiveImgWrap}>
            <Image
              src="/lms/lms-instructor.png"
              alt="Vanaila LMS Instructor Studio Course Creator"
              width={1440}
              height={900}
              className={styles.deepDiveImg}
            />
          </div>
        </div>
      </Reveal>

      {/* ── Platform Architecture ── */}
      <Reveal as="section" className={styles.section} id="architecture">
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.sectionEyebrow}>[ 04 / ENTERPRISE FOUNDATION ]</span>
            <h2 className={styles.sectionTitle}>
              Engineered for <em>scale, security, and white-labeling.</em>
            </h2>
          </div>
          <p className={styles.sectionDesc}>
            Built on the same enterprise-grade TypeScript, Drizzle ORM, and PostgreSQL stack powering our custom business tools.
          </p>
        </div>

        <StaggerGroup className={styles.pillarsGrid}>
          {pillars.map((item) => (
            <StaggerItem as="article" className={styles.pillarCard} key={item.number}>
              <span className={styles.pillarNum}>{item.number}</span>
              <h3 className={styles.pillarTitle}>{item.title}</h3>
              <p className={styles.pillarText}>{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </Reveal>

      {/* ── CTA Banner ── */}
      <Reveal as="section" className={styles.ctaSection}>
        <span className={styles.ctaEye}>[ EARLY ACCESS ]</span>
        <h2 className={styles.ctaHeading}>
          Ready to launch your own <em>online academy?</em>
        </h2>
        <p className={styles.ctaBody}>
          Vanaila LMS is launching in Q4 2026. Join the early access program today to reserve a staging instance,
          request custom features, and lock in founding partner pricing.
        </p>
        <div className={styles.ctaActions}>
          <Link
            href="/contact?interest=lms"
            className={styles.btnPrimary}
            data-analytics-event="cta_click"
            data-analytics-label="LMS Footer Waitlist CTA"
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            <span>Request Early Access Brief</span>
            <span>-&gt;</span>
          </Link>
          <Link
            href="/portfolio"
            className={styles.btnGhost}
            data-analytics-event="cta_click"
            data-analytics-label="LMS Footer Portfolio CTA"
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            Explore Delivered Platforms
          </Link>
        </div>
      </Reveal>
    </main>
  );
}
