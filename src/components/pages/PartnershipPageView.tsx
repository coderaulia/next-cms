import Link from 'next/link';

import type { LandingPage } from '@/features/cms/types';

import { sectionWithFallback, splitAccent } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type PartnershipPageViewProps = {
  page: LandingPage;
};

const PROGRAM_COLORS = ['text-electricBlue bg-electricBlue/10', 'text-royalPurple bg-royalPurple/10', 'text-vibrantCyan bg-vibrantCyan/10'] as const;

export function PartnershipPageView({ page }: PartnershipPageViewProps) {
  const hero = sectionWithFallback(page, 0, {
    id: 'hero',
    heading: 'Build the Future|Scale with Vanaila.',
    body: 'Join our network of elite technical agencies and referral partners. Let us deliver extraordinary digital infrastructure together.',
    ctaLabel: 'Ecosystem Partnership',
    ctaHref: '/partnership',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const programIntro = sectionWithFallback(page, 1, {
    id: 'program-intro',
    heading: 'Partnership Tracks',
    body: 'Choose the model that fits your team and growth strategy.',
    ctaLabel: 'Program',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const programCards = [
    sectionWithFallback(page, 2, {
      id: 'program-1',
      heading: 'Referral Alpha',
      body: 'Earn commissions by connecting clients with our engineering services.',
      ctaLabel: 'handshake',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 3, {
      id: 'program-2',
      heading: 'Technical Alliance',
      body: 'Embed our lead architects into your project workflow with white-label support.',
      ctaLabel: 'hub',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'split'
    }),
    sectionWithFallback(page, 4, {
      id: 'program-3',
      heading: 'Service Expansion',
      body: 'Offer cloud infra and mobile app delivery under your own brand.',
      ctaLabel: 'rocket_launch',
      ctaHref: '/contact',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const standardsIntro = sectionWithFallback(page, 5, {
    id: 'standards-intro',
    heading: 'Our Selection Standard',
    body: 'We partner with teams that share our standards for engineering quality.',
    ctaLabel: 'Standards',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const standards = [
    sectionWithFallback(page, 6, {
      id: 'standard-1',
      heading: 'Excellence',
      body: 'Proven high-performance delivery track record.',
      ctaLabel: '01',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 7, {
      id: 'standard-2',
      heading: 'Integrity',
      body: 'Transparent communication and milestone discipline.',
      ctaLabel: '02',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 8, {
      id: 'standard-3',
      heading: 'Innovation',
      body: 'Commitment to modern stacks and cloud-native delivery.',
      ctaLabel: '03',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 9, {
      id: 'standard-4',
      heading: 'Growth',
      body: 'Long-term vision for mutual ecosystem expansion.',
      ctaLabel: '04',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const perksIntro = sectionWithFallback(page, 10, {
    id: 'perks-intro',
    heading: 'Ecosystem Perks',
    body: 'Beyond collaboration, we provide resources for partners to thrive.',
    ctaLabel: 'Perks',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const perks = [
    sectionWithFallback(page, 11, {
      id: 'perk-1',
      heading: 'Architecture Audits',
      body: 'Free consultation for complex cloud infrastructure designs.',
      ctaLabel: 'architecture',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 12, {
      id: 'perk-2',
      heading: 'Priority Support',
      body: 'Direct line to senior architects for emergency escalations.',
      ctaLabel: 'monitoring',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    }),
    sectionWithFallback(page, 13, {
      id: 'perk-3',
      heading: 'Co-Marketing',
      body: 'Join webinars and white papers to boost visibility.',
      ctaLabel: 'local_atm',
      ctaHref: '',
      mediaImage: '',
      mediaAlt: '',
      layout: 'stacked'
    })
  ];

  const cta = sectionWithFallback(page, 14, {
    id: 'cta',
    heading: 'Ready to Build Partner Value?|Join our ecosystem network.',
    body: 'Tell us your capabilities and we will map the best collaboration model for your team.',
    ctaLabel: 'Start Partnership Discussion',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(hero.heading, 'Scale with Vanaila.');
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(cta.heading, 'Join our ecosystem network.');

  return (
    <main>
      <Reveal as="section" className="relative pt-32 pb-20 overflow-hidden bg-vanailaNavy text-white">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#3B82F6,transparent)]" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-electricBlue text-[10px] font-bold uppercase tracking-widest mb-8 hero-badge">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electricBlue opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-electricBlue" />
            </span>
            {hero.ctaLabel}
          </div>
          <h1 className="hero-heading-safe font-display font-black leading-[1.1] mb-8 tracking-tighter">
            {heroPrimary}
            <br />
            <span className="bg-gradient-to-r from-electricBlue via-vibrantCyan to-electricBlue bg-clip-text text-transparent">
              {heroAccent}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-300 font-light max-w-2xl mx-auto leading-relaxed">
            {hero.body}
          </p>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-4xl md:text-5xl font-display font-black text-deepSlate mb-4">{programIntro.heading}</h2>
            <p className="text-slate-500 font-light leading-relaxed">{programIntro.body}</p>
          </div>
          <div className="grid lg:grid-cols-3 gap-12">
            {programCards.map((card, index) => (
              <Link
                key={card.id}
                href={card.ctaHref || '/contact'}
                className={`p-10 rounded-[2.5rem] border border-slate-100 hover:shadow-xl transition-all group block ${card.layout === 'split' ? 'lg:scale-105 bg-white z-10 shadow-2xl shadow-blue-900/5' : 'bg-slate-50'}`}
              >
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform ${PROGRAM_COLORS[index % PROGRAM_COLORS.length]}`}>
                  <span className="material-symbols-outlined text-3xl">{card.ctaLabel || 'hub'}</span>
                </div>
                <h3 className="text-2xl font-display font-black text-deepSlate mb-4">{card.heading}</h3>
                <p className="text-slate-500 font-light leading-relaxed">{card.body}</p>
              </Link>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24 relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="glass-panel p-12 md:p-20 rounded-[4rem] border border-white/60 shadow-2xl shadow-blue-500/5 bg-white/40 backdrop-blur-3xl">
            <div className="max-w-3xl mb-16">
              <h2 className="text-4xl md:text-5xl font-display font-black text-deepSlate leading-tight mb-6">
                {standardsIntro.heading}
              </h2>
              <p className="text-lg text-slate-500 font-light leading-relaxed">{standardsIntro.body}</p>
            </div>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-12">
              {standards.map((item) => (
                <div className="space-y-4" key={item.id}>
                  <div className="text-4xl font-display font-black text-slate-100">{item.ctaLabel}</div>
                  <h4 className="font-bold text-deepSlate uppercase tracking-widest text-xs">{item.heading}</h4>
                  <p className="text-sm text-slate-500 font-light leading-relaxed">{item.body}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-32 bg-vanailaNavy text-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl md:text-5xl font-display font-black tracking-tight italic">{perksIntro.heading}</h2>
            <p className="text-slate-400 font-light text-lg">{perksIntro.body}</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {perks.map((item) => (
              <div className="p-8 border border-white/10 rounded-3xl hover:bg-white/5 transition-colors" key={item.id}>
                <span className="material-symbols-outlined text-electricBlue mb-6">{item.ctaLabel || 'architecture'}</span>
                <h4 className="text-xl font-bold mb-4">{item.heading}</h4>
                <p className="text-slate-400 text-sm font-light">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="relative py-40 overflow-hidden">
        <div className="absolute inset-0 z-0 bg-slate-50">
          <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-30" />
          <div className="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-30" />
        </div>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white/50 w-full">
            <div className="relative z-10 w-full max-w-4xl mx-auto">
              <h2 className="cta-heading-safe font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                {ctaPrimary}
                <br />
                <span className="text-brand-gradient italic font-light inline-block px-1 sm:px-2">{ctaAccent}</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">{cta.body}</p>
              <Link
                href={cta.ctaHref || '/contact'}
                className="group relative px-12 py-6 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 inline-block"
              >
                <span className="relative z-10 group-hover:text-white transition-colors">{cta.ctaLabel}</span>
                <div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}





