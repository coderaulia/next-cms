'use client';

import type { ChangeEvent } from 'react';
import { useEffect, useMemo, useRef, useState } from 'react';

import { AdminActionButton } from '@/components/admin/AdminActionButton';
import type { MediaAsset } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';
import { Check, Image as ImageIcon, Search, Trash2, Upload, X } from 'lucide-react';

type MediaResponse = {
  mediaAssets: MediaAsset[];
};

type MediaAssetBrowserProps = {
  buttonLabel?: string;
  onSelect: (asset: MediaAsset) => void;
  selectedUrl?: string;
  uploadLabel?: string;
  uploadContextLabel?: string;
  suggestedAltText?: string;
};

type MediaPickerFieldProps = {
  label: string;
  value: string;
  onChange: (value: string) => void;
  altLabel?: string;
  altValue?: string;
  onAltChange?: (value: string) => void;
  helperText?: string;
  aspectRatioHint?: string;
  pickLabel?: string;
  placeholder?: string;
};

type MediaGalleryFieldProps = {
  label: string;
  values: string[];
  onChange: (next: string[]) => void;
  helperText?: string;
};

let mediaAssetCache: MediaAsset[] | null = null;
let mediaAssetPromise: Promise<MediaAsset[]> | null = null;

function setCachedMediaAssets(assets: MediaAsset[]) {
  const deduped = Array.from(
    new Map(assets.filter(isImageAsset).map((asset) => [asset.id, asset])).values()
  );
  mediaAssetCache = deduped;
  return deduped;
}

function isImageAsset(asset: MediaAsset) {
  if (asset.mimeType.toLowerCase().startsWith('image/')) return true;
  return /\.(png|jpe?g|webp|gif|svg)$/i.test(asset.url);
}

async function loadMediaAssets(force = false): Promise<MediaAsset[]> {
  if (!force && mediaAssetCache) return mediaAssetCache;
  if (!force && mediaAssetPromise) return mediaAssetPromise;

  mediaAssetPromise = csrfFetch('/api/admin/media')
    .then(async (response) => {
      if (!response.ok) {
        throw new Error('Failed to load media library.');
      }

      const payload = (await response.json()) as MediaResponse;
      return setCachedMediaAssets(payload.mediaAssets);
    })
    .finally(() => {
      mediaAssetPromise = null;
    });

  return mediaAssetPromise;
}

function previewAltText(url: string) {
  const parts = url.split('/');
  return parts[parts.length - 1] || 'Selected media asset';
}

function humanizeFileName(value: string) {
  return value
    .replace(/\.[^.]+$/, '')
    .replace(/[-_]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

type MediaUploadResponse = {
  mediaAsset?: MediaAsset;
  duplicateOf?: MediaAsset;
  error?: string;
};

async function uploadMediaAsset(file: File, title: string, altText: string) {
  const form = new FormData();
  form.set('file', file);
  form.set('title', title);
  form.set('altText', altText);

  const response = await csrfFetch('/api/admin/media/upload', {
    method: 'POST',
    body: form
  });
  const payload = (await response.json().catch(() => null)) as MediaUploadResponse | null;

  if (response.status === 409 && payload?.duplicateOf) {
    return {
      asset: payload.duplicateOf,
      duplicate: true
    };
  }

  if (!response.ok || !payload?.mediaAsset) {
    throw new Error(payload?.error || 'Failed to upload media.');
  }

  return {
    asset: payload.mediaAsset,
    duplicate: false
  };
}

function formatAspectRatio(width: number | null, height: number | null) {
  if (!width || !height) {
    return '';
  }

  const gcd = (left: number, right: number): number => {
    if (!right) return left;
    return gcd(right, left % right);
  };

  const divisor = gcd(width, height);
  return `${Math.round(width / divisor)}:${Math.round(height / divisor)}`;
}

function MediaAssetBrowser({
  buttonLabel = 'Browse library',
  onSelect,
  selectedUrl = '',
  uploadLabel = 'Upload image',
  uploadContextLabel = 'image',
  suggestedAltText = ''
}: MediaAssetBrowserProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>(mediaAssetCache ?? []);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState('');
  const [error, setError] = useState('');
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!open || assets.length > 0) return;

    setLoading(true);
    setError('');
    loadMediaAssets()
      .then((next) => setAssets(next))
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load media assets.');
      })
      .finally(() => setLoading(false));
  }, [assets.length, open]);

  const buildUploadMeta = (file: File) => {
    const defaultTitle = humanizeFileName(file.name) || 'Uploaded image';
    const defaultAltText = suggestedAltText.trim() || defaultTitle;
    return {
      title: defaultTitle,
      altText: defaultAltText
    };
  };

  const handleUploadPick = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';

    if (!file) {
      return;
    }

    try {
      const metadata = buildUploadMeta(file);

      setUploading(true);
      setStatus('');
      setError('');

      const { asset, duplicate } = await uploadMediaAsset(file, metadata.title, metadata.altText);
      const nextAssets = setCachedMediaAssets([asset, ...(mediaAssetCache ?? assets)]);
      setAssets(nextAssets);
      onSelect(asset);
      setOpen(false);
      setStatus(
        duplicate
          ? `Matching ${uploadContextLabel.toLowerCase()} already existed in the media library, so the existing asset was selected.`
          : `Image uploaded for ${uploadContextLabel.toLowerCase()} and selected. Review alt text if needed.`
      );
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'Failed to upload image.');
    } finally {
      setUploading(false);
    }
  };

  const filteredAssets = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return assets;
    return assets.filter((asset) => {
      const haystack = `${asset.title} ${asset.altText} ${asset.url}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [assets, query]);

  return (
    <div className="admin-media-browser-wrap">
      <div className="admin-actions" style={{ alignItems: 'center' }}>
        <AdminActionButton
          icon={open ? 'close' : 'images'}
          size="sm"
          variant="secondary"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? 'Hide library' : buttonLabel}
        </AdminActionButton>
        <button
          type="button"
          className="v2-btn v2-btn-primary"
          style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '6px 12px' }}
          disabled={uploading}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload size={14} />
          <span>{uploading ? 'Uploading...' : uploadLabel}</span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          hidden
          onChange={handleUploadPick}
        />
      </div>

      {status ? <p className="admin-subtle" style={{ color: '#16a34a', marginTop: 6 }}>{status}</p> : null}
      {error ? <p className="admin-error-text" style={{ marginTop: 6 }}>{error}</p> : null}

      {open ? (
        <div className="admin-media-browser" style={{ marginTop: 12, padding: 16, background: 'var(--panel, #f8fafc)', border: '1px solid var(--line, #e2e8f0)', borderRadius: 12 }}>
          <div className="admin-inline-header" style={{ marginBottom: 12 }}>
            <div>
              <h3 className="admin-section-heading" style={{ margin: 0, fontSize: '0.95rem' }}>Media Library</h3>
              <p className="admin-subtle" style={{ margin: '2px 0 0' }}>Select an uploaded image or upload a new one directly.</p>
            </div>
            <div style={{ position: 'relative', width: 220 }}>
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search images..."
                style={{ paddingLeft: 30 }}
              />
              <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }} />
            </div>
          </div>

          {loading ? <p className="admin-subtle">Loading media assets...</p> : null}

          {!loading && filteredAssets.length === 0 ? (
            <p className="admin-subtle" style={{ textAlign: 'center', padding: '20px 0' }}>No images match this search.</p>
          ) : null}

          <div className="admin-media-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 12 }}>
            {filteredAssets.map((asset) => {
              const active = selectedUrl === asset.url;
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`admin-media-option ${active ? 'active' : ''}`}
                  style={{
                    position: 'relative',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'stretch',
                    padding: 6,
                    borderRadius: 8,
                    border: active ? '2px solid #2563eb' : '1px solid var(--line, #e2e8f0)',
                    background: active ? '#eff6ff' : '#ffffff',
                    cursor: 'pointer',
                    textAlign: 'left',
                    overflow: 'hidden'
                  }}
                  onClick={() => {
                    onSelect(asset);
                    setOpen(false);
                  }}
                >
                  <div className="admin-media-option-thumb" style={{ width: '100%', height: 80, borderRadius: 6, overflow: 'hidden', background: '#f1f5f9' }}>
                    <img src={asset.url} alt={asset.altText || asset.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  </div>
                  {active ? (
                    <div style={{ position: 'absolute', top: 10, right: 10, background: '#2563eb', color: '#fff', borderRadius: '50%', width: 20, height: 20, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <Check size={12} strokeWidth={3} />
                    </div>
                  ) : null}
                  <div style={{ marginTop: 6, fontSize: '0.75rem', lineHeight: 1.3 }}>
                    <strong style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{asset.title}</strong>
                    {asset.width && asset.height ? (
                      <span style={{ color: '#64748b', fontSize: '0.7rem' }}>
                        {asset.width}×{asset.height} ({formatAspectRatio(asset.width, asset.height)})
                      </span>
                    ) : null}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function MediaPickerField({
  label,
  value,
  onChange,
  altLabel = 'Alt text',
  altValue = '',
  onAltChange,
  helperText,
  aspectRatioHint,
  pickLabel,
  placeholder = 'https://example.com/asset.jpg'
}: MediaPickerFieldProps) {
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(() => {
    if (!value || !mediaAssetCache) return null;
    return mediaAssetCache.find((asset) => asset.url === value) ?? null;
  });

  useEffect(() => {
    if (!value) {
      setSelectedAsset(null);
      return;
    }

    if (mediaAssetCache) {
      const match = mediaAssetCache.find((asset) => asset.url === value) ?? null;
      setSelectedAsset(match);
      if (match) {
        return;
      }
    }

    loadMediaAssets()
      .then((assets) => {
        setSelectedAsset(assets.find((asset) => asset.url === value) ?? null);
      })
      .catch(() => {
        setSelectedAsset(null);
      });
  }, [value]);

  return (
    <div className="admin-media-field" style={{ position: 'relative' }}>
      <label>
        <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
          <span>{label}</span>
          {aspectRatioHint ? (
            <span style={{ fontSize: '0.72rem', color: '#64748b', fontWeight: 'normal' }}>
              Ratio: {aspectRatioHint}
            </span>
          ) : null}
        </span>
        <div className="admin-media-input-row" style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          {value ? (
            <div style={{ width: 38, height: 38, borderRadius: 6, overflow: 'hidden', border: '1px solid var(--line, #e2e8f0)', flexShrink: 0, background: '#f8fafc' }}>
              <img src={value} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
          ) : (
            <div style={{ width: 38, height: 38, borderRadius: 6, border: '1px dashed var(--line, #cbd5e1)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8fafc' }}>
              <ImageIcon size={16} className="text-slate-400" />
            </div>
          )}
          <input
            value={value}
            onChange={(event) => onChange(event.target.value)}
            placeholder={placeholder}
            style={{ flex: 1 }}
          />
          <MediaAssetBrowser
            buttonLabel={pickLabel}
            selectedUrl={value}
            uploadContextLabel={label}
            suggestedAltText={altValue}
            onSelect={(asset) => {
              onChange(asset.url);
              setSelectedAsset(asset);
              if (onAltChange) {
                onAltChange(asset.altText || asset.title || '');
              }
            }}
          />
          {value ? (
            <button
              type="button"
              className="v2-btn v2-btn-secondary"
              style={{ padding: '6px 10px', color: '#ef4444', display: 'inline-flex', alignItems: 'center', gap: 4 }}
              title="Remove image"
              onClick={() => onChange('')}
            >
              <X size={14} />
            </button>
          ) : null}
        </div>
      </label>

      {helperText ? <p className="admin-subtle" style={{ margin: '4px 0 0', fontSize: '0.78rem' }}>{helperText}</p> : null}

      {value ? (
        <div className="admin-media-preview" style={{ marginTop: 8, borderRadius: 8, overflow: 'hidden', border: '1px solid var(--line, #e2e8f0)', maxHeight: 180, background: '#f8fafc' }}>
          <img src={value} alt={altValue || previewAltText(value)} style={{ maxHeight: 180, width: 'auto', objectFit: 'contain', margin: '0 auto', display: 'block' }} />
        </div>
      ) : null}

      {selectedAsset ? (
        <div className="admin-media-meta" style={{ display: 'flex', gap: 12, fontSize: '0.75rem', color: '#64748b', marginTop: 4, flexWrap: 'wrap' }}>
          <strong>{selectedAsset.title}</strong>
          {selectedAsset.width && selectedAsset.height ? (
            <span>{selectedAsset.width} × {selectedAsset.height} ({formatAspectRatio(selectedAsset.width, selectedAsset.height)})</span>
          ) : null}
        </div>
      ) : null}

      {onAltChange ? (
        <label style={{ marginTop: 8 }}>
          {altLabel}
          <input value={altValue} onChange={(event) => onAltChange(event.target.value)} placeholder="Describe this image for screen readers and SEO..." />
        </label>
      ) : null}
    </div>
  );
}

export function MediaGalleryField({ label, values, onChange, helperText }: MediaGalleryFieldProps) {
  const items = useMemo(() => Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))), [values]);

  return (
    <div className="admin-media-field">
      <div className="admin-inline-header" style={{ alignItems: 'center' }}>
        <div>
          <h3 className="admin-section-heading" style={{ margin: 0 }}>{label}</h3>
          {helperText ? <p className="admin-subtle" style={{ margin: '2px 0 0' }}>{helperText}</p> : null}
        </div>
        <MediaAssetBrowser
          buttonLabel="Browse library"
          uploadLabel="Upload image"
          uploadContextLabel={label}
          onSelect={(asset) => {
            if (items.includes(asset.url)) return;
            onChange([...items, asset.url]);
          }}
        />
      </div>

      {items.length === 0 ? <p className="admin-subtle" style={{ marginTop: 8 }}>No gallery images selected yet.</p> : null}

      <div className="admin-media-gallery-list" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
        {items.map((item, index) => (
          <article
            className="admin-media-gallery-item"
            key={`${item}-${index}`}
            style={{
              position: 'relative',
              borderRadius: 8,
              border: '1px solid var(--line, #e2e8f0)',
              background: 'var(--panel, #f8fafc)',
              overflow: 'hidden',
              padding: 8
            }}
          >
            <div className="admin-media-gallery-thumb" style={{ width: '100%', height: 110, borderRadius: 6, overflow: 'hidden', background: '#e2e8f0' }}>
              <img src={item} alt={previewAltText(item)} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </div>
            <div className="admin-media-gallery-meta" style={{ marginTop: 6 }}>
              <span style={{ fontSize: '0.78rem', fontWeight: 600, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {previewAltText(item)}
              </span>
              <p style={{ fontSize: '0.7rem', color: '#64748b', margin: '2px 0 0', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {item}
              </p>
            </div>
            <button
              type="button"
              className="v2-btn v2-btn-secondary"
              style={{
                position: 'absolute',
                top: 12,
                right: 12,
                padding: '4px 6px',
                background: 'rgba(255,255,255,0.9)',
                color: '#ef4444',
                border: '1px solid #fecaca',
                borderRadius: 6
              }}
              title="Remove image"
              onClick={() => onChange(items.filter((url) => url !== item))}
            >
              <Trash2 size={13} />
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
