'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

import type { BlogPost, Category } from '@/features/cms/types';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { formatSavedAtLabel, toFieldErrorMap, validateBlogEditor } from '@/features/cms/editorValidation';
import { getBlogPostPublicationLabel } from '@/features/cms/publicationState';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { ContentRevisionPanel } from '@/components/admin/ContentRevisionPanel';
import { MediaPickerField } from '@/components/admin/MediaPickerField';

type BlogEditorFormProps = {
  initialPost: BlogPost;
  isNew?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
};

type CategoriesResponse = {
  categories: Category[];
};

type SaveMode = 'manual' | 'autosave';

type AutoSaveState = 'idle' | 'scheduled' | 'saving' | 'blocked';

const AUTO_SAVE_DELAY_MS = 30_000;

function normalizePreviewHref(post: BlogPost) {
  const slug = post.seo.slug.trim();
  if (!slug) return '/blog';
  return `/blog/${slug.replace(/^\/+/, '')}`;
}

function previewModeHref(path: string) {
  return `/api/admin/preview?action=enable&path=${encodeURIComponent(path)}`;
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

export function BlogEditorForm({
  initialPost,
  isNew = false,
  canPublish = true,
  canDelete = true
}: BlogEditorFormProps) {
  const [post, setPost] = useState(initialPost);
  const [baseline, setBaseline] = useState(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialPost.updatedAt ?? null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);
  const router = useRouter();

  useEffect(() => {
    setPost(initialPost);
    setBaseline(initialPost);
    setLastSavedAt(initialPost.updatedAt ?? null);
    setAutoSaveState('idle');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
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
  const previewModePath = previewModeHref(previewHref);
  const publicationLabel = getBlogPostPublicationLabel(post);
  const validationIssues = useMemo(() => validateBlogEditor(post), [post]);
  const fieldErrors = useMemo(() => toFieldErrorMap(validationIssues), [validationIssues]);
  const canSave = validationIssues.length === 0;
  const canDeleteConfirm = deleteConfirmText.trim().toUpperCase() === 'DELETE';

  const toggleCategory = (slug: string) => {
    const next = new Set(selectedCategories);
    if (next.has(slug)) {
      next.delete(slug);
    } else {
      next.add(slug);
    }

    setPost({ ...post, tags: Array.from(next) });
  };

  const savePost = useCallback(
    async (mode: SaveMode = 'manual') => {
      if (!canSave) {
        if (mode === 'manual') {
          setNotice(`Fix ${validationIssues.length} validation issue(s) before saving.`);
        }
        setAutoSaveState('blocked');
        return false;
      }

      if (!isDirty && mode === 'autosave') {
        setAutoSaveState('idle');
        return true;
      }

      setSaving(true);
      if (mode === 'autosave') {
        setAutoSaveState('saving');
      }
      setNotice('');

      const response = await csrfFetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-cms-save-mode': mode
        },
        body: JSON.stringify(post)
      });
      setSaving(false);

      if (!response.ok) {
        setNotice('Failed to save post');
        if (mode === 'autosave') {
          setAutoSaveState('blocked');
        }
        return false;
      }

      const payload = (await response.json()) as { post: BlogPost };
      setPost(payload.post);
      setBaseline(payload.post);
      setLastSavedAt(payload.post.updatedAt);
      setAutoSaveState('idle');

      if (mode === 'manual') {
        setNotice('Post saved');
        setRevisionReloadKey((current) => current + 1);
      }

      if (isNew) {
        router.replace(`/admin/blog/${payload.post.id}`);
      }

      return true;
    },
    [canSave, isDirty, isNew, post, router, validationIssues.length]
  );

  const publish = async () => {
    if (!canSave) {
      setNotice('Resolve validation issues before publishing.');
      return;
    }

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
    setLastSavedAt(payload.post.updatedAt);
    setNotice('Post published');
    setRevisionReloadKey((current) => current + 1);
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
    setLastSavedAt(payload.post.updatedAt);
    setNotice('Post moved to draft');
    setRevisionReloadKey((current) => current + 1);
  };

  const deletePost = async () => {
    if (!canDeleteConfirm) {
      setNotice('Type DELETE to confirm permanent deletion.');
      return;
    }

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
        void savePost('manual');
      }
    };

    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [savePost, saving]);

  useEffect(() => {
    if (!isDirty) {
      setAutoSaveState('idle');
      return;
    }

    if (!canSave) {
      setAutoSaveState('blocked');
      return;
    }

    setAutoSaveState('scheduled');
    const timer = window.setTimeout(() => {
      if (!saving) {
        void savePost('autosave');
      }
    }, AUTO_SAVE_DELAY_MS);

    return () => window.clearTimeout(timer);
  }, [canSave, isDirty, savePost, saving]);

  return (
    <div className="admin-form-wrap">
      <section className="admin-card admin-editor-toolbar">
        <div className="admin-inline-header">
          <div>
            <h2>{post.title || 'Untitled post'}</h2>
            <p className="admin-subtle">
              Ctrl/Cmd + S to save. Status: {publicationLabel}. {countWords(post.content)} words. {formatSavedAtLabel(lastSavedAt)}.
            </p>
            <p className="admin-subtle">
              Autosave: {autoSaveState === 'blocked' ? 'blocked by validation' : autoSaveState}
            </p>
          </div>
          <div className="admin-actions">
            <span className={`admin-chip ${isDirty ? 'admin-chip-warning' : 'admin-chip-success'}`}>
              {isDirty ? 'Unsaved changes' : 'Saved'}
            </span>
            {!canSave ? <span className="admin-chip admin-chip-warning">Validation required</span> : null}
            <AdminActionButton href={previewModePath} icon="visibility" rel="noreferrer" target="_blank" variant="secondary">
              Open preview
            </AdminActionButton>
            <AdminActionButton icon="sync_alt" variant="ghost" disabled={!isDirty || saving} onClick={() => setPost(baseline)}>
              Reset edits
            </AdminActionButton>
            <AdminActionButton icon="save" variant="primary" onClick={() => void savePost('manual')} disabled={saving || !canSave}>
              {saving ? 'Saving...' : 'Save post'}
            </AdminActionButton>
            {canPublish ? (
              post.status === 'draft' ? (
                <AdminActionButton icon="publish" variant="primary" onClick={publish} disabled={!canSave}>
                  Publish now
                </AdminActionButton>
              ) : (
                <AdminActionButton icon="schedule" variant="secondary" onClick={unpublish}>
                  Move to draft
                </AdminActionButton>
              )
            ) : (
              <span className="admin-chip admin-chip-muted">No publish access</span>
            )}
            {canDelete ? (
              <AdminActionButton
                icon={showDeleteConfirm ? 'close' : 'delete'}
                variant="danger"
                onClick={() => {
                  setShowDeleteConfirm((current) => !current);
                  setDeleteConfirmText('');
                }}
              >
                {showDeleteConfirm ? 'Cancel delete' : 'Delete post'}
              </AdminActionButton>
            ) : null}
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
        {validationIssues.length > 0 ? (
          <p className="admin-error-text">{validationIssues[0].message}</p>
        ) : null}
        <p className="admin-subtle">Draft preview opens the current saved version in preview mode. Save first if you changed the slug or content.</p>
      </section>

      <ContentRevisionPanel<BlogPost>
        entityType="blog_post"
        entityId={post.id}
        reloadKey={revisionReloadKey}
        emptyMessage="Manual saves and publishing changes for this post will appear here."
        onRestore={(restoredPost) => {
          setPost(restoredPost);
          setBaseline(restoredPost);
          setLastSavedAt(restoredPost.updatedAt ?? null);
          setNotice('Post restored from revision history.');
          setAutoSaveState('idle');
        }}
      />

      {showDeleteConfirm ? (
        <section className="admin-card admin-danger-card">
          <h3>Confirm deletion</h3>
          <p className="admin-subtle">Type DELETE to permanently remove this post.</p>
          <div className="admin-actions">
            <input
              value={deleteConfirmText}
              onChange={(event) => setDeleteConfirmText(event.target.value)}
              placeholder="Type DELETE"
            />
            <AdminActionButton icon="delete" variant="danger" disabled={!canDeleteConfirm} onClick={deletePost}>
              Permanently delete post
            </AdminActionButton>
          </div>
        </section>
      ) : null}

      <section className="admin-card">
        <h2>Content</h2>
        <label>
          Title
          <input
            className={fieldErrors.title ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors.title)}
            value={post.title}
            onChange={(event) => setPost({ ...post, title: event.target.value })}
          />
          {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
        </label>
        <label>
          Excerpt
          <textarea value={post.excerpt} onChange={(event) => setPost({ ...post, excerpt: event.target.value })} />
        </label>
        <label>
          Content
          <textarea
            className={fieldErrors.content ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors.content)}
            value={post.content}
            onChange={(event) => setPost({ ...post, content: event.target.value })}
            rows={14}
          />
          <span className="admin-subtle">Word count: {countWords(post.content)}</span>
          {fieldErrors.content ? <span className="admin-error-text">{fieldErrors.content}</span> : null}
        </label>
        <label>
          Author
          <input
            className={fieldErrors.author ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors.author)}
            value={post.author}
            onChange={(event) => setPost({ ...post, author: event.target.value })}
          />
          {fieldErrors.author ? <span className="admin-error-text">{fieldErrors.author}</span> : null}
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
        <MediaPickerField
          label="Cover image"
          value={post.coverImage}
          onChange={(value) => setPost({ ...post, coverImage: value })}
          helperText="Pick an uploaded file or paste an external image URL."
          aspectRatioHint="16:9 for blog cards and post hero sections."
        />
      </section>

      <section className="admin-card">
        <h2>Publishing</h2>
        <div className="admin-grid-2">
          <label>
            Scheduled publish time
            <input
              className={fieldErrors.scheduledPublishAt ? 'admin-input-error' : ''}
              aria-invalid={Boolean(fieldErrors.scheduledPublishAt)}
              type="datetime-local"
              value={toDatetimeLocalValue(post.scheduledPublishAt)}
              disabled={!canPublish}
              onChange={(event) =>
                setPost({
                  ...post,
                  scheduledPublishAt: fromDatetimeLocalValue(event.target.value)
                })
              }
            />
            {fieldErrors.scheduledPublishAt ? (
              <span className="admin-error-text">{fieldErrors.scheduledPublishAt}</span>
            ) : (
              <span className="admin-subtle">Leave blank to control publishing manually.</span>
            )}
          </label>
          <label>
            Scheduled unpublish time
            <input
              className={fieldErrors.scheduledUnpublishAt ? 'admin-input-error' : ''}
              aria-invalid={Boolean(fieldErrors.scheduledUnpublishAt)}
              type="datetime-local"
              value={toDatetimeLocalValue(post.scheduledUnpublishAt)}
              disabled={!canPublish}
              onChange={(event) =>
                setPost({
                  ...post,
                  scheduledUnpublishAt: fromDatetimeLocalValue(event.target.value)
                })
              }
            />
            {fieldErrors.scheduledUnpublishAt ? (
              <span className="admin-error-text">{fieldErrors.scheduledUnpublishAt}</span>
            ) : (
              <span className="admin-subtle">Useful for time-limited announcements or campaign pages.</span>
            )}
          </label>
        </div>
        {!canPublish ? <p className="admin-subtle">Your role can edit content but cannot change publishing timing.</p> : null}
      </section>

      <section className="admin-card">
        <h2>SEO</h2>
        <label>
          Meta title
          <input
            className={fieldErrors['seo.metaTitle'] ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors['seo.metaTitle'])}
            value={post.seo.metaTitle}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, metaTitle: event.target.value }
              })
            }
          />
          <span className="admin-subtle">{post.seo.metaTitle.length}/60 recommended</span>
          {fieldErrors['seo.metaTitle'] ? <span className="admin-error-text">{fieldErrors['seo.metaTitle']}</span> : null}
        </label>
        <label>
          Meta description
          <textarea
            className={fieldErrors['seo.metaDescription'] ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors['seo.metaDescription'])}
            value={post.seo.metaDescription}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, metaDescription: event.target.value }
              })
            }
          />
          <span className="admin-subtle">{post.seo.metaDescription.length}/160 recommended</span>
          {fieldErrors['seo.metaDescription'] ? (
            <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span>
          ) : null}
        </label>
        <label>
          Slug
          <input
            className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
            aria-invalid={Boolean(fieldErrors['seo.slug'])}
            value={post.seo.slug}
            onChange={(event) =>
              setPost({
                ...post,
                seo: { ...post.seo, slug: event.target.value }
              })
            }
          />
          {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
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
        <MediaPickerField
          label="Social image"
          value={post.seo.socialImage}
          onChange={(value) =>
            setPost({
              ...post,
              seo: { ...post.seo, socialImage: value }
            })
          }
          helperText="Optional Open Graph/Twitter image for social sharing."
          aspectRatioHint="1200x630 (1.91:1) for Open Graph and X cards."
        />
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
