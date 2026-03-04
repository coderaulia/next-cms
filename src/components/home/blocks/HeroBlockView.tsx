import type { HeroBlock } from '@/features/cms/types';

import { HomeCtaButton } from './HomeCtaButton';

type HeroBlockViewProps = {
  block: HeroBlock;
};

export function HeroBlockView({ block }: HeroBlockViewProps) {
  return (
    <section className={`v2-section v2-hero-wrap theme-${block.theme}`}>
      <div className="container">
        <div className="v2-hero-card v2-glass-panel">
          <p className="v2-pill">{block.badge}</p>
          <h1 className="v2-hero-title">
            {block.titlePrimary}
            <span className="v2-hero-accent">{block.titleAccent}</span>
          </h1>
          <p className="v2-subtext">{block.description}</p>
          <div className="v2-cta-row">
            <HomeCtaButton
              href={block.primaryCtaHref}
              label={block.primaryCtaLabel}
              styleToken={block.primaryCtaStyle}
            />
            <HomeCtaButton
              href={block.secondaryCtaHref}
              label={block.secondaryCtaLabel}
              styleToken={block.secondaryCtaStyle}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
