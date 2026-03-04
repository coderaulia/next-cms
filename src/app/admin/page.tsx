'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { BlogPost, LandingPage } from '@/features/cms/types';

type DashboardData = {
  pages: LandingPage[];
  blogPosts: BlogPost[];
};

function DashboardPanel({ token }: { token: string }) {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [pagesResponse, blogResponse] = await Promise.all([
        fetch('/api/admin/pages', { headers: { 'x-admin-token': token } }),
        fetch('/api/admin/blog?includeDrafts=1', { headers: { 'x-admin-token': token } })
      ]);
      if (!pagesResponse.ok || !blogResponse.ok) {
        setError('Failed to load dashboard.');
        return;
      }
      const pagesPayload = (await pagesResponse.json()) as { pages: LandingPage[] };
      const blogPayload = (await blogResponse.json()) as { posts: BlogPost[] };
      setData({ pages: pagesPayload.pages, blogPosts: blogPayload.posts });
    }
    load();
  }, [token]);

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!data) {
    return <p>Loading dashboard...</p>;
  }

  const publishedPages = data.pages.filter((page) => page.published).length;
  const publishedPosts = data.blogPosts.filter((post) => post.status === 'published').length;
  const draftPosts = data.blogPosts.filter((post) => post.status === 'draft').length;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <h2>Content Snapshot</h2>
        <p>
          Pages published: {publishedPages}/{data.pages.length}
        </p>
        <p>Blog posts published: {publishedPosts}</p>
        <p>Blog drafts: {draftPosts}</p>
      </section>
      <section className="admin-card">
        <h2>Actions</h2>
        <p>
          <Link href="/admin/pages">Edit landing pages</Link>
        </p>
        <p>
          <Link href="/admin/blog">Manage blog posts</Link>
        </p>
        <p>
          <Link href="/admin/blog/new">Create new blog post</Link>
        </p>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell
      title="CMS Admin"
      description="Manage landing pages, blog workflow, and SEO fields."
    >
      {(token) => <DashboardPanel token={token} />}
    </AdminShell>
  );
}
