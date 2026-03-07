'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { BlogPost, Category } from '@/features/cms/types';

type BlogEditorFormProps = {
  initialPost: BlogPost;
  isNew?: boolean;
};

type CategoriesResponse = {
  categories: Category[];
};

export function BlogEditorForm({ initialPost, isNew = false }: BlogEditorFormProps) {
  const [post, setPost] = useState(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/admin/categories')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload) return;
        setCategories((payload as CategoriesResponse).categories);
      });
  }, []);

  const selectedCategories = useMemo(() => new Set(post.tags), [post.tags]);

  const toggleCategory = (slug: string) => {
    const next = new Set(selectedCategories);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    setPost({ ...post, tags: Array.from(next) });
  };

  const savePost = async () => {
    setSaving(true);
    setNotice('');
    const response = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(post)
    });
    setSaving(false);
    if (!response.ok) {
      setNotice('Failed to save post');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
    setNotice('Post saved');
    if (isNew) {
      router.replace(`/admin/blog/${payload.post.id}`);
    }
  };

  const publish = async () => {
    const response = await fetch(`/api/admin/blog/${post.id}/publish`, {
      method: 'POST'
    });
    if (!response.ok) {
      setNotice('Failed to publish');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
    setNotice('Post published');
  };

  const unpublish = async () => {
    const response = await fetch(`/api/admin/blog/${post.id}/unpublish`, {
      method: 'POST'
    });
    if (!response.ok) {
      setNotice('Failed to unpublish');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
    setNotice('Post moved to draft');
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    const response = await fetch(`/api/admin/blog/${post.id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      setNotice('Failed to delete');
      return;
    }
    router.replace('/admin/blog');
    router.refresh();
  };

  return (
    <div className="admin-form-wrap">
      <div className="admin-card">
        <h2>Content</h2>
        <label>
          Title
          <input
            value={post.title}
            onChange={(event) => setPost({ ...post, title: event.target.value })}
          />
        </label>
        <label>
          Excerpt
          <textarea
            value={post.excerpt}
            onChange={(event) => setPost({ ...post, excerpt: event.target.value })}
          />
        </label>
        <label>
          Content
          <textarea
            value={post.content}
            onChange={(event) => setPost({ ...post, content: event.target.value })}
            rows={14}
          />
        </label>
        <label>
          Author
          <input
            value={post.author}
            onChange={(event) => setPost({ ...post, author: event.target.value })}
          />
        </label>
        <div>
          <p className="admin-kpi-label">Categories</p>
          <div className="admin-actions" style={{ flexWrap: 'wrap' }}>
            {categories.map((category) => {
              const active = selectedCategories.has(category.slug);
              return (
                <button
                  key={category.id}
                  type="button"
                  className={active ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-secondary'}
                  onClick={() => toggleCategory(category.slug)}
                >
                  {category.name}
                </button>
              );
            })}
          </div>
        </div>
        <label>
          Category slugs (comma separated)
          <input
            value={post.tags.join(', ')}
            onChange={(event) =>
              setPost({
                ...post,
                tags: event.target.value
                  .split(',')
                  .map((item) => item.trim().toLowerCase())
                  .filter(Boolean)
              })
            }
          />
        </label>
        <label>
          Cover image URL
          <input
            value={post.coverImage}
            onChange={(event) => setPost({ ...post, coverImage: event.target.value })}
          />
        </label>
      </div>

      <div className="admin-card">
        <h2>SEO</h2>
        <label>
          Meta title
          <input
            value={post.seo.metaTitle}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, metaTitle: event.target.value }
              })
            }
          />
        </label>
        <label>
          Meta description
          <textarea
            value={post.seo.metaDescription}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, metaDescription: event.target.value }
              })
            }
          />
        </label>
        <label>
          Slug
          <input
            value={post.seo.slug}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, slug: event.target.value }
              })
            }
          />
        </label>
        <label>
          Canonical URL
          <input
            value={post.seo.canonical}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, canonical: event.target.value }
              })
            }
          />
        </label>
        <label>
          Social image URL
          <input
            value={post.seo.socialImage}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, socialImage: event.target.value }
              })
            }
          />
        </label>
        <label>
          Keywords (comma separated)
          <input
            value={(post.seo.keywords ?? []).join(', ')}
            onChange={(event) =>
              setPost({
                ...post,
                seo: {
                  ...post.seo,
                  keywords: event.target.value
                    .split(',')
                    .map((item) => item.trim().toLowerCase())
                    .filter(Boolean)
                }
              })
            }
          />
        </label>
        <label>
          Noindex
          <input
            type="checkbox"
            checked={post.seo.noIndex}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, noIndex: event.target.checked }
              })
            }
          />
        </label>
      </div>

      <div className="admin-actions">
        <button type="button" onClick={savePost} disabled={saving}>
          {saving ? 'Saving...' : 'Save post'}
        </button>
        {post.status === 'draft' ? (
          <button type="button" onClick={publish}>
            Publish
          </button>
        ) : (
          <button type="button" onClick={unpublish}>
            Unpublish
          </button>
        )}
        <button type="button" onClick={deletePost}>
          Delete
        </button>
      </div>
      {notice ? <p>{notice}</p> : null}
    </div>
  );
}

