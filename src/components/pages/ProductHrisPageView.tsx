import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import type { LandingPage, PageSection } from '@/features/cms/types';

import { splitAccent } from './sectionContent';

function fallbackSection(partial: Partial<PageSection> & Pick<PageSection, 'id'>): PageSection {
  return {
    id: partial.id,
    heading: partial.heading ?? '',
    body: partial.body ?? '',
    ctaLabel: partial.ctaLabel ?? '',
    ctaHref: partial.ctaHref ?? '',
    mediaImage: partial.mediaImage ?? '',
    mediaAlt: partial.mediaAlt ?? '',
    layout: partial.layout ?? 'stacked',
    theme: {
      background: partial.theme?.background ?? '#f9fafb',
      text: partial.theme?.text ?? '#111827',
      accent: partial.theme?.accent ?? '#0f766e'
    }
  };
}

function mergeSection(base: PageSection, incoming: Partial<PageSection> | null | undefined): PageSection {
  if (!incoming) return base;
  return {
    ...base,
    ...incoming,
    theme: {
      ...base.theme,
      ...incoming.theme
    }
  };
}

function resolveSection(
  page: LandingPage,
  id: string,
  fallback: PageSection,
  fallbackIndex?: number
): PageSection {
  const directMatch = page.sections.find((section) => section.id === id);
  if (directMatch) {
    return mergeSection(fallback, directMatch);
  }

  const indexMatch = typeof fallbackIndex === 'number' ? page.sections[fallbackIndex] : null;
  if (indexMatch) {
    return mergeSection(fallback, indexMatch);
  }

  return fallback;
}

function resolveCollection(
  page: LandingPage,
  prefix: string,
  fallbackRangeStart: number,
  fallbackRangeEnd: number
) {
  const prefixed = page.sections.filter((section) => section.id.startsWith(prefix));
  if (prefixed.length > 0) {
    return prefixed;
  }

  return page.sections.slice(fallbackRangeStart, fallbackRangeEnd);
}

type ProductHrisPageViewProps = {
  page: LandingPage;
};

export function ProductHrisPageView({ page }: ProductHrisPageViewProps) {
  const hero = resolveSection(
    page,
    'hero',
    fallbackSection({
      id: 'hero',
      heading: 'Stop Managing Performance.|Start Developing People.',
      body:
        'One platform to run your entire performance lifecycle, from probation to appraisals, KPIs to improvement plans, built for Indonesian organisations that are serious about growing their people.',
      ctaLabel: 'Performance management, built in',
      ctaHref: '/contact',
      mediaImage: '/contact',
      mediaAlt: 'Jadwalkan Demo',
      layout: 'stacked'
    }),
    0
  );

  const painIntro = resolveSection(
    page,
    'pain-intro',
    fallbackSection({
      id: 'pain-intro',
      heading: 'Sound familiar?',
      body: "There's a better way to run performance management, and it does not require a 6-month implementation.",
      ctaLabel: 'Operational friction',
      layout: 'stacked'
    }),
    1
  );

  const painPoints = resolveCollection(page, 'pain-', 2, 7)
    .filter((section) => section.id !== 'pain-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `pain-${index + 1}`,
          heading: section.heading || `Pain point ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || 'check_circle',
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const productIntro = resolveSection(
    page,
    'product-intro',
    fallbackSection({
      id: 'product-intro',
      heading: 'Meet Vanaila HRIS,|performance built in, not bolted on',
      body:
        'Vanaila is a browser-based HR suite designed for the full employee performance lifecycle. No desktop installs. No complex setup.',
      ctaLabel: 'Browser-based HR suite',
      layout: 'split'
    }),
    7
  );

  const featureIntro = resolveSection(
    page,
    'feature-intro',
    fallbackSection({
      id: 'feature-intro',
      heading: 'Everything your HR team needs to run a fair, consistent, and documented appraisal process',
      body: 'One system to define standards, run reviews, generate documents, and report with confidence.',
      ctaLabel: 'Core product modules',
      layout: 'stacked'
    }),
    8
  );

  const features = resolveCollection(page, 'feature-', 9, 15)
    .filter((section) => section.id !== 'feature-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `feature-${index + 1}`,
          heading: section.heading || `Feature ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || 'check_circle',
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const trust = resolveSection(
    page,
    'trust',
    fallbackSection({
      id: 'trust',
      heading: 'Built for how Indonesian HR teams actually work',
      body:
        'Vanaila was designed with Indonesian HR workflows in mind, including local document templates, probation practices, and audit-ready reporting.',
      ctaLabel: 'Local-first workflows',
      layout: 'split'
    }),
    15
  );

  const howIntro = resolveSection(
    page,
    'how-intro',
    fallbackSection({
      id: 'how-intro',
      heading: 'Up and running without an IT project',
      body: 'Launch in clear operational steps instead of a heavyweight implementation cycle.',
      ctaLabel: 'Fast rollout',
      layout: 'stacked'
    }),
    16
  );

  const howSteps = resolveCollection(page, 'how-', 17, 20)
    .filter((section) => section.id !== 'how-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `how-${index + 1}`,
          heading: section.heading || `Step ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || 'check_circle',
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const pricing = resolveSection(
    page,
    'pricing',
    fallbackSection({
      id: 'pricing',
      heading: 'Performance management should not cost a fortune|to implement',
      body:
        'Vanaila is priced for growing Indonesian companies, not enterprise multinationals. No per-module licensing. No surprise implementation fees.',
      ctaLabel: 'Lihat Paket Harga',
      ctaHref: '/contact',
      mediaImage: '/contact',
      mediaAlt: 'Hubungi Kami untuk Demo',
      layout: 'split'
    }),
    20
  );

  const cta = resolveSection(
    page,
    'cta',
    fallbackSection({
      id: 'cta',
      heading: 'Your next appraisal cycle|does not have to be a fire drill',
      body:
        'Give your HR team the structure, the tools, and the records they need to run performance management with confidence.',
      ctaLabel: 'Mulai Sekarang - Gratis',
      ctaHref: '/contact',
      layout: 'stacked'
    }),
    21
  );

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, page.title);
  const { primary: introPrimary, accent: introAccent } = splitAccent(productIntro.heading, page.title);
  const { primary: pricingPrimary, accent: pricingAccent } = splitAccent(pricing.heading, page.title);
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, page.title);

  return (
    <main>
      <Reveal as="section" className="relative overflow-hidden px-0 pt-0">
        <div className="w-full border-b border-slate-100 bg-[radial-gradient(circle_at_top_left,_rgba(14,165,233,0.18),_transparent_35%),linear-gradient(180deg,_#f8fbff_0%,_#ffffff_58%,_#eef5ff_100%)]">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 pt-28 pb-20 md:pt-32 md:pb-24">
            <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-center">
              <div className="max-w-4xl">
              <span className="inline-flex items-center gap-3 rounded-full border border-sky-100 bg-white/80 px-5 py-2 text-[10px] font-bold uppercase tracking-[0.3em] text-slate-600 shadow-sm">
                <span className="h-2 w-2 rounded-full bg-electricBlue" />
                {hero.ctaLabel || 'Performance management, built in'}
              </span>
              <h1 className="hero-heading-safe mt-8 max-w-5xl font-display text-deepSlate">
                <span className="block text-[clamp(3rem,8vw,6.6rem)] font-black leading-[0.92] tracking-[-0.06em]">
                  {heroPrimary}
                </span>
                <span className="mt-3 inline-block bg-gradient-to-r from-electricBlue via-sky-500 to-indigo-600 bg-clip-text px-1 text-[clamp(2.8rem,7vw,6rem)] font-light italic leading-[0.95] tracking-[-0.05em] text-transparent">
                  {heroAccent}
                </span>
              </h1>
              <p className="mt-8 max-w-3xl text-lg font-light leading-relaxed text-slate-600 md:text-xl">
                {hero.body}
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
                <Link
                  href={hero.ctaHref || '/contact'}
                  className="inline-flex items-center justify-center rounded-full bg-deepSlate px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-black hover:shadow-xl hover:shadow-slate-900/10"
                >
                  Mulai Gratis
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-deepSlate transition-all hover:border-electricBlue hover:text-electricBlue"
                >
                  Jadwalkan Demo
                </Link>
              </div>
            </div>
              {hero.mediaImage ? (
                <div className="relative">
                  <div className="absolute -inset-6 rounded-[2.5rem] bg-gradient-to-br from-sky-200/40 via-transparent to-indigo-200/30 blur-3xl" />
                  <div className="relative overflow-hidden rounded-[2.5rem] border border-white/70 bg-white p-3 shadow-[0_32px_90px_-48px_rgba(15,23,42,0.45)]">
                    <img
                      src={hero.mediaImage}
                      alt={hero.mediaAlt || page.title}
                      className="h-full w-full rounded-[2rem] object-cover"
                    />
                  </div>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-20">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {painIntro.ctaLabel || 'Operational friction'}
            </span>
            <h2 className="mt-4 text-4xl font-display font-black tracking-tight text-deepSlate md:text-5xl">
              {painIntro.heading}
            </h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-500">{painIntro.body}</p>
          </div>
          <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-5">
            {painPoints.map((item) => (
              <div key={item.id} className="rounded-[2rem] border border-slate-100 bg-white px-6 py-7 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-electricBlue">
                  <SymbolIcon className="text-xl" name={item.ctaLabel || 'check_circle'} />
                </div>
                <h3 className="mt-5 text-base font-bold leading-snug text-deepSlate">{item.heading}</h3>
                <p className="mt-3 text-sm font-light leading-relaxed text-slate-500">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-end">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
                {productIntro.ctaLabel || 'Browser-based HR suite'}
              </span>
              <h2 className="mt-4 text-4xl font-display font-black leading-[0.95] tracking-tight text-deepSlate md:text-6xl">
                {introPrimary}
                <span className="mt-2 block bg-gradient-to-r from-electricBlue to-indigo-500 bg-clip-text font-light italic text-transparent">
                  {introAccent}
                </span>
              </h2>
            </div>
            <div className="space-y-6">
              <p className="max-w-2xl text-lg font-light leading-relaxed text-slate-500">{productIntro.body}</p>
              {productIntro.mediaImage ? (
                <div className="overflow-hidden rounded-[2rem] border border-slate-100 bg-white p-3 shadow-sm">
                  <img
                    src={productIntro.mediaImage}
                    alt={productIntro.mediaAlt || productIntro.heading}
                    className="h-full w-full rounded-[1.5rem] object-cover"
                  />
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="border-y border-slate-100 bg-slate-50/60 py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {featureIntro.ctaLabel || 'Core product modules'}
            </span>
            <h2 className="mt-4 text-4xl font-display font-black leading-tight text-deepSlate md:text-5xl">
              {featureIntro.heading}
            </h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-500">{featureIntro.body}</p>
          </div>
          <div className="mt-14 grid gap-x-10 gap-y-12 md:grid-cols-2 xl:grid-cols-3">
            {features.map((feature) => (
              <div key={feature.id} className="border-b border-slate-200 pb-8">
                {feature.mediaImage ? (
                  <div className="mb-5 overflow-hidden rounded-[1.6rem] border border-slate-100 bg-white p-2 shadow-sm">
                    <img
                      src={feature.mediaImage}
                      alt={feature.mediaAlt || feature.heading}
                      className="aspect-[4/3] w-full rounded-[1.2rem] object-cover"
                    />
                  </div>
                ) : null}
                <div className="flex items-center gap-3">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white text-electricBlue shadow-sm ring-1 ring-slate-100">
                    <SymbolIcon className="text-xl" name={feature.ctaLabel || 'check_circle'} />
                  </div>
                  <h3 className="text-xl font-display font-bold leading-tight text-deepSlate">{feature.heading}</h3>
                </div>
                <p className="mt-5 text-sm font-light leading-relaxed text-slate-500">{feature.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-[3rem] bg-deepSlate px-8 py-12 text-white md:px-12 md:py-16">
            <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-end">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-sky-200">
                  {trust.ctaLabel || 'Local-first workflows'}
                </span>
                <h2 className="mt-4 max-w-xl text-4xl font-display font-black leading-tight md:text-5xl">
                  {trust.heading}
                </h2>
              </div>
              <p className="max-w-2xl text-base font-light leading-relaxed text-slate-200 md:text-lg">
                {trust.body}
              </p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-3xl">
            <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400">
              {howIntro.ctaLabel || 'Fast rollout'}
            </span>
            <h2 className="mt-4 text-4xl font-display font-black text-deepSlate md:text-5xl">
              {howIntro.heading}
            </h2>
            <p className="mt-4 text-lg font-light leading-relaxed text-slate-500">{howIntro.body}</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {howSteps.map((step, index) => (
              <div key={step.id} className="rounded-[2.4rem] border border-slate-100 bg-white p-8 shadow-sm">
                <div className="flex items-center justify-between">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-50 text-electricBlue">
                    <SymbolIcon className="text-xl" name={step.ctaLabel || 'check_circle'} />
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-300">
                    0{index + 1}
                  </span>
                </div>
                <h3 className="mt-8 text-2xl font-display font-bold leading-tight text-deepSlate">{step.heading}</h3>
                <p className="mt-4 text-sm font-light leading-relaxed text-slate-500">{step.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="rounded-[3rem] border border-slate-100 bg-[linear-gradient(135deg,_rgba(14,165,233,0.10),_rgba(255,255,255,1)_42%,_rgba(15,23,42,0.02)_100%)] px-8 py-12 md:px-12 md:py-16">
            <div className="grid gap-8 lg:grid-cols-[1fr_0.9fr] lg:items-end">
              <div>
                <h2 className="text-4xl font-display font-black leading-[0.95] text-deepSlate md:text-5xl">
                  {pricingPrimary}
                  <span className="mt-2 block bg-gradient-to-r from-electricBlue to-indigo-500 bg-clip-text font-light italic text-transparent">
                    {pricingAccent}
                  </span>
                </h2>
                <p className="mt-5 max-w-2xl text-lg font-light leading-relaxed text-slate-500">{pricing.body}</p>
              </div>
              <div className="flex flex-col gap-4 lg:items-start">
                <Link
                  href={pricing.ctaHref || '/contact'}
                  className="inline-flex items-center justify-center rounded-full bg-deepSlate px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-black hover:shadow-xl hover:shadow-slate-900/10"
                >
                  {pricing.ctaLabel || 'Lihat Paket Harga'}
                </Link>
                <Link
                  href={pricing.mediaImage || '/contact'}
                  className="inline-flex items-center justify-center rounded-full border border-slate-200 bg-white px-8 py-4 text-xs font-bold uppercase tracking-[0.24em] text-deepSlate transition-all hover:border-electricBlue hover:text-electricBlue"
                >
                  {pricing.mediaAlt || 'Hubungi Kami untuk Demo'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24">
        <div className="max-w-5xl mx-auto px-6 lg:px-12">
          <div className="rounded-[3rem] bg-white px-8 py-14 text-center shadow-[0_40px_100px_-48px_rgba(15,23,42,0.4)] ring-1 ring-slate-100 md:px-12 md:py-20">
            <h2 className="cta-heading-safe font-display text-deepSlate">
              <span className="block text-4xl font-black leading-[0.95] tracking-[-0.04em] md:text-6xl">
                {ctaPrimary}
              </span>
              <span className="mt-3 inline-block bg-gradient-to-r from-electricBlue to-indigo-500 bg-clip-text px-1 text-4xl font-light italic leading-[0.98] tracking-[-0.04em] text-transparent md:text-5xl">
                {ctaAccent}
              </span>
            </h2>
            <p className="mx-auto mt-6 max-w-2xl text-lg font-light leading-relaxed text-slate-500">{cta.body}</p>
            <div className="mt-10">
              <Link
                href={cta.ctaHref || '/contact'}
                className="inline-flex items-center justify-center rounded-full bg-deepSlate px-10 py-4 text-xs font-bold uppercase tracking-[0.24em] text-white transition-all hover:bg-black hover:shadow-xl hover:shadow-slate-900/10"
              >
                {cta.ctaLabel || 'Mulai Sekarang - Gratis'}
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
