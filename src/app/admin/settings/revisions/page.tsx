'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { AdminLoading } from '@/components/admin/AdminLoading';
import type { CmsContentRevisionSummary } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

const PAGE_SIZE = 10;

type RevisionsResponse = {
  revisions: CmsContentRevisionSummary[];
  meta: { total: number; page: number; pageSize: number };
};

function SettingsRevisionsList() {
  const [revisions, setRevisions] = useState<CmsContentRevisionSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [restoringId, setRestoringId] = useState('');

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const loadPage = useCallback(async (nextPage: number) => {
    setLoading(true);
    setError('');

    const params = new URLSearchParams({
      entityType: 'site_settings',
      entityId: 'default',
      page: String(nextPage),
      pageSize: String(PAGE_SIZE)
    });

    const response = await csrfFetch(`/api/admin/revisions?${params.toString()}`);
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load revision history.');
      return;
    }

    const payload = (await response.json()) as RevisionsResponse;
    setRevisions(payload.revisions);
    setTotal(payload.meta.total);
    setPage(payload.meta.page);
    setLoading(false);
  }, []);

  useEffect(() => {
    void loadPage(1);
  }, [loadPage]);

  const restoreRevision = async (revisionId: string) => {
    if (!confirm('Restore this revision? Current saved settings will be overwritten.')) return;

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

    setNotice('Revision restored.');
    await loadPage(1);
  };

  return (
    <section className="admin-card">
      <div className="admin-inline-header">
        <h2>All settings revisions</h2>
        <div className="admin-actions" style={{ alignItems: 'center' }}>
          <span className="admin-subtle">{total} entries</span>
          <Link href="/admin/settings" className="v2-btn v2-btn-secondary">
            Back to settings
          </Link>
        </div>
      </div>

      {notice ? <p className="admin-subtle">{notice}</p> : null}
      {error ? <p className="admin-error-text">{error}</p> : null}

      {loading ? (
        <AdminLoading label="Loading revisions..." />
      ) : revisions.length === 0 ? (
        <p className="admin-subtle">No settings revisions saved yet.</p>
      ) : (
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
      )}

      {totalPages > 1 ? (
        <div className="admin-actions" style={{ marginTop: 16, alignItems: 'center' }}>
          <AdminActionButton
            icon="chevron_left"
            size="sm"
            variant="secondary"
            disabled={loading || page <= 1}
            onClick={() => void loadPage(page - 1)}
          >
            Previous
          </AdminActionButton>
          <span className="admin-subtle">
            Page {page} of {totalPages}
          </span>
          <AdminActionButton
            icon="chevron_right"
            size="sm"
            variant="secondary"
            disabled={loading || page >= totalPages}
            onClick={() => void loadPage(page + 1)}
          >
            Next
          </AdminActionButton>
        </div>
      ) : null}
    </section>
  );
}

export default function AdminSettingsRevisionsPage() {
  return (
    <AdminShell
      title="Settings Revisions"
      description="Full revision history for site settings, with what changed, who saved it, and when."
    >
      {() => <SettingsRevisionsList />}
    </AdminShell>
  );
}
