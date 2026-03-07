'use client';

import type { CSSProperties } from 'react';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { revealTransitions, revealVariants, revealViewport, type RevealPreset } from './presets';

type RevealTag = 'div' | 'section' | 'article' | 'li' | 'span';

type RevealProps = {
  children: React.ReactNode;
  className?: string;
  preset?: RevealPreset;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: RevealTag;
  id?: string;
  style?: CSSProperties;
};

const motionMap = {
  div: motion.div,
  section: motion.section,
  article: motion.article,
  li: motion.li,
  span: motion.span
};

export function Reveal({
  children,
  className,
  preset = 'fadeUp',
  delay = 0,
  once = revealViewport.once,
  amount = revealViewport.amount,
  as = 'div',
  id,
  style
}: RevealProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    const StaticTag = as;
    return (
      <StaticTag className={className} id={id} style={style}>
        {children}
      </StaticTag>
    );
  }

  const MotionTag = motionMap[as];

  return (
    <MotionTag
      className={cn(className)}
      id={id}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={revealVariants[preset]}
      transition={{ ...revealTransitions[preset], delay }}
    >
      {children}
    </MotionTag>
  );
}
