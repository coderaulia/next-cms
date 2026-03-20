'use client';

import { useCallback, useEffect, useState } from 'react';

import type {
  CmsContentRevisionSummary,
  CmsRevisionEntityType,
  CmsRevisionPayload
} from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminActionButton } from './AdminActionButton';

type RestoreResponse = {
  entityType: CmsRevisionEntityType;
  entityId: string;
  payload: CmsRevisionPayload;
};

type ContentRevisionPanelProps<TPayload extends CmsRevisionPayload = CmsRevisionPayload> = {
  entityType: CmsRevisionEntityType;
  entityId: string;
  title?: string;
  emptyMessage?: string;
  reloadKey?: number;
  onRestore?: (payload: TPayload) => void;
};

export function ContentRevisionPanel<TPayload extends CmsRevisionPayload = CmsRevisionPayload>({
  entityType,
  entityId,
  title = 'Revision history',
  emptyMessage = 'No saved revisions yet.',
  reloadKey = 0,
  onRestore
}: ContentRevisionPanelProps<TPayload>) {
  const [revisions, setRevisions] = useState<CmsContentRevisionSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [restoringId, setRestoringId] = useState('');

  const loadRevisions = useCallback(async () => {
    if (!entityId) {
      setRevisions([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      entityType,
      entityId,
      limit: '10'
    });

    const response = await csrfFetch(`/api/admin/revisions?${params.toString()}`);
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load revision history.');
      return;
    }

    try {
      const payload = (await response.json()) as { revisions?: CmsContentRevisionSummary[] };
      setRevisions(Array.isArray(payload.revisions) ? payload.revisions : []);
      setLoading(false);
    } catch {
      setRevisions([]);
      setLoading(false);
      setError('Failed to load revision history.');
    }
  }, [entityId, entityType]);

  useEffect(() => {
    void loadRevisions();
  }, [loadRevisions, reloadKey]);

  const restoreRevision = async (revisionId: string) => {
    if (!confirm('Restore this revision? Current saved content will be overwritten.')) {
      return;
    }

    setRestoringId(revisionId);
    setNotice('');
    setError('');

    const response = await csrfFetch(`/api/admin/revisions/${revisionId}/restore`, {
      method: 'POST'
    });

    setRestoringId('');

    if (!response.ok) {
      setError('Failed to restore revision.');
      return;
    }

    const payload = (await response.json()) as RestoreResponse;
    onRestore?.(payload.payload as TPayload);
    setNotice('Revision restored.');
    await loadRevisions();
  };

  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>{title}</h2>
        {loading ? <span className="admin-subtle">Loading...</span> : <span className="admin-subtle">{revisions.length} entries</span>}
      </div>
      {notice ? <p className="admin-subtle">{notice}</p> : null}
      {error ? <p className="admin-error-text">{error}</p> : null}
      {loading ? <p className="admin-subtle">Loading revision history...</p> : null}
      {!loading && revisions.length === 0 ? <p className="admin-subtle">{emptyMessage}</p> : null}
      {revisions.length > 0 ? (
        <ul className="admin-plain-list admin-revision-list">
          {revisions.map((revision) => (
            <li key={revision.id}>
              <div className="admin-revision-row">
                <div>
                  <strong>{revision.label}</strong>
                  <span>{revision.summary}</span>
                  <span>
                    {new Date(revision.createdAt).toLocaleString()}
                    {revision.userDisplayName ? ` | ${revision.userDisplayName}` : ''}
                  </span>
                </div>
                <AdminActionButton
                  icon="history_edu"
                  size="sm"
                  variant="secondary"
                  disabled={restoringId === revision.id}
                  onClick={() => void restoreRevision(revision.id)}
                >
                  {restoringId === revision.id ? 'Restoring...' : 'Restore'}
                </AdminActionButton>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
