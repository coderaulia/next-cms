'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { PageEditorForm } from '@/components/forms/PageEditorForm';
import type { LandingPage } from '@/features/cms/types';

function PageEditorScreen({ token }: { token: string }) {
  const params = useParams<{ id: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/admin/pages/${params.id}`, {
        headers: { 'x-admin-token': token }
      });
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { page: LandingPage };
      setPage(payload.page);
      setLoading(false);
    }
    if (params.id) load();
  }, [params.id, token]);

  if (loading) return <p>Loading page editor...</p>;
  if (!page) return <p>Page not found.</p>;

  return <PageEditorForm initialPage={page} adminToken={token} />;
}

export default function AdminPageById() {
  return (
    <AdminShell
      title="Edit Landing Page"
      description="Update sections, structure, color theme, and SEO tags."
    >
      {(token) => <PageEditorScreen token={token} />}
    </AdminShell>
  );
}
