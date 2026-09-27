'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { useCursorMode } from '@/components/CustomCursor';

import styles from './muzikplayer-page-view.module.css';

const GITHUB_REPO_URL = 'https://github.com/coderaulia/muzik';

const features = [
  {
    n: '01',
    badge: 'Audio Engine',
    title: 'Bit-Perfect PipeWire & ALSA Direct',
    desc: 'Bypasses system sound servers for uncompromised 1:1 hardware output. Supports up to 24-bit/192kHz PCM and native DSD playback with ultra-low 5.33 ms buffer latency.',
    tags: ['PipeWire 1.0', 'ALSA Direct', '24-bit/192kHz', 'Bit-Perfect 1:1'],
  },
  {
    n: '02',
    badge: 'Lyrics & Waveform',
    title: 'LRC Synced Lyrics & Peak Waveform',
    desc: 'Auto-scrolling synchronized lyrics with UTF-8 support alongside pre-calculated audio waveforms with peak caching. Includes A-B loop marking and parametric EQ visualization.',
    tags: ['LRC Engine', 'Auto-scroll', 'Waveform Cache', 'A-B Looping'],
  },
  {
    n: '03',
    badge: 'Library',
    title: 'Lightning-Fast Local Library Indexing',
    desc: 'Scans thousands of tracks in seconds. Instant search with Ctrl+K, genre filtering, album discography grouping, and comprehensive tag inspection powered by bundled FFmpeg.',
    tags: ['Ctrl+K Search', 'Instant Indexing', 'FFmpeg Decoder', 'Tag Inspector'],
  },
  {
    n: '04',
    badge: 'UI Architecture',
    title: 'Libadwaita Slate Design System',
    desc: 'Engineered with Compose Desktop (Kotlin/JVM) adhering to GNOME/Libadwaita Slate tokens. Dynamic cover art palette extraction, vinyl spinning animation, and instant Dark/Light/System theme toggles.',
    tags: ['Compose Desktop', 'Libadwaita Slate', 'Palette Extraction', 'Dark / Light'],
  },
  {
    n: '05',
    badge: 'Desktop Integration',
    title: 'Linux Desktop & MPRIS Integration',
    desc: 'Native desktop presence with MPRIS protocol integration for keyboard media keys, lock screen playback controls, and system notifications. Supports ListenBrainz scrobbling.',
    tags: ['MPRIS Media Keys', 'Lock Screen', 'ListenBrainz', 'GNOME Shell'],
  },
  {
    n: '06',
    badge: 'Packaging',
    title: 'Zero-Dependency Distribution',
    desc: 'Ships with a self-contained, pre-bundled Java runtime. No Gradle, JVM, or developer toolchain needed on user systems. Available in RPM, DEB, Flatpak, and standalone portable tarball.',
    tags: ['Bundled JRE', 'RPM', 'DEB', 'Flatpak', 'Portable'],
  },
];

const packages = [
  {
    distro: 'Fedora / RHEL / openSUSE',
    type: '.rpm package',
    desc: 'Native standalone RPM package built with automated CI. Integrates directly into your package manager.',
    command: 'sudo dnf install ./muzikplayer-1.5.4-1.x86_64.rpm',
  },
  {
    distro: 'Debian / Ubuntu / Linux Mint',
    type: '.deb package',
    desc: 'Standard Debian binary package with desktop entry and icon associations.',
    command: 'sudo apt install ./MuzikPlayer-1.5.4.deb',
  },
  {
    distro: 'Portable Linux Archive (Any Distro)',
    type: '.tar.gz bundle (Rootless)',
    desc: 'Extract and run anywhere without root privileges. Includes one-click install and uninstall scripts.',
    command: 'tar -xzf MuzikPlayer-1.5.4-linux-amd64.tar.gz\ncd MuzikPlayer && ./install.sh',
  },
  {
    distro: 'Flatpak (Flathub)',
    type: 'Sandbox runtime',
    desc: 'Sandboxed installation using the standard Freedesktop 26.08 application runtime.',
    command: 'flatpak install --user MuzikPlayer-1.5.4.flatpak\nflatpak run io.github.coderaulia.muzikplayer',
  },
];

const specs = [
  { k: 'Frontend & UI Framework', v: 'Compose Desktop (Kotlin Multiplatform / Skiko graphics engine)' },
  { k: 'Programming Language', v: 'Kotlin 2.3 on JVM' },
  { k: 'Audio Decoding Engine', v: 'Bundled FFmpeg engine supporting FLAC, ALAC, WAV, MP3, OGG, AIFF, DSD' },
  { k: 'Audio Output Streaming', v: 'Direct PipeWire 1.0 stream & ALSA hardware output (bit-perfect 1:1, up to 192kHz/24-bit)' },
  { k: 'Audio Metrics & DSP', v: 'ReplayGain -1.4 dB, buffer latency ~5.33 ms (512 samples), DSP clipping protection' },
  { k: 'Target Platform', v: 'Linux x86_64 (Fedora, Arch, Debian/Ubuntu, openSUSE, etc.)' },
  { k: 'License', v: 'Open Source (GNU General Public License v3.0)' },
  { k: 'Source Code & Releases', v: 'https://github.com/coderaulia/muzik' },
];

export function MuzikPlayerPageView() {
  const { setMode } = useCursorMode();
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const copyToClipboard = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  return (
    <main className={styles.root}>
      {/* HERO SECTION */}
      <Reveal as="section" className={styles.hero}>
        <div className={styles.gridLines} aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <div className={styles.heroMeta}>
          <div className={styles.productPill}>
            <span className={styles.productMark} />
            <span>PRODUCT 04 · OPEN-SOURCE AUDIO ENGINE</span>
          </div>
          <div className={styles.statusPill}>
            <span>● BIT-PERFECT PIPEWIRE 1.0 DIRECT · v1.5.4</span>
          </div>
        </div>

        <div className={styles.heroHead}>
          <h1 className={styles.heroTitle}>
            Pure Hi-Fi Sound.
            <br />
            <em>Libadwaita Slate Design.</em>
          </h1>
          <div className={styles.heroLead}>
            <p>
              A modern desktop music player for your local library, built with Compose Desktop
              (Kotlin/JVM). Delivers bit-perfect PipeWire direct streaming, auto-scrolling LRC
              synchronized lyrics, real-time audio waveforms, and lightning-fast local library navigation.
            </p>
            <div className={styles.heroActions}>
              <a
                href="#install"
                className={styles.btnPrimary}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>Get MuzikPlayer v1.5.4</span>
                <span>↓</span>
              </a>
              <a
                href={GITHUB_REPO_URL}
                target="_blank"
                rel="noreferrer noopener"
                className={styles.btnSecondary}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>View on GitHub</span>
                <span>↗</span>
              </a>
              <Link
                href="/contact?interest=muzikplayer"
                className={styles.btnGhost}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>Discuss custom audio apps</span>
                <span>→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* HERO SHOWCASE PREVIEW */}
        <div className={styles.showcaseFrame}>
          <Image
            src="/muzikplayer/muzikplayer-hero.png"
            alt="MuzikPlayer interface with PipeWire audio engine, waveforms, synchronized lyrics, and local library browser"
            width={1024}
            height={576}
            priority
            style={{ width: '100%', height: 'auto', display: 'block' }}
          />
        </div>
      </Reveal>

      {/* TECH PILLS RIBBON */}
      <div className={styles.ribbon}>
        <div className={styles.ribbonItem}>
          <span className={styles.ribbonDot} />
          <span>PIPEWIRE &amp; ALSA DIRECT</span>
        </div>
        <div className={styles.ribbonItem}>
          <span className={styles.ribbonDot} />
          <span>1:1 BIT-PERFECT PCM &amp; DSD</span>
        </div>
        <div className={styles.ribbonItem}>
          <span className={styles.ribbonDot} />
          <span>SYNCHRONIZED LRC LYRICS</span>
        </div>
        <div className={styles.ribbonItem}>
          <span className={styles.ribbonDot} />
          <span>FLAC / ALAC / WAV / MP3 / DSD</span>
        </div>
        <div className={styles.ribbonItem}>
          <span className={styles.ribbonDot} />
          <span>100% NATIVE COMPOSE DESKTOP</span>
        </div>
      </div>

      {/* CAPABILITIES GRID */}
      <Reveal as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>[ 01 ] ARCHITECTURE &amp; FEATURES</span>
          <h2 className={styles.sectionTitle}>
            Built for audiophiles.
            <br />
            Engineered for <em>Linux.</em>
          </h2>
          <p className={styles.sectionDesc}>
            Every layer of MuzikPlayer is crafted to preserve acoustic fidelity while respecting
            modern desktop design standards. From zero-latency PipeWire output to dynamic cover-art
            palette extraction.
          </p>
        </div>

        <StaggerGroup className={styles.cardGrid}>
          {features.map((feat) => (
            <StaggerItem key={feat.n} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardN}>{feat.n}</span>
                <span className={styles.cardBadge}>{feat.badge}</span>
              </div>
              <h3 className={styles.cardTitle}>{feat.title}</h3>
              <p className={styles.cardDesc}>{feat.desc}</p>
              <div className={styles.cardTags}>
                {feat.tags.map((t) => (
                  <span key={t} className={styles.tag}>
                    {t}
                  </span>
                ))}
              </div>
            </StaggerItem>
          ))}
        </StaggerGroup>

        {/* DEEP DIVE MONITOR */}
        <div className={styles.deepDive}>
          <div className={styles.deepDiveContent}>
            <span className={styles.eyebrow}>BIT-PERFECT AUDIO BACKEND</span>
            <h3>
              Direct PipeWire streaming with <em>zero resampling</em>
            </h3>
            <p>
              Unlike conventional desktop audio players that rely on pulse wrappers or mixer layers,
              MuzikPlayer connects directly to PipeWire and ALSA hardware nodes. No unwanted sample-rate
              conversion, no dithering distortion, and no volume quantization.
            </p>
            <div className={styles.statList}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>5.33 ms</span>
                <span className={styles.statLabel}>Buffer Latency (512 spl)</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>1:1 Direct</span>
                <span className={styles.statLabel}>Resampling Bypass</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>96kHz / 24-bit</span>
                <span className={styles.statLabel}>Studio Master FLAC</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>0.0 dB</span>
                <span className={styles.statLabel}>DSP Clipping State</span>
              </div>
            </div>
          </div>

          <div className={styles.deepDiveContent}>
            <span className={styles.eyebrow}>NATIVE DESKTOP ERGONOMICS</span>
            <h3>
              Libadwaita Slate <em>visual tokens</em>
            </h3>
            <p>
              Designed to look right at home on modern Linux environments. MuzikPlayer adheres to
              Libadwaita design patterns with custom slate dark surfaces, dynamic cover art accent
              derivation, auto-scrolling LRC lyric visualization, and instant light/dark mode switching.
            </p>
            <div className={styles.statList}>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Dynamic</span>
                <span className={styles.statLabel}>Cover Art Palette Derivation</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Sub-second</span>
                <span className={styles.statLabel}>LRC Lyric Synchronization</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Ctrl + K</span>
                <span className={styles.statLabel}>Instant Library Search</span>
              </div>
              <div className={styles.statItem}>
                <span className={styles.statValue}>Zero Setup</span>
                <span className={styles.statLabel}>Bundled JRE Runtime</span>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      {/* INSTALLATION SECTION */}
      <Reveal as="section" id="install" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>[ 02 ] GET MUZIKPLAYER</span>
          <h2 className={styles.sectionTitle}>
            Install in seconds.
            <br />
            <em>No dependencies</em> required.
          </h2>
          <p className={styles.sectionDesc}>
            Pre-built releases include a bundled Java runtime—no Java, Gradle, or build tools need to
            be installed on your machine.
          </p>
        </div>

        <div className={styles.distroGrid}>
          {packages.map((pkg, idx) => (
            <div key={pkg.distro} className={styles.distroCard}>
              <div className={styles.distroHead}>
                <h3 className={styles.distroTitle}>{pkg.distro}</h3>
                <span className={styles.distroType}>{pkg.type}</span>
              </div>
              <p className={styles.distroDesc}>{pkg.desc}</p>
              <pre className={styles.codeBlock}>{pkg.command}</pre>
              <button
                type="button"
                className={styles.btnSecondary}
                onClick={() => copyToClipboard(pkg.command, idx)}
                style={{ alignSelf: 'flex-start', marginTop: 'auto' }}
                onMouseEnter={() => setMode('link')}
                onMouseLeave={() => setMode('default')}
              >
                <span>{copiedIndex === idx ? '✓ Copied!' : 'Copy command'}</span>
              </button>
            </div>
          ))}
        </div>
      </Reveal>

      {/* TECH SPECS TABLE */}
      <Reveal as="section" className={styles.section}>
        <div className={styles.sectionHeader}>
          <span className={styles.eyebrow}>[ 03 ] SPECIFICATIONS</span>
          <h2 className={styles.sectionTitle}>
            Engineering <em>benchmarks.</em>
          </h2>
        </div>

        <table className={styles.specsTable}>
          <tbody>
            {specs.map((s) => (
              <tr key={s.k}>
                <th>{s.k}</th>
                <td>
                  {s.v.startsWith('http') ? (
                    <a
                      href={s.v}
                      target="_blank"
                      rel="noreferrer noopener"
                      style={{ color: 'var(--mz-cyan)', textDecoration: 'underline' }}
                    >
                      {s.v}
                    </a>
                  ) : (
                    s.v
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Reveal>

      {/* BOTTOM CTA */}
      <section className={styles.cta}>
        <span className={styles.ctaEye}>[ OPEN-SOURCE &amp; BESPOKE SYSTEMS ]</span>
        <h2 className={styles.ctaTitle}>
          Audiophile precision.
          <br />
          Built by <em>Vanaila Digital.</em>
        </h2>
        <p className={styles.ctaDesc}>
          Explore the source code on GitHub, download pre-built release packages, or talk with us
          about engineering custom desktop, audio, and high-performance software for your organization.
        </p>
        <div className={styles.ctaActions}>
          <a
            href={GITHUB_REPO_URL}
            target="_blank"
            rel="noreferrer noopener"
            className={styles.btnPrimary}
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            <span>Star on GitHub</span>
            <span>★</span>
          </a>
          <Link
            href="/contact?interest=muzikplayer"
            className={styles.btnSecondary}
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            <span>Discuss a custom software project</span>
            <span>→</span>
          </Link>
          <Link
            href="/products"
            className={styles.btnGhost}
            onMouseEnter={() => setMode('link')}
            onMouseLeave={() => setMode('default')}
          >
            <span>Browse all products</span>
            <span>→</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
