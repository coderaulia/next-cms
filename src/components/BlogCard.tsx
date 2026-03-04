import Link from 'next/link';

import type { BlogPost } from '@/features/cms/types';

type BlogCardProps = {
  post: BlogPost;
};

export function BlogCard({ post }: BlogCardProps) {
  return (
    <article className="blog-card">
      {post.coverImage ? <img src={post.coverImage} alt={post.title} className="blog-image" /> : null}
      <div className="blog-content">
        <p className="blog-meta">
          {post.author} {post.publishedAt ? `• ${new Date(post.publishedAt).toLocaleDateString()}` : ''}
        </p>
        <h2>
          <Link href={`/blog/${post.seo.slug}`}>{post.title}</Link>
        </h2>
        <p>{post.excerpt}</p>
        {post.tags.length ? <p className="blog-tags">{post.tags.map((tag) => `#${tag}`).join(' ')}</p> : null}
      </div>
    </article>
  );
}
