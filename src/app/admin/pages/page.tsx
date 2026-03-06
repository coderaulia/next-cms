'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { LandingPage } from '@/features/cms/types';

function PagesList() {
  const [pages, setPages] = useState<LandingPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const response = await fetch('/api/admin/pages');
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
  }, []);

  if (loading) return <p>Loading pages...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="admin-card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>Page</th>
              <th>Slug</th>
              <th>Status</th>
              <th>Updated</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {pages.map((page) => (
              <tr key={page.id}>
                <td>
                  <strong>{page.navLabel}</strong>
                  <span className="admin-subtle">{page.title}</span>
                </td>
                <td>/{page.seo.slug || ''}</td>
                <td>
                  <span className={`admin-chip ${page.published ? 'admin-chip-success' : 'admin-chip-warning'}`}>
                    {page.published ? 'published' : 'draft'}
                  </span>
                </td>
                <td>{new Date(page.updatedAt).toLocaleDateString()}</td>
                <td>
                  <Link href={`/admin/pages/${page.id}`}>Edit</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminPagesPage() {
  return (
    <AdminShell
      title="Pages"
      description="Manage landing pages and homepage block composition."
    >
      {() => <PagesList />}
    </AdminShell>
  );
}
