import type { Metadata } from 'next';

import { TemplatesPageView } from '@/components/pages/TemplatesPageView';
import { getAllTemplateMetadata } from '@/components/templates/registry';

export const metadata: Metadata = {
  title: 'Templates — Vanaila Atelier',
  description:
    'Production-ready website templates built on the Vanaila design system. Design-first, fully editable, engineered for speed.',
  openGraph: {
    title: 'Templates — Vanaila Atelier',
    description:
      'Production-ready website templates built on the Vanaila design system. Design-first, fully editable, engineered for speed.',
  },
};

export default function TemplatesPage() {
  const templates = getAllTemplateMetadata();
  return <TemplatesPageView templates={templates} />;
}
