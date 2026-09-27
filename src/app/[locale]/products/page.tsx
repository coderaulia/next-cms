import type { Metadata } from 'next';

import { ProductsPageView } from '@/components/pages/ProductsPageView';

export const metadata: Metadata = {
  title: 'Products — VanailaChat, Psikotest, HR Suite, Flowraze & MuzikPlayer | Vanaila Digital',
  description:
    'Five products built and operated by Vanaila Digital. Privacy-first AI workstation with VanailaChat, assessment delivery with Psikotest, performance management with HR Suite, CRM with Flowraze, and bit-perfect desktop audio with MuzikPlayer.',
  openGraph: {
    title: 'Products — VanailaChat, Psikotest, HR Suite, Flowraze & MuzikPlayer | Vanaila Digital',
    description:
      'Five products built and operated by Vanaila Digital. Privacy-first AI workstation with VanailaChat, assessment delivery with Psikotest, performance management with HR Suite, CRM with Flowraze, and bit-perfect desktop audio with MuzikPlayer.',
  },
};

export default function ProductsPage() {
  return <ProductsPageView />;
}
