import type { ValueTripletBlock } from '@/features/cms/types';

import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';
import { SymbolIcon } from '@/components/ui/symbol-icon';

type ValueTripletBlockViewProps = {
  block: ValueTripletBlock;
};

export function ValueTripletBlockView({ block }: ValueTripletBlockViewProps) {
  return (
    <section className={`py-20 relative border-b border-white/40 bg-white/30 backdrop-blur-sm theme-${block.theme}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <StaggerGroup className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {block.items.map((item) => (
            <StaggerItem className="px-4 py-4 group" key={item.id}>
              <div className="mb-6 inline-flex p-4 rounded-full bg-blue-50 text-electricBlue group-hover:bg-electricBlue group-hover:text-white transition-colors duration-300">
                <SymbolIcon className="text-4xl" name={item.icon} />
              </div>
              <h3 className="text-2xl font-display font-bold text-deepSlate mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.text}</p>
            </StaggerItem>
          ))}
        </StaggerGroup>
      </div>
    </section>
  );
}
