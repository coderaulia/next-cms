import type { PrimaryCtaBlock } from '@/features/cms/types';

import { HomeCtaButton } from './HomeCtaButton';

type PrimaryCtaBlockViewProps = {
  block: PrimaryCtaBlock;
};

export function PrimaryCtaBlockView({ block }: PrimaryCtaBlockViewProps) {
  return (
    <section className={`v2-section v2-primary-cta-wrap theme-${block.theme}`}>
      <div className="container">
        <div className="v2-cta-panel v2-glass-panel">
          <h2>
            {block.heading} <span>{block.accentText}</span>
          </h2>
          <p>{block.description}</p>
          <HomeCtaButton href={block.ctaHref} label={block.ctaLabel} styleToken={block.ctaStyle} />
        </div>
      </div>
    </section>
  );
}
