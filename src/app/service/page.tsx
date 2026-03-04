import { notFound, redirect } from 'next/navigation';

import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('service')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function ServicePage() {
  const page = await getPublishedPage('service');
  if (!page) notFound();
  if (page.seo.slug && page.seo.slug !== 'service') {
    redirect(`/${page.seo.slug}`);
  }
  return <MarketingPageRenderer page={page} />;
}
