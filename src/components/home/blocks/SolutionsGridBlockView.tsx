import Link from 'next/link';

import type { SolutionsGridBlock } from '@/features/cms/types';

type SolutionsGridBlockViewProps = {
  block: SolutionsGridBlock;
};

const SOLUTION_ICONS = ['▣', '✦', '◍', '▤', '✉'];

export function SolutionsGridBlockView({ block }: SolutionsGridBlockViewProps) {
  return (
    <section className={`v2-section v2-solutions-wrap theme-${block.theme}`}>
      <div className="container">
        <header className="v2-section-header">
          <h2>{block.heading}</h2>
          <p>{block.subheading}</p>
        </header>
        <div className="v2-solution-grid">
          {block.items.map((item, index) => (
            <article key={item.id} className="v2-solution-card v2-glass-panel">
              <div className="v2-solution-head">
                <span className="v2-solution-icon" aria-hidden="true">
                  {SOLUTION_ICONS[index % SOLUTION_ICONS.length]}
                </span>
                <p className="v2-card-index">{item.number}</p>
              </div>
              <h3>{item.title}</h3>
              <p>{item.text}</p>
              <Link href={item.ctaHref} className="v2-solution-link">
                {item.ctaLabel}
              </Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
