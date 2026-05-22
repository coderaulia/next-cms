'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import dynamic from 'next/dynamic';

import type { BlogPost, Category, SiteSettings } from '@/features/cms/types';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { fromDatetimeLocalValue, toDatetimeLocalValue } from '@/features/cms/editorSchedule';
import { formatSavedAtLabel, toFieldErrorMap, validateBlogEditor } from '@/features/cms/editorValidation';
import { getBlogPostPublicationLabel } from '@/features/cms/publicationState';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { ContentRevisionPanel } from '@/components/admin/ContentRevisionPanel';
import { MediaPickerField } from '@/components/admin/MediaPickerField';

const RichContentEditor = dynamic(
  () => import('@/components/admin/RichContentEditor').then((m) => m.RichContentEditor),
  { ssr: false, loading: () => <textarea rows={14} placeholder="Loading editor..." readOnly /> }
);

type BlogEditorFormProps = {
  initialPost: BlogPost;
  isNew?: boolean;
  canPublish?: boolean;
  canDelete?: boolean;
  currentUser?: AdminSessionUser;
};

type CategoriesResponse = { categories: Category[] };
type SettingsResponse = { settings: SiteSettings };
type SaveMode = 'manual' | 'autosave';
type AutoSaveState = 'idle' | 'scheduled' | 'saving' | 'blocked';

const AUTO_SAVE_DELAY_MS = 30_000;

function normalizeSlug(title: string) {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

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
  canDelete = true,
  currentUser
}: BlogEditorFormProps) {
  const [post, setPost] = useState(initialPost);
  const [baseline, setBaseline] = useState(initialPost);
  const [categories, setCategories] = useState<Category[]>([]);
  const [globalOgImage, setGlobalOgImage] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState('');
  const [lastSavedAt, setLastSavedAt] = useState<string | null>(initialPost.updatedAt ?? null);
  const [autoSaveState, setAutoSaveState] = useState<AutoSaveState>('idle');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState('');
  const [revisionReloadKey, setRevisionReloadKey] = useState(0);
  // Track if slug was manually edited; lock auto-generation for existing posts
  const [slugTouched, setSlugTouched] = useState(!isNew);
  const router = useRouter();

  useEffect(() => {
    setPost(initialPost);
    setBaseline(initialPost);
    setLastSavedAt(initialPost.updatedAt ?? null);
    setAutoSaveState('idle');
    setShowDeleteConfirm(false);
    setDeleteConfirmText('');
    setSlugTouched(!isNew);
  }, [initialPost, isNew]);

  useEffect(() => {
    csrfFetch('/api/admin/categories')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (payload) setCategories((payload as CategoriesResponse).categories);
      });
    csrfFetch('/api/admin/settings')
      .then((r) => (r.ok ? r.json() : null))
      .then((payload) => {
        if (payload) setGlobalOgImage((payload as SettingsResponse).settings.seo.defaultOgImage ?? '');
      })
      .catch(() => {});
  }, []);

  const isDirty = useMemo(() => JSON.stringify(post) !== JSON.stringify(baseline), [post, baseline]);
  const previewHref = normalizePreviewHref(post);
  const previewModePath = previewModeHref(previewHref);
  const publicationLabel = getBlogPostPublicationLabel(post);
  const validationIssues = useMemo(() => validateBlogEditor(post), [post]);
  const fieldErrors = useMemo(() => toFieldErrorMap(validationIssues), [validationIssues]);
  const canSave = validationIssues.length === 0;
  const canDeleteConfirm = deleteConfirmText.trim().toUpperCase() === 'DELETE';

  const effectiveSocialImage = post.seo.socialImage || post.coverImage || globalOgImage;

  const handleTitleChange = (title: string) => {
    const next: BlogPost = { ...post, title };
    if (!slugTouched) {
      next.seo = { ...post.seo, slug: normalizeSlug(title) };
    }
    setPost(next);
  };

  const handleSlugChange = (slug: string) => {
    setSlugTouched(true);
    setPost({ ...post, seo: { ...post.seo, slug } });
  };

  const toggleTag = (slug: string) => {
    const next = new Set(post.tags);
    if (next.has(slug)) next.delete(slug);
    else next.add(slug);
    setPost({ ...post, tags: Array.from(next) });
  };

  const savePost = useCallback(
    async (mode: SaveMode = 'manual') => {
      if (!canSave) {
        if (mode === 'manual') setNotice(`Fix ${validationIssues.length} validation issue(s) before saving.`);
        setAutoSaveState('blocked');
        return false;
      }

      if (!isDirty && mode === 'autosave') {
        setAutoSaveState('idle');
        return true;
      }

      setSaving(true);
      if (mode === 'autosave') setAutoSaveState('saving');
      setNotice('');

      const response = await csrfFetch(`/api/admin/blog/${post.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'x-cms-save-mode': mode },
        body: JSON.stringify(post)
      });
      setSaving(false);

      if (!response.ok) {
        setNotice('Failed to save post');
        if (mode === 'autosave') setAutoSaveState('blocked');
        return false;
      }

      const payload = (await response.json()) as { post: BlogPost };
      setPost(payload.post);
      setBaseline(payload.post);
      setLastSavedAt(payload.post.updatedAt);
      setAutoSaveState('idle');
      if (mode === 'manual') {
        setNotice('Post saved');
        setRevisionReloadKey((c) => c + 1);
      }
      if (isNew) router.replace(`/admin/blog/${payload.post.id}`);
      return true;
    },
    [canSave, isDirty, isNew, post, router, validationIssues.length]
  );

  const publish = async () => {
    if (!canSave) { setNotice('Resolve validation issues before publishing.'); return; }
    const response = await csrfFetch(`/api/admin/blog/${post.id}/publish`, { method: 'POST' });
    if (!response.ok) { setNotice('Failed to publish'); return; }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post); setBaseline(payload.post); setLastSavedAt(payload.post.updatedAt);
    setNotice('Post published'); setRevisionReloadKey((c) => c + 1);
  };

  const unpublish = async () => {
    const response = await csrfFetch(`/api/admin/blog/${post.id}/unpublish`, { method: 'POST' });
    if (!response.ok) { setNotice('Failed to unpublish'); return; }
    const payload = (await response.json()) as { post: BlogPost };
    setPost(payload.post); setBaseline(payload.post); setLastSavedAt(payload.post.updatedAt);
    setNotice('Post moved to draft'); setRevisionReloadKey((c) => c + 1);
  };

  const deletePost = async () => {
    if (!canDeleteConfirm) { setNotice('Type DELETE to confirm permanent deletion.'); return; }
    const response = await csrfFetch(`/api/admin/blog/${post.id}`, { method: 'DELETE' });
    if (!response.ok) { setNotice('Failed to delete'); return; }
    router.replace('/admin/blog'); router.refresh();
  };

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty) return;
      event.preventDefault(); event.returnValue = '';
    };
    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty]);

  useEffect(() => {
    const onKeydown = (event: KeyboardEvent) => {
      const isSaveShortcut = (event.ctrlKey || event.metaKey) && event.key.toLowerCase() === 's';
      if (!isSaveShortcut) return;
      event.preventDefault();
      if (!saving) void savePost('manual');
    };
    window.addEventListener('keydown', onKeydown);
    return () => window.removeEventListener('keydown', onKeydown);
  }, [savePost, saving]);

  useEffect(() => {
    if (!isDirty) { setAutoSaveState('idle'); return; }
    if (!canSave) { setAutoSaveState('blocked'); return; }
    setAutoSaveState('scheduled');
    const timer = window.setTimeout(() => { if (!saving) void savePost('autosave'); }, AUTO_SAVE_DELAY_MS);
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
                <AdminActionButton icon="publish" variant="primary" onClick={publish} disabled={!canSave}>Publish now</AdminActionButton>
              ) : (
                <AdminActionButton icon="schedule" variant="secondary" onClick={unpublish}>Move to draft</AdminActionButton>
              )
            ) : (
              <span className="admin-chip admin-chip-muted">No publish access</span>
            )}
            {canDelete ? (
              <AdminActionButton
                icon={showDeleteConfirm ? 'close' : 'delete'}
                variant="danger"
                onClick={() => { setShowDeleteConfirm((c) => !c); setDeleteConfirmText(''); }}
              >
                {showDeleteConfirm ? 'Cancel delete' : 'Delete post'}
              </AdminActionButton>
            ) : null}
          </div>
        </div>
        {notice ? <p className="admin-subtle">{notice}</p> : null}
        {validationIssues.length > 0 ? <p className="admin-error-text">{validationIssues[0].message}</p> : null}
        <p className="admin-subtle">Draft preview opens the current saved version in preview mode. Save first if you changed the slug or content.</p>
      </section>

      <ContentRevisionPanel<BlogPost>
        entityType="blog_post"
        entityId={post.id}
        reloadKey={revisionReloadKey}
        emptyMessage="Manual saves and publishing changes for this post will appear here."
        onRestore={(restoredPost) => {
          setPost(restoredPost); setBaseline(restoredPost);
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
            <input value={deleteConfirmText} onChange={(e) => setDeleteConfirmText(e.target.value)} placeholder="Type DELETE" />
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
            onChange={(e) => handleTitleChange(e.target.value)}
          />
          {fieldErrors.title ? <span className="admin-error-text">{fieldErrors.title}</span> : null}
        </label>
        <label>
          Excerpt
          <textarea value={post.excerpt} onChange={(e) => setPost({ ...post, excerpt: e.target.value })} />
        </label>
        <div>
          <label style={{ marginBottom: 6 }}>Content</label>
          <RichContentEditor
            value={post.content}
            onChange={(value) => setPost({ ...post, content: value })}
            hasError={Boolean(fieldErrors.content)}
            rows={14}
          />
          <span className="admin-subtle">Word count: {countWords(post.content)}</span>
          {fieldErrors.content ? <span className="admin-error-text">{fieldErrors.content}</span> : null}
        </div>
        <label>
          Author
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <input
              className={fieldErrors.author ? 'admin-input-error' : ''}
              aria-invalid={Boolean(fieldErrors.author)}
              value={post.author}
              onChange={(e) => setPost({ ...post, author: e.target.value })}
              style={{ flex: 1 }}
            />
            {currentUser && currentUser.displayName && currentUser.displayName !== post.author ? (
              <button
                type="button"
                className="slug-lock-btn"
                onClick={() => setPost({ ...post, author: currentUser.displayName })}
                title={`Use ${currentUser.displayName}`}
              >
                Use my name
              </button>
            ) : null}
          </div>
          {fieldErrors.author ? <span className="admin-error-text">{fieldErrors.author}</span> : null}
        </label>
        <label>
          Primary Category
          <select value={post.categoryId || ''} onChange={(e) => setPost({ ...post, categoryId: e.target.value || null })}>
            <option value="">Uncategorized</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </label>
        <div>
          <p className="admin-kpi-label">Tags (Quick Select)</p>
          <div className="admin-actions" style={{ flexWrap: 'wrap' }}>
            {categories.map((cat) => {
              const active = post.tags.includes(cat.slug);
              return (
                <button
                  key={cat.id}
                  type="button"
                  className={active ? 'v2-btn v2-btn-primary' : 'v2-btn v2-btn-secondary'}
                  onClick={() => toggleTag(cat.slug)}
                >
                  {cat.name}
                </button>
              );
            })}
          </div>
        </div>
        <label>
          Tags (comma separated)
          <input
            value={post.tags.join(', ')}
            onChange={(e) => setPost({ ...post, tags: fromKeywordInput(e.target.value) })}
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
              onChange={(e) => setPost({ ...post, scheduledPublishAt: fromDatetimeLocalValue(e.target.value) })}
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
              onChange={(e) => setPost({ ...post, scheduledUnpublishAt: fromDatetimeLocalValue(e.target.value) })}
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
            onChange={(e) => setPost({ ...post, seo: { ...post.seo, metaTitle: e.target.value } })}
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
            onChange={(e) => setPost({ ...post, seo: { ...post.seo, metaDescription: e.target.value } })}
          />
          <span className="admin-subtle">{post.seo.metaDescription.length}/160 recommended</span>
          {fieldErrors['seo.metaDescription'] ? <span className="admin-error-text">{fieldErrors['seo.metaDescription']}</span> : null}
        </label>
        <label>
          Slug
          <div className="slug-field-row">
            <input
              className={fieldErrors['seo.slug'] ? 'admin-input-error' : ''}
              aria-invalid={Boolean(fieldErrors['seo.slug'])}
              value={post.seo.slug}
              onChange={(e) => handleSlugChange(e.target.value)}
            />
            {!slugTouched ? (
              <span className="slug-lock-btn" style={{ cursor: 'default', background: '#eef5ff', borderColor: '#93c5fd', color: '#1d4ed8' }}>
                Auto
              </span>
            ) : isNew ? (
              <button
                type="button"
                className="slug-lock-btn"
                onClick={() => { setSlugTouched(false); setPost({ ...post, seo: { ...post.seo, slug: normalizeSlug(post.title) } }); }}
                title="Re-enable auto-generation from title"
              >
                Reset to auto
              </button>
            ) : null}
          </div>
          {fieldErrors['seo.slug'] ? <span className="admin-error-text">{fieldErrors['seo.slug']}</span> : null}
          <span className="admin-subtle">URL: /blog/{post.seo.slug || '…'}</span>
        </label>
        <label>
          Canonical URL
          <input
            value={post.seo.canonical}
            onChange={(e) => setPost({ ...post, seo: { ...post.seo, canonical: e.target.value } })}
          />
        </label>
        <MediaPickerField
          label="Social image"
          value={post.seo.socialImage}
          onChange={(value) => setPost({ ...post, seo: { ...post.seo, socialImage: value } })}
          helperText={
            post.seo.socialImage
              ? 'Custom social image set.'
              : post.coverImage
                ? 'Not set — will use cover image for social sharing.'
                : globalOgImage
                  ? 'Not set — will use site default OG image.'
                  : 'Optional Open Graph/Twitter image for social sharing.'
          }
          aspectRatioHint="1200x630 (1.91:1) for Open Graph and X cards."
        />
        {!post.seo.socialImage && effectiveSocialImage ? (
          <p className="admin-subtle" style={{ marginTop: -8 }}>
            Effective social image: <strong>{post.coverImage ? 'cover image' : 'site default'}</strong>
            {' '}— set a custom image above to override.
          </p>
        ) : null}
        <label>
          Keywords (comma separated)
          <input
            value={toKeywordInput(post.seo.keywords)}
            onChange={(e) => setPost({ ...post, seo: { ...post.seo, keywords: fromKeywordInput(e.target.value) } })}
          />
        </label>
        <label>
          Noindex
          <input
            type="checkbox"
            checked={post.seo.noIndex}
            onChange={(e) => setPost({ ...post, seo: { ...post.seo, noIndex: e.target.checked } })}
          />
        </label>
      </section>
    </div>
  );
}
