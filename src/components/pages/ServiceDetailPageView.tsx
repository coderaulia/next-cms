import Link from 'next/link';

import { Reveal } from '@/components/animations/Reveal';
import { SymbolIcon } from '@/components/ui/symbol-icon';
import { isServiceDetailPageId } from '@/config/site-profile';
import type { LandingPage, PageSection, PortfolioProject } from '@/features/cms/types';

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

type ServiceDetailPageViewProps = {
  page: LandingPage;
  portfolioProjects?: PortfolioProject[];
};

export function ServiceDetailPageView({ page, portfolioProjects = [] }: ServiceDetailPageViewProps) {
  if (!isServiceDetailPageId(page.id)) {
    return null;
  }

  const servicePageId = page.id;
  const serviceHref = page.seo.slug ? `/${page.seo.slug}` : '/service';

  const hero = resolveSection(
    page,
    'hero',
    fallbackSection({
      id: 'hero',
      heading: `${page.title}|Delivered with technical clarity`,
      body: page.seo.metaDescription || 'A CMS-managed service page ready for package, process, and CTA editing.',
      ctaLabel: 'Service overview',
      ctaHref: serviceHref,
      layout: 'stacked'
    }),
    0
  );

  const plans = resolveCollection(page, 'plan-', 1, 4).map((section, index) =>
    mergeSection(
      fallbackSection({
        id: `plan-${index + 1}`,
        heading: section.heading || `Package ${index + 1}`,
        body: section.body,
        ctaLabel: section.ctaLabel,
        ctaHref: section.ctaHref || '/contact',
        mediaImage: section.mediaImage || 'Starting From',
        mediaAlt: section.mediaAlt,
        layout: section.layout,
        theme: section.theme
      }),
      section
    )
  );

  const whyIntro = resolveSection(
    page,
    'why-intro',
    fallbackSection({
      id: 'why-intro',
      heading: 'Why choose this service?',
      body: 'Differentiation',
      ctaLabel: 'Differentiation',
      layout: 'stacked'
    }),
    4
  );

  const whyItems = resolveCollection(page, 'why-', 5, 9)
    .filter((section) => section.id !== 'why-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `why-${index + 1}`,
          heading: section.heading || `Reason ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || 'verified',
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const lifecycleIntro = resolveSection(
    page,
    'lifecycle-intro',
    fallbackSection({
      id: 'lifecycle-intro',
      heading: 'Delivery lifecycle',
      body: 'Methodology',
      ctaLabel: 'Methodology',
      layout: 'stacked'
    }),
    9
  );

  const lifecycleItems = resolveCollection(page, 'lifecycle-', 10, 15)
    .filter((section) => section.id !== 'lifecycle-intro')
    .map((section, index) =>
      mergeSection(
        fallbackSection({
          id: section.id || `lifecycle-${index + 1}`,
          heading: section.heading || `Step ${index + 1}`,
          body: section.body,
          ctaLabel: section.ctaLabel || 'code',
          layout: 'stacked',
          theme: section.theme
        }),
        section
      )
    );

  const cta = resolveSection(
    page,
    'cta',
    fallbackSection({
      id: 'cta',
      heading: `Ready to move forward with|${page.title}?`,
      body: page.seo.metaDescription || 'Talk through the brief and next implementation steps.',
      ctaLabel: 'Book a Strategy Call',
      ctaHref: '/contact',
      mediaAlt: 'Get a Free Technical Audit',
      mediaImage: '/contact',
      layout: 'stacked'
    }),
    15
  );

  const relatedProjects = portfolioProjects
    .filter((project) => {
      const relatedIds = Array.isArray(project.relatedServicePageIds) ? project.relatedServicePageIds : [];
      if (relatedIds.includes(servicePageId)) {
        return true;
      }

      return project.projectUrl === serviceHref;
    })
    .sort((a, b) => {
      if (a.featured !== b.featured) return a.featured ? -1 : 1;
      if (a.sortOrder !== b.sortOrder) return a.sortOrder - b.sortOrder;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    })
    .slice(0, 3);

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, page.title);
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, page.title);

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          {hero.ctaLabel ? (
            <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-8 backdrop-blur-sm mx-auto">
              <span className="w-1.5 h-1.5 rounded-full bg-electricBlue animate-pulse" />
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">{hero.ctaLabel}</span>
            </div>
          ) : null}
          <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter mb-8">
            {heroPrimary}
            <br />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light inline-block px-1 sm:px-2">
              {heroAccent}
            </span>
          </h1>
          <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">{hero.body}</p>
        </div>
      </Reveal>

      {plans.length > 0 ? (
        <Reveal as="section" className="py-20 relative">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="grid md:grid-cols-3 gap-8 items-stretch">
              {plans.map((plan) => {
                const features = plan.body
                  .split(/\n+/)
                  .map((row) => row.trim())
                  .filter((row) => row.length > 0);
                const featured = plan.layout === 'split';
                const buttonLabel =
                  plan.theme.accent && !plan.theme.accent.startsWith('#') ? plan.theme.accent : 'Select Package';

                return (
                  <div
                    className={`glass-panel p-10 rounded-[3rem] bg-white border border-slate-100 flex flex-col h-full relative ${featured ? 'ring-2 ring-electricBlue shadow-2xl scale-105 z-20' : 'z-10'}`}
                    key={plan.id}
                  >
                    {featured ? (
                      <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-electricBlue text-white text-[10px] font-black uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                        Top Choice!
                      </div>
                    ) : null}
                    <div className="mb-8">
                      <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-2 block">
                        {plan.ctaLabel}
                      </span>
                      <h3 className="text-3xl font-display font-black text-deepSlate">{plan.heading}</h3>
                    </div>
                    <div className="mb-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1">
                        {plan.mediaImage || 'Starting From'}
                      </span>
                      <div className="text-4xl font-display font-black text-deepSlate">{plan.mediaAlt || '-'}</div>
                    </div>

                    <ul className="space-y-4 mb-12 flex-grow">
                      {features.map((feature) => (
                        <li className="flex items-center gap-3 text-sm text-slate-500 font-light" key={`${plan.id}-${feature}`}>
                          <SymbolIcon className="text-electricBlue text-lg" name="check_circle" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={plan.ctaHref || '/contact'}
                      className={`w-full py-5 rounded-full font-display font-bold text-xs uppercase tracking-[0.2em] text-center transition-all ${featured ? 'bg-deepSlate text-white hover:bg-black shadow-xl' : 'bg-slate-50 text-deepSlate border border-slate-100 hover:bg-white hover:border-electricBlue'}`}
                    >
                      {buttonLabel}
                    </Link>
                  </div>
                );
              })}
            </div>
          </div>
        </Reveal>
      ) : null}

      {whyItems.length > 0 ? (
        <Reveal as="section" className="py-24 relative overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-16">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">
                {whyIntro.ctaLabel || 'Differentiation'}
              </span>
              <h2 className="text-4xl font-display font-black text-deepSlate">{whyIntro.heading}</h2>
              <div className="w-20 h-1 bg-electricBlue mx-auto mt-6 rounded-full" />
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {whyItems.map((item) => (
                <div className="glass-panel p-8 rounded-[2rem] bg-white border border-slate-50 hover:shadow-xl transition-all group" key={item.id}>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-electricBlue mb-6 group-hover:bg-electricBlue group-hover:text-white transition-all">
                    <SymbolIcon name={item.ctaLabel || 'verified'} />
                  </div>
                  <h4 className="text-lg font-bold text-deepSlate mb-3">{item.heading}</h4>
                  <p className="text-xs text-slate-500 font-light leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {lifecycleItems.length > 0 ? (
        <Reveal as="section" className="py-24 relative overflow-hidden bg-slate-50/30">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
            <div className="text-center mb-20">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">
                {lifecycleIntro.ctaLabel || 'Methodology'}
              </span>
              <h2 className="text-4xl font-display font-black text-deepSlate italic">{lifecycleIntro.heading}</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-8 items-start relative">
              {lifecycleItems.map((item, index) => (
                <div className="text-center group" key={item.id}>
                  <div className="relative inline-block mb-6">
                    <div className="w-16 h-16 rounded-full bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-electricBlue group-hover:border-electricBlue transition-all shadow-sm">
                      <SymbolIcon className="text-2xl" name={item.ctaLabel || 'code'} />
                    </div>
                    <div className="absolute -top-1 -right-1 w-6 h-6 bg-deepSlate text-white text-[10px] font-black rounded-full flex items-center justify-center">
                      {index + 1}
                    </div>
                  </div>
                  <h4 className="text-sm font-bold text-deepSlate mb-2 tracking-tight">{item.heading}</h4>
                  <p className="text-[10px] text-slate-400 font-medium leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      {relatedProjects.length > 0 ? (
        <Reveal as="section" className="py-24 bg-white border-y border-slate-100">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center mb-14">
              <span className="text-[10px] font-bold uppercase tracking-[0.3em] text-slate-400 mb-4 block">Delivered work</span>
              <h2 className="text-4xl font-display font-black text-deepSlate">Related projects for this service</h2>
              <p className="max-w-2xl mx-auto text-slate-500 font-light leading-relaxed mt-4">
                Recent case studies connected to the service you are viewing.
              </p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
              {relatedProjects.map((project) => (
                <Link
                  key={project.id}
                  href={`/portfolio/${project.seo.slug}`}
                  className="glass-panel p-4 rounded-[2rem] bg-white hover:shadow-xl transition-all"
                >
                  <div className="aspect-video rounded-[1.5rem] bg-slate-100 overflow-hidden mb-4">
                    {project.coverImage ? (
                      <img src={project.coverImage} alt={project.title} className="w-full h-full object-cover" />
                    ) : null}
                  </div>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-electricBlue mb-2">
                    {project.clientName || project.serviceType || 'Project'}
                  </p>
                  <h3 className="text-lg font-display font-black text-deepSlate leading-tight mb-2">{project.title}</h3>
                  <p className="text-slate-500 text-sm font-light leading-relaxed">{project.summary}</p>
                </Link>
              ))}
            </div>
          </div>
        </Reveal>
      ) : null}

      <Reveal as="section" className="relative py-40 overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white w-full shadow-2xl shadow-blue-900/5 border border-white">
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <h2 className="cta-heading-safe font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                {ctaPrimary}
                <br />
                <span className="text-brand-gradient italic font-light inline-block px-1 sm:px-2">{ctaAccent}</span>
              </h2>
              <p className="text-slate-500 text-lg font-light mb-12 max-w-xl mx-auto">{cta.body}</p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link href={cta.ctaHref || '/contact'} className="px-12 py-5 bg-deepSlate text-white font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black transition-all shadow-lg shadow-black/10">
                  {cta.ctaLabel || 'Book a Strategy Call'}
                </Link>
                <Link href={cta.mediaImage || '/contact'} className="px-12 py-5 bg-white border-2 border-slate-100 text-deepSlate font-bold text-xs uppercase tracking-[0.2em] hover:border-electricBlue hover:text-electricBlue transition-all rounded-full">
                  {cta.mediaAlt || 'Get a Free Technical Audit'}
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}
