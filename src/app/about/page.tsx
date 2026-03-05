import { notFound, redirect } from 'next/navigation';

import { AboutPageView } from '@/components/pages/AboutPageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('about')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function AboutPage() {
  const page = await getPublishedPage('about');
  if (!page) notFound();
  if (page.seo.slug && page.seo.slug !== 'about') {
    redirect(`/${page.seo.slug}`);
  }
  return <AboutPageView page={page} />;
}
