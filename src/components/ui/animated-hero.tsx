'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { MoveRight, PhoneCall } from 'lucide-react';

import { Button } from '@/components/ui/button';

type HeroProps = {
  badge: string;
  titlePrimary: string;
  titleAccent: string;
  description: string;
  primaryCtaLabel: string;
  primaryCtaHref: string;
  secondaryCtaLabel: string;
  secondaryCtaHref: string;
  animatedWords?: string[];
  microCtaLabel?: string;
  microCtaHref?: string;
  primaryButtonClass?: string;
  secondaryButtonClass?: string;
};

function Hero({
  badge,
  titlePrimary,
  titleAccent,
  description,
  primaryCtaLabel,
  primaryCtaHref,
  secondaryCtaLabel,
  secondaryCtaHref,
  animatedWords,
  microCtaLabel,
  microCtaHref,
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
      if (titleNumber === titles.length - 1) {
        setTitleNumber(0);
      } else {
        setTitleNumber(titleNumber + 1);
      }
    }, 2000);
    return () => clearTimeout(timeoutId);
  }, [titleNumber, titles]);

  const renderPrimaryButtonClass =
    primaryButtonClass ??
    'px-8 py-4 bg-vanailaNavy text-white font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-electricBlue transition-colors duration-500 shadow-xl shadow-blue-900/10 hover:shadow-2xl hover:shadow-blue-600/20 hover:-translate-y-1 no-underline';

  const renderSecondaryButtonClass =
    secondaryButtonClass ??
    'px-8 py-4 bg-white/50 backdrop-blur-sm border border-slate-200 text-deepSlate font-display font-bold text-sm uppercase tracking-widest rounded-full hover:bg-white hover:border-electricBlue/30 hover:text-electricBlue transition-all flex items-center justify-center gap-2 group shadow-sm hover:shadow-md no-underline';

  const microHref = microCtaHref || primaryCtaHref;
  const microLabel = microCtaLabel || primaryCtaLabel;

  return (
    <div className="w-full">
      <div className="container mx-auto">
        <div className="flex gap-8 py-20 lg:py-40 items-center justify-center flex-col">
          {microCtaLabel ? (
            <div>
              <Button asChild variant="secondary" size="sm" className="gap-4">
                <Link href={microHref}>
                  {microLabel}
                  <MoveRight className="w-4 h-4" />
                </Link>
              </Button>
            </div>
          ) : null}
          <div className="flex gap-4 flex-col">
            <h1 className="text-5xl md:text-7xl max-w-2xl tracking-tighter text-center font-regular">
              <span className="text-spektr-cyan-50">{titlePrimary}</span>
              <span className="relative flex w-full justify-center overflow-hidden text-center md:pb-4 md:pt-1">
                &nbsp;
                {titles.map((title, index) => (
                  <motion.span
                    key={title}
                    className="absolute font-semibold"
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
                  </motion.span>
                ))}
              </span>
            </h1>

            <p className="text-lg md:text-xl leading-relaxed tracking-tight text-muted-foreground max-w-2xl text-center">
              {description}
            </p>
          </div>
          <div className="flex flex-col gap-2">
            <p className="text-sm uppercase tracking-[0.35em] text-slate-600 font-semibold">
              {badge}
            </p>
            <h2 className="text-4xl sm:text-5xl font-display font-black text-deepSlate leading-[0.95] drop-shadow-sm">
              <span className="text-brand-gradient">{titleAccent}</span>
            </h2>
          </div>
          <div className="flex flex-row gap-3">
            <Button asChild size="lg" className={renderPrimaryButtonClass}>
              <Link href={primaryCtaHref}>{primaryCtaLabel}</Link>
            </Button>
            <Button asChild size="lg" className={`gap-4 ${renderSecondaryButtonClass}`}>
              <Link href={secondaryCtaHref}>
                {secondaryCtaLabel}
                <PhoneCall className="w-4 h-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export { Hero };


