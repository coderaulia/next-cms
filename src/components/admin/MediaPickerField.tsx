'use client';

import { useEffect, useMemo, useState } from 'react';

import type { MediaAsset } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

type MediaResponse = {
  mediaAssets: MediaAsset[];
};

type MediaAssetBrowserProps = {
  buttonLabel?: string;
  onSelect: (asset: MediaAsset) => void;
  selectedUrl?: string;
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
      mediaAssetCache = payload.mediaAssets.filter(isImageAsset);
      return mediaAssetCache;
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

function MediaAssetBrowser({ buttonLabel = 'Choose from media', onSelect, selectedUrl = '' }: MediaAssetBrowserProps) {
  const [open, setOpen] = useState(false);
  const [assets, setAssets] = useState<MediaAsset[]>(mediaAssetCache ?? []);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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
      <button type="button" className="v2-btn v2-btn-secondary" onClick={() => setOpen((current) => !current)}>
        {open ? 'Close media' : buttonLabel}
      </button>

      {open ? (
        <div className="admin-media-browser">
          <div className="admin-inline-header">
            <div>
              <p className="admin-kpi-label">Media library</p>
              <p className="admin-subtle">Pick from uploaded images without copying URLs.</p>
            </div>
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search images"
            />
          </div>

          {loading ? <p className="admin-subtle">Loading media assets...</p> : null}
          {error ? <p className="admin-error-text">{error}</p> : null}

          {!loading && filteredAssets.length === 0 ? (
            <p className="admin-subtle">No images match this search.</p>
          ) : null}

          <div className="admin-media-grid">
            {filteredAssets.map((asset) => {
              const active = selectedUrl === asset.url;
              return (
                <button
                  key={asset.id}
                  type="button"
                  className={`admin-media-option ${active ? 'active' : ''}`}
                  onClick={() => {
                    onSelect(asset);
                    setOpen(false);
                  }}
                >
                  <div className="admin-media-option-thumb">
                    <img src={asset.url} alt={asset.altText || asset.title} />
                  </div>
                  <div>
                    <strong>{asset.title}</strong>
                    <span>{asset.altText || asset.url}</span>
                    {asset.width && asset.height ? (
                      <span>
                        {asset.width} x {asset.height} ({formatAspectRatio(asset.width, asset.height)})
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
    <div className="admin-media-field">
      <label>
        {label}
        <div className="admin-media-input-row">
          <input value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} />
          <MediaAssetBrowser
            buttonLabel={pickLabel}
            selectedUrl={value}
            onSelect={(asset) => {
              onChange(asset.url);
              setSelectedAsset(asset);
              if (onAltChange) {
                onAltChange(asset.altText || asset.title || '');
              }
            }}
          />
          {value ? (
            <button type="button" className="v2-btn v2-btn-secondary" onClick={() => onChange('')}>
              Clear
            </button>
          ) : null}
        </div>
      </label>

      {helperText ? <p className="admin-subtle">{helperText}</p> : null}
      {aspectRatioHint ? <p className="admin-subtle">Recommended ratio: {aspectRatioHint}</p> : null}

      {value ? (
        <div className="admin-media-preview">
          <img src={value} alt={altValue || previewAltText(value)} />
        </div>
      ) : null}

      {selectedAsset ? (
        <div className="admin-media-meta">
          <span>{selectedAsset.title}</span>
          <span>{selectedAsset.altText || 'No alt text on the selected asset yet.'}</span>
          {selectedAsset.width && selectedAsset.height ? (
            <span>
              {selectedAsset.width} x {selectedAsset.height} ({formatAspectRatio(selectedAsset.width, selectedAsset.height)})
            </span>
          ) : (
            <span>Stored dimensions are not available for this asset.</span>
          )}
        </div>
      ) : null}

      {onAltChange ? (
        <label>
          {altLabel}
          <input value={altValue} onChange={(event) => onAltChange(event.target.value)} placeholder="Describe this image" />
        </label>
      ) : null}
    </div>
  );
}

export function MediaGalleryField({ label, values, onChange, helperText }: MediaGalleryFieldProps) {
  const items = useMemo(() => Array.from(new Set(values.map((item) => item.trim()).filter(Boolean))), [values]);

  return (
    <div className="admin-media-field">
      <div className="admin-inline-header">
        <div>
          <p className="admin-kpi-label">{label}</p>
          {helperText ? <p className="admin-subtle">{helperText}</p> : null}
        </div>
        <MediaAssetBrowser
          buttonLabel="Add from media"
          onSelect={(asset) => {
            if (items.includes(asset.url)) return;
            onChange([...items, asset.url]);
          }}
        />
      </div>

      {items.length === 0 ? <p className="admin-subtle">No gallery images selected yet.</p> : null}

      <div className="admin-media-gallery-list">
        {items.map((item, index) => (
          <article className="admin-media-gallery-item" key={`${item}-${index}`}>
            <div className="admin-media-gallery-thumb">
              <img src={item} alt={previewAltText(item)} />
            </div>
            <div className="admin-media-gallery-meta">
              <span>{previewAltText(item)}</span>
              <p>{item}</p>
            </div>
            <button type="button" className="v2-btn v2-btn-secondary" onClick={() => onChange(items.filter((url) => url !== item))}>
              Remove
            </button>
          </article>
        ))}
      </div>
    </div>
  );
}
