import type { Metadata } from 'next';

import { LmsPageView } from '@/components/pages/LmsPageView';

export const metadata: Metadata = {
  title: 'Vanaila LMS — Online Learning & Academy Platform',
  description:
    'Next-generation LMS for educators, training providers, and corporate academies. Deliver self-paced video courses, track student progression in real time, and award verifiable credentials.',
  openGraph: {
    title: 'Vanaila LMS — Online Learning & Academy Platform',
    description:
      'Next-generation LMS for educators, training providers, and corporate academies. Deliver self-paced video courses, track student progression in real time, and award verifiable credentials.',
  },
};

export default function LmsPage() {
  return <LmsPageView />;
}
