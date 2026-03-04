import { notFound } from 'next/navigation';

import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPageBySlug, getSiteSettings } from '@/features/cms/publicApi';

type DynamicPageProps = {
  params: Promise<{ slug: string }>;
};

const reserved = new Set(['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt']);

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params;
  if (reserved.has(slug)) return {};
  const [settings, page] = await Promise.all([getSiteSettings(), getPublishedPageBySlug(slug)]);
  if (!page) return {};
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function DynamicLandingPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  if (reserved.has(slug)) notFound();
  const page = await getPublishedPageBySlug(slug);
  if (!page) notFound();
  return <MarketingPageRenderer page={page} />;
}
