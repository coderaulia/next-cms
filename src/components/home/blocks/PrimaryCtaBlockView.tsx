import Link from 'next/link';

import type { PrimaryCtaBlock } from '@/features/cms/types';

type PrimaryCtaBlockViewProps = {
  block: PrimaryCtaBlock;
};

export function PrimaryCtaBlockView({ block }: PrimaryCtaBlockViewProps) {
  return (
    <section className={`relative py-40 overflow-hidden theme-${block.theme}`}>
      <div className="absolute inset-0 z-0 bg-slate-50">
        <div className="absolute top-0 right-[-10%] w-[60%] h-[120%] shard-gradient-1 rotate-12 opacity-30" />
        <div className="absolute bottom-0 left-[-10%] w-[60%] h-[120%] shard-gradient-2 -rotate-12 opacity-30" />
      </div>
      <div className="max-w-6xl mx-auto px-6 lg:px-12 relative z-10 w-full">
        <div className="glass-panel p-16 md:p-24 rounded-[4rem] text-center relative overflow-hidden bg-white/50 w-full">
          <div className="relative z-10 w-full max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-display font-black text-deepSlate leading-[0.95] mb-8 tracking-tighter pb-4">
              {block.heading}
              <br />
              <span className="text-brand-gradient italic font-light">{block.accentText}</span>
            </h2>
            <p className="text-slate-500 text-lg md:text-xl font-light mb-12 max-w-xl mx-auto">
              {block.description}
            </p>
            <Link
              href={block.ctaHref || '/contact'}
              className="group relative px-12 py-6 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-[0.2em] rounded-full overflow-hidden hover:shadow-2xl hover:shadow-blue-900/30 transition-all duration-300 inline-block"
            >
              <span className="relative z-10 group-hover:text-white transition-colors">{block.ctaLabel}</span>
              <div className="absolute inset-0 bg-gradient-to-r from-electricBlue to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
