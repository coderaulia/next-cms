import type { HeroBlock } from '@/features/cms/types';

import { Hero } from '@/components/ui/animated-hero';

type HeroBlockViewProps = {
  block: HeroBlock;
};

export function HeroBlockView({ block }: HeroBlockViewProps) {
  const primaryButtonClass =
    block.primaryCtaStyle === 'secondary' || block.primaryCtaStyle === 'ghost'
      ? 'px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 text-deepSlate font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white hover:border-electricBlue/30 hover:text-electricBlue transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md no-underline'
      : 'px-8 py-4 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-electricBlue transition-colors duration-500 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 no-underline';
  const secondaryButtonClass =
    block.secondaryCtaStyle === 'primary'
      ? 'px-8 py-4 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-electricBlue transition-colors duration-500 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 no-underline'
      : 'px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 text-deepSlate font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white hover:border-electricBlue/30 hover:text-electricBlue transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md no-underline';

  return (
    <section className={`relative min-h-[calc(100vh-96px)] flex items-start pt-8 md:pt-10 pb-20 overflow-hidden theme-${block.theme}`}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[900px] h-[700px] bg-gradient-to-tr from-vanailaNavy via-electricBlue to-royalPurple opacity-20 filter blur-[100px] rounded-full animate-pulse duration-[10s]" />
        <div className="absolute top-10 left-10 w-64 h-64 bg-electricBlue opacity-20 filter blur-[80px] rounded-full mix-blend-multiply" />
        <div className="absolute bottom-1/4 right-10 w-80 h-80 bg-indigo-500 opacity-15 filter blur-[90px] rounded-full mix-blend-multiply" />
      </div>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 w-full text-center">
        <div className="bg-white/30 backdrop-blur-2xl p-12 md:p-24 rounded-[3rem] relative overflow-hidden ring-1 ring-white/40 shadow-[0_8px_60px_-12px_rgba(37,99,235,0.15)]">
          <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/50 via-white/10 to-blue-50/20 pointer-events-none" />
          <Hero
            badge={block.badge}
            titlePrimary={block.titlePrimary}
            titleAccent={block.titleAccent}
            description={block.description}
            primaryCtaLabel={block.primaryCtaLabel}
            primaryCtaHref={block.primaryCtaHref}
            secondaryCtaLabel={block.secondaryCtaLabel}
            secondaryCtaHref={block.secondaryCtaHref}
            animatedWords={block.animatedWords}
            primaryButtonClass={primaryButtonClass}
            secondaryButtonClass={secondaryButtonClass}
          />
        </div>
      </div>
    </section>
  );
}
