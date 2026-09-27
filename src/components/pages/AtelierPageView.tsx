'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './atelier-page-view.module.css';

const disciplines = [
  {
    number: '01',
    title: 'Document Studio',
    description:
      'Generate client proposals, invoices, service agreements, NDAs, and project briefs in seconds with vector-crisp, print-ready PDF export.',
    tags: ['Invoices', 'Contracts', 'PRDs', 'PDF Export'],
  },
  {
    number: '02',
    title: 'CV & Resume Builder',
    description:
      'Design ATS-compliant, recruiter-ready resumes. Select curated typographic layouts, edit inline in real time, and export directly to DOCX or PDF.',
    tags: ['ATS-Compliant', 'Inline Editor', 'DOCX & PDF', 'Designer Layouts'],
  },
  {
    number: '03',
    title: 'Social Content Generator',
    description:
      'Transform ideas and quotes into high-impact LinkedIn, Twitter, and Instagram carousels and banners with custom palettes and typographic scales.',
    tags: ['Carousels', 'Post Banners', 'Typography', 'Instant PNG'],
  },
  {
    number: '04',
    title: 'Client-Side PDF Utilities',
    description:
      'Merge multi-page PDFs, reorder sheets, extract individual pages, or convert PDF documents directly into high-res images entirely in your browser.',
    tags: ['Merge PDF', 'PDF to Image', 'Split & Reorder', 'Zero Server'],
  },
  {
    number: '05',
    title: 'Image Converter & Compressor',
    description:
      'Batch convert between WebP, PNG, JPEG, and SVG graphics locally in memory. Compress file sizes without sending confidential assets over the network.',
    tags: ['WebP / PNG / JPG', 'Batch Mode', 'Local Canvas', 'Lossless'],
  },
  {
    number: '06',
    title: 'Client-Side WASM OCR',
    description:
      'Extract text from images, scanned receipts, and screenshots using local WebAssembly Tesseract OCR with absolute privacy and zero cloud dependence.',
    tags: ['WebAssembly', 'Tesseract OCR', 'Zero Uploads', 'Instant Copy'],
  },
] as const;

const steps = [
  {
    step: '01',
    phase: 'Architecture',
    title: 'Zero server uploads. 100% client-side.',
    description:
      'All calculations, document compilation, PDF parsing, and OCR run directly inside your browser using WebAssembly and HTML5 Canvas. Your confidential contracts, personal resumes, and proprietary media never leave your device.',
    duration: 'Sub-second',
    deliverables: ['Zero remote telemetry', 'WASM-powered rendering', 'Local IndexedDB persistence', 'Complete offline capability'],
  },
  {
    step: '02',
    phase: 'Workflow',
    title: 'No sign-up wall. No paywall on your data.',
    description:
      'Open a tab, choose your tool, complete your work, and close the tab. No mandatory registrations, no passwords to reset, and no artificial watermarks stamped on documents you crafted yourself.',
    duration: 'Instant',
    deliverables: ['Instant browser launch', 'Zero credit card required', 'No watermarks', 'Export directly to disk'],
  },
  {
    step: '03',
    phase: 'Production',
    title: 'Vector-sharp, print-accurate output.',
    description:
      'Every document, PDF, and graphic complies with ISO standard page dimensions, crisp typography, and high-DPI resolution. Hand documents to clients, printers, or hiring managers with complete confidence.',
    duration: 'Milliseconds',
    deliverables: ['Vector PDF generation', 'Editable DOCX', 'Lossless image formats', 'Client-ready exports'],
  },
] as const;

const principles = [
  'Privacy is an architectural guarantee, not a marketing promise — zero files uploaded to servers.',
  'Zero install friction. Open a browser tab and immediately start producing work.',
  'No artificial paywalls or watermarks on documents and assets you created.',
  'The speed of native desktop software with the instant accessibility of the web.',
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
      {/* ── Hero ── */}
      <Reveal as="section" className={styles.hero}>
        <GridLines />

        <div className={styles.heroMeta}>
          <span className={styles.studioPill}>
            <span className={styles.studioMark}>◈</span>
            VANAILA STUDIO · 18 BROWSER TOOLS
          </span>
          <span className={styles.status}>
            <span className={styles.statusDot}>●</span>
            NOW LIVE · 100% CLIENT-SIDE PRIVACY
          </span>
        </div>

        <div>
          <h1 className={styles.heroTitle}>
            One tab.
            <br />
            Every tool you <span className={styles.serifClay}>actually use.</span>
          </h1>

          <div className={styles.heroFoot}>
            <p>
              Documents, CVs, image and PDF conversions, OCR, and social posts — built in your
              browser. No installs. No accounts. No watermarks. 100% client-side privacy.
            </p>
            <div className={styles.actions}>
              <a
                href="https://studio.vanaila.com/"
                target="_blank"
                rel="noopener noreferrer"
                className={styles.primaryButton}
                data-analytics-event="cta_click"
                data-analytics-label="Atelier Hero Launch Studio"
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>Launch Studio Free</span>
                <span className={styles.arrow}>→</span>
              </a>
              <Link
                href="/contact?interest=atelier"
                className={styles.ghostButton}
                data-analytics-event="cta_click"
                data-analytics-label="Atelier Hero Enterprise CTA"
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                Enterprise Licensing
              </Link>
            </div>
            <div className={styles.heroNote}>
              <span className={styles.noteDot}>●</span>
              <span>100% Client-Side Sandbox · 18 Tools · Zero Data Uploaded</span>
            </div>
          </div>
        </div>

        <div className={styles.heroMedia}>
          <div className={styles.browserWindow}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={`${styles.browserDot} ${styles.browserDotRed}`} />
                <span className={`${styles.browserDot} ${styles.browserDotYellow}`} />
                <span className={`${styles.browserDot} ${styles.browserDotGreen}`} />
              </div>
              <div className={styles.browserUrl}>studio.vanaila.com</div>
              <span className={styles.browserBadge}>Client Sandbox</span>
            </div>
            <div className={styles.browserImageWrap}>
              <Image
                src="/atelier/atelier-home.png"
                alt="Vanaila Studio — In-Browser Document and Utility Suite"
                width={1440}
                height={900}
                priority
                className={styles.browserImage}
              />
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── Ticker ── */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 4 }, (_, i) => (
            <span key={i}>
              DOCUMENT STUDIO &nbsp;◆&nbsp; CV & RESUME BUILDER &nbsp;◆&nbsp; SOCIAL CONTENT &nbsp;◆&nbsp;
              CLIENT-SIDE PDF MERGE &nbsp;◆&nbsp; PDF TO IMAGE &nbsp;◆&nbsp; WASM OCR SCANNER &nbsp;◆&nbsp;
              ZERO CLOUD UPLOADS &nbsp;◆&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* ── Workspace / Dashboard Showcase ── */}
      <Reveal as="section" className={styles.dashboardSection}>
        <GridLines />
        <div className={styles.dashboardInner}>
          <div className={styles.dashboardHead}>
            <div>
              <span className={styles.eyebrow}>[ WORKSPACE INTERFACE ]</span>
              <h2>
                Your personal studio.
                <br />
                <em>Zero server storage.</em>
              </h2>
            </div>
            <p>
              Manage document drafts, resume iterations, and social media campaigns in an organized
              personal workspace saved directly to your browser&apos;s encrypted local storage.
            </p>
          </div>

          <div className={styles.dashboardFrame}>
            <div className={styles.browserHeader}>
              <div className={styles.browserDots}>
                <span className={`${styles.browserDot} ${styles.browserDotRed}`} />
                <span className={`${styles.browserDot} ${styles.browserDotYellow}`} />
                <span className={`${styles.browserDot} ${styles.browserDotGreen}`} />
              </div>
              <div className={styles.browserUrl}>studio.vanaila.com/workspace</div>
              <span className={styles.browserBadge}>Local IndexedDB</span>
            </div>
            <div className={styles.browserImageWrap}>
              <Image
                src="/atelier/atelier-user.png"
                alt="Vanaila Studio Pro Workspace Dashboard"
                width={1440}
                height={900}
                className={styles.browserImage}
              />
            </div>
          </div>

          <div className={styles.dashboardFeatures}>
            <div className={styles.dashboardFeatureCard}>
              <span className={styles.featureCardTag}>LOCAL PRIVACY</span>
              <h3>Encrypted Sandbox</h3>
              <p>Your drafts and assets remain on your device. We cannot read your NDAs, contracts, or personal resumes.</p>
            </div>
            <div className={styles.dashboardFeatureCard}>
              <span className={styles.featureCardTag}>ZERO DELAY</span>
              <h3>Instant WebAssembly</h3>
              <p>Render PDFs, compute OCR, and re-encode high-res images in milliseconds without network transfer lags.</p>
            </div>
            <div className={styles.dashboardFeatureCard}>
              <span className={styles.featureCardTag}>NO FEES</span>
              <h3>Free & Unrestricted</h3>
              <p>Full access to all 18 tools with no trial limits, export caps, or mandatory credit card prompts.</p>
            </div>
          </div>
        </div>
      </Reveal>

      {/* ── The 18 Tools Across 6 Categories ── */}
      <Reveal as="section" className={styles.disciplines}>
        <div className={styles.sectionHead}>
          <div>
            <span className={styles.eyebrow}>[ 18 BROWSER TOOLS ]</span>
            <h2>
              Everything you need.
              <br />
              <i>Nothing you don&apos;t.</i>
            </h2>
          </div>
          <p>
            Six dedicated browser studios built for designers, founders, and knowledge workers.
            Zero files touch remote servers — all calculations run natively in your browser.
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

      {/* ── How It Works ── */}
      <Reveal as="section" className={styles.process}>
        <div className={styles.processHead}>
          <span className={styles.eyebrow}>[ ARCHITECTURE ]</span>
          <h2>
            Zero servers.
            <br />
            Zero <i>compromises.</i>
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
                    <span className={styles.metaLabel}>EXECUTION SPEED</span>
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

      {/* ── Principles ── */}
      <Reveal as="section" className={styles.manifesto}>
        <GridLines />
        <div className={styles.manifestoInner}>
          <span className={styles.manifestoEyebrow}>[ CORE PRINCIPLES ]</span>
          <h2 className={styles.manifestoTitle}>
            Built for privacy,
            <br />
            engineered for <i>speed.</i>
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

      {/* ── Bottom CTA ── */}
      <Reveal as="section" className={styles.cta}>
        <GridLines />
        <span className={`${styles.eyebrow} ${styles.ctaEyebrow}`}>[ GET STARTED ]</span>
        <h2 className={styles.ctaTitle}>
          Ready to create
          <br />
          <span>in privacy?</span>
        </h2>
        <div className={styles.ctaFoot}>
          <p>
            Experience 18 in-browser utilities without signing up, installing plugins, or uploading
            your private documents to external clouds. Open the suite and start immediately.
          </p>
          <div className={styles.ctaActions}>
            <a
              href="https://studio.vanaila.com/"
              target="_blank"
              rel="noopener noreferrer"
              className={`${styles.primaryButton} ${styles.largeButton}`}
              data-analytics-event="cta_click"
              data-analytics-label="Atelier Bottom Launch Studio"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Launch Studio Free (studio.vanaila.com)</span>
              <span className={styles.arrow}>→</span>
            </a>
            <Link
              href="/contact?interest=atelier"
              className={styles.secondaryLink}
              data-analytics-event="cta_click"
              data-analytics-label="Atelier Bottom Enterprise CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              or request on-prem enterprise deployment
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
