import type { Metadata } from 'next';

import { PsikotestPageView } from '@/components/pages/PsikotestPageView';

export const metadata: Metadata = {
  title: 'Psikotest — Assessment Delivery, Scoring & Interpretation',
  description:
    'Online assessment infrastructure for HR teams and licensed psychologists. Run DISC, IQ, Big 5, Workload, and custom assessments with bilingual delivery and reviewer-written interpretations.',
  openGraph: {
    title: 'Psikotest — Assessment Delivery, Scoring & Interpretation',
    description:
      'Online assessment infrastructure for HR teams and licensed psychologists. Run DISC, IQ, Big 5, Workload, and custom assessments with bilingual delivery and reviewer-written interpretations.',
  },
};

export default function PsikotestPage() {
  return <PsikotestPageView />;
}
