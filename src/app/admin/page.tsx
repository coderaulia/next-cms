'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { BlogPost, LandingPage } from '@/features/cms/types';

type DashboardData = {
  pages: LandingPage[];
  blogPosts: BlogPost[];
};

function DashboardPanel() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const [pagesResponse, blogResponse] = await Promise.all([
        fetch('/api/admin/pages'),
        fetch('/api/admin/blog?includeDrafts=1&page=1&pageSize=5')
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
  }, []);

  const metrics = useMemo(() => {
    if (!data) return null;
    const publishedPages = data.pages.filter((page) => page.published).length;
    const publishedPosts = data.blogPosts.filter((post) => post.status === 'published').length;
    const draftPosts = data.blogPosts.filter((post) => post.status === 'draft').length;
    return { publishedPages, publishedPosts, draftPosts };
  }, [data]);

  if (error) return <p className="error">{error}</p>;
  if (!data || !metrics) return <p>Loading dashboard...</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-kpi-grid">
        <article className="admin-card">
          <p className="admin-kpi-label">Published pages</p>
          <p className="admin-kpi-value">
            {metrics.publishedPages}/{data.pages.length}
          </p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">Published posts</p>
          <p className="admin-kpi-value">{metrics.publishedPosts}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">Draft posts</p>
          <p className="admin-kpi-value">{metrics.draftPosts}</p>
        </article>
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Quick actions</h2>
        </div>
        <div className="admin-grid-3">
          <Link href="/admin/pages" className="v2-btn v2-btn-secondary">
            Edit landing pages
          </Link>
          <Link href="/admin/blog" className="v2-btn v2-btn-secondary">
            Manage posts
          </Link>
          <Link href="/admin/categories" className="v2-btn v2-btn-secondary">
            Manage categories
          </Link>
          <Link href="/admin/contact-submissions" className="v2-btn v2-btn-secondary">
            Review leads
          </Link>
          <Link href="/admin/media" className="v2-btn v2-btn-secondary">
            Media library
          </Link>
          <Link href="/admin/blog/new" className="v2-btn v2-btn-primary">
            Create new post
          </Link>
          <Link href="/admin/settings" className="v2-btn v2-btn-secondary">
            Site settings
          </Link>
        </div>
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Recent posts</h2>
          <Link href="/admin/blog">View all</Link>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Title</th>
                <th>Author</th>
                <th>Status</th>
                <th>Updated</th>
              </tr>
            </thead>
            <tbody>
              {data.blogPosts.map((post) => (
                <tr key={post.id}>
                  <td>
                    <strong>{post.title}</strong>
                    <span className="admin-subtle">/blog/{post.seo.slug}</span>
                  </td>
                  <td>{post.author}</td>
                  <td>
                    <span
                      className={`admin-chip ${
                        post.status === 'published' ? 'admin-chip-success' : 'admin-chip-muted'
                      }`}
                    >
                      {post.status}
                    </span>
                  </td>
                  <td>{new Date(post.updatedAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function AdminDashboardPage() {
  return (
    <AdminShell title="Dashboard" description="Architectural dashboard and content control center.">
      {() => <DashboardPanel />}
    </AdminShell>
  );
}
