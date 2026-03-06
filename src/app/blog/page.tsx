import { BlogPageView } from '@/components/pages/BlogPageView';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedBlogPosts, getSiteSettings } from '@/features/cms/publicApi';

type BlogListPageProps = {
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
      metaTitle: 'Insights',
      metaDescription: 'Technical leadership, performance optimization, and digital strategy insights.',
      slug: 'blog',
      canonical: '',
      socialImage: settings.defaultOgImage,
      noIndex: false
    },
    'Insights',
    'Technical leadership, performance optimization, and digital strategy insights.'
  );
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const [params, settings, posts] = await Promise.all([
    searchParams,
    getSiteSettings(),
    getPublishedBlogPosts()
  ]);
  const query = params.q ?? '';
  const activeTag = params.tag ?? 'all';
  const page = Number.parseInt(params.page ?? '1', 10);
  const pageSize = Math.max(1, Math.min(settings.reading.postsPerPage, 24));

  return (
    <BlogPageView
      posts={posts}
      query={query}
      activeTag={activeTag}
      page={Number.isNaN(page) ? 1 : page}
      pageSize={pageSize}
    />
  );
}
