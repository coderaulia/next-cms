'use client';

import { useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { PortfolioEditorForm } from '@/components/forms/PortfolioEditorForm';
import type { PortfolioProject } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

function CreatePortfolioProject() {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const createDraft = async () => {
    setPending(true);
    setError('');

    const response = await csrfFetch('/api/admin/portfolio', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Untitled project',
        summary: '',
        challenge: '',
        solution: '',
        outcome: '',
        clientName: '',
        serviceType: '',
        industry: '',
        projectUrl: '',
        coverImage: '',
        gallery: [],
        tags: [],
        featured: false,
        status: 'draft',
        sortOrder: 0,
        seo: {
          metaTitle: 'Untitled project',
          metaDescription: '',
          slug: 'untitled-project',
          canonical: '',
          socialImage: '',
          noIndex: false,
          keywords: []
        }
      })
    });

    setPending(false);

    if (!response.ok) {
      setError('Failed to create draft portfolio project');
      return;
    }

    const payload = (await response.json()) as { project: PortfolioProject };
    setProject(payload.project);
  };

  if (!project) {
    return (
      <section className="admin-card">
        <p>Create a draft portfolio project, then edit and publish it.</p>
        <button type="button" onClick={createDraft} disabled={pending}>
          {pending ? 'Creating...' : 'Create draft'}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </section>
    );
  }

  return <PortfolioEditorForm initialProject={project} isNew />;
}

export default function AdminPortfolioCreatePage() {
  return (
    <AdminShell title="New Portfolio Project" description="Create a draft, then complete content and SEO fields.">
      {() => <CreatePortfolioProject />}
    </AdminShell>
  );
}
