import { notFound } from 'next/navigation';

import { BlogPostView } from '@/components/pages/BlogPostView';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { buildCanonical, buildMetadata } from '@/features/cms/seo';
import {
  getPublishedBlogPostBySlug,
  getPublishedBlogPosts,
  getSiteSettings
} from '@/features/cms/publicApi';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateStaticParams() {
  const posts = await getPublishedBlogPosts();
  return posts.map((post) => ({
    slug: post.seo.slug
  }));
}

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSiteSettings(), getPublishedBlogPostBySlug(slug)]);
  if (!post) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(
    settings,
    { ...post.seo, slug: `blog/${post.seo.slug}`, keywords: post.seo.keywords ?? post.tags },
    post.title,
    post.excerpt
  );
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [settings, post, allPosts] = await Promise.all([
    getSiteSettings(),
    getPublishedBlogPostBySlug(slug),
    getPublishedBlogPosts()
  ]);
  if (!post) notFound();

  const canonical = buildCanonical(settings.baseUrl, `blog/${post.seo.slug}`, post.seo.canonical);
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: post.seo.socialImage || post.coverImage || settings.defaultOgImage,
    author: {
      '@type': 'Person',
      name: post.author
    },
    publisher: {
      '@type': 'Organization',
      name: settings.organizationName,
      logo: {
        '@type': 'ImageObject',
        url: settings.organizationLogo
      }
    },
    mainEntityOfPage: canonical,
    datePublished: post.publishedAt || post.updatedAt,
    dateModified: post.updatedAt
  };

  const related = allPosts
    .filter((row) => row.id !== post.id)
    .sort((a, b) => {
      const aScore = a.tags.some((tag) => post.tags.includes(tag)) ? 1 : 0;
      const bScore = b.tags.some((tag) => post.tags.includes(tag)) ? 1 : 0;
      if (aScore !== bScore) return bScore - aScore;
      return a.updatedAt < b.updatedAt ? 1 : -1;
    })
    .slice(0, 3);

  return (
    <>
      <SeoJsonLd data={jsonLd} />
      <BlogPostView post={post} related={related} />
    </>
  );
}



