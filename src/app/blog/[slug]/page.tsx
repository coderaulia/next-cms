import { draftMode } from 'next/headers';
import { notFound, permanentRedirect, redirect } from 'next/navigation';

import { BlogPostView } from '@/components/pages/BlogPostView';
import { PreviewModeBanner } from '@/components/PreviewModeBanner';
import { SeoJsonLd } from '@/components/SeoJsonLd';
import { getRedirectByFromPath } from '@/features/cms/contentStore';
import { buildCanonical, buildMetadata } from '@/features/cms/seo';
import {
  getPreviewBlogPostBySlug,
  getPreviewBlogPosts,
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
  const isPreview = (await draftMode()).isEnabled;
  const [settings, post] = await Promise.all([
    getSiteSettings(),
    isPreview ? getPreviewBlogPostBySlug(slug) : getPublishedBlogPostBySlug(slug)
  ]);
  if (!post) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(
    settings,
    { ...post.seo, slug: `blog/${post.seo.slug}`, keywords: post.seo.keywords ?? post.tags },
    post.title,
    post.excerpt,
    post.coverImage || undefined,
    {
      publishedTime: post.publishedAt || undefined,
      modifiedTime: post.updatedAt,
      authors: post.author ? [post.author] : undefined,
      tags: post.tags.length > 0 ? post.tags : undefined
    }
  );
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const isPreview = (await draftMode()).isEnabled;
  const [settings, post, allPosts] = await Promise.all([
    getSiteSettings(),
    isPreview ? getPreviewBlogPostBySlug(slug) : getPublishedBlogPostBySlug(slug),
    isPreview ? getPreviewBlogPosts() : getPublishedBlogPosts()
  ]);
  if (!post) {
    const r = await getRedirectByFromPath(`/blog/${slug}`);
    if (r) {
      if (r.type === '301' || r.type === '308') permanentRedirect(r.toPath);
      redirect(r.toPath);
    }
    notFound();
  }

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
      {isPreview ? <PreviewModeBanner path={`/blog/${slug}`} /> : null}
      <SeoJsonLd data={jsonLd} />
      <BlogPostView post={post} related={related} />
    </>
  );
}


