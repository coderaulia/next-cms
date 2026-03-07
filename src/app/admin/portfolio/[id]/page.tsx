'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { PortfolioEditorForm } from '@/components/forms/PortfolioEditorForm';
import type { PortfolioProject } from '@/features/cms/types';

function PortfolioEditor() {
  const params = useParams<{ id: string }>();
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
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
    if (params.id) load();
  }, [params.id]);

  if (loading) return <p>Loading project...</p>;
  if (!project) return <p>Portfolio project not found.</p>;

  return <PortfolioEditorForm initialProject={project} />;
}

export default function AdminPortfolioByIdPage() {
  return (
    <AdminShell title="Edit Portfolio Project" description="Update case-study content, SEO, and publication status.">
      {() => <PortfolioEditor />}
    </AdminShell>
  );
}
