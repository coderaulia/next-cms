import { BlogCard } from '@/components/BlogCard';
import { buildMetadata } from '@/features/cms/seo';
import { getPublishedBlogPosts, getSiteSettings } from '@/features/cms/publicApi';

export async function generateMetadata() {
  const settings = await getSiteSettings();
  return buildMetadata(
    settings,
    {
      metaTitle: `Blog | ${settings.siteName}`,
      metaDescription: 'Latest articles and updates from our editorial team.',
      slug: 'blog',
      canonical: '',
      socialImage: settings.defaultOgImage,
      noIndex: false
    },
    `Blog | ${settings.siteName}`,
    'Latest articles and updates from our editorial team.'
  );
}

export default async function BlogListPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="blog-page">
      <div className="container">
        <h1>Blog</h1>
        <p className="muted">Manage draft/publish flow from the admin panel.</p>
        {posts.length === 0 ? (
          <p>No published posts yet.</p>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <BlogCard key={post.id} post={post} />
            ))}
          </div>
        )}
      </div>
    </main>
  );
}
