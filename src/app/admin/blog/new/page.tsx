'use client';

import dynamic from 'next/dynamic';
import { useCallback, useEffect, useRef, useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { BlogPost } from '@/features/cms/types';
import { AdminLoading } from '@/components/admin/AdminLoading';

const BlogEditorForm = dynamic(
  () => import('@/components/forms/BlogEditorForm').then((module) => module.BlogEditorForm),
  {
    loading: () => <AdminLoading label="Loading post editor..." />
  }
);

type CreateBlogPostProps = {
  user: AdminSessionUser;
};

function CreateBlogPost({ user }: CreateBlogPostProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [error, setError] = useState('');
  const startedRef = useRef(false);

  const canEdit = user.permissions.includes('content:edit');

  const createDraft = useCallback(async () => {
    setError('');
    const response = await csrfFetch('/api/admin/blog', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Untitled post',
        excerpt: '',
        content: '',
        author: user.displayName || 'Admin',
        tags: [],
        coverImage: '',
        status: 'draft',
        seo: {
          metaTitle: 'Untitled post',
          metaDescription: '',
          slug: 'untitled-post',
          canonical: '',
          socialImage: '',
          noIndex: false,
          keywords: []
        }
      })
    });
    if (!response.ok) {
      setError('Failed to create draft post');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
  }, [user.displayName]);

  useEffect(() => {
    if (!canEdit || startedRef.current) return;
    startedRef.current = true;
    void createDraft();
  }, [canEdit, createDraft]);

  if (!canEdit) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role cannot create or edit blog posts.</p>
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

  if (!post) {
    return <AdminLoading label="Preparing your new post..." />;
  }

  return (
    <BlogEditorForm
      initialPost={post}
      isNew
      canPublish={user.permissions.includes('content:publish')}
      canDelete={user.permissions.includes('content:delete')}
      currentUser={user}
    />
  );
}

export default function AdminBlogCreatePage() {
  return (
    <AdminShell title="New Post" description="A draft is created automatically — complete content and SEO fields, then publish.">
      {(user) => <CreateBlogPost user={user} />}
    </AdminShell>
  );
}
