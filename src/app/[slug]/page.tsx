import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { PreviewModeBanner } from '@/components/PreviewModeBanner';
import { AboutPageView } from '@/components/pages/AboutPageView';
import { ContactPageView } from '@/components/pages/ContactPageView';
import { PartnershipPageView } from '@/components/pages/PartnershipPageView';
import { ServiceDetailPageView } from '@/components/pages/ServiceDetailPageView';
import { ServicePageView } from '@/components/pages/ServicePageView';
import { isReservedPublicSlug, isServiceDetailPageId } from '@/config/site-profile';
import { buildMetadata } from '@/features/cms/seo';
import {
  getPreviewPageBySlug,
  getPreviewPortfolioProjects,
  getPublishedPageBySlug,
  getPublishedPages,
  getPublishedPortfolioProjects,
  getSiteSettings
} from '@/features/cms/publicApi';

type DynamicPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const pages = await getPublishedPages();
  return pages
    .filter((page) => page.seo.slug.trim().length > 0)
    .map((page) => ({
      slug: page.seo.slug
    }));
}

export async function generateMetadata({ params }: DynamicPageProps) {
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) return {};
  const isPreview = (await draftMode()).isEnabled;
  const [settings, page] = await Promise.all([
    getSiteSettings(),
    isPreview ? getPreviewPageBySlug(slug) : getPublishedPageBySlug(slug)
  ]);
  if (!page) return {};
  return buildMetadata(settings, page.seo, page.title, page.seo.metaDescription);
}

export default async function DynamicLandingPage({ params }: DynamicPageProps) {
  const { slug } = await params;
  if (isReservedPublicSlug(slug)) notFound();
  const isPreview = (await draftMode()).isEnabled;
  const [page, settings] = await Promise.all([
    isPreview ? getPreviewPageBySlug(slug) : getPublishedPageBySlug(slug),
    getSiteSettings()
  ]);
  if (!page) notFound();

  const previewBanner = isPreview ? <PreviewModeBanner path={`/${slug}`} /> : null;

  if (page.id === 'about') {
    return (
      <>
        {previewBanner}
        <AboutPageView page={page} />
      </>
    );
  }
  if (page.id === 'service') {
    return (
      <>
        {previewBanner}
        <ServicePageView page={page} />
      </>
    );
  }
  if (page.id === 'partnership') {
    return (
      <>
        {previewBanner}
        <PartnershipPageView page={page} />
      </>
    );
  }
  if (isServiceDetailPageId(page.id)) {
    const portfolioProjects = await (isPreview
      ? getPreviewPortfolioProjects()
      : getPublishedPortfolioProjects());
    return (
      <>
        {previewBanner}
        <ServiceDetailPageView page={page} portfolioProjects={portfolioProjects} />
      </>
    );
  }
  if (page.id === 'contact') {
    return (
      <>
        {previewBanner}
        <ContactPageView page={page} settings={settings} />
      </>
    );
  }

  return (
    <>
      {previewBanner}
      <MarketingPageRenderer page={page} />
    </>
  );
}
