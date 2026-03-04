import { notFound } from 'next/navigation';

import { SeoJsonLd } from '@/components/SeoJsonLd';
import { buildCanonical, buildMetadata } from '@/features/cms/seo';
import { getPublishedBlogPostBySlug, getSiteSettings } from '@/features/cms/publicApi';

type BlogDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSiteSettings(), getPublishedBlogPostBySlug(slug)]);
  if (!post) {
    return {
      title: 'Not found'
    };
  }
  return buildMetadata(settings, post.seo, post.title, post.excerpt);
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { slug } = await params;
  const [settings, post] = await Promise.all([getSiteSettings(), getPublishedBlogPostBySlug(slug)]);
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

  return (
    <main className="blog-detail">
      <div className="container">
        <SeoJsonLd data={jsonLd} />
        <p className="blog-meta">
          {post.author} {post.publishedAt ? `• ${new Date(post.publishedAt).toLocaleDateString()}` : ''}
        </p>
        <h1>{post.title}</h1>
        <p>{post.excerpt}</p>
        {post.coverImage ? <img src={post.coverImage} alt={post.title} /> : null}
        <article className="prose">
          <pre>{post.content}</pre>
        </article>
      </div>
    </main>
  );
}
