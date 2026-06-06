import type { Metadata } from 'next';

import { AtelierPageView } from '@/components/pages/AtelierPageView';

export const metadata: Metadata = {
  title: 'Vanaila Atelier — Design Studio',
  description:
    'Vanaila Atelier is a boutique design studio creating brand identities, digital experiences, and visual systems for brands that want to be remembered.',
  openGraph: {
    title: 'Vanaila Atelier — Design Studio',
    description:
      'Brand identity, web experience, UI design, creative direction, motion, and print — crafted with uncommon care.',
  },
};

export default function AtelierPage() {
  return <AtelierPageView />;
}
