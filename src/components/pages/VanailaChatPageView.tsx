'use client';

import Image from 'next/image';
import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './vanailachat-page-view.module.css';

const GITHUB_REPO = 'https://github.com/coderaulia/vanailachat';
const GITHUB_RELEASES = 'https://github.com/coderaulia/vanailachat/releases/latest';

const stats = [
  { number: '100%', label: 'Free & Local AI', detail: 'Zero subscriptions. Offline Ollama models on your own silicon.' },
  { number: '0', label: 'Telemetry & Tracking', detail: 'Private local SQLite WAL storage. What happens locally stays locally.' },
  { number: '240+', label: 'Automated Tests', detail: 'Rigorous Vitest suite, strict TypeScript, and zero lint warnings.' },
  { number: '5', label: 'Packaging Formats', detail: '.deb, .rpm, .AppImage, AUR package, and 1-Click web launcher.' },
] as const;

const pillars = [
  {
    n: '01',
    title: '100% Free & Offline-Ready',
    desc: 'Connect directly to Ollama to run cutting-edge models (Llama 3.2, DeepSeek-R1, Qwen 2.5-Coder, Mistral, Phi-4) on your local GPU/NPU with zero monthly subscriptions.',
    tags: ['Ollama', 'Llama 3.2', 'DeepSeek-R1', 'Qwen 2.5', 'Offline'],
  },
  {
    n: '02',
    title: 'Live Coding Workspace Engines',
    desc: 'Swappable Pi and DeepSeek coding harnesses with live diff reviews, sandboxed terminal execution, approval prompts, and read-only safety modes.',
    tags: ['Pi Harness', 'DeepSeek Harness', 'Diff Reviews', 'Tool Approvals'],
  },
  {
    n: '03',
    title: 'Workspaces & Project Memory',
    desc: 'Organize chats into dedicated project workspaces. Persistent RAG vector memory (nomic-embed-text) automatically remembers your coding style and architecture.',
    tags: ['Workspaces', 'Vector RAG', 'nomic-embed-text', 'SQLite WAL'],
  },
  {
    n: '04',
    title: 'Universal AI Model Routing',
    desc: 'Plug in OpenRouter free models, high-speed 9Router proxy, OpenAI (GPT-4o, o1, o3-mini), Anthropic Claude, or local endpoints like LM Studio and vLLM.',
    tags: ['OpenRouter Free', '9Router', 'OpenAI', 'Claude', 'vLLM'],
  },
  {
    n: '05',
    title: 'Git Status & Safety Creator',
    desc: 'Real-time branch monitoring in the workspace bar with warning badges on production branches and 1-click safety branch creation before code generation.',
    tags: ['Git Integration', 'Branch Guard', 'Safety Branch', 'Live Activity'],
  },
  {
    n: '06',
    title: 'Themes & Native Linux Ergonomics',
    desc: 'Native Linux client built with Tauri 2.0 and Rust. Includes Vanaila Origin and Catppuccin color schemes (Teal, Rose, Blue, Green, Peach) with light & dark modes.',
    tags: ['Tauri 2.0', 'Rust', 'Catppuccin', 'Dark Mode', 'Linux Native'],
  },
] as const;

const deepDives = [
  {
    kicker: 'WORKSPACE ERGONOMICS',
    title: 'Dedicated Workspaces with Independent Memory',
    desc: 'Never mix unrelated client chats or research notes again. VanailaChat auto-organizes conversations by project workspace, linking each to a local codebase folder while maintaining isolated prompts, custom instructions, and long-term semantic memory.',
    bullets: [
      'Isolated workspace memory and custom system instructions per project',
      'Linked workspace directory with real-time Git status and safety branching',
      'Semantic vector search powered by nomic-embed-text for instant recall',
      'Accurate live token meters tracking prompt and completion tokens',
    ],
    image: '/vanailachat/workspaces-hub.png',
    alt: 'VanailaChat Workspaces and Projects Hub interface',
  },
  {
    kicker: 'CODING WORKSPACE ENGINES',
    title: 'Interactive Coding Harnesses with Live Diff Inspection',
    desc: 'Harness the power of AI coding agents directly on your machine. Choose between the lightweight Pi Coding Harness or the multi-file DeepSeek Harness. Every tool execution is transparent: inspect touched files, review diffs line by line, and approve actions with a keystroke.',
    bullets: [
      'Swappable Pi and DeepSeek harnesses using your configured AI provider',
      'Dedicated right activity drawer with live terminal feeds and approval prompts',
      'Side-by-side git diff review before accepting code changes',
      'Read-only safety switch to allow code research without accidental edits',
    ],
    image: '/vanailachat/workspace-chat.png',
    alt: 'VanailaChat Core Workspace with Ollama and Pi Harness',
  },
] as const;

const downloads = [
  {
    distro: 'Ubuntu / Debian / Mint / Pop!_OS',
    format: '.deb (x86_64)',
    command: 'sudo apt install ./vanaila-chat_0.3.2_amd64.deb',
    href: GITHUB_RELEASES,
    label: 'Download .deb',
  },
  {
    distro: 'Fedora / RHEL / openSUSE',
    format: '.rpm (x86_64)',
    command: 'sudo dnf install ./vanaila-chat-0.3.2-1.x86_64.rpm',
    href: GITHUB_RELEASES,
    label: 'Download .rpm',
  },
  {
    distro: 'Universal Linux (Any Distro)',
    format: '.AppImage',
    command: 'chmod +x *.AppImage && ./*.AppImage',
    href: GITHUB_RELEASES,
    label: 'Download .AppImage',
  },
  {
    distro: 'Arch Linux / Manjaro',
    format: 'AUR Package',
    command: 'yay -S vanaila-chat-bin',
    href: GITHUB_REPO,
    label: 'View on AUR',
  },
  {
    distro: '1-Click Web App (Linux / Mac / Windows)',
    format: 'Automated Script',
    command: './start.sh (Linux/Mac) or start.bat (Win)',
    href: GITHUB_REPO,
    label: 'Clone & Run',
  },
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

export function VanailaChatPageView() {
  const { setMode } = useCursorMode();

  return (
    <main className={styles.root}>
      {/* HERO SECTION */}
      <Reveal as="section" className={styles.hero}>
        <GridLines />

        <div className={styles.heroMeta}>
          <span className={styles.productPill}>
            <span className={styles.productMark}>✦</span>
            VANAILACHAT · PRIVACY-FIRST AI WORKSTATION
          </span>
          <span className={styles.status}>
            <span className={styles.statusDot}>●</span> v0.3.2 LIVE · TAURI 2.0 &amp; WEB
          </span>
        </div>

        <div className={styles.heroContent}>
          <h1 className={styles.heroTitle}>
            Organize Projects.
            <br />
            Empower <span className={styles.serifBlue}>Local AI.</span>
            <br />
            <span className={styles.cyanGradient}>Zero Telemetry.</span>
          </h1>

          <div className={styles.heroFoot}>
            <p className={styles.heroLead}>
              A native Linux desktop client and web workstation built for Ollama, cloud LLMs, and swappable live
              coding harnesses — with persistent agent memory, project workspaces, and strict local privacy.
            </p>

            <div className={styles.actions}>
              <a
                className={styles.primaryButton}
                href={GITHUB_RELEASES}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>Download for Linux (.deb, .rpm, .AppImage)</span>
                <span>↓</span>
              </a>
              <a
                className={styles.ghostButton}
                href={GITHUB_REPO}
                target="_blank"
                rel="noopener noreferrer"
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>⭐ Star on GitHub</span>
              </a>
            </div>

            <div className={styles.heroBadges}>
              <span className={styles.badgeItem}>
                <span>🔒</span> 100% Local SQLite &amp; Zero Tracking
              </span>
              <span>•</span>
              <span className={styles.badgeItem}>
                <span>⚡</span> Powered by Rust, Tauri 2.0 &amp; React 19
              </span>
            </div>
          </div>
        </div>

        <div
          className={styles.heroShot}
          onMouseEnter={() => setMode('view')}
          onMouseLeave={() => setMode('default')}
        >
          <div className={styles.shotFrame}>
            <Image
              src="/vanailachat/hero-mockup.png"
              alt="VanailaChat native desktop and web workstation UI mockup"
              width={1024}
              height={576}
              sizes="(max-width: 1024px) 100vw, 50vw"
              priority
            />
          </div>

          <div className={`${styles.annotation} ${styles.annotationOne}`}>
            <span className={styles.annotationDot} />
            <div>
              <span className={styles.annotationKey}>Swappable Coding</span>
              <span className={styles.annotationValue}>Pi &amp; DeepSeek Harnesses</span>
            </div>
          </div>
          <div className={`${styles.annotation} ${styles.annotationTwo}`}>
            <span className={styles.annotationDot} />
            <div>
              <span className={styles.annotationKey}>100% Free &amp; Offline</span>
              <span className={styles.annotationValue}>Ollama DeepSeek-R1 &amp; Qwen</span>
            </div>
          </div>
        </div>
      </Reveal>

      {/* TICKER MARQUEE */}
      <div className={styles.ticker} aria-hidden="true">
        <div className={styles.tickerTrack}>
          {Array.from({ length: 4 }, (_, index) => (
            <span key={index}>
              OLLAMA &nbsp;✦&nbsp; TAURI 2.0 &nbsp;✦&nbsp; REACT 19 &nbsp;✦&nbsp; RUST &nbsp;✦&nbsp; PI HARNESS
              &nbsp;✦&nbsp; DEEPSEEK HARNESS &nbsp;✦&nbsp; OPENROUTER &nbsp;✦&nbsp; ZERO TELEMETRY &nbsp;✦&nbsp;
              VECTOR MEMORY &nbsp;✦&nbsp; 100% OPEN SOURCE &nbsp;✦&nbsp;
            </span>
          ))}
        </div>
      </div>

      {/* STATS SECTION */}
      <Reveal as="section" className={styles.statsSection}>
        <div className={styles.statsGrid}>
          {stats.map((stat, idx) => (
            <div key={idx} className={styles.statCard}>
              <div className={styles.statNumber}>{stat.number}</div>
              <div className={styles.statLabel}>{stat.label}</div>
              <div className={styles.statSub}>{stat.detail}</div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* PILLARS SECTION */}
      <Reveal as="section" className={styles.pillarsSection}>
        <div className={styles.sectionHeader}>
          <span className={styles.sectionEyebrow}>[ CAPABILITIES ]</span>
          <h2 className={styles.sectionTitle}>Engineered for AI Autonomy &amp; Developer Privacy</h2>
          <p className={styles.sectionSubtitle}>
            Everything you expect from modern AI developer tooling — without corporate telemetry or closed-source lock-in.
          </p>
        </div>

        <div className={styles.pillarsGrid}>
          {pillars.map((pillar) => (
            <div key={pillar.n} className={styles.pillarCard}>
              <div className={pillarNumberStyle(pillar.n)}>{pillar.n}</div>
              <h3 className={styles.pillarTitle}>{pillar.title}</h3>
              <p className={styles.pillarDesc}>{pillar.desc}</p>
              <div className={styles.pillarTags}>
                {pillar.tags.map((tag) => (
                  <span key={tag} className={styles.pillarTag}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          ))}
        </div>
      </Reveal>

      {/* DEEP DIVES SECTION */}
      <Reveal as="section" className={styles.deepDivesSection}>
        {deepDives.map((deepDive, index) => (
          <div key={index} className={styles.deepDiveRow}>
            <div className={styles.deepDiveText}>
              <span className={styles.deepDiveKicker}>[ {deepDive.kicker} ]</span>
              <h3 className={styles.deepDiveTitle}>{deepDive.title}</h3>
              <p className={styles.deepDiveDesc}>{deepDive.desc}</p>
              <ul className={styles.deepDiveList}>
                {deepDive.bullets.map((bullet, bIdx) => (
                  <li key={bIdx} className={styles.deepDiveItem}>
                    <span className={styles.checkMark}>✓</span>
                    <span>{bullet}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className={styles.deepDiveImageWrap}>
              <Image
                src={deepDive.image}
                alt={deepDive.alt}
                width={1024}
                height={640}
                sizes="(max-width: 1024px) 100vw, 50vw"
              />
            </div>
          </div>
        ))}
      </Reveal>

      {/* DOWNLOADS & DISTRIBUTION SECTION */}
      <Reveal as="section" className={styles.downloadsSection}>
        <div className={styles.downloadsWrapper}>
          <div className={styles.sectionHeader}>
            <span className={styles.sectionEyebrow}>[ PACKAGING &amp; INSTALLATION ]</span>
            <h2 className={styles.sectionTitle}>Get Started in Seconds</h2>
            <p className={styles.sectionSubtitle}>
              Download the native Linux installer for your distribution or launch the automated cross-platform web edition.
            </p>
          </div>

          <table className={styles.downloadsTable}>
            <thead>
              <tr>
                <th>Platform / Distro</th>
                <th>Package</th>
                <th>Quick Install Command</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {downloads.map((item, dIdx) => (
                <tr key={dIdx}>
                  <td className={styles.distroName}>{item.distro}</td>
                  <td>
                    <span className={styles.packageBadge}>{item.format}</span>
                  </td>
                  <td>
                    <code className={styles.codeSnippet}>{item.command}</code>
                  </td>
                  <td>
                    <a
                      href={item.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={styles.downloadLink}
                    >
                      {item.label} →
                    </a>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Reveal>

      {/* INDONESIAN COMMUNITY BANNER */}
      <Reveal as="section" style={{ padding: '80px 48px', background: 'var(--paper)' }}>
        <div className={styles.communityBanner}>
          <div className={styles.communityFlag}>🇮🇩</div>
          <h3 className={styles.communityTitle}>Made with Love for the Indonesian AI Community</h3>
          <p className={styles.communityLead}>
            An open-source, privacy-first AI workstation built to empower students, independent creators, and senior
            software engineers to build with modern AI — completely free and sovereign.
          </p>
          <a
            href={GITHUB_REPO}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.primaryButton}
            style={{ background: '#ffffff', color: '#0a0e1a' }}
          >
            <span>Join the Community on GitHub</span>
            <span>→</span>
          </a>
        </div>
      </Reveal>

      {/* FINAL CALL TO ACTION */}
      <Reveal as="section" className={styles.ctaSection}>
        <div className={styles.ctaBox}>
          <h2 className={styles.ctaTitle}>Reclaim Your AI Sovereignty Today</h2>
          <p className={styles.ctaSubtitle}>
            Run your models locally, preserve your code confidentiality, and experience a developer-first AI workspace.
          </p>
          <div className={styles.actions} style={{ justifyContent: 'center' }}>
            <a
              className={styles.primaryButton}
              href={GITHUB_RELEASES}
              target="_blank"
              rel="noopener noreferrer"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Download Native Linux Client</span>
              <span>↓</span>
            </a>
            <Link
              href="/products"
              className={styles.ghostButton}
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>View All Products</span>
            </Link>
          </div>
        </div>
      </Reveal>
    </main>
  );
}

function pillarNumberStyle(_n: string) {
  return styles.pillarNumber;
}
