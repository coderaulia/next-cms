import type { LogoCloudBlock } from '@/features/cms/types';

import { HomeCtaButton } from './HomeCtaButton';

type LogoCloudBlockViewProps = {
  block: LogoCloudBlock;
};

export function LogoCloudBlockView({ block }: LogoCloudBlockViewProps) {
  return (
    <section className={`v2-section v2-logo-wrap theme-${block.theme}`}>
      <div className="container">
        <header className="v2-section-header">
          <p className="v2-pill">{block.heading}</p>
        </header>
        <div className="v2-logo-grid">
          {block.logos.map((logo) => (
            <p key={logo.id}>{logo.name}</p>
          ))}
        </div>
        <div className="v2-cta-row">
          <HomeCtaButton href={block.primaryCtaHref} label={block.primaryCtaLabel} styleToken="ghost" />
          <HomeCtaButton
            href={block.secondaryCtaHref}
            label={block.secondaryCtaLabel}
            styleToken="primary"
          />
        </div>
      </div>
    </section>
  );
}
