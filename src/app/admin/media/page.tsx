'use client';

import Link from 'next/link';
import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { MediaAsset } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type MediaResponse = {
  mediaAssets: MediaAsset[];
};

type DuplicateMediaResponse = {
  error?: string;
  duplicateOf?: MediaAsset;
};

type MediaUsageEntry = {
  entityType: 'settings' | 'page' | 'blog_post' | 'portfolio_project';
  entityId: string;
  label: string;
  field: string;
  href: string;
};

const emptyMediaAsset: MediaAsset = {
  id: '',
  title: '',
  url: '',
  altText: '',
  mimeType: 'image/png',
  width: null,
  height: null,
  sizeBytes: null,
  checksumSha256: null,
  storageProvider: 'external-url',
  storageKey: null,
  createdAt: '',
  updatedAt: ''
};

function isImageMimeType(value: string) {
  return value.toLowerCase().startsWith('image/');
}

function formatAspectRatio(width: number | null, height: number | null) {
  if (!width || !height) {
    return 'unknown';
  }

  const gcd = (left: number, right: number): number => {
    if (!right) return left;
    return gcd(right, left % right);
  };

  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function formatBytes(value: number | null) {
  if (!value || value <= 0) {
    return 'unknown';
  }

  if (value < 1024) {
    return `${value} B`;
  }
  if (value < 1024 * 1024) {
    return `${(value / 1024).toFixed(1)} KB`;
  }
  return `${(value / (1024 * 1024)).toFixed(1)} MB`;
}

function isManagedAsset(asset: MediaAsset) {
  return Boolean(asset.storageKey) && ['local', 'supabase'].includes(asset.storageProvider);
}

type MediaLibraryManagerProps = {
  user: AdminSessionUser;
};

function MediaLibraryManager({ user }: MediaLibraryManagerProps) {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<MediaAsset>(emptyMediaAsset);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const uploadInputRef = useRef<HTMLInputElement>(null);

  const [replaceFile, setReplaceFile] = useState<File | null>(null);
  const [replaceAltText, setReplaceAltText] = useState('');
  const [replacing, setReplacing] = useState(false);
  const [replaceError, setReplaceError] = useState('');
  const [replaceNotice, setReplaceNotice] = useState('');
  const [usage, setUsage] = useState<MediaUsageEntry[]>([]);
  const [usageLoading, setUsageLoading] = useState(false);
  const [usageError, setUsageError] = useState('');
  const replaceInputRef = useRef<HTMLInputElement>(null);
  const canEditMedia = user.permissions.includes('media:edit');

  const load = async () => {
    setLoading(true);
    setError('');
    const response = await csrfFetch('/api/admin/media');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load media library.');
      return;
    }

    const payload = (await response.json()) as MediaResponse;
    setMediaAssets(payload.mediaAssets);
    setLoading(false);
  };

  useEffect(() => {
    if (!canEditMedia) {
      setLoading(false);
      return;
    }

    void load();
  }, [canEditMedia]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return mediaAssets;
    return mediaAssets.filter((asset) => {
      const haystack = `${asset.title} ${asset.url} ${asset.altText} ${asset.mimeType} ${asset.storageProvider} ${asset.storageKey ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [mediaAssets, query]);

  const uploadRequiresAlt = Boolean(uploadFile && isImageMimeType(uploadFile.type || 'image/png'));
  const replaceRequiresAlt = Boolean(replaceFile && isImageMimeType(replaceFile.type || form.mimeType || 'image/png'));
  const canReplaceSelected = Boolean(form.id) && isManagedAsset(form);

  const resetForm = () => {
    setForm(emptyMediaAsset);
    setNotice('');
    setError('');
    setReplaceFile(null);
    setReplaceAltText('');
    setReplaceError('');
    setReplaceNotice('');
    setUsage([]);
    setUsageError('');
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  const selectAsset = (asset: MediaAsset) => {
    setForm(asset);
    setNotice('');
    setError('');
    setReplaceFile(null);
    setReplaceAltText(asset.altText);
    setReplaceError('');
    setReplaceNotice('');
    setUsageError('');
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
  };

  useEffect(() => {
    if (!form.id) {
      setUsage([]);
      setUsageError('');
      setUsageLoading(false);
      return;
    }

    let cancelled = false;

    async function loadUsage() {
      setUsageLoading(true);
      setUsageError('');
      const response = await csrfFetch(`/api/admin/media/${form.id}/usage`);
      if (!response.ok) {
        if (!cancelled) {
          setUsage([]);
          setUsageLoading(false);
          setUsageError('Failed to load usage references.');
        }
        return;
      }

      const payload = (await response.json()) as { usage?: MediaUsageEntry[] };
      if (!cancelled) {
        setUsage(Array.isArray(payload.usage) ? payload.usage : []);
        setUsageLoading(false);
      }
    }

    void loadUsage();

    return () => {
      cancelled = true;
    };
  }, [form.id]);

  if (!canEditMedia) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role can review reporting data but cannot manage media assets.</p>
      </section>
    );
  }

  const onSelectUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setUploadFile(next);
    if (next) {
      setUploadTitle((prev) => prev || next.name.replace(/\.[^.]+$/, ''));
      setUploadAltText((prev) => prev || next.name.replace(/\.[^.]+$/, ''));
    }
    setUploadNotice('');
    setUploadError('');
  };

  const onSelectReplaceFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    setReplaceFile(next);
    setReplaceError('');
    setReplaceNotice('');
  };

  const handleUpload = async () => {
    if (!uploadFile) {
      setUploadError('Please select a file.');
      return;
    }
    if (uploadRequiresAlt && !uploadAltText.trim()) {
      setUploadError('Alt text is required for image uploads.');
      return;
    }

    const body = new FormData();
    body.append('file', uploadFile);
    if (uploadTitle.trim()) body.append('title', uploadTitle.trim());
    if (uploadAltText.trim()) body.append('altText', uploadAltText.trim());

    setUploading(true);
    setUploadNotice('');
    setUploadError('');

    const response = await csrfFetch('/api/admin/media/upload', {
      method: 'POST',
      body
    });

    setUploading(false);

    if (response.status === 409) {
      const payload = (await response.json().catch(() => null)) as DuplicateMediaResponse | null;
      if (payload?.duplicateOf) {
        selectAsset(payload.duplicateOf);
        setUploadNotice('Duplicate file detected. The existing media asset has been opened instead.');
        return;
      }
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setUploadError(payload?.error || 'Failed to upload media.');
      return;
    }

    const payload = (await response.json()) as { mediaAsset: MediaAsset };
    selectAsset(payload.mediaAsset);
    setUploadFile(null);
    setUploadTitle('');
    setUploadAltText('');
    setUploadNotice('Media uploaded successfully.');
    if (uploadInputRef.current) {
      uploadInputRef.current.value = '';
    }
    await load();
  };

  const handleSave = async () => {
    if (isImageMimeType(form.mimeType) && !form.altText.trim()) {
      setError('Alt text is required for image assets.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const method = form.id ? 'PUT' : 'POST';
    const endpoint = form.id ? `/api/admin/media/${form.id}` : '/api/admin/media';
    const payload = {
      ...form,
      id: form.id || crypto.randomUUID()
    };

    const response = await csrfFetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to save media asset.');
      return;
    }

    const body = (await response.json()) as { mediaAsset: MediaAsset };
    selectAsset(body.mediaAsset);
    setNotice(form.id ? 'Media asset updated.' : 'Media asset created.');
    await load();
  };

  const handleReplace = async () => {
    if (!form.id) {
      setReplaceError('Select a media asset first.');
      return;
    }
    if (!replaceFile) {
      setReplaceError('Choose a replacement file first.');
      return;
    }
    if (replaceRequiresAlt && !(replaceAltText.trim() || form.altText.trim())) {
      setReplaceError('Alt text is required for image replacements.');
      return;
    }

    const body = new FormData();
    body.append('file', replaceFile);
    if (replaceAltText.trim()) {
      body.append('altText', replaceAltText.trim());
    }

    setReplacing(true);
    setReplaceError('');
    setReplaceNotice('');

    const response = await csrfFetch(`/api/admin/media/${form.id}/replace`, {
      method: 'POST',
      body
    });

    setReplacing(false);

    if (response.status === 409) {
      const payload = (await response.json().catch(() => null)) as DuplicateMediaResponse | null;
      if (payload?.duplicateOf) {
        selectAsset(payload.duplicateOf);
        setReplaceNotice('Duplicate file detected. The existing asset has been opened instead of replacing this one.');
        await load();
        return;
      }
    }

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setReplaceError(payload?.error || 'Failed to replace media.');
      return;
    }

    const payload = (await response.json()) as { mediaAsset: MediaAsset };
    selectAsset(payload.mediaAsset);
    setReplaceFile(null);
    setReplaceAltText(payload.mediaAsset.altText);
    setReplaceNotice('Media replaced successfully. The public URL stayed the same.');
    if (replaceInputRef.current) {
      replaceInputRef.current.value = '';
    }
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media asset?')) return;

    const response = await csrfFetch(`/api/admin/media/${id}`, {
      method: 'DELETE'
    });

    if (response.status === 409) {
      const body = (await response.json().catch(() => null)) as { error?: string; usage?: MediaUsageEntry[] } | null;
      setError(body?.error || 'This media asset is still used in content.');
      setUsage(Array.isArray(body?.usage) ? body.usage : []);
      const current = mediaAssets.find((asset) => asset.id === id);
      if (current) {
        selectAsset(current);
      }
      return;
    }

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to delete media asset.');
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setNotice('Media asset deleted.');
    await load();
  };

  if (loading) return <p>Loading media library...</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Media guidance</h2>
          <span className="admin-subtle">{mediaAssets.length} assets in library</span>
        </div>
        <ul className="admin-plain-list">
          <li>
            <strong>Alt text is required for image uploads.</strong>
            <span>Use human-readable descriptions so editors do not ship inaccessible images to clients.</span>
          </li>
          <li>
            <strong>Recommended crops:</strong>
            <span>1200x630 for social cards, 16:9 for blog and page sections, 4:3 or 16:9 for portfolio covers.</span>
          </li>
          <li>
            <strong>Duplicate uploads are blocked.</strong>
            <span>Files are fingerprinted with SHA-256 so the library stays lean instead of accumulating copies.</span>
          </li>
          <li>
            <strong>Replace keeps URLs stable.</strong>
            <span>Only managed local or Supabase assets can be swapped in place without breaking existing content links.</span>
          </li>
        </ul>
      </section>

      <section className="admin-card">
        <h2>Upload media file</h2>
        <div className="admin-grid-3">
          <label>
            Title
            <input value={uploadTitle} onChange={(event) => setUploadTitle(event.target.value)} placeholder="Featured banner" />
          </label>
          <label>
            Alt text
            <input
              value={uploadAltText}
              onChange={(event) => setUploadAltText(event.target.value)}
              placeholder="Describe the image for accessibility"
            />
          </label>
          <label>
            File
            <input
              type="file"
              ref={uploadInputRef}
              accept="image/*"
              onChange={onSelectUploadFile}
            />
          </label>
        </div>
        <p className="admin-subtle">Recommended ratios: 1200x630 for social, 16:9 for editorial sections, 4:3 for portfolio covers.</p>
        <div className="admin-actions" style={{ marginTop: 8 }}>
          <button
            type="button"
            onClick={handleUpload}
            disabled={!uploadFile || uploading || (uploadRequiresAlt && !uploadAltText.trim())}
          >
            {uploading ? 'Uploading...' : 'Upload file'}
          </button>
        </div>
        {uploadNotice ? <p className="admin-subtle">{uploadNotice}</p> : null}
        {uploadError ? <p className="error">{uploadError}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>{form.id ? 'Edit media asset' : 'New media asset'}</h2>
          <button type="button" onClick={resetForm} className="v2-btn v2-btn-secondary">
            New asset
          </button>
        </div>
        <div className="admin-grid-2">
          <label>
            Title
            <input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} />
          </label>
          <label>
            File URL
            <input value={form.url} onChange={(event) => setForm({ ...form, url: event.target.value })} />
          </label>
          <label>
            Alt text
            <input value={form.altText} onChange={(event) => setForm({ ...form, altText: event.target.value })} />
          </label>
          <label>
            MIME type
            <input value={form.mimeType} onChange={(event) => setForm({ ...form, mimeType: event.target.value })} />
          </label>
          <label>
            Width
            <input
              type="number"
              value={form.width ?? ''}
              onChange={(event) => setForm({ ...form, width: event.target.value ? Number(event.target.value) : null })}
            />
          </label>
          <label>
            Height
            <input
              type="number"
              value={form.height ?? ''}
              onChange={(event) => setForm({ ...form, height: event.target.value ? Number(event.target.value) : null })}
            />
          </label>
          <label>
            Size (bytes)
            <input
              type="number"
              value={form.sizeBytes ?? ''}
              onChange={(event) =>
                setForm({ ...form, sizeBytes: event.target.value ? Number(event.target.value) : null })
              }
            />
          </label>
          <label>
            Storage provider
            <input value={form.storageProvider} onChange={(event) => setForm({ ...form, storageProvider: event.target.value })} />
          </label>
          <label>
            Storage key
            <input
              value={form.storageKey ?? ''}
              onChange={(event) => setForm({ ...form, storageKey: event.target.value || null })}
            />
          </label>
          <label>
            Checksum (SHA-256)
            <input value={form.checksumSha256 ?? ''} onChange={(event) => setForm({ ...form, checksumSha256: event.target.value || null })} />
          </label>
        </div>
        {form.id ? (
          <div className="admin-media-meta">
            <span>{isManagedAsset(form) ? 'Managed asset with stable replace support.' : 'Manual/external asset.'}</span>
            <span>Aspect ratio: {formatAspectRatio(form.width, form.height)}</span>
            <span>File size: {formatBytes(form.sizeBytes)}</span>
          </div>
        ) : null}
        {form.id ? (
          <div className="admin-card" style={{ marginTop: 16 }}>
            <div className="admin-inline-header">
              <h3>Where this asset is used</h3>
              <span className="admin-subtle">{usageLoading ? 'Checking...' : `${usage.length} references`}</span>
            </div>
            {usageError ? <p className="error">{usageError}</p> : null}
            {usage.length > 0 ? (
              <ul className="admin-plain-list">
                {usage.map((item, index) => (
                  <li key={`${item.entityType}-${item.entityId}-${item.field}-${index}`}>
                    <strong>{item.label}</strong>
                    <span>{item.field}</span>
                    <Link href={item.href}>Open item</Link>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="admin-subtle">This asset is not currently referenced by pages, posts, portfolio, or settings.</p>
            )}
          </div>
        ) : null}
        {form.url ? (
          <div className="admin-card" style={{ marginTop: 16 }}>
            <p className="admin-kpi-label">Preview</p>
            <img src={form.url} alt={form.altText || form.title} style={{ maxWidth: '100%', borderRadius: 16 }} />
          </div>
        ) : null}
        {form.id ? (
          <div className="admin-card admin-media-replace-card" style={{ marginTop: 16 }}>
            <div className="admin-inline-header">
              <h3>Replace file without changing URL</h3>
              <span className="admin-subtle">{canReplaceSelected ? 'Available' : 'Unavailable'}</span>
            </div>
            {canReplaceSelected ? (
              <>
                <div className="admin-grid-3">
                  <label>
                    Replacement alt text
                    <input
                      value={replaceAltText}
                      onChange={(event) => setReplaceAltText(event.target.value)}
                      placeholder="Reuse or update the current alt text"
                    />
                  </label>
                  <label>
                    Replacement file
                    <input type="file" ref={replaceInputRef} accept="image/*" onChange={onSelectReplaceFile} />
                  </label>
                </div>
                <p className="admin-subtle">Use this when a client wants a refreshed image but the published URL must stay stable.</p>
                <div className="admin-actions">
                  <button
                    type="button"
                    onClick={handleReplace}
                    disabled={!replaceFile || replacing || (replaceRequiresAlt && !(replaceAltText.trim() || form.altText.trim()))}
                  >
                    {replacing ? 'Replacing...' : 'Replace file'}
                  </button>
                </div>
              </>
            ) : (
              <p className="admin-subtle">This asset is external or manually managed, so in-place replacement would break the URL contract.</p>
            )}
            {replaceNotice ? <p className="admin-subtle">{replaceNotice}</p> : null}
            {replaceError ? <p className="error">{replaceError}</p> : null}
          </div>
        ) : null}
        <div className="admin-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update asset' : 'Create asset'}
          </button>
          {form.id ? (
            <button type="button" onClick={() => void handleDelete(form.id)}>
              Delete asset
            </button>
          ) : null}
        </div>
        {notice ? <p>{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Media library</h2>
          <label>
            Search
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" />
          </label>
        </div>
        {mediaAssets.length === 0 ? (
          <div className="admin-empty-state">
            <h3>No media uploaded yet</h3>
            <p className="admin-subtle">Start with brand assets, default social images, and at least one portfolio cover so editors are not blocked later.</p>
          </div>
        ) : (
          <div className="admin-grid-3">
            {filtered.map((asset) => (
              <article key={asset.id} className="admin-card admin-media-library-card">
                <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 16, marginBottom: 12 }}>
                  <img
                    src={asset.url}
                    alt={asset.altText || asset.title}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <h3>{asset.title}</h3>
                <p className="admin-subtle">{asset.altText || 'Missing alt text'}</p>
                <div className="admin-media-meta">
                  <span>{asset.mimeType}</span>
                  <span>{asset.width ?? '-'} x {asset.height ?? '-'} ({formatAspectRatio(asset.width, asset.height)})</span>
                  <span>{asset.storageProvider}</span>
                  <span>{asset.storageKey || 'manual asset'}</span>
                </div>
                <div className="admin-actions">
                  <button type="button" onClick={() => selectAsset(asset)}>
                    Edit
                  </button>
                  <button type="button" onClick={() => void handleDelete(asset.id)}>
                    Delete
                  </button>
                </div>
              </article>
            ))}
            {filtered.length === 0 ? (
              <div className="admin-empty-state">
                <h3>No media matches this filter</h3>
                <p className="admin-subtle">Clear the search term or upload a new asset that fits the target page and aspect ratio.</p>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminMediaPage() {
  return (
    <AdminShell title="Media Library" description="Manage reusable media metadata, uploads, and safe in-place replacements.">
      {(user) => <MediaLibraryManager user={user} />}
    </AdminShell>
  );
}
