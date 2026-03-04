'use client';

import { useParams } from 'next/navigation';
import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { BlogEditorForm } from '@/components/forms/BlogEditorForm';
import type { BlogPost } from '@/features/cms/types';

function BlogEditor({ token }: { token: string }) {
  const params = useParams<{ id: string }>();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const response = await fetch(`/api/admin/blog/${params.id}`, {
        headers: { 'x-admin-token': token }
      });
      if (!response.ok) {
        setLoading(false);
        return;
      }
      const payload = (await response.json()) as { post: BlogPost };
      setPost(payload.post);
      setLoading(false);
    }
    if (params.id) load();
  }, [params.id, token]);

  if (loading) return <p>Loading post...</p>;
  if (!post) return <p>Post not found.</p>;

  return <BlogEditorForm initialPost={post} adminToken={token} />;
}

export default function AdminBlogByIdPage() {
  return (
    <AdminShell title="Edit Post" description="Update content, SEO, and publication status.">
      {(token) => <BlogEditor token={token} />}
    </AdminShell>
  );
}
