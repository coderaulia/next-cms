'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { BlogEditorForm } from '@/components/forms/BlogEditorForm';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { BlogPost } from '@/features/cms/types';

type BlogEditorProps = {
  user: AdminSessionUser;
};

function BlogEditor({ user }: BlogEditorProps) {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);
  const canEditContent = user.permissions.includes('content:edit');

  useEffect(() => {
    if (!canEditContent) {
      setLoading(false);
      return;
    }

    async function load() {
      const response = await fetch(`/api/admin/blog/${params.id}`);
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { post: BlogPost };
      setPost(payload.post);
      setLoading(false);
    }
    if (params.id) void load();
  }, [canEditContent, params.id]);

  if (!canEditContent) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role can view dashboard data but cannot edit blog content.</p>
      </section>
    );
  }
  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  return (
    <BlogEditorForm
      initialPost={post}
      canPublish={user.permissions.includes('content:publish')}
      canDelete={user.permissions.includes('content:delete')}
    />
  );
}

export default function AdminBlogByIdPage() {
  return (
    <AdminShell title="Edit Post" description="Update content, SEO, and publication status.">
      {(user) => <BlogEditor user={user} />}
    </AdminShell>
  );
}
