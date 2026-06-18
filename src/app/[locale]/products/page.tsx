import type { Metadata } from 'next';

import { ProductsPageView } from '@/components/pages/ProductsPageView';

export const metadata: Metadata = {
  title: 'Products — Psikotest, HR Suite & Flowraze | Vanaila Digital',
  description:
    'Three SaaS products built for growing Indonesian businesses. Assessment delivery with Psikotest, performance management with HR Suite, and revenue growth with Flowraze.',
  openGraph: {
    title: 'Products — Psikotest, HR Suite & Flowraze | Vanaila Digital',
    description:
      'Three SaaS products built for growing Indonesian businesses. Assessment delivery with Psikotest, performance management with HR Suite, and revenue growth with Flowraze.',
  },
};

export default function ProductsPage() {
  return <ProductsPageView />;
}
