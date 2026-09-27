import type { Metadata } from 'next';

import { AtelierPageView } from '@/components/pages/AtelierPageView';

export const metadata: Metadata = {
  title: 'Vanaila Studio — In-Browser Document & Creator Suite',
  description:
    'Documents, CVs, image and PDF conversions, OCR, and social content — all running in your browser with 100% client-side privacy. Zero uploads, no accounts needed.',
  openGraph: {
    title: 'Vanaila Studio — In-Browser Document & Creator Suite',
    description:
      'Documents, CVs, image and PDF conversions, OCR, and social content — all running in your browser with 100% client-side privacy.',
  },
};

export default function AtelierPage() {
  return <AtelierPageView />;
}
