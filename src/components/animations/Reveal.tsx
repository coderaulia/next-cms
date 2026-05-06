'use client';

import { createElement, useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react';

import { cn } from '@/lib/utils';

import { revealViewport, type RevealPreset } from './presets';

type RevealTag = 'div' | 'section' | 'article' | 'li' | 'span';

type RevealProps = {
  children: ReactNode;
  className?: string;
  preset?: RevealPreset;
  delay?: number;
  once?: boolean;
  amount?: number;
  as?: RevealTag;
  id?: string;
  style?: CSSProperties;
};

const presetClassNames: Record<RevealPreset, string> = {
  fadeUp: 'reveal-motion-fade-up',
  fadeIn: 'reveal-motion-fade-in',
  scaleInSoft: 'reveal-motion-scale-in-soft'
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
      className: cn('reveal-motion', presetClassNames[preset], isVisible && 'is-visible', className),
      id,
      ref: (node: HTMLElement | null) => {
        nodeRef.current = node;
      },
      style: { ...style, '--reveal-delay': `${delay}s` } as CSSProperties
    },
    children
  );
}
