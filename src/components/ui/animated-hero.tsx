'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { domAnimation, LazyMotion, m } from 'framer-motion';
import MoveRight from 'lucide-react/dist/esm/icons/move-right';

import { Button } from '@/components/ui/button';

type HeroProps = {
  badge?: string;
  titlePrimary: string;
  titleAccent?: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  animatedWords?: string[];
  primaryButtonClass?: string;
  secondaryButtonClass?: string;
};

function Hero({
  titlePrimary,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  animatedWords,
  primaryButtonClass,
  secondaryButtonClass
}: HeroProps) {
  const [titleNumber, setTitleNumber] = useState(0);

  const titles = useMemo(
    () =>
      animatedWords && animatedWords.length > 0
        ? animatedWords
        : ['amazing', 'new', 'wonderful', 'beautiful', 'smart'],
    [animatedWords]
  );

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      setTitleNumber((previous) => (previous === titles.length - 1 ? 0 : previous + 1));
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles.length]);

  const renderPrimaryButtonClass =
    primaryButtonClass ??
    'px-8 py-4 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-electricBlue transition-colors duration-500 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 no-underline';

  const renderSecondaryButtonClass =
    secondaryButtonClass ??
    'px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 text-deepSlate font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white hover:border-electricBlue/30 hover:text-electricBlue transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md no-underline';

  return (
    <div className="relative z-10 w-full">
      <div className="flex flex-col items-center justify-center gap-8 py-8 lg:py-12">
        <div className="flex w-full flex-col gap-4">
          <h1 className="hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter text-center drop-shadow-sm">
            {titlePrimary}
          </h1>
          <div className="relative h-14 md:h-20 lg:h-24 overflow-hidden">
            <LazyMotion features={domAnimation}>
              {titles.map((title, index) => (
                <m.span
                  key={title}
                  className="absolute inset-x-0 text-center hero-heading-safe font-display font-black text-deepSlate leading-[0.95] tracking-tighter"
                  initial={{ opacity: 0, y: -100 }}
                  transition={{ type: 'spring', stiffness: 50 }}
                  animate={
                    titleNumber === index
                      ? {
                          y: 0,
                          opacity: 1
                        }
                      : {
                          y: titleNumber > index ? -150 : 150,
                          opacity: 0
                        }
                  }
                >
                  {title}
                </m.span>
              ))}
            </LazyMotion>
          </div>
          <p className="max-w-3xl mx-auto text-lg md:text-xl text-slate-600 font-light leading-relaxed text-center">
            {description}
          </p>
        </div>

        <div className="hero-actions flex flex-col sm:flex-row gap-5 justify-center items-center">
          <Button asChild variant="ghost" size="lg" className={renderPrimaryButtonClass}>
            <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
          </Button>
          <Button asChild variant="ghost" size="lg" className={renderSecondaryButtonClass}>
            <Link href={secondaryCtaHref}>
              {secondaryCtaLabel}
              <MoveRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}

export { Hero };
