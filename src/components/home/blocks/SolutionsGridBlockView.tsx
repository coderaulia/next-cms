import Link from 'next/link';

import type { SolutionsGridBlock } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { SymbolIcon } from '@/components/ui/symbol-icon';

type SolutionsGridBlockViewProps = {
  block: SolutionsGridBlock;
};

const ICONS = ['language', 'integration_instructions', 'shopping_cart', 'smartphone', 'email'];
const ICON_STYLES = [
  {
    hoverBorder: 'group-hover:border-electricBlue/40',
    iconWrap:
      'w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-electricBlue border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-electricBlue group-hover:text-white transition-all duration-500',
    cta: 'text-electricBlue',
    line: 'bg-electricBlue'
  },
  {
    hoverBorder: 'group-hover:border-royalPurple/40',
    iconWrap:
      'w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-royalPurple border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-royalPurple group-hover:text-white transition-all duration-500',
    cta: 'text-royalPurple',
    line: 'bg-royalPurple'
  },
  {
    hoverBorder: 'group-hover:border-vibrantCyan/40',
    iconWrap:
      'w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-vibrantCyan border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-vibrantCyan group-hover:text-white transition-all duration-500',
    cta: 'text-vibrantCyan',
    line: 'bg-vibrantCyan'
  },
  {
    hoverBorder: 'group-hover:border-vanailaNavy/30',
    iconWrap:
      'w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-vanailaNavy border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-vanailaNavy group-hover:text-white transition-all duration-500',
    cta: 'text-vanailaNavy',
    line: 'bg-vanailaNavy'
  },
  {
    hoverBorder: 'group-hover:border-indigo-500/30',
    iconWrap:
      'w-16 h-16 rounded-2xl bg-slate-50 flex items-center justify-center text-indigo-500 border border-slate-100 shadow-inner group-hover:scale-110 group-hover:bg-indigo-500 group-hover:text-white transition-all duration-500',
    cta: 'text-indigo-500',
    line: 'bg-indigo-500'
  }
] as const;

const CARD_WRAPPER_CLASSES = ['', 'md:mt-12 lg:mt-0', 'lg:mt-12', '', 'md:mt-12 lg:mt-0'] as const;

export function SolutionsGridBlockView({ block }: SolutionsGridBlockViewProps) {
  return (
    <section className={`py-32 relative theme-${block.theme}`} id="services">
      <div className="absolute top-[10%] left-[-10%] w-[50%] h-[60%] shard-gradient-soft rotate-12 z-0" />
      <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[50%] shard-gradient-2 -rotate-12 z-0" />
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <Reveal className="max-w-3xl mx-auto text-center mb-24" preset="fadeUp">
          <h2 className="text-5xl md:text-7xl font-display font-black text-deepSlate mb-6 tracking-tighter">{block.heading}</h2>
          <p className="text-xl md:text-2xl text-slate-500 font-light leading-relaxed">{block.subheading}</p>
        </Reveal>

        <StaggerGroup className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 lg:gap-10">
          {block.items.map((item, index) => {
            const style = ICON_STYLES[index % ICON_STYLES.length];
            const icon = ICONS[index % ICONS.length];
            const shape = index % 2 === 0 ? 'irregular-card-1' : 'irregular-card-2';
            const wrapper = CARD_WRAPPER_CLASSES[index % CARD_WRAPPER_CLASSES.length];
            return (
              <StaggerItem className={`relative group ${wrapper}`.trim()} key={item.id}>
                <Link
                  href={item.ctaHref || '/service'}
                  className={`glass-card ${shape} p-10 relative z-10 hover:-translate-y-2 transition-transform duration-500 ${style.hoverBorder} bg-white h-full flex flex-col block`}
                >
                  <div className="flex justify-between items-start mb-8">
                    <div className={style.iconWrap}>
                      <SymbolIcon className="text-3xl" name={icon} />
                    </div>
                    <span className="text-5xl font-black text-slate-100/80 -z-10 absolute right-8 top-8">
                      {item.number || String(index + 1).padStart(2, '0')}
                    </span>
                  </div>
                  <h3 className="text-2xl font-display font-bold text-deepSlate mb-3 leading-tight">{item.title}</h3>
                  <p className="text-slate-500 text-sm font-light leading-relaxed mb-6 flex-grow">{item.text}</p>
                  <div className={`flex items-center gap-3 text-xs font-bold uppercase tracking-widest ${style.cta}`}>
                    <span className={`w-6 h-px ${style.line}`} />
                    {item.ctaLabel}
                  </div>
                </Link>
              </StaggerItem>
            );
          })}
        </StaggerGroup>

        <Reveal className="mt-24 text-center" preset="fadeIn" delay={0.1}>
          <Link className="inline-flex flex-col items-center gap-4 group" href="/service">
            <span className="w-16 h-16 rounded-full border border-slate-300 bg-white/50 backdrop-blur-sm flex items-center justify-center group-hover:bg-electricBlue group-hover:text-white group-hover:border-electricBlue transition-all duration-300 shadow-sm">
              <SymbolIcon className="text-2xl" name="expand_more" />
            </span>
            <span className="text-xs font-black uppercase tracking-[0.3em] text-deepSlate group-hover:text-electricBlue transition-colors">
              Explore All Solutions
            </span>
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
