'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { PageEditorForm } from '@/components/forms/PageEditorForm';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { LandingPage } from '@/features/cms/types';

type PageEditorScreenProps = {
  user: AdminSessionUser;
};

function PageEditorScreen({ user }: PageEditorScreenProps) {
  const params = useParams<{ id: string }>();
  const [page, setPage] = useState<LandingPage | null>(null);
  const [loading, setLoading] = useState(true);
  const canEditContent = user.permissions.includes('content:edit');

  useEffect(() => {
    if (!canEditContent) {
      setLoading(false);
      return;
    }

    async function load() {
      const response = await fetch(`/api/admin/pages/${params.id}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { page: LandingPage };
      setPage(payload.page);
      setLoading(false);
    }
    if (params.id) void load();
  }, [canEditContent, params.id]);

  if (!canEditContent) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role can view reporting data but cannot edit pages.</p>
      </section>
    );
  }
  if (loading) return <p>Loading page editor...</p>;
  if (!page) return <p>Page not found.</p>;

  return <PageEditorForm initialPage={page} canPublish={user.permissions.includes('content:publish')} />;
}

export default function AdminPageById() {
  return (
    <AdminShell
      title="Edit Landing Page"
      description="Update SEO and content. Homepage supports typed block composition."
    >
      {(user) => <PageEditorScreen user={user} />}
    </AdminShell>
  );
}
