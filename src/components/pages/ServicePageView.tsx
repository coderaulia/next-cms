import Link from 'next/link';

import type { LandingPage } from '@/features/cms/types';

import { sectionWithFallback, splitAccent } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type ServicePageViewProps = {
  page: LandingPage;
};

export function ServicePageView({ page }: ServicePageViewProps) {
  const hero = sectionWithFallback(page, 0, {
    id: 'service-hero',
    heading: 'Our Services:|Tailored Digital Infrastructure',
    body: 'We bridge the gap between complex engineering and seamless user experience. Explore our specialized services designed to establish and scale your digital authority.',
    ctaLabel: 'Tailored Solutions',
    ctaHref: '/service',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const intro = sectionWithFallback(page, 1, {
    id: 'service-intro',
    heading: 'Our Solutions',
    body: 'Engineered solutions for modern business infrastructure. We build for performance, scale, and uncompromising quality.',
    ctaLabel: '',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const cards = [
    sectionWithFallback(page, 2, {
      id: 'service-card-1',
      heading: 'Website Development',
      body: 'Clean, fast-loading digital authority. We build premium corporate presences that balance aesthetic minimalism with architectural performance.',
      ctaLabel: 'language',
      ctaHref: '/website-development',
      mediaImage: '',
      mediaAlt: 'Svelte,WordPress,SEO',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 3, {
      id: 'service-card-2',
      heading: 'Custom Business Tools',
      body: 'Bespoke automation systems including HR portals and recruitment tools. Engineered to streamline internal workflows and reduce operational friction.',
      ctaLabel: 'integration_instructions',
      ctaHref: '/custom-business-tools',
      mediaImage: '',
      mediaAlt: 'Python,React,Automation',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 4, {
      id: 'service-card-3',
      heading: 'Secure Online Shops',
      body: 'Robust retail systems built for secure payments and performance. We prioritize high-security payment processing and custom inventory integrations.',
      ctaLabel: 'shopping_cart',
      ctaHref: '/secure-online-shops',
      mediaImage: '',
      mediaAlt: 'WooCommerce,Store,Security',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 5, {
      id: 'service-card-4',
      heading: 'Mobile Business App',
      body: 'Professional iOS and Android development using React Native to deliver native-feel experiences and reliable architecture.',
      ctaLabel: 'smartphone',
      ctaHref: '/mobile-business-app',
      mediaImage: '',
      mediaAlt: 'React Native,iOS,Android',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 6, {
      id: 'service-card-5',
      heading: 'Official Business Email',
      body: 'Complete domain and business email setup for professional image, reliable deliverability, and better infrastructure control.',
      ctaLabel: 'email',
      ctaHref: '/official-business-email',
      mediaImage: '',
      mediaAlt: 'GWS,DNS Setup,Infrastructure',
      layout: 'stacked'
    })
  ];

  const trustIntro = sectionWithFallback(page, 7, {
    id: 'service-trust-intro',
    heading: 'Why Trust Vanaila',
    body: '',
    ctaLabel: '',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const trustItems = [
    sectionWithFallback(page, 8, {
      id: 'service-trust-1',
      heading: 'Versatile Expertise',
      body: 'From simple blogs to complex data pipelines, our team masters the full stack.',
      ctaLabel: 'terminal',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 9, {
      id: 'service-trust-2',
      heading: 'Ecosystem Ready',
      body: 'We build solutions that play well with your existing stack and third-party APIs.',
      ctaLabel: 'hub',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 10, {
      id: 'service-trust-3',
      heading: '8+ Years Leadership',
      body: 'Nearly a decade of technical excellence and proven delivery for global clients.',
      ctaLabel: 'verified',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const cta = sectionWithFallback(page, 11, {
    id: 'service-cta',
    heading: 'Ready to scale your|digital infrastructure?',
    body: 'Let\'s discuss how our engineering approach can solve your specific business challenges. No commitment, just technical clarity.',
    ctaLabel: 'Claim Free Consultation',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(
    hero.heading,
    'Tailored Digital Infrastructure'
  );
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(
    cta.heading,
    'digital infrastructure?'
  );

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-20 overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-blue-50/50 border border-blue-100/50 mb-8 backdrop-blur-sm mx-auto">
            <span className="w-1.5 h-1.5 rounded-full bg-electricBlue" />
            <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">
              {hero.ctaLabel || 'Tailored Solutions'}
            </span>
          </div>
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

      <Reveal as="section" className="py-20 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-display font-black text-deepSlate mb-6">
              {intro.heading}
            </h2>
            <p className="max-w-3xl mx-auto text-lg text-slate-500 font-light leading-relaxed">{intro.body}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {cards.map((card, index) => {
              const tags = (card.mediaAlt || '')
                .split(',')
                .map((row) => row.trim())
                .filter((row) => row.length > 0)
                .slice(0, 3);

              return (
                <Link
                  key={card.id}
                  href={card.ctaHref || '/service'}
                  className="glass-panel p-10 rounded-[2.5rem] bg-white hover:shadow-2xl hover:shadow-blue-500/5 transition-all duration-500 group relative block"
                >
                  <div className="absolute top-8 right-10 text-[10px] font-black text-slate-100 group-hover:text-slate-200 transition-colors">
                    #{index + 1}
                  </div>
                  <div className="w-12 h-12 bg-blue-50 rounded-xl flex items-center justify-center text-electricBlue mb-8 group-hover:bg-electricBlue group-hover:text-white transition-colors shadow-sm">
                    <span className="material-symbols-outlined">{card.ctaLabel || 'language'}</span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-deepSlate mb-4">{card.heading}</h3>
                  <p className="text-slate-500 font-light text-sm leading-relaxed mb-8 min-h-[80px]">
                    {card.body}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {tags.length > 0
                      ? tags.map((tag) => (
                          <span
                            key={`${card.id}-${tag}`}
                            className="px-3 py-1 bg-slate-50 border border-slate-100 rounded-full text-[8px] font-bold uppercase tracking-widest text-slate-400"
                          >
                            {tag}
                          </span>
                        ))
                      : null}
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <h2 className="text-4xl font-display font-black text-deepSlate mb-20">{trustIntro.heading}</h2>
          <div className="grid md:grid-cols-3 gap-12">
            {trustItems.map((item) => (
              <div className="space-y-6" key={item.id}>
                <div className="w-14 h-14 bg-white border border-slate-100 rounded-2xl flex items-center justify-center text-electricBlue mx-auto shadow-sm">
                  <span className="material-symbols-outlined text-3xl">{item.ctaLabel || 'verified'}</span>
                </div>
                <h4 className="text-xl font-bold font-display text-deepSlate">{item.heading}</h4>
                <p className="text-slate-500 text-sm leading-relaxed font-light">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="relative py-40 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white/50 w-full shadow-2xl shadow-slate-200">
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <h2 className="cta-heading-safe font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                {ctaPrimary}
                <br />
                <span className="text-brand-gradient italic font-light inline-block px-1 sm:px-2">{ctaAccent}</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
                {cta.body}
              </p>
              <div className="flex flex-col sm:flex-row justify-center items-center gap-6">
                <Link
                  href={cta.ctaHref || '/contact'}
                  className="group relative px-12 py-6 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 inline-block"
                >
                  <span className="relative z-10 group-hover:text-white transition-colors">
                    {cta.ctaLabel || 'Claim Free Consultation'}
                  </span>
                  <div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}








