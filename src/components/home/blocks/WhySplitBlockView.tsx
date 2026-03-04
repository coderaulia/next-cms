import type { WhySplitBlock } from '@/features/cms/types';

type WhySplitBlockViewProps = {
  block: WhySplitBlock;
};

export function WhySplitBlockView({ block }: WhySplitBlockViewProps) {
  return (
    <section className={`v2-section v2-why-wrap theme-${block.theme}`}>
      <div className="container v2-why-grid">
        <div>
          <div className="v2-why-card v2-glass-panel">
            <h2>{block.heading}</h2>
            <p>{block.description}</p>
          </div>
          <ul className="v2-why-list">
            {block.bullets.map((bullet, index) => (
              <li key={bullet.id}>
                <span className="v2-why-bullet-index" aria-hidden="true">
                  {index + 1}
                </span>
                <h3>{bullet.title}</h3>
                <p>{bullet.text}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="v2-why-media v2-glass-panel">
          <div className="v2-why-media-inner">
            <img src={block.mediaImage} alt={block.mediaAlt} />
          </div>
        </div>
      </div>
    </section>
  );
}
