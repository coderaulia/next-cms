import type { HomeBlock, LandingPage } from '@/features/cms/types';

import { HeroBlockView } from './blocks/HeroBlockView';
import { LogoCloudBlockView } from './blocks/LogoCloudBlockView';
import { PrimaryCtaBlockView } from './blocks/PrimaryCtaBlockView';
import { SolutionsGridBlockView } from './blocks/SolutionsGridBlockView';
import { ValueTripletBlockView } from './blocks/ValueTripletBlockView';
import { WhySplitBlockView } from './blocks/WhySplitBlockView';

type HomeBlockRendererProps = {
  page: LandingPage;
};

function renderBlock(block: HomeBlock) {
  switch (block.type) {
    case 'hero':
      return <HeroBlockView block={block} key={block.id} />;
    case 'value_triplet':
      return <ValueTripletBlockView block={block} key={block.id} />;
    case 'solutions_grid':
      return <SolutionsGridBlockView block={block} key={block.id} />;
    case 'why_split':
      return <WhySplitBlockView block={block} key={block.id} />;
    case 'logo_cloud':
      return <LogoCloudBlockView block={block} key={block.id} />;
    case 'primary_cta':
      return <PrimaryCtaBlockView block={block} key={block.id} />;
    default:
      return null;
  }
}

export function HomeBlockRenderer({ page }: HomeBlockRendererProps) {
  const blocks = page.homeBlocks ?? [];
  return <main className="home-main">{blocks.filter((block) => block.enabled).map(renderBlock)}</main>;
}
