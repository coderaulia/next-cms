'use client';

import Link from 'next/link';
import { type FormEvent, useState } from 'react';

import { useCursorMode } from '@/components/CustomCursor';
import { trackClientAnalyticsEvent } from '@/lib/analyticsClient';
import { csrfFetch } from '@/lib/clientCsrf';
import type { LandingPage, SiteSettings } from '@/features/cms/types';

type ContactPageViewProps = {
  page: LandingPage;
  settings?: Pick<SiteSettings, 'contact'>;
  initialInterest?: string;
};

const PARTNERSHIP_INTEREST = 'Partnership / Referral';

const SERVICES = [
  'Website Development',
  'Custom Web App Development',
  'Mobile App Development (React Native)',
  'High-Conversion Landing Page',
  'Online Shop / E-Commerce',
  'Professional Business Email',
  PARTNERSHIP_INTEREST,
] as const;

export function ContactPageView({ settings, initialInterest }: ContactPageViewProps) {
  const { setMode } = useCursorMode();
  const c = settings?.contact;

  const emailValue = c?.emailValue || 'care@vanaila.com';
  const emailHref = c?.emailHref || 'mailto:care@vanaila.com';
  const whatsappValue = c?.whatsappValue || '+62 851 744 133 23';
  const whatsappHref = c?.whatsappHref || 'https://wa.me/6285174413323';
  const companyName = c?.companyName || 'PT Vanaila Digital Vision';
  const addressLine1 = c?.addressLine1 || 'Bogor, Indonesia';

  const [interests, setInterests] = useState<string[]>(() =>
    initialInterest === PARTNERSHIP_INTEREST ? [PARTNERSHIP_INTEREST] : []
  );
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [emailField, setEmailField] = useState('');
  const [overview, setOverview] = useState('');
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const toggle = (s: string) =>
    setInterests((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]));

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setErrorMsg('');
    try {
      const res = await csrfFetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          company,
          email: emailField,
          serviceCategory: interests.join(', '),
          projectOverview: overview,
        }),
      });
      if (!res.ok) {
        const payload = (await res.json().catch(() => null)) as { error?: string } | null;
        setStatus('error');
        setErrorMsg(payload?.error || 'Failed to submit. Please try again.');
        return;
      }
      setStatus('success');
      void trackClientAnalyticsEvent('contact_submit', interests.join(', ') || 'Contact brief');
    } catch {
      setStatus('error');
      setErrorMsg('Failed to submit. Please try again.');
    }
  };

  return (
    <main className="v-contact">
      {/* HERO */}
      <section className="v-contact-hero">
        <div className="v-svc-grid" aria-hidden>
          {Array.from({ length: 12 }).map((_, i) => (
            <span key={i} />
          ))}
        </div>

        <nav className="v-svc-breadcrumb" aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span>/</span>
          <span>Contact</span>
        </nav>

        <div className="v-contact-hero-meta">
          <span>[ CONTACT / BRIEF ]</span>
          <span>RESPONSE WITHIN 24 BUSINESS HOURS</span>
          <span className="v-svc-status">● BOOKING NEW PROJECTS</span>
        </div>

        <h1 className="v-contact-h1">
          Build your
          <br />
          <em>competitive edge</em>
          <br />
          —&nbsp;<del>offline.</del>&nbsp;<em>online.</em>
        </h1>

        <div className="v-contact-hero-foot">
          <p>
            From lightning-fast Svelte web apps to scalable WordPress ecosystems — Vanaila Digital
            turns your vision into a product that performs.
          </p>
          <div className="v-home-actions">
            <a
              href="#brief"
              className="v-home-btn v-home-btn-primary"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Submit a project brief <span>↓</span>
            </a>
            <a
              href="#meet"
              className="v-home-btn v-home-btn-ghost"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              Or book a Google Meet
            </a>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN: FORM + SIDEBAR */}
      <section id="brief" className="v-contact-main">
        {/* FORM SIDE */}
        <div className="v-contact-form-side">
          <div className="v-contact-form-head">
            <span className="v-contact-eyebrow">[ 01 ] LEAD QUALIFIER</span>
            <h2>
              Start with a brief,
              <br />
              not a <em>vendor request.</em>
            </h2>
            <p>Tell us what you&apos;re building — we&apos;ll tell you how to make it work.</p>
          </div>

          {status === 'success' ? (
            <div className="v-contact-success">
              <span className="v-contact-success-mark">●</span>
              <h3>Brief received.</h3>
              <p>
                A founder — not a bot — will read your brief and respond within 24 business hours.
                Check <strong>{emailValue}</strong> in your inbox.
              </p>
            </div>
          ) : (
            <form className="v-contact-form" onSubmit={handleSubmit}>
              <div className="v-contact-row-2">
                <label className="v-contact-field">
                  <span className="v-contact-label">
                    Your name <em>*</em>
                  </span>
                  <input
                    type="text"
                    placeholder="Full name"
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="v-contact-field">
                  <span className="v-contact-label">Company name</span>
                  <input
                    type="text"
                    placeholder="Company / organization"
                    maxLength={160}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <label className="v-contact-field">
                <span className="v-contact-label">
                  Business email <em>*</em>
                </span>
                <input
                  type="email"
                  placeholder="you@company.com"
                  required
                  maxLength={254}
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                />
              </label>

              <div className="v-contact-field">
                <span className="v-contact-label">
                  I&apos;m interested in <em>*</em>
                </span>
                <div className="v-contact-chips">
                  {SERVICES.map((s) => (
                    <button
                      type="button"
                      key={s}
                      className={`v-contact-chip${interests.includes(s) ? ' is-on' : ''}`}
                      onClick={() => toggle(s)}
                      onMouseEnter={() => setMode('link')}
                      onMouseLeave={() => setMode('default')}
                    >
                      <span className="v-contact-chip-dot" />
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <label className="v-contact-field">
                <span className="v-contact-label">
                  Project overview <em>*</em>
                </span>
                <span className="v-contact-hint">
                  What are you trying to achieve, and what&apos;s holding you back right now?
                </span>
                <textarea
                  rows={6}
                  placeholder="A few honest paragraphs beat a 30-page RFP. Tell us the goal, the obstacle, and the timeline."
                  required
                  maxLength={5000}
                  value={overview}
                  onChange={(e) => setOverview(e.target.value)}
                />
              </label>

              {errorMsg && (
                <p style={{ color: '#BD3146', fontSize: 13, margin: 0 }}>{errorMsg}</p>
              )}

              <div className="v-contact-form-foot">
                <button
                  type="submit"
                  disabled={status === 'saving' || interests.length === 0}
                  className="v-home-btn v-home-btn-primary v-home-btn-large"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {status === 'saving' ? 'Submitting…' : 'Submit my project brief →'}
                </button>
                <span className="v-contact-form-note">Reviewed by a human. No auto-replies.</span>
              </div>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="v-contact-aside">
          {/* Priority Scheduling */}
          <div id="meet" className="v-contact-card v-contact-card-blue">
            <span className="v-contact-eyebrow v-contact-eyebrow-light">
              [ 02 ] PRIORITY SCHEDULING
            </span>
            <h3>
              Ready to talk
              <br />
              architecture
              <br />
              and <em>timelines?</em>
            </h3>
            <p>
              Skip the form. If your project is defined and you&apos;re ready to move, book a
              15-minute discovery call directly.
            </p>
            <a
              href={emailHref}
              className="v-contact-card-cta"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>Invite us to a Google Meet</span>
              <span className="v-contact-card-arrow">→</span>
            </a>
            <a
              href={emailHref}
              className="v-contact-card-mail"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {emailValue}
            </a>
          </div>

          {/* Promise */}
          <div className="v-contact-card v-contact-card-cream">
            <span className="v-contact-eyebrow">[ 03 ] OUR PROMISE</span>
            <h3>
              Every brief, read by a <em>human.</em>
            </h3>
            <p>
              We respond within 24 business hours — no auto-replies, no telephone game, no
              runaround.
            </p>
            <div className="v-contact-promise-bar">
              <span className="v-contact-promise-dot" />
              <span>Average response: under 9 hours</span>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="v-contact-card v-contact-card-ink">
            <span className="v-contact-eyebrow v-contact-eyebrow-light">
              [ 04 ] DIRECT CHANNELS
            </span>
            <h3>
              Faster than <em>a form.</em>
            </h3>
            <ul className="v-contact-channels">
              <li>
                <span className="v-contact-channel-k">Email</span>
                <a
                  href={emailHref}
                  className="v-contact-channel-v"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {emailValue}
                </a>
              </li>
              <li>
                <span className="v-contact-channel-k">WhatsApp</span>
                <a
                  href={whatsappHref}
                  className="v-contact-channel-v"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {whatsappValue}
                </a>
              </li>
              <li>
                <span className="v-contact-channel-k">Google Meet</span>
                <span className="v-contact-channel-v">15-min discovery</span>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      {/* GLOBAL REACH */}
      <section className="v-contact-global">
        <div className="v-contact-global-head">
          <span className="v-contact-eyebrow v-contact-eyebrow-light">
            [ 05 ] GLOBAL REACH, LOCAL ROOTS
          </span>
          <h2>
            Bogor-built.
            <br />
            <em>Worldwide-shipped.</em>
          </h2>
        </div>
        <div className="v-contact-global-grid">
          <div className="v-contact-global-cell">
            <span className="v-contact-global-label">Legal Entity</span>
            <h4>{companyName}</h4>
            <p>Registered in Indonesia as PT Vanaila Digital Vision. Serving SMEs and innovators worldwide.</p>
          </div>
          <div className="v-contact-global-cell">
            <span className="v-contact-global-label">Headquarters</span>
            <h4>
              <span style={{ color: 'var(--v-blue-glow, #2D5FFF)' }}>◉</span> {addressLine1}
            </h4>
            <p>West Java · GMT+7. Working remote across Southeast Asia, Europe, and the Americas.</p>
          </div>
          <div className="v-contact-global-cell v-contact-global-cta">
            <span className="v-contact-global-label">Reach Us</span>
            <a
              href={emailHref}
              className="v-contact-global-link"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {emailValue} →
            </a>
            <a
              href={whatsappHref}
              className="v-contact-global-link"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {whatsappValue} (WhatsApp) →
            </a>
          </div>
        </div>
      </section>
    </main>
  );
}
