'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import type {
  CmsContentRevisionSummary,
  CmsRevisionEntityType,
  CmsRevisionPayload
} from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

import { Clock, History, RotateCcw, User } from 'lucide-react';

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
  limit?: number;
  viewAllHref?: string;
  onRestore?: (payload: TPayload) => void;
};

export function ContentRevisionPanel<TPayload extends CmsRevisionPayload = CmsRevisionPayload>({
  entityType,
  entityId,
  title = 'Revision history',
  emptyMessage = 'No saved revisions yet.',
  reloadKey = 0,
  limit = 10,
  viewAllHref,
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
      limit: String(limit)
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
  }, [entityId, entityType, limit]);

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
      <div className="admin-inline-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <History size={16} className="text-blue-600" />
          <h3 className="admin-section-heading" style={{ margin: 0, fontSize: '0.95rem' }}>{title}</h3>
        </div>
        <div className="admin-actions" style={{ alignItems: 'center' }}>
          {loading ? (
            <span className="admin-subtle" style={{ fontSize: '0.78rem' }}>Loading...</span>
          ) : (
            <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.72rem' }}>{revisions.length} saved</span>
          )}
          {viewAllHref ? (
            <Link href={viewAllHref} className="v2-btn v2-btn-secondary" style={{ fontSize: '0.78rem', padding: '3px 8px' }}>
              View all
            </Link>
          ) : null}
        </div>
      </div>
      {notice ? <p className="admin-subtle" style={{ color: '#16a34a', fontWeight: 600, fontSize: '0.8rem' }}>{notice}</p> : null}
      {error ? <p className="admin-error-text" style={{ fontSize: '0.8rem' }}>{error}</p> : null}
      {loading ? <p className="admin-subtle" style={{ fontSize: '0.8rem' }}>Loading revision history...</p> : null}
      {!loading && revisions.length === 0 ? <p className="admin-subtle" style={{ fontSize: '0.8rem', padding: '8px 0' }}>{emptyMessage}</p> : null}
      {revisions.length > 0 ? (
        <ul className="admin-plain-list admin-revision-list" style={{ marginTop: 8, display: 'flex', flexDirection: 'column', gap: 8 }}>
          {revisions.map((revision) => (
            <li key={revision.id} style={{ listStyle: 'none' }}>
              <div
                className="admin-revision-row"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 12px',
                  background: 'var(--panel, #f8fafc)',
                  border: '1px solid var(--line, #e2e8f0)',
                  borderRadius: 8,
                  gap: 8
                }}
              >
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2, minWidth: 0, flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    <strong style={{ fontSize: '0.82rem', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {revision.label}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', color: '#64748b', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {revision.summary}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: '0.7rem', color: '#94a3b8' }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                      <Clock size={11} />
                      {new Date(revision.createdAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </span>
                    {revision.userDisplayName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3 }}>
                        <User size={11} />
                        {revision.userDisplayName}
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: '0.75rem', padding: '4px 8px', flexShrink: 0 }}
                  disabled={restoringId === revision.id}
                  onClick={() => void restoreRevision(revision.id)}
                  title="Restore this revision"
                >
                  <RotateCcw size={12} />
                  <span>{restoringId === revision.id ? 'Restoring...' : 'Restore'}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      ) : null}
    </section>
  );
}
