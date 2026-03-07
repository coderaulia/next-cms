'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { MediaAsset } from '@/features/cms/types';

type MediaResponse = {
  mediaAssets: MediaAsset[];
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
  storageProvider: 'external-url',
  storageKey: null,
  createdAt: '',
  updatedAt: ''
};

function MediaLibraryManager() {
  const [mediaAssets, setMediaAssets] = useState<MediaAsset[]>([]);
  const [form, setForm] = useState<MediaAsset>(emptyMediaAsset);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const response = await fetch('/api/admin/media');
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
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return mediaAssets;
    return mediaAssets.filter((asset) => {
      const haystack = `${asset.title} ${asset.url} ${asset.altText} ${asset.mimeType} ${asset.storageProvider} ${asset.storageKey ?? ''}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [mediaAssets, query]);

  const resetForm = () => {
    setForm(emptyMediaAsset);
    setNotice('');
    setError('');
  };

  const handleSave = async () => {
    setSaving(true);
    setError('');
    setNotice('');

    const method = form.id ? 'PUT' : 'POST';
    const endpoint = form.id ? `/api/admin/media/${form.id}` : '/api/admin/media';
    const payload = {
      ...form,
      id: form.id || crypto.randomUUID()
    };

    const response = await fetch(endpoint, {
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
    setForm(body.mediaAsset);
    setNotice(form.id ? 'Media asset updated.' : 'Media asset created.');
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this media asset?')) return;

    const response = await fetch(`/api/admin/media/${id}`, {
      method: 'DELETE'
    });

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
          <label style={{ gridColumn: '1 / -1' }}>
            Storage key
            <input
              value={form.storageKey ?? ''}
              onChange={(event) => setForm({ ...form, storageKey: event.target.value || null })}
            />
          </label>
        </div>
        {form.url ? (
          <div className="admin-card" style={{ marginTop: 16 }}>
            <p className="admin-kpi-label">Preview</p>
            <img src={form.url} alt={form.altText || form.title} style={{ maxWidth: '100%', borderRadius: 16 }} />
          </div>
        ) : null}
        <div className="admin-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update asset' : 'Create asset'}
          </button>
          {form.id ? (
            <button type="button" onClick={() => handleDelete(form.id)}>
              Delete asset
            </button>
          ) : null}
        </div>
        {notice ? <p>{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Media Library</h2>
          <label>
            Search
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search media" />
          </label>
        </div>
        <div className="admin-grid-3">
          {filtered.map((asset) => (
            <article key={asset.id} className="admin-card">
              <div style={{ aspectRatio: '16 / 9', overflow: 'hidden', borderRadius: 16, marginBottom: 12 }}>
                <img
                  src={asset.url}
                  alt={asset.altText || asset.title}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                />
              </div>
              <h3>{asset.title}</h3>
              <p className="admin-subtle">{asset.mimeType}</p>
              <p className="admin-subtle">{asset.storageProvider}</p>
              <p className="admin-subtle">{asset.storageKey || 'manual asset'}</p>
              <p className="admin-subtle">{asset.width ?? '-'} x {asset.height ?? '-'}</p>
              <div className="admin-actions">
                <button type="button" onClick={() => setForm(asset)}>
                  Edit
                </button>
                <button type="button" onClick={() => handleDelete(asset.id)}>
                  Delete
                </button>
              </div>
            </article>
          ))}
          {filtered.length === 0 ? <p className="admin-subtle">No media assets found.</p> : null}
        </div>
      </section>
    </div>
  );
}

export default function AdminMediaPage() {
  return (
    <AdminShell title="Media Library" description="Manage reusable media metadata and external asset URLs.">
      {() => <MediaLibraryManager />}
    </AdminShell>
  );
}
