'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { PortfolioProject } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

const PortfolioEditorForm = dynamic(
  () => import('@/components/forms/PortfolioEditorForm').then((module) => module.PortfolioEditorForm),
  {
    loading: () => <AdminLoading label="Loading project editor..." />
  }
);

type CreatePortfolioProjectProps = {
  user: AdminSessionUser;
};

function CreatePortfolioProject({ user }: CreatePortfolioProjectProps) {
  const [project, setProject] = useState<PortfolioProject | null>(null);
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const canEdit = user.permissions.includes('content:edit');

  const createDraft = useCallback(async () => {
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

    if (!response.ok) {
      setError('Failed to create draft portfolio project');
      return;
    }

    const payload = (await response.json()) as { project: PortfolioProject };
    setProject(payload.project);
  }, []);

  useEffect(() => {
    if (!canEdit || startedRef.current) return;
    startedRef.current = true;
    void createDraft();
  }, [canEdit, createDraft]);

  if (!canEdit) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role cannot create or edit portfolio projects.</p>
      </section>
    );
  }

  if (error) {
    return (
      <section className="admin-card">
        <p className="error">{error}</p>
        <button type="button" className="v2-btn v2-btn-secondary" onClick={() => void createDraft()}>
          Try again
        </button>
      </section>
    );
  }

  if (!project) {
    return <AdminLoading label="Preparing your new project..." />;
  }

  return (
    <PortfolioEditorForm
      initialProject={project}
      isNew
      canPublish={user.permissions.includes('content:publish')}
      canDelete={user.permissions.includes('content:delete')}
    />
  );
}

export default function AdminPortfolioCreatePage() {
  return (
    <AdminShell title="New Portfolio Project" description="A draft is created automatically — complete content and SEO fields, then publish.">
      {(user) => <CreatePortfolioProject user={user} />}
    </AdminShell>
  );
}
