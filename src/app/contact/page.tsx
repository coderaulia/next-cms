import { notFound } from 'next/navigation';

import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('contact')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function ContactPage() {
  const page = await getPublishedPage('contact');
  if (!page) notFound();
  return <MarketingPageRenderer page={page} />;
}
