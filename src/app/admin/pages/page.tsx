'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { LandingPage } from '@/features/cms/types';

function PagesList({ token }: { token: string }) {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/pages', {
          headers: { 'x-admin-token': token }
        });
        if (!response.ok) {
          setError('Failed to load pages.');
          return;
        }
        const payload = (await response.json()) as { pages: LandingPage[] };
        setPages(payload.pages);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [token]);

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <h2>Landing Pages</h2>
        {pages.map((page) => (
          <article key={page.id} className="section-editor">
            <h3>{page.navLabel}</h3>
            <p className="muted">Slug: /{page.seo.slug || ''}</p>
            <p className="muted">Status: {page.published ? 'Published' : 'Draft'}</p>
            <Link href={`/admin/pages/${page.id}`}>Edit page</Link>
          </article>
        ))}
      </section>
    </div>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminShell
      title="Landing Page Editor"
      description="Edit structure, copy, section layout, theme colors, and SEO fields."
    >
      {(token) => <PagesList token={token} />}
    </AdminShell>
  );
}
