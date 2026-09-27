import type { Metadata } from 'next';

import { PsikotestPageView } from '@/components/pages/PsikotestPageView';

export const metadata: Metadata = {
  title: 'Psikotest — The Complete Psychometric Hiring & Talent Assessment Platform',
  description:
    'Deploy 21 pre-built psychometric tests (DISC, IQ, Kraepelin) or import custom CSV instruments. Screen candidates on an interactive ATS Kanban pipeline, save 80% on admin time, and generate SIPP-compliant branded PDF reports.',
  openGraph: {
    title: 'Psikotest — The Complete Psychometric Hiring & Talent Assessment Platform',
    description:
      'Deploy 21 pre-built psychometric tests (DISC, IQ, Kraepelin) or import custom CSV instruments. Screen candidates on an interactive ATS Kanban pipeline, save 80% on admin time, and generate SIPP-compliant branded PDF reports.',
  },
};

export default function PsikotestPage() {
  return <PsikotestPageView />;
}
