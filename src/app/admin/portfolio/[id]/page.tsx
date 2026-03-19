'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { PortfolioEditorForm } from '@/components/forms/PortfolioEditorForm';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { PortfolioProject } from '@/features/cms/types';

type PortfolioEditorProps = {
  user: AdminSessionUser;
};

function PortfolioEditor({ user }: PortfolioEditorProps) {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);
  const canEditContent = user.permissions.includes('content:edit');

  useEffect(() => {
    if (!canEditContent) {
      setLoading(false);
      return;
    }

    async function load() {
      const response = await fetch(`/api/admin/portfolio/${params.id}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { project: PortfolioProject };
      setProject(payload.project);
      setLoading(false);
    }
    if (params.id) void load();
  }, [canEditContent, params.id]);

  if (!canEditContent) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role can view reporting data but cannot edit portfolio projects.</p>
      </section>
    );
  }
  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Portfolio project not found.</p>;

  return (
    <PortfolioEditorForm
      initialProject={project}
      canPublish={user.permissions.includes('content:publish')}
      canDelete={user.permissions.includes('content:delete')}
    />
  );
}

export default function AdminPortfolioByIdPage() {
  return (
    <AdminShell title="Edit Portfolio Project" description="Update case-study content, SEO, and publication status.">
      {(user) => <PortfolioEditor user={user} />}
    </AdminShell>
  );
}
