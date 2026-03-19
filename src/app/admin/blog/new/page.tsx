'use client';

import { useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import { BlogEditorForm } from '@/components/forms/BlogEditorForm';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { BlogPost } from '@/features/cms/types';

type CreateBlogPostProps = {
  user: AdminSessionUser;
};

function CreateBlogPost({ user }: CreateBlogPostProps) {
  const [post, setPost] = useState<BlogPost | null>(null);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  if (!user.permissions.includes('content:edit')) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role cannot create or edit blog posts.</p>
      </section>
    );
  }

  const createDraft = async () => {
    setPending(true);
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
        author: 'Admin',
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
    setPending(false);
    if (!response.ok) {
      setError('Failed to create draft post');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
  };

  if (!post) {
    return (
      <section className="admin-card">
        <p>Create a draft post, then edit and publish it.</p>
        <button type="button" onClick={createDraft} disabled={pending}>
          {pending ? 'Creating...' : 'Create draft'}
        </button>
        {error ? <p className="error">{error}</p> : null}
      </section>
    );
  }

  return (
    <BlogEditorForm
      initialPost={post}
      isNew
      canPublish={user.permissions.includes('content:publish')}
      canDelete={user.permissions.includes('content:delete')}
    />
  );
}

export default function AdminBlogCreatePage() {
  return (
    <AdminShell title="New Post" description="Create a draft, then complete content and SEO fields.">
      {(user) => <CreateBlogPost user={user} />}
    </AdminShell>
  );
}
