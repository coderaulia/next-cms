'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { BlogPost } from '@/features/cms/types';

function BlogList({ token }: { token: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/blog?includeDrafts=1', {
          headers: { 'x-admin-token': token }
        });
        if (!response.ok) {
          setError('Failed to load posts.');
          return;
        }
        const payload = (await response.json()) as { posts: BlogPost[] };
        setPosts(payload.posts);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <p>Loading posts...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Blog Posts</h2>
          <Link href="/admin/blog/new">Create new post</Link>
        </div>
        {posts.length === 0 ? <p>No posts created yet.</p> : null}
        {posts.map((post) => (
          <article key={post.id} className="section-editor">
            <h3>{post.title}</h3>
            <p className="muted">
              /blog/{post.seo.slug} • {post.status}
            </p>
            <Link href={`/admin/blog/${post.id}`}>Edit post</Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function AdminBlogPage() {
  return (
    <AdminShell title="Blog Manager" description="Create, edit, publish, or unpublish blog posts.">
      {(token) => <BlogList token={token} />}
    </AdminShell>
  );
}
