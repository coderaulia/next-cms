'use client';

import { useEffect, useRef, useState } from 'react';

import type { CmsCollectionExport, CmsImportCollection, CmsImportMode, CmsImportResult } from '@/features/cms/importExport';
import { csrfFetch } from '@/lib/clientCsrf';

type JsonImportExportCardProps = {
  collection: CmsImportCollection;
  title: string;
  description: string;
  allowReplace?: boolean;
  defaultMode?: CmsImportMode;
  fixedMode?: CmsImportMode;
  importHint?: string;
  onImported?: (result: CmsImportResult) => void | Promise<void>;
};

function downloadJson(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function buildFilename(collection: CmsImportCollection) {
  const datePart = new Date().toISOString().slice(0, 10);
  if (collection === 'fullSite') return `cms-backup-${datePart}.json`;
  return `${collection}-${datePart}.json`;
}

export function JsonImportExportCard({
  collection,
  title,
  description,
  allowReplace = true,
  defaultMode = 'merge',
  fixedMode,
  importHint,
  onImported
}: JsonImportExportCardProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [jsonValue, setJsonValue] = useState('');
  const [mode, setMode] = useState<CmsImportMode>(fixedMode ?? defaultMode);
  const [busyAction, setBusyAction] = useState<'export' | 'import' | null>(null);
  const [notice, setNotice] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    setMode(fixedMode ?? defaultMode);
  }, [defaultMode, fixedMode]);

  const handleExport = async () => {
    setBusyAction('export');
    setNotice('');
    setError('');

    const response = await fetch(`/api/admin/import-export?collection=${collection}`, {
      cache: 'no-store'
    });

    setBusyAction(null);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || 'Failed to export JSON.');
      return;
    }

    const payload = (await response.json()) as CmsCollectionExport;
    downloadJson(buildFilename(collection), payload);
    setNotice('JSON export downloaded.');
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const text = await file.text();
    setJsonValue(text);
    setNotice(`Loaded ${file.name}.`);
    setError('');
    event.target.value = '';
  };

  const handleImport = async () => {
    setNotice('');
    setError('');

    if (!jsonValue.trim()) {
      setError('Paste JSON or load a file before importing.');
      return;
    }

    let parsed: unknown;
    try {
      parsed = JSON.parse(jsonValue);
    } catch {
      setError('Invalid JSON syntax.');
      return;
    }

    const importMode = fixedMode ?? mode;

    setBusyAction('import');

    const response = await csrfFetch('/api/admin/import-export', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        collection,
        mode: importMode,
        payload: parsed
      })
    });

    setBusyAction(null);

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(payload?.error || 'Failed to import JSON.');
      return;
    }

    const payload = (await response.json()) as CmsImportResult;
    setNotice(`Imported ${payload.importedCount} item(s). Totals now: ${payload.totals.pages} pages, ${payload.totals.blogPosts} posts, ${payload.totals.portfolioProjects} projects.`);
    if (onImported) {
      await onImported(payload);
    }
  };

  return (
    <section className="admin-card admin-json-transfer-card">
      <div className="admin-inline-header">
        <div>
          <h2>{title}</h2>
          <p className="admin-subtle">{description}</p>
        </div>
        <div className="admin-actions">
          <button type="button" onClick={handleExport} disabled={busyAction !== null}>
            {busyAction === 'export' ? 'Exporting...' : 'Export JSON'}
          </button>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={() => fileInputRef.current?.click()} disabled={busyAction !== null}>
            Load JSON file
          </button>
          <input ref={fileInputRef} type="file" accept="application/json,.json" onChange={handleFileChange} hidden />
        </div>
      </div>

      {fixedMode ? (
        <div className="admin-json-transfer-controls">
          <p className="admin-subtle">{importHint || (fixedMode === 'replace' ? 'Imported JSON will replace the current collection.' : 'Imported JSON will merge into the current collection.')}</p>
        </div>
      ) : (
        <div className="admin-json-transfer-controls">
          <label>
            Import mode
            <select value={mode} onChange={(event) => setMode(event.target.value as CmsImportMode)} disabled={busyAction !== null}>
              <option value="merge">Merge into current content</option>
              {allowReplace ? <option value="replace">Replace this collection</option> : null}
            </select>
          </label>
        </div>
      )}

      <label>
        JSON payload
        <textarea
          className="admin-json-transfer-textarea"
          rows={12}
          placeholder="Paste exported JSON here or load a .json file."
          value={jsonValue}
          onChange={(event) => setJsonValue(event.target.value)}
        />
      </label>

      <div className="admin-inline-header">
        <p className="admin-subtle">{importHint || 'Exports match the current CMS schema so you can batch-edit content offline and re-import it safely.'}</p>
        <button type="button" onClick={handleImport} disabled={busyAction !== null}>
          {busyAction === 'import' ? 'Importing...' : 'Import JSON'}
        </button>
      </div>

      {notice ? <p className="admin-subtle">{notice}</p> : null}
      {error ? <p className="admin-error-text">{error}</p> : null}
    </section>
  );
}
