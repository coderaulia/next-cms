import { notFound, redirect } from 'next/navigation';

import { ContactPageView } from '@/components/pages/ContactPageView';
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
  const [page, settings] = await Promise.all([getPublishedPage('contact'), getSiteSettings()]);
  if (!page) notFound();
  if (page.seo.slug && page.seo.slug !== 'contact') {
    redirect(`/${page.seo.slug}`);
  }
  return <ContactPageView page={page} settings={settings} />;
}
