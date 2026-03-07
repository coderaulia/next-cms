import Link from 'next/link';

import type { LogoCloudBlock } from '@/features/cms/types';

import { Reveal } from '@/components/animations/Reveal';
import { StaggerGroup, StaggerItem } from '@/components/animations/StaggerGroup';

type LogoCloudBlockViewProps = {
  block: LogoCloudBlock;
};

const LOGO_ICONS = ['waves', 'public', 'change_history', 'favorite', 'local_shipping'];
const LOGO_ICON_COLORS = ['text-electricBlue', 'text-royalPurple', 'text-vibrantCyan', 'text-vanailaNavy', 'text-indigo-500'];

export function LogoCloudBlockView({ block }: LogoCloudBlockViewProps) {
  return (
    <section className={`py-32 bg-white relative theme-${block.theme}`}>
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-0 w-[40%] h-[1px] bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        <div className="absolute top-1/2 right-0 w-[40%] h-[1px] bg-gradient-to-l from-transparent via-slate-200 to-transparent" />
      </div>
      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <Reveal className="text-center mb-24" preset="fadeIn">
          <h2 className="text-slate-400 font-bold tracking-[0.6em] uppercase text-xs">{block.heading}</h2>
        </Reveal>

        <StaggerGroup className="flex flex-wrap justify-center items-center gap-x-16 gap-y-12 grayscale opacity-50 hover:grayscale-0 hover:opacity-100 transition-all duration-700 mb-24" delayChildren={0.05}>
          {block.logos.map((logo, index) => (
            <StaggerItem className="flex items-center gap-3 text-2xl font-display font-black text-deepSlate" key={logo.id}>
              <span className={`material-symbols-outlined text-3xl ${LOGO_ICON_COLORS[index % LOGO_ICON_COLORS.length]}`}>
                {LOGO_ICONS[index % LOGO_ICONS.length]}
              </span>
              {logo.name}
            </StaggerItem>
          ))}
        </StaggerGroup>

        <Reveal className="flex flex-col sm:flex-row justify-center items-center gap-6" preset="fadeUp" delay={0.1}>
          <Link
            href={block.primaryCtaHref || '/blog'}
            className="px-10 py-5 bg-white border-2 border-slate-100 text-deepSlate font-bold text-xs uppercase tracking-[0.2em] hover:border-electricBlue hover:text-electricBlue transition-all rounded-full shadow-sm"
          >
            {block.primaryCtaLabel}
          </Link>
          <Link
            href={block.secondaryCtaHref || '/contact'}
            className="px-10 py-5 bg-vanailaNavy text-white font-bold text-xs uppercase tracking-[0.2em] rounded-full shadow-lg hover:shadow-2xl hover:shadow-blue-900/20 hover:-translate-y-1 transition-all"
          >
            {block.secondaryCtaLabel}
          </Link>
        </Reveal>
      </div>
    </section>
  );
}
