import type { WhySplitBlock } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { SymbolIcon } from '@/components/ui/symbol-icon';

type WhySplitBlockViewProps = {
  block: WhySplitBlock;
};

const ITEM_ICONS = ['trending_up', 'verified', 'support_agent', 'strategy', 'star'];
const ITEM_COLORS = [
  'group-hover:bg-electricBlue group-hover:shadow-blue-400/30',
  'group-hover:bg-royalPurple group-hover:shadow-indigo-500/30',
  'group-hover:bg-vanailaNavy group-hover:shadow-slate-600/30',
  'group-hover:bg-vibrantCyan group-hover:shadow-cyan-500/30',
  'group-hover:bg-indigo-500 group-hover:shadow-indigo-500/30'
] as const;

export function WhySplitBlockView({ block }: WhySplitBlockViewProps) {
  const hasImage = block.mediaImage.trim().length > 0 && !block.mediaImage.includes('placehold.co');

  return (
    <section className={`py-32 relative overflow-hidden bg-white/30 backdrop-blur-sm theme-${block.theme}`}>
      <div className="absolute inset-0 bg-gradient-to-br from-slate-50 via-blue-50/50 to-indigo-50/50 opacity-60 z-0" />
      <div className="absolute top-0 right-0 w-3/4 h-full shard-gradient-1 -skew-x-12 opacity-10 z-0" />

      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid lg:grid-cols-2 gap-24 items-center">
          <div className="space-y-16">
            <Reveal className="glass-panel p-10 rounded-[2.5rem] -ml-6 border-l-4 border-l-electricBlue" preset="fadeUp">
              <h2 className="text-5xl md:text-6xl font-display font-black text-deepSlate mb-6 leading-[0.9] tracking-tighter">
                {block.heading}
              </h2>
              <p className="text-lg text-slate-500 font-light leading-relaxed">{block.description}</p>
            </Reveal>

            <StaggerGroup className="space-y-8 pl-4" delayChildren={0.05}>
              {block.bullets.map((bullet, index) => {
                const icon = ITEM_ICONS[index % ITEM_ICONS.length];
                const colorClass = ITEM_COLORS[index % ITEM_COLORS.length];
                return (
                  <StaggerItem className="flex gap-8 items-start group" key={bullet.id}>
                    <div
                      className={`flex-shrink-0 w-16 h-16 flex items-center justify-center bg-white rounded-2xl shadow-sm border border-slate-100 group-hover:text-white transition-all duration-500 group-hover:shadow-xl ${colorClass}`}
                    >
                      <SymbolIcon className="text-3xl" name={icon} />
                    </div>
                    <div>
                      <h4 className="text-xl font-black text-deepSlate mb-2 font-display">{bullet.title}</h4>
                      <p className="text-slate-500 font-light text-base leading-relaxed">{bullet.text}</p>
                    </div>
                  </StaggerItem>
                );
              })}
            </StaggerGroup>
          </div>

          <Reveal className="relative h-full min-h-[500px] flex items-center justify-center" preset="scaleInSoft">
            <div className="absolute inset-0 bg-gradient-to-br from-electricBlue via-indigo-400 to-slate-400 opacity-20 blur-[80px] rounded-full" />
            <div className="glass-panel w-full aspect-square max-w-md rounded-[3rem] rotate-3 flex items-center justify-center p-12 border border-white/80 relative z-10">
              <div className="relative w-full h-full flex items-center justify-center">
                <div className="absolute inset-0 rounded-full border border-slate-200/50 scale-125" />
                <div className="absolute inset-0 rounded-full border-2 border-dashed border-electricBlue/30 animate-[spin_40s_linear_infinite] scale-110" />

                <div className="w-32 h-32 bg-white rounded-2xl shadow-xl flex items-center justify-center border border-slate-50 z-20 relative transform -rotate-3 overflow-hidden">
                  {hasImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={block.mediaImage} alt={block.mediaAlt || block.heading} className="w-full h-full object-cover" />
                  ) : (
                    <SymbolIcon className="text-6xl text-transparent bg-clip-text bg-gradient-to-br from-electricBlue to-vanailaNavy" name="hub" />
                  )}
                </div>

                <div className="absolute top-10 right-10 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white rotate-6 animate-bounce [animation-duration:3s]">
                  <SymbolIcon className="text-electricBlue text-3xl" name="code" />
                </div>
                <div className="absolute bottom-16 left-10 p-6 bg-white/90 backdrop-blur-md rounded-2xl shadow-lg border border-white -rotate-6 animate-bounce [animation-duration:4s]">
                  <SymbolIcon className="text-royalPurple text-3xl" name="analytics" />
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </div>
    </section>
  );
}
