import type { ValueTripletBlock } from '@/features/cms/types';

type ValueTripletBlockViewProps = {
  block: ValueTripletBlock;
};

export function ValueTripletBlockView({ block }: ValueTripletBlockViewProps) {
  return (
    <section className={`py-20 relative border-b border-white/40 bg-white/30 backdrop-blur-sm theme-${block.theme}`}>
      <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center divide-y md:divide-y-0 md:divide-x divide-slate-200">
          {block.items.map((item) => (
            <div className="px-4 py-4 group scroll-reveal" key={item.id}>
              <div className="mb-6 inline-flex p-4 rounded-full bg-blue-50 text-electricBlue group-hover:bg-electricBlue group-hover:text-white transition-colors duration-300">
                <span className="material-symbols-outlined text-4xl">{item.icon}</span>
              </div>
              <h3 className="text-2xl font-display font-bold text-deepSlate mb-2">{item.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed max-w-xs mx-auto">{item.text}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
