import { notFound } from 'next/navigation';

import { HomeBlockRenderer } from '@/components/home/HomeBlockRenderer';
import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getSiteSettings } from '@/features/cms/publicApi';

export async function generateMetadata() {
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPage('home')]);
  if (!page) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function HomePage() {
  const page = await getPublishedPage('home');
  if (!page) notFound();
  if (page.homeBlocks && page.homeBlocks.length > 0) {
    return <HomeBlockRenderer page={page} />;
  }
  return <MarketingPageRenderer page={page} />;
}
