import Link from 'next/link';

import type { LandingPage } from '@/features/cms/types';

import { paragraphs, sectionWithFallback, splitAccent } from './sectionContent';
import { Reveal } from '@/components/animations/Reveal';

type AboutPageViewProps = {
  page: LandingPage;
};

export function AboutPageView({ page }: AboutPageViewProps) {
  const hero = sectionWithFallback(page, 0, {
    id: 'about-hero',
    heading: 'A Decade of|Engineering Excellence',
    body: 'Founded on the principles of precision and scalability, we have spent over 8 years perfecting the digital infrastructure that powers ambitious brands.',
    ctaLabel: 'Vanaila Digital:',
    ctaHref: '/about',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const story = sectionWithFallback(page, 1, {
    id: 'about-story',
    heading: 'Our Technical DNA',
    body: 'Vanaila Digital was born from a simple observation: the gap between aesthetic design and robust engineering was widening.\n\nFor over 8 years, we have cultivated a culture of architectural foresight, building not just for today\'s launch, but for next year\'s scale.',
    ctaLabel: '2023',
    ctaHref: 'Established in Bogor',
    mediaImage: '',
    mediaAlt: 'We prioritize speed, security, and stability above all else, ensuring your digital presence is as reliable as it is beautiful.',
    layout: 'split'
  });
  const vision = sectionWithFallback(page, 2, {
    id: 'about-vision',
    heading: 'Our Vision',
    body: 'To redefine the standard of digital craftsmanship by proving that high-performance engineering is the truest form of modern design.',
    ctaLabel: 'visibility',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const mission = sectionWithFallback(page, 3, {
    id: 'about-mission',
    heading: 'Our Mission',
    body: 'To empower forward-thinking businesses with digital infrastructure that scales effortlessly, with transparency in code and clarity in communication.',
    ctaLabel: 'rocket_launch',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarsIntro = sectionWithFallback(page, 4, {
    id: 'about-pillars-intro',
    heading: 'The Pillars of Vanaila',
    body: 'Three core principles that have guided our engineering decisions for nearly a decade.',
    ctaLabel: '',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarOne = sectionWithFallback(page, 5, {
    id: 'about-pillar-1',
    heading: 'Architectural Foresight',
    body: 'We architect for the future. Every line of code is written with scalability and maintenance in mind.',
    ctaLabel: 'architecture',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarTwo = sectionWithFallback(page, 6, {
    id: 'about-pillar-2',
    heading: 'Precision & Care',
    body: 'From pixel-perfect responsiveness to optimized database queries, we treat every project like our own product.',
    ctaLabel: 'psychology',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const pillarThree = sectionWithFallback(page, 7, {
    id: 'about-pillar-3',
    heading: 'Results-Driven Approach',
    body: 'We measure success through load times, conversion rates, and the tangible growth of our partners.',
    ctaLabel: 'trending_up',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const quote = sectionWithFallback(page, 8, {
    id: 'about-quote',
    heading: 'We believe that true potential is unlocked when complex problems meet elegant engineering.',
    body: 'Whether you are a startup looking to disrupt or an enterprise aiming to optimize, our team is ready to translate your vision into a digital reality that stands the test of time.',
    ctaLabel: 'format_quote',
    ctaHref: '',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });
  const cta = sectionWithFallback(page, 9, {
    id: 'about-cta',
    heading: 'Unlock Your|Digital Potential',
    body: 'Partner with an engineering team that understands the intersection of technology and business growth.',
    ctaLabel: 'Claim Free Consultation Call',
    ctaHref: '/contact',
    mediaImage: '',
    mediaAlt: '',
    layout: 'stacked'
  });

  const { primary: heroPrimary, accent: heroAccent } = splitAccent(
    hero.heading,
    'Engineering Excellence'
  );
  const { primary: ctaPrimary, accent: ctaAccent } = splitAccent(
    cta.heading,
    'Digital Potential'
  );
  const storyParts = paragraphs(story.body);
  const quoteHeadline = quote.heading.replace(/\"/g, '').trim();

  const pillars = [pillarOne, pillarTwo, pillarThree];

  return (
    <main>
      <Reveal as="section" className="relative min-h-[80vh] flex items-center pt-32 pb-20 overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-tr from-vanailaNavy via-electricBlue to-royalPurple opacity-20 filter blur-[100px] rounded-full animate-pulse duration-[10s]" />
          <div className="absolute top-10 left-10 w-64 h-64 bg-electricBlue opacity-20 filter blur-[80px] rounded-full mix-blend-multiply" />
          <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500 opacity-15 filter blur-[90px] rounded-full mix-blend-multiply" />
        </div>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
          <div className="bg-white/30 backdrop-blur-2xl p-12 md:p-20 rounded-[3rem] relative overflow-hidden ring-1 ring-white/40 shadow-[0_8px_60px_-12px_rgba(37,99,235,0.15)]">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 via-white/10 to-blue-50/20 pointer-events-none" />
            <div className="hero-badge inline-flex items-center gap-3 px-5 py-1.5 rounded-full bg-white/60 border border-white/60 mb-8 backdrop-blur-sm shadow-sm mx-auto">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-electricBlue opacity-75" />
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-electricBlue" />
              </span>
              <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-slate-600">
                {hero.ctaLabel || 'Vanaila Digital:'}
              </span>
            </div>
            <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[1.0] tracking-tighter mb-8 drop-shadow-sm">
              {heroPrimary}
              <br />
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-electricBlue to-indigo-500 italic font-light inline-block px-1 sm:px-2">
                {heroAccent}
              </span>
            </h1>
            <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 font-light leading-relaxed">
              {hero.body}
            </p>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-24 relative" id="story">
        <div className="absolute top-[10%] right-[-10%] w-[50%] h-[60%] shard-gradient-soft -rotate-12 z-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="glass-card rounded-[3rem] p-10 md:p-16 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-white/60 via-transparent to-white/40 pointer-events-none z-0" />
            <div className="grid lg:grid-cols-12 gap-12 relative z-10 items-center">
              <div className="lg:col-span-5 flex flex-col justify-center items-center lg:items-start text-center lg:text-left">
                <div className="relative">
                  <span className="text-[10rem] md:text-[12rem] font-display font-black text-slate-100 leading-none select-none absolute -top-16 -left-10 z-0">
                    8
                  </span>
                  <h2 className="text-6xl md:text-8xl font-display font-black text-deepSlate relative z-10">
                    {story.ctaLabel || '2023'}
                  </h2>
                </div>
                <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-electricBlue/10 text-electricBlue font-bold uppercase tracking-widest text-xs">
                  <span className="material-symbols-outlined text-sm">flag</span>
                  {story.ctaHref || 'Established in Bogor'}
                </div>
              </div>
              <div className="lg:col-span-7 space-y-6">
                <h3 className="text-3xl font-display font-bold text-deepSlate">{story.heading}</h3>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  {storyParts[0] || story.body}
                </p>
                <p className="text-lg text-slate-600 font-light leading-relaxed">
                  {storyParts[1] || story.mediaAlt}
                </p>
              </div>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-20 relative bg-white/30 backdrop-blur-sm" id="vision">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 opacity-60 z-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="grid md:grid-cols-2 gap-8 lg:gap-16">
            <div className="glass-panel rounded-[2.5rem] p-12 hover:-translate-y-2 transition-transform duration-500 border-t-4 border-t-electricBlue">
              <div className="w-16 h-16 rounded-2xl bg-electricBlue/10 flex items-center justify-center text-electricBlue mb-8">
                <span className="material-symbols-outlined text-3xl">{vision.ctaLabel || 'visibility'}</span>
              </div>
              <h3 className="text-4xl font-display font-bold text-deepSlate mb-6">{vision.heading}</h3>
              <p className="text-slate-600 font-light text-lg leading-relaxed">{vision.body}</p>
            </div>
            <div className="glass-panel rounded-[2.5rem] p-12 hover:-translate-y-2 transition-transform duration-500 border-t-4 border-t-royalPurple">
              <div className="w-16 h-16 rounded-2xl bg-royalPurple/10 flex items-center justify-center text-royalPurple mb-8">
                <span className="material-symbols-outlined text-3xl">{mission.ctaLabel || 'rocket_launch'}</span>
              </div>
              <h3 className="text-4xl font-display font-bold text-deepSlate mb-6">{mission.heading}</h3>
              <p className="text-slate-600 font-light text-lg leading-relaxed">{mission.body}</p>
            </div>
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-32 relative" id="values">
        <div className="absolute bottom-0 left-0 w-full h-full shard-gradient-soft opacity-30 pointer-events-none z-0" />
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-display font-black text-deepSlate mb-6">
              {pillarsIntro.heading}
            </h2>
            <p className="text-xl text-slate-500 font-light max-w-2xl mx-auto">{pillarsIntro.body}</p>
          </div>
          <div className="grid md:grid-cols-3 gap-8">
            {pillars.map((item, index) => (
              <div key={item.id} className="glass-card rounded-3xl p-10 flex flex-col items-center text-center group hover:bg-white transition-colors duration-300">
                <div className="w-14 h-14 rounded-full bg-slate-50 border border-slate-200 flex items-center justify-center mb-6 group-hover:text-white transition-all shadow-sm text-electricBlue group-hover:bg-electricBlue">
                  <span className="material-symbols-outlined text-2xl">{item.ctaLabel || (index === 0 ? 'architecture' : index === 1 ? 'psychology' : 'trending_up')}</span>
                </div>
                <h4 className="text-xl font-bold font-display text-deepSlate mb-4">{item.heading}</h4>
                <p className="text-slate-500 text-sm leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal as="section" className="py-20 bg-white relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-50/80 pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center">
          <span className="material-symbols-outlined text-6xl text-slate-200 mb-8">{quote.ctaLabel || 'format_quote'}</span>
          <h2 className="text-3xl md:text-5xl font-display font-light text-slate-700 leading-tight mb-8">
            &ldquo;{quoteHeadline}&rdquo;
          </h2>
          <div className="w-24 h-1 bg-gradient-to-r from-electricBlue to-vanailaNavy mx-auto rounded-full mb-8" />
          <p className="text-lg text-slate-500 leading-relaxed">{quote.body}</p>
        </div>
      </Reveal>

      <Reveal as="section" className="relative py-32 overflow-hidden" id="contact">
        <div className="absolute inset-0 z-0 bg-slate-50">
          <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-30" />
          <div className="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-30" />
        </div>
        <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full">
          <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white/50 w-full">
            <div className="relative z-10">
              <h2 className="cta-heading-safe font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
                {ctaPrimary}
                <br />
                <span className="text-brand-gradient italic font-light inline-block px-1 sm:px-2">{ctaAccent}</span>
              </h2>
              <p className="text-slate-500 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
                {cta.body}
              </p>
              <Link href={cta.ctaHref || '/contact'} className="group relative px-12 py-6 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 inline-block">
                <span className="relative z-10 group-hover:text-white transition-colors">
                  {cta.ctaLabel || 'Claim Free Consultation Call'}
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Link>
            </div>
          </div>
        </div>
      </Reveal>
    </main>
  );
}







