'use client';

import { useTranslations } from 'next-intl';
import { type FormEvent, useState } from 'react';

import { useCursorMode } from '@/components/CustomCursor';
import { Link } from '@/i18n/navigation';
import { trackClientAnalyticsEvent } from '@/lib/analyticsClient';
import { csrfFetch } from '@/lib/clientCsrf';
import type { LandingPage, SiteSettings } from '@/features/cms/types';

type ContactPageViewProps = {
  page: LandingPage;
  settings?: Pick<SiteSettings, 'contact'>;
  initialInterest?: string;
  initialOverview?: string;
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

export function ContactPageView({ settings, initialInterest, initialOverview }: ContactPageViewProps) {
  const { setMode } = useCursorMode();
  const t = useTranslations('contact');
  const c = settings?.contact;

  const emailValue = c?.emailValue || 'care@vanaila.com';
  const emailHref = c?.emailHref || 'mailto:care@vanaila.com';
  const whatsappValue = c?.whatsappValue || '+62 851 744 133 23';
  const whatsappHref = c?.whatsappHref || 'https://wa.me/6285174413323';
  const companyName = c?.companyName || 'PT Vanaila Digital Vision';
  const addressLine1 = c?.addressLine1 || 'Bogor, Indonesia';

  const [interests, setInterests] = useState<string[]>(() => {
    if (initialInterest && SERVICES.includes(initialInterest as (typeof SERVICES)[number])) {
      return [initialInterest];
    }
    return [];
  });
  const [name, setName] = useState('');
  const [company, setCompany] = useState('');
  const [emailField, setEmailField] = useState('');
  const [overview, setOverview] = useState(initialOverview ?? '');
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
        setErrorMsg(payload?.error || t('submitError'));
        return;
      }
      setStatus('success');
      void trackClientAnalyticsEvent('contact_submit', interests.join(', ') || 'Contact brief');
    } catch {
      setStatus('error');
      setErrorMsg(t('submitError'));
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
          <span>{t('metaResponse')}</span>
          <span className="v-svc-status">{t('metaStatus')}</span>
        </div>

        <h1 className="v-contact-h1">
          {t('h1Line1')}
          <br />
          <em>{t('h1Accent1')}</em>
          <br />
          —&nbsp;<del>{t('h1Strike')}</del>&nbsp;<em>{t('h1Accent2')}</em>
        </h1>

        <div className="v-contact-hero-foot">
          <p>{t('heroBody')}</p>
          <div className="v-home-actions">
            <a
              href="#brief"
              className="v-home-btn v-home-btn-primary"
              data-analytics-event="cta_click"
              data-analytics-label="Contact hero brief anchor"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {t('heroBriefCta')} <span>↓</span>
            </a>
            <a
              href="#meet"
              className="v-home-btn v-home-btn-ghost"
              data-analytics-event="cta_click"
              data-analytics-label="Contact hero meet anchor"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              {t('heroMeetCta')}
            </a>
          </div>
        </div>
      </section>

      {/* TWO-COLUMN: FORM + SIDEBAR */}
      <section id="brief" className="v-contact-main">
        {/* FORM SIDE */}
        <div className="v-contact-form-side">
          <div className="v-contact-form-head">
            <span className="v-contact-eyebrow">{t('formEyebrow')}</span>
            <h2>
              {t('formHeading')}
              <br />
              <em>{t('formHeadingAccent')}</em>
            </h2>
            <p>{t('formSubtitle')}</p>
          </div>

          {status === 'success' ? (
            <div className="v-contact-success">
              <span className="v-contact-success-mark">●</span>
              <h3>{t('successTitle')}</h3>
              <p>{t('successBody', { email: emailValue })}</p>
            </div>
          ) : (
            <form className="v-contact-form" onSubmit={handleSubmit}>
              <div className="v-contact-row-2">
                <label className="v-contact-field">
                  <span className="v-contact-label">
                    {t('labelName')} <em>*</em>
                  </span>
                  <input
                    type="text"
                    placeholder={t('placeholderName')}
                    required
                    maxLength={120}
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </label>
                <label className="v-contact-field">
                  <span className="v-contact-label">{t('labelCompany')}</span>
                  <input
                    type="text"
                    placeholder={t('placeholderCompany')}
                    maxLength={160}
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </label>
              </div>

              <label className="v-contact-field">
                <span className="v-contact-label">
                  {t('labelEmail')} <em>*</em>
                </span>
                <input
                  type="email"
                  placeholder={t('placeholderEmail')}
                  required
                  maxLength={254}
                  value={emailField}
                  onChange={(e) => setEmailField(e.target.value)}
                />
              </label>

              <div className="v-contact-field">
                <span className="v-contact-label">
                  {t('labelInterest')} <em>*</em>
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
                  {t('labelOverview')} <em>*</em>
                </span>
                <span className="v-contact-hint">{t('overviewHint')}</span>
                <textarea
                  rows={6}
                  placeholder={t('overviewPlaceholder')}
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
                  {status === 'saving' ? t('submitting') : t('submit')}
                </button>
                <span className="v-contact-form-note">
                  {interests.length === 0 ? t('noteSelectService') : t('noteHuman')}
                </span>
              </div>
            </form>
          )}
        </div>

        {/* SIDEBAR */}
        <aside className="v-contact-aside">
          {/* Priority Scheduling */}
          <div id="meet" className="v-contact-card v-contact-card-blue">
            <span className="v-contact-eyebrow v-contact-eyebrow-light">
              {t('scheduleEyebrow')}
            </span>
            <h3>{t('scheduleHeading')}</h3>
            <p>{t('scheduleBody')}</p>
            <a
              href={emailHref}
              className="v-contact-card-cta"
              data-analytics-event="cta_click"
              data-analytics-label="Contact meet invite CTA"
              onMouseEnter={() => setMode('link')}
              onMouseLeave={() => setMode('default')}
            >
              <span>{t('scheduleCta')}</span>
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
            <span className="v-contact-eyebrow">{t('promiseEyebrow')}</span>
            <h3>{t('promiseHeading')}</h3>
            <p>{t('promiseBody')}</p>
            <div className="v-contact-promise-bar">
              <span className="v-contact-promise-dot" />
              <span>{t('promiseStat')}</span>
            </div>
          </div>

          {/* Direct Channels */}
          <div className="v-contact-card v-contact-card-ink">
            <span className="v-contact-eyebrow v-contact-eyebrow-light">
              {t('channelsEyebrow')}
            </span>
            <h3>{t('channelsHeading')}</h3>
            <ul className="v-contact-channels">
              <li>
                <span className="v-contact-channel-k">{t('channelEmail')}</span>
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
                <span className="v-contact-channel-k">{t('channelWhatsapp')}</span>
                <a
                  href={whatsappHref}
                  className="v-contact-channel-v"
                  data-analytics-event="cta_click"
                  data-analytics-label="Contact WhatsApp channel"
                  onMouseEnter={() => setMode('link')}
                  onMouseLeave={() => setMode('default')}
                >
                  {whatsappValue}
                </a>
              </li>
              <li>
                <span className="v-contact-channel-k">{t('channelMeet')}</span>
                <span className="v-contact-channel-v">{t('channelMeetValue')}</span>
              </li>
            </ul>
          </div>
        </aside>
      </section>

      {/* GLOBAL REACH */}
      <section className="v-contact-global">
        <div className="v-contact-global-head">
          <span className="v-contact-eyebrow v-contact-eyebrow-light">
            {t('globalEyebrow')}
          </span>
          <h2>
            {t('globalHeading')}
            <br />
            <em>{t('globalHeadingAccent')}</em>
          </h2>
        </div>
        <div className="v-contact-global-grid">
          <div className="v-contact-global-cell">
            <span className="v-contact-global-label">{t('globalEntityLabel')}</span>
            <h4>{companyName}</h4>
            <p>{t('globalEntityBody')}</p>
          </div>
          <div className="v-contact-global-cell">
            <span className="v-contact-global-label">{t('globalHqLabel')}</span>
            <h4>
              <span style={{ color: 'var(--v-blue-glow, #2D5FFF)' }}>◉</span> {addressLine1}
            </h4>
            <p>{t('globalHqBody')}</p>
          </div>
          <div className="v-contact-global-cell v-contact-global-cta">
            <span className="v-contact-global-label">{t('globalReachLabel')}</span>
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
