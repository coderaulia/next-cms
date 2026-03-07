'use client';

import { motion, useReducedMotion } from 'framer-motion';

import { cn } from '@/lib/utils';

import { revealTransitions, revealVariants, revealViewport, type RevealPreset } from './presets';

type GroupTag = 'div' | 'section' | 'ul';
type ItemTag = 'div' | 'article' | 'li';

type StaggerGroupProps = {
  children: React.ReactNode;
  className?: string;
  as?: GroupTag;
  staggerChildren?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
};

type StaggerItemProps = {
  children: React.ReactNode;
  className?: string;
  as?: ItemTag;
  preset?: RevealPreset;
};

const groupMap = {
  div: motion.div,
  section: motion.section,
  ul: motion.ul
};

const itemMap = {
  div: motion.div,
  article: motion.article,
  li: motion.li
};

export function StaggerGroup({
  children,
  className,
  as = 'div',
  staggerChildren = 0.08,
  delayChildren = 0,
  once = revealViewport.once,
  amount = revealViewport.amount
}: StaggerGroupProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = groupMap[as];

  return (
    <MotionTag
      className={cn(className)}
      initial="hidden"
      whileInView="visible"
      viewport={{ once, amount }}
      variants={{
        hidden: { opacity: 1 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren,
            delayChildren
          }
        }
      }}
    >
      {children}
    </MotionTag>
  );
}

export function StaggerItem({ children, className, as = 'div', preset = 'fadeUp' }: StaggerItemProps) {
  const reducedMotion = useReducedMotion();

  if (reducedMotion) {
    const StaticTag = as;
    return <StaticTag className={className}>{children}</StaticTag>;
  }

  const MotionTag = itemMap[as];

  return (
    <MotionTag className={cn(className)} variants={revealVariants[preset]} transition={revealTransitions[preset]}>
      {children}
    </MotionTag>
  );
}
