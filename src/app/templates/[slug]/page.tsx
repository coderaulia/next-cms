import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TemplatePreviewShell } from '@/components/pages/TemplatePreviewShell';
import { getTemplate, getAllTemplates } from '@/components/templates/registry';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplate(slug);
  if (!template) return {};
  return {
    title: `${template.name} — Vanaila Templates`,
    description: template.description,
    robots: { index: false }
  };
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { slug } = await params;
  const template = getTemplate(slug);

  if (!template) {
    notFound();
  }

  return <TemplatePreviewShell template={template} />;
}
