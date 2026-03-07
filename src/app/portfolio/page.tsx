import { PortfolioPageView } from '@/components/pages/PortfolioPageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedPortfolioProjects, getSiteSettings } from '@/features/cms/publicApi';

type PortfolioListPageProps = {
  searchParams: Promise<{
    q?: string;
    tag?: string;
    page?: string;
  }>;
};

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildMetadata(
    settings,
    {
      metaTitle: 'Portfolio | Case Studies, Web Development, and Digital Infrastructure Results',
      metaDescription:
        'Explore Vanaila Digital portfolio case studies across websites, automation systems, ecommerce, and mobile solutions.',
      slug: 'portfolio',
      canonical: '',
      socialImage: settings.defaultOgImage,
      noIndex: false,
      keywords: ['portfolio case study', 'web development portfolio', 'digital agency projects']
    },
    'Portfolio | Case Studies, Web Development, and Digital Infrastructure Results',
    'Explore Vanaila Digital portfolio case studies across websites, automation systems, ecommerce, and mobile solutions.'
  );
}

export default async function PortfolioListPage({ searchParams }: PortfolioListPageProps) {
  const [params, settings, projects] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getPublishedPortfolioProjects()
  ]);

  const query = params.q ?? '';
  const activeTag = params.tag ?? 'all';
  const page = Number.parseInt(params.page ?? '1', 10);
  const pageSize = Math.max(1, Math.min(settings.reading.postsPerPage, 24));

  return (
    <PortfolioPageView
      projects={projects}
      query={query}
      activeTag={activeTag}
      page={Number.isNaN(page) ? 1 : page}
      pageSize={pageSize}
    />
  );
}
