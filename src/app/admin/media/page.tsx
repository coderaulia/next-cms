'use client';

import Link from 'next/link';
import type { ChangeEvent, DragEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';
import {
  ExternalLink,
  Info,
  PenSquare,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  Upload
} from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import type { MediaAsset } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

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
  const [showGuidelines, setShowGuidelines] = useState(false);

  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [uploadTitle, setUploadTitle] = useState('');
  const [uploadAltText, setUploadAltText] = useState('');
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [uploadNotice, setUploadNotice] = useState('');
  const [isDragOver, setIsDragOver] = useState(false);
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

  const handleFileSelection = (file: File | null) => {
    setUploadFile(file);
    if (file) {
      setUploadTitle((prev) => prev || file.name.replace(/\.[^.]+$/, ''));
      setUploadAltText((prev) => prev || file.name.replace(/\.[^.]+$/, ''));
    }
    setUploadNotice('');
    setUploadError('');
  };

  const onSelectUploadFile = (event: ChangeEvent<HTMLInputElement>) => {
    const next = event.target.files?.[0] ?? null;
    handleFileSelection(next);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = () => {
    setIsDragOver(false);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const file = e.dataTransfer.files?.[0] ?? null;
    if (file) {
      handleFileSelection(file);
    }
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

  if (loading) return <AdminLoading label="Loading media library..." />;

  return (
    <div className="admin-form-wrap">
      {/* Top Bar: Search, Count Badge, and Collapsible Media Guidelines Toggle */}
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 flex-1 min-w-[280px]">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                className="pl-9"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search media by title, alt text, or file URL..."
              />
            </div>
            <span className="admin-chip admin-chip-muted font-semibold text-xs whitespace-nowrap">
              {filtered.length} {filtered.length === 1 ? 'asset' : 'assets'}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowGuidelines((prev) => !prev)}
              className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl border border-slate-300 text-slate-700 hover:bg-slate-100 transition-colors"
            >
              <Info className="w-4 h-4 text-blue-600" />
              <span>{showGuidelines ? 'Hide guidelines' : 'Media guidelines'}</span>
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="v2-btn v2-btn-secondary inline-flex items-center gap-1.5 text-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>New asset</span>
            </button>
          </div>
        </div>

        {/* Collapsible Guidelines Drawer */}
        {showGuidelines ? (
          <div className="mt-4 pt-4 border-t border-slate-200 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <strong className="block text-slate-900 mb-1">Alt text required</strong>
              <span className="text-slate-600">Provide descriptive alt text for accessibility and SEO on all image uploads.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <strong className="block text-slate-900 mb-1">Recommended crops</strong>
              <span className="text-slate-600">1200x630 for social, 16:9 for editorial sections, 4:3 for portfolio cards.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <strong className="block text-slate-900 mb-1">Deduplication</strong>
              <span className="text-slate-600">SHA-256 fingerprinting blocks identical re-uploads automatically.</span>
            </div>
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs">
              <strong className="block text-slate-900 mb-1">Safe replace</strong>
              <span className="text-slate-600">Swap files in-place while keeping the published URL permanent.</span>
            </div>
          </div>
        ) : null}
      </section>

      {/* Main 2-Column DAM Layout */}
      <div className="admin-workspace-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Compact Upload Card + Visual Media Library Grid */}
        <div className="lg:col-span-7 xl:col-span-8 space-y-6">
          {/* Upload Card */}
          <section className="admin-card">
            <div className="admin-inline-header mb-3">
              <div className="flex items-center gap-2">
                <Upload className="w-4 h-4 text-blue-600" />
                <h3 className="m-0 text-base font-bold text-slate-900">Upload media</h3>
              </div>
              <span className="admin-subtle text-xs">Max 10MB · PNG, JPG, WebP, SVG</span>
            </div>

            {/* Drag & Drop Dropzone */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => uploadInputRef.current?.click()}
              className={`border-2 border-dashed rounded-2xl p-5 text-center cursor-pointer transition-all ${
                isDragOver
                  ? 'border-blue-500 bg-blue-50/70 scale-[0.99]'
                  : uploadFile
                    ? 'border-emerald-400 bg-emerald-50/40'
                    : 'border-slate-300 hover:border-slate-400 bg-slate-50/50'
              }`}
            >
              <input
                type="file"
                ref={uploadInputRef}
                accept="image/*"
                onChange={onSelectUploadFile}
                className="hidden"
              />
              <div className="flex flex-col items-center justify-center gap-1.5 pointer-events-none">
                <Upload className={`w-6 h-6 ${uploadFile ? 'text-emerald-600' : 'text-slate-400'}`} />
                {uploadFile ? (
                  <p className="text-sm font-semibold text-emerald-800 m-0">
                    Selected: {uploadFile.name} ({formatBytes(uploadFile.size)})
                  </p>
                ) : (
                  <>
                    <p className="text-sm font-semibold text-slate-700 m-0">
                      Drag &amp; drop an image here, or <span className="text-blue-600 underline">browse</span>
                    </p>
                    <p className="text-xs text-slate-500 m-0">Auto-detects title and dimensions</p>
                  </>
                )}
              </div>
            </div>

            {/* Compact metadata inputs for upload */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-3">
              <label className="text-xs font-semibold text-slate-700">
                Title
                <input
                  value={uploadTitle}
                  onChange={(event) => setUploadTitle(event.target.value)}
                  placeholder="e.g. Hero banner"
                  className="mt-1"
                />
              </label>
              <label className="text-xs font-semibold text-slate-700">
                Alt text (required for images)
                <input
                  value={uploadAltText}
                  onChange={(event) => setUploadAltText(event.target.value)}
                  placeholder="Describe image for screen readers"
                  className="mt-1"
                />
              </label>
            </div>

            <div className="flex items-center justify-between gap-3 mt-3">
              <button
                type="button"
                onClick={handleUpload}
                disabled={!uploadFile || uploading || (uploadRequiresAlt && !uploadAltText.trim())}
                className="v2-btn v2-btn-primary inline-flex items-center gap-1.5 text-xs py-2 px-4"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>{uploading ? 'Uploading...' : 'Upload file'}</span>
              </button>

              {uploadFile ? (
                <button
                  type="button"
                  onClick={() => {
                    setUploadFile(null);
                    setUploadTitle('');
                    setUploadAltText('');
                    if (uploadInputRef.current) uploadInputRef.current.value = '';
                  }}
                  className="text-xs text-slate-500 hover:text-slate-800"
                >
                  Clear file
                </button>
              ) : null}
            </div>

            {uploadNotice ? <p className="admin-subtle text-xs text-emerald-700 mt-2">{uploadNotice}</p> : null}
            {uploadError ? <p className="error text-xs text-rose-700 mt-2">{uploadError}</p> : null}
          </section>

          {/* Visual Media Library Grid */}
          <section className="admin-card">
            <div className="admin-inline-header mb-4">
              <div>
                <h3 className="m-0 text-base font-bold text-slate-900">Media Library</h3>
                <p className="admin-subtle text-xs mt-0.5">Click any asset to inspect and edit details.</p>
              </div>
              <span className="text-xs text-slate-500">
                Showing {filtered.length} of {mediaAssets.length}
              </span>
            </div>

            {mediaAssets.length === 0 ? (
              <div className="admin-empty-state py-12 text-center">
                <h3>No media uploaded yet</h3>
                <p className="admin-subtle text-sm">Upload images above to build your asset library.</p>
              </div>
            ) : filtered.length === 0 ? (
              <div className="admin-empty-state py-12 text-center">
                <h3>No media matches this filter</h3>
                <p className="admin-subtle text-sm">Clear the search query to see the entire media library.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3.5">
                {filtered.map((asset) => {
                  const isSelected = form.id === asset.id;
                  const ratio = formatAspectRatio(asset.width, asset.height);

                  return (
                    <article
                      key={asset.id}
                      onClick={() => selectAsset(asset)}
                      className={`group relative flex flex-col justify-between rounded-xl border bg-white p-2.5 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-blue-500 ring-2 ring-blue-500/20 shadow-md'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-sm'
                      }`}
                    >
                      {/* Image Thumbnail with Overlay Badges */}
                      <div className="relative aspect-video w-full overflow-hidden rounded-lg bg-slate-100 mb-2">
                        <img
                          src={asset.url}
                          alt={asset.altText || asset.title}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                          loading="lazy"
                        />
                        <span className="absolute top-1.5 left-1.5 bg-black/60 backdrop-blur-xs text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">
                          {ratio}
                        </span>
                        <span className="absolute top-1.5 right-1.5 bg-slate-900/70 backdrop-blur-xs text-white text-[9px] font-semibold px-1.5 py-0.5 rounded uppercase">
                          {asset.storageProvider}
                        </span>
                      </div>

                      {/* Info & Meta */}
                      <div className="min-w-0 flex-1">
                        <h4 className="text-xs font-semibold text-slate-900 truncate m-0" title={asset.title}>
                          {asset.title || 'Untitled asset'}
                        </h4>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5 mb-1" title={asset.altText || 'Missing alt text'}>
                          {asset.altText || <span className="text-amber-600 font-medium">Missing alt text</span>}
                        </p>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>{formatBytes(asset.sizeBytes)}</span>
                          <span>·</span>
                          <span>{asset.mimeType.replace('image/', '')}</span>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center justify-between gap-1 mt-2.5 pt-2 border-t border-slate-100">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            selectAsset(asset);
                          }}
                          className={`text-[11px] font-semibold px-2 py-0.5 rounded transition-colors ${
                            isSelected
                              ? 'bg-blue-600 text-white'
                              : 'text-slate-700 hover:bg-slate-100'
                          }`}
                        >
                          {isSelected ? 'Selected' : 'Edit'}
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            void handleDelete(asset.id);
                          }}
                          className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                          title="Delete asset"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </article>
                  );
                })}
              </div>
            )}
          </section>
        </div>

        {/* Right Sticky Column: Asset Inspector */}
        <div className="admin-inspector lg:col-span-5 xl:col-span-4 sticky top-6 space-y-4">
          <section className="admin-card">
            <div className="admin-inline-header pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <PenSquare className="w-4 h-4 text-blue-600" />
                <h3 className="m-0 text-base font-bold text-slate-900">
                  {form.id ? 'Asset Inspector' : 'New External Asset'}
                </h3>
              </div>
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                {form.id ? 'Deselect' : 'Reset'}
              </button>
            </div>

            {/* Preview Area */}
            {form.url ? (
              <div className="mt-3 relative rounded-xl overflow-hidden border border-slate-200 bg-slate-50">
                <img
                  src={form.url}
                  alt={form.altText || form.title}
                  className="w-full max-h-52 object-contain bg-slate-900/5"
                />
                <a
                  href={form.url}
                  target="_blank"
                  rel="noreferrer"
                  title="Open full image in new tab"
                  className="absolute bottom-2 right-2 inline-flex items-center gap-1 text-[11px] font-semibold bg-white/90 backdrop-blur-xs text-slate-800 px-2 py-1 rounded shadow-sm hover:bg-white transition-colors"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Open URL</span>
                </a>
              </div>
            ) : null}

            {/* Core Editable Metadata */}
            <div className="space-y-3 mt-3">
              <label className="text-xs font-semibold text-slate-700">
                Title
                <input
                  value={form.title}
                  onChange={(event) => setForm({ ...form, title: event.target.value })}
                  placeholder="Asset title"
                  className="mt-1"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                Alt text
                <input
                  value={form.altText}
                  onChange={(event) => setForm({ ...form, altText: event.target.value })}
                  placeholder="Describe image for screen readers"
                  className="mt-1"
                />
              </label>

              <label className="text-xs font-semibold text-slate-700">
                File URL
                <input
                  value={form.url}
                  onChange={(event) => setForm({ ...form, url: event.target.value })}
                  placeholder="https://..."
                  className="mt-1 text-xs"
                />
              </label>
            </div>

            {/* Quick Summary Pill for Selected Asset */}
            {form.id ? (
              <div className="flex flex-wrap items-center gap-1.5 mt-3 text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-200">
                <span className="font-semibold text-slate-800">
                  {isManagedAsset(form) ? 'Managed storage' : 'External URL'}
                </span>
                <span>·</span>
                <span>{formatAspectRatio(form.width, form.height)}</span>
                <span>·</span>
                <span>{formatBytes(form.sizeBytes)}</span>
              </div>
            ) : null}

            {/* Where this asset is used */}
            {form.id ? (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-800">Where this asset is used</span>
                  <span className="admin-chip admin-chip-muted text-[10px]">
                    {usageLoading ? 'Checking...' : `${usage.length} refs`}
                  </span>
                </div>
                {usageError ? <p className="error text-xs">{usageError}</p> : null}
                {usage.length > 0 ? (
                  <ul className="space-y-1.5 m-0 p-0 list-none text-xs">
                    {usage.map((item, index) => (
                      <li
                        key={`${item.entityType}-${item.entityId}-${item.field}-${index}`}
                        className="flex items-center justify-between gap-2 p-1.5 bg-white rounded border border-slate-200"
                      >
                        <div className="truncate">
                          <strong className="block text-slate-800 truncate">{item.label}</strong>
                          <span className="text-[10px] text-slate-500">{item.field}</span>
                        </div>
                        <Link
                          href={item.href}
                          className="text-blue-600 hover:text-blue-800 font-semibold text-[11px] whitespace-nowrap"
                        >
                          Open →
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="admin-subtle text-xs m-0">Not currently referenced by any content.</p>
                )}
              </div>
            ) : null}

            {/* Replace file in-place */}
            {form.id ? (
              <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-1.5">
                    <RefreshCw className="w-3.5 h-3.5 text-blue-600" />
                    <span className="text-xs font-bold text-slate-800">Replace file in-place</span>
                  </div>
                  <span className="text-[10px] text-slate-500">Keep URL stable</span>
                </div>

                {canReplaceSelected ? (
                  <div className="space-y-2">
                    <label className="text-[11px] font-semibold text-slate-700">
                      Replacement file
                      <input
                        type="file"
                        ref={replaceInputRef}
                        accept="image/*"
                        onChange={onSelectReplaceFile}
                        className="mt-1 text-xs"
                      />
                    </label>
                    <label className="text-[11px] font-semibold text-slate-700">
                      Replacement alt text
                      <input
                        value={replaceAltText}
                        onChange={(event) => setReplaceAltText(event.target.value)}
                        placeholder="Update alt text for new file"
                        className="mt-1 text-xs"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={handleReplace}
                      disabled={!replaceFile || replacing || (replaceRequiresAlt && !(replaceAltText.trim() || form.altText.trim()))}
                      className="w-full inline-flex items-center justify-center gap-1.5 text-xs font-semibold py-1.5 px-3 rounded-lg bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 transition-colors"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>{replacing ? 'Replacing...' : 'Swap file without changing URL'}</span>
                    </button>
                    {replaceNotice ? <p className="admin-subtle text-xs text-emerald-700 m-0">{replaceNotice}</p> : null}
                    {replaceError ? <p className="error text-xs text-rose-700 m-0">{replaceError}</p> : null}
                  </div>
                ) : (
                  <p className="admin-subtle text-xs m-0">
                    External or manual asset; in-place replacement requires managed storage.
                  </p>
                )}
              </div>
            ) : null}

            {/* Collapsible Technical Metadata Section */}
            <details className="mt-3 border border-slate-200 rounded-xl p-3 bg-slate-50/50 text-xs">
              <summary className="font-semibold text-slate-700 cursor-pointer select-none">
                Technical Metadata &amp; Storage
              </summary>
              <div className="space-y-2 mt-3 pt-2 border-t border-slate-200">
                <div className="grid grid-cols-2 gap-2">
                  <label className="text-[11px]">
                    MIME type
                    <input
                      value={form.mimeType}
                      onChange={(event) => setForm({ ...form, mimeType: event.target.value })}
                      className="mt-0.5 text-xs"
                    />
                  </label>
                  <label className="text-[11px]">
                    Storage provider
                    <input
                      value={form.storageProvider}
                      onChange={(event) => setForm({ ...form, storageProvider: event.target.value })}
                      className="mt-0.5 text-xs"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  <label className="text-[11px]">
                    Width
                    <input
                      type="number"
                      value={form.width ?? ''}
                      onChange={(event) => setForm({ ...form, width: event.target.value ? Number(event.target.value) : null })}
                      className="mt-0.5 text-xs"
                    />
                  </label>
                  <label className="text-[11px]">
                    Height
                    <input
                      type="number"
                      value={form.height ?? ''}
                      onChange={(event) => setForm({ ...form, height: event.target.value ? Number(event.target.value) : null })}
                      className="mt-0.5 text-xs"
                    />
                  </label>
                  <label className="text-[11px]">
                    Size (bytes)
                    <input
                      type="number"
                      value={form.sizeBytes ?? ''}
                      onChange={(event) =>
                        setForm({ ...form, sizeBytes: event.target.value ? Number(event.target.value) : null })
                      }
                      className="mt-0.5 text-xs"
                    />
                  </label>
                </div>
                <label className="text-[11px]">
                  Storage key
                  <input
                    value={form.storageKey ?? ''}
                    onChange={(event) => setForm({ ...form, storageKey: event.target.value || null })}
                    className="mt-0.5 text-xs"
                  />
                </label>
                <label className="text-[11px]">
                  Checksum (SHA-256)
                  <input
                    value={form.checksumSha256 ?? ''}
                    onChange={(event) => setForm({ ...form, checksumSha256: event.target.value || null })}
                    className="mt-0.5 text-xs"
                  />
                </label>
              </div>
            </details>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving}
                className="v2-btn v2-btn-primary flex-1 text-xs py-2"
              >
                {saving ? 'Saving...' : form.id ? 'Update asset' : 'Create asset'}
              </button>
              {form.id ? (
                <button
                  type="button"
                  onClick={() => void handleDelete(form.id)}
                  className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors"
                >
                  Delete
                </button>
              ) : null}
            </div>

            {notice ? <p className="admin-subtle text-xs text-emerald-700 mt-2">{notice}</p> : null}
            {error ? <p className="error text-xs text-rose-700 mt-2">{error}</p> : null}
          </section>
        </div>
      </div>
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
