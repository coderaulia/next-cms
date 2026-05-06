'use client';

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { revealViewport, type RevealPreset } from './presets';

type GroupTag = 'div' | 'section' | 'ul';
type ItemTag = 'div' | 'article' | 'li';

type StaggerGroupProps = {
  children: ReactNode;
  className?: string;
  as?: GroupTag;
  staggerChildren?: number;
  delayChildren?: number;
  once?: boolean;
  amount?: number;
};

type StaggerItemProps = {
  children: ReactNode;
  className?: string;
  as?: ItemTag;
  preset?: RevealPreset;
};

const presetClassNames: Record<RevealPreset, string> = {
  fadeUp: 'reveal-motion-fade-up',
  fadeIn: 'reveal-motion-fade-in',
  scaleInSoft: 'reveal-motion-scale-in-soft'
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
  const nodeRef = useRef<HTMLElement | null>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const node = nodeRef.current;
    if (!node) return undefined;

    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return undefined;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        const nextVisible = Boolean(entry?.isIntersecting);
        setIsVisible(nextVisible);
        if (nextVisible && once) {
          observer.disconnect();
        }
      },
      { threshold: amount }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [amount, once]);

  return createElement(
    as,
    {
      className: cn('reveal-stagger', isVisible && 'is-visible', className),
      ref: (node: HTMLElement | null) => {
        nodeRef.current = node;
      },
      style: {
        '--stagger-delay': `${delayChildren}s`,
        '--stagger-step': `${staggerChildren}s`
      } as CSSProperties
    },
    children
  );
}

export function StaggerItem({ children, className, as = 'div', preset = 'fadeUp' }: StaggerItemProps) {
  return createElement(
    as,
    {
      className: cn('reveal-motion', 'reveal-stagger-item', presetClassNames[preset], className)
    },
    children
  );
}
