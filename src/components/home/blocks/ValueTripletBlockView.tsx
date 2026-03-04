import type { ValueTripletBlock } from '@/features/cms/types';

type ValueTripletBlockViewProps = {
  block: ValueTripletBlock;
};

export function ValueTripletBlockView({ block }: ValueTripletBlockViewProps) {
  return (
    <section className={`v2-section v2-value-wrap theme-${block.theme}`}>
      <div className="container v2-value-grid">
        {block.items.map((item) => (
          <article className="v2-value-item" key={item.id}>
            <p className="v2-value-icon" aria-hidden="true">
              {item.icon}
            </p>
            <h3>{item.title}</h3>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
