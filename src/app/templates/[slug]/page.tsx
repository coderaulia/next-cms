import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { TemplatePreviewShell } from '@/components/pages/TemplatePreviewShell';
import { getTemplate, getTemplateMetadata, getAllTemplates } from '@/components/templates/registry';

type Props = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getAllTemplates().map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const template = getTemplateMetadata(slug);
  if (!template) return {};
  return {
    title: `${template.name} — Vanaila Templates`,
    description: template.description,
    robots: { index: false },
  };
}

export default async function TemplatePreviewPage({ params }: Props) {
  const { slug } = await params;
  const entry = getTemplate(slug);

  if (!entry) notFound();

  const { component: Component, ...meta } = entry;

  return (
    <TemplatePreviewShell template={meta}>
      {Component ? <Component /> : null}
    </TemplatePreviewShell>
  );
}
