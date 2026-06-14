import { notFound, redirect } from 'next/navigation';

import { ContactPageView } from '@/components/pages/ContactPageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

type ContactPageProps = {
  searchParams?: Promise<{ interest?: string; template?: string }>;
};

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('contact')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function ContactPage({ searchParams }: ContactPageProps) {
  const [page, settings, params] = await Promise.all([
    getPublishedPage('contact'),
    getSiteSettings(),
    searchParams
  ]);
  if (!page) notFound();
  if (page.seo.slug && page.seo.slug !== 'contact') {
    redirect(`/${page.seo.slug}`);
  }
  let initialInterest: string | undefined;
  let initialOverview: string | undefined;

  if (params?.interest === 'partnership') {
    initialInterest = 'Partnership / Referral';
  } else if (params?.interest === 'template') {
    initialInterest = 'Website Development';
    const templateName = typeof params.template === 'string'
      ? params.template.slice(0, 120).replace(/[<>"']/g, '')
      : null;
    if (templateName) {
      initialOverview = `Hi, I'm interested in the "${templateName}" template. I'd love to build a website using this design.`;
    }
  }

  return (
    <ContactPageView
      page={page}
      settings={settings}
      initialInterest={initialInterest}
      initialOverview={initialOverview}
    />
  );
}
