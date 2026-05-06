import { notFound, redirect } from 'next/navigation';

import { VanailaRedesignHome } from '@/components/home/VanailaRedesignHome';
import { MarketingPageRenderer } from '@/components/MarketingPageRenderer';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPage, getPublishedPortfolioProjects, getSiteSettings } from '@/features/cms/publicApi';

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
  const [settings, homePage, projects] = await Promise.all([
    getSiteSettings(),
    getPublishedPage('home'),
    getPublishedPortfolioProjects()
  ]);

  if (settings.reading.homepageDisplay === 'latest_posts') {
    redirect('/blog');
  }

  if (settings.reading.homepagePageId && settings.reading.homepagePageId !== 'home') {
    const targetPage = await getPublishedPage(settings.reading.homepagePageId);
    if (targetPage) {
      redirect(targetPage.seo.slug ? `/${targetPage.seo.slug}` : '/');
    }
  }

  if (!homePage) notFound();
  if (homePage.homeBlocks && homePage.homeBlocks.length > 0) {
    return <VanailaRedesignHome page={homePage} projects={projects} />;
  }
  return <MarketingPageRenderer page={homePage} />;
}
