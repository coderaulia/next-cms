import { draftMode } from 'next/headers';
import { notFound } from 'next/navigation';

import { PortfolioProjectView } from '@/components/pages/PortfolioProjectView';
import { PreviewModeBanner } from '@/components/PreviewModeBanner';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { buildCanonical, buildMetadata } from '@/features/cms/seo';
import {
  getPreviewPortfolioProjectBySlug,
  getPreviewPortfolioProjects,
  getPublishedPortfolioProjectBySlug,
  getPublishedPortfolioProjects,
  getSiteSettings
} from '@/features/cms/publicApi';

type PortfolioDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const projects = await getPublishedPortfolioProjects();
  return projects.map((project) => ({
    slug: project.seo.slug
  }));
}

export async function generateMetadata({ params }: PortfolioDetailPageProps) {
  const { slug } = await params;
  const isPreview = (await draftMode()).isEnabled;
  const [settings, project] = await Promise.all([
    getSiteSettings(),
    isPreview ? getPreviewPortfolioProjectBySlug(slug) : getPublishedPortfolioProjectBySlug(slug)
  ]);
  if (!project) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(
    settings,
    { ...project.seo, slug: `portfolio/${project.seo.slug}`, keywords: project.seo.keywords ?? project.tags },
    project.title,
    project.summary
  );
}

export default async function PortfolioDetailPage({ params }: PortfolioDetailPageProps) {
  const { slug } = await params;
  const isPreview = (await draftMode()).isEnabled;
  const [settings, project, allProjects] = await Promise.all([
    getSiteSettings(),
    isPreview ? getPreviewPortfolioProjectBySlug(slug) : getPublishedPortfolioProjectBySlug(slug),
    isPreview ? getPreviewPortfolioProjects() : getPublishedPortfolioProjects()
  ]);
  if (!project) notFound();

  const canonical = buildCanonical(settings.baseUrl, `portfolio/${project.seo.slug}`, project.seo.canonical);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: project.title,
    description: project.summary,
    image: project.seo.socialImage || project.coverImage || settings.defaultOgImage,
    url: canonical,
    datePublished: project.publishedAt || project.updatedAt,
    dateModified: project.updatedAt,
    creator: {
      '@type': 'Organization',
      name: settings.organizationName
    },
    keywords: project.tags.join(', ')
  };

  const related = allProjects
    .filter((row) => row.id !== project.id)
    .sort((a, b) => {
      const aScore = a.tags.some((tag) => project.tags.includes(tag)) ? 1 : 0;
      const bScore = b.tags.some((tag) => project.tags.includes(tag)) ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    })
    .slice(0, 3);

  return (
    <>
      {isPreview ? <PreviewModeBanner path={`/portfolio/${slug}`} /> : null}
      <SeoJsonLd data={jsonLd} />
      <PortfolioProjectView project={project} related={related} />
    </>
  );
}
