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
      metaTitle: `Insights | ${settings.siteName}`,
      metaDescription: 'Technical leadership, performance optimization, and digital strategy insights.',
      slug: 'blog',
      canonical: '',
      socialImage: settings.defaultOgImage,
      noIndex: false
    },
    `Insights | ${settings.siteName}`,
    'Technical leadership, performance optimization, and digital strategy insights.'
  );
}

export default async function BlogListPage({ searchParams }: BlogListPageProps) {
  const [params, posts] = await Promise.all([searchParams, getPublishedBlogPosts()]);
  const query = params.q ?? '';
  const activeTag = params.tag ?? 'all';
  const page = Number.parseInt(params.page ?? '1', 10);

  return (
    <BlogPageView
      posts={posts}
      query={query}
      activeTag={activeTag}
      page={Number.isNaN(page) ? 1 : page}
    />
  );
}
