
'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { BlogPost, Category } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type BlogEditorFormProps = {
  initialPost: BlogPost;
  isNew?: boolean;
};

type CategoriesResponse = {
  categories: Category[];
};

function normalizePreviewHref(post: BlogPost) {
  const slug = post.seo.slug.trim();
  if (!slug) return '/blog';
  return `/blog/${slug.replace(/^\/+/, '')}`;
}

function toKeywordInput(items: string[] | undefined) {
  return (items ?? []).join(', ');
}

function fromKeywordInput(value: string) {
  return value
    .split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean);
}

function countWords(value: string) {
  return value
    .split(/\s+/)
    .map((item) => item.trim())
    .filter(Boolean).length;
}

export function BlogEditorForm({ initialPost, isNew = false }: BlogEditorFormProps) {
  const [post, setPost] = useState(initialPost);
  const [baseline, setBaseline] = useState(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const router = useRouter();

  useEffect(() => {
    setPost(initialPost);
    setBaseline(initialPost);
  }, [initialPost]);

  useEffect(() => {
    csrfFetch('/api/admin/categories')
      .then((response) => (response.ok ? response.json() : null))
      .then((payload) => {
        if (!payload) return;
        setCategories((payload as CategoriesResponse).categories);
      });
  }, []);

  const selectedCategories = useMemo(() => new Set(post.tags), [post.tags]);
  const isDirty = useMemo(() => JSON.stringify(post) !== JSON.stringify(baseline), [post, baseline]);
  const previewHref = normalizePreviewHref(post);

  const toggleCategory = (slug: string) => {
    const next = new Set(selectedCategories);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    setPost({ ...post, tags: Array.from(next) });
  };

  const savePost = useCallback(async () => {
    setSaving(true);
    setNotice('');
    const response = await csrfFetch(`/api/admin/blog/${post.id}`, {
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
    setBaseline(payload.post);
    setNotice('Post saved');

    if (isNew) {
      router.replace(`/admin/blog/${payload.post.id}`);
    }
  }, [isNew, post, router]);

  const publish = async () => {
    const response = await csrfFetch(`/api/admin/blog/${post.id}/publish`, {
      method: 'POST'
    });
    if (!response.ok) {
      setNotice('Failed to publish');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
    setBaseline(payload.post);
    setNotice('Post published');
  };

  const unpublish = async () => {
    const response = await csrfFetch(`/api/admin/blog/${post.id}/unpublish`, {
      method: 'POST'
    });
    if (!response.ok) {
      setNotice('Failed to unpublish');
      return;
    }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post);
    setBaseline(payload.post);
    setNotice('Post moved to draft');
  };

  const deletePost = async () => {
    if (!confirm('Delete this post?')) return;
    const response = await csrfFetch(`/api/admin/blog/${post.id}`, {
      method: 'DELETE'
    });
    if (!response.ok) {
      setNotice('Failed to delete');
      return;
    }
    router.replace('/admin/blog');
    router.refresh();
  };

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      if (!saving) {
        void savePost();
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [savePost, saving]);

  return (
    <div className="admin-form-wrap">
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <h2>{post.title || 'Untitled post'}</h2>
            <p className="admin-subtle">
              Ctrl/Cmd + S to save. Status: {post.status}. {countWords(post.content)} words.
            </p>
          </div>
          <div className="admin-actions">
            <span className={`admin-chip ${isDirty ? 'admin-chip-warning' : 'admin-chip-success'}`}>
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
            <a className="v2-btn v2-btn-secondary" href={previewHref} target="_blank" rel="noreferrer">
              Preview post
            </a>
            <button type="button" disabled={!isDirty || saving} onClick={() => setPost(baseline)}>
              Discard
            </button>
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
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
      </section>

      <section className="admin-card">
        <h2>Content</h2>
        <label>
          Title
          <input value={post.title} onChange={(event) => setPost({ ...post, title: event.target.value })} />
        </label>
        <label>
          Excerpt
          <textarea value={post.excerpt} onChange={(event) => setPost({ ...post, excerpt: event.target.value })} />
        </label>
        <label>
          Content
          <textarea
            value={post.content}
            onChange={(event) => setPost({ ...post, content: event.target.value })}
            rows={14}
          />
          <span className="admin-subtle">Word count: {countWords(post.content)}</span>
        </label>
        <label>
          Author
          <input value={post.author} onChange={(event) => setPost({ ...post, author: event.target.value })} />
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
                tags: fromKeywordInput(event.target.value)
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
      </section>

      <section className="admin-card">
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
          <span className="admin-subtle">{post.seo.metaTitle.length}/60 recommended</span>
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
          <span className="admin-subtle">{post.seo.metaDescription.length}/160 recommended</span>
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
            value={toKeywordInput(post.seo.keywords)}
            onChange={(event) =>
              setPost({
                ...post,
                seo: {
                  ...post.seo,
                  keywords: fromKeywordInput(event.target.value)
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
      </section>
    </div>
  );
}




