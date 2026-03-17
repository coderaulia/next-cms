import { notFound } from 'next/navigation';

import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { AboutPageView } from '@/components/pages/AboutPageView';
import { ContactPageView } from '@/components/pages/ContactPageView';
import { PartnershipPageView } from '@/components/pages/PartnershipPageView';
import { ServiceDetailPageView } from '@/components/pages/ServiceDetailPageView';
import { ServicePageView } from '@/components/pages/ServicePageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPageBySlug, getPublishedPortfolioProjects, getSiteSettings } from '@/features/cms/publicApi';

type DynamicPageProps = {
  params: Promise<{ slug: string }>;
};

const reserved = new Set(['admin', 'api', 'blog', 'sitemap.xml', 'robots.txt', 'portfolio']);
const serviceDetailIds = new Set([
  'service-website-development',
  'service-custom-business-tools',
  'service-secure-online-shops',
  'service-mobile-business-app',
  'service-official-business-email'
]);

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
  const [page, settings] = await Promise.all([getPublishedPageBySlug(slug), getSiteSettings()]);
  if (!page) notFound();

  if (page.id === 'about') {
    return <AboutPageView page={page} />;
  }
  if (page.id === 'service') {
    return <ServicePageView page={page} />;
  }
  if (page.id === 'partnership') {
    return <PartnershipPageView page={page} />;
  }
  if (serviceDetailIds.has(page.id)) {
    const portfolioProjects = await getPublishedPortfolioProjects();
    return <ServiceDetailPageView page={page} portfolioProjects={portfolioProjects} />;
  }
  if (page.id === 'contact') {
    return <ContactPageView page={page} settings={settings} />;
  }

  return <MarketingPageRenderer page={page} />;
}
