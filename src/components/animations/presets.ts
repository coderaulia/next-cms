import type { Transition, Variants } from 'framer-motion';

export type RevealPreset = 'fadeUp' | 'fadeIn' | 'scaleInSoft';

const easeOut = [0.22, 1, 0.36, 1] as const;

export const revealVariants: Record<RevealPreset, Variants> = {
  fadeUp: {
    hidden: { opacity: 0, y: 24 },
    visible: { opacity: 1, y: 0 }
  },
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  },
  scaleInSoft: {
    hidden: { opacity: 0, scale: 0.96 },
    visible: { opacity: 1, scale: 1 }
  }
};

export const revealTransitions: Record<RevealPreset, Transition> = {
  fadeUp: { duration: 0.45, ease: easeOut },
  fadeIn: { duration: 0.35, ease: easeOut },
  scaleInSoft: { duration: 0.4, ease: easeOut }
};

export const revealViewport = {
  once: true,
  amount: 0.2
} as const;
