'use client';

import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { AdminActionButton } from '@/components/admin/AdminActionButton';
import { AdminLoading } from '@/components/admin/AdminLoading';
import type { CmsContentRevisionSummary } from '@/features/cms/types';
import { csrfFetch } from '@/lib/clientCsrf';

import { ArrowLeft, Clock, History, RotateCcw, User } from 'lucide-react';

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
      <div className="admin-inline-header" style={{ alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <History size={20} className="text-blue-600" />
          <div>
            <h2 style={{ margin: 0 }}>All Settings Revisions</h2>
            <p className="admin-subtle" style={{ margin: '2px 0 0' }}>
              Restore previous configuration states or audit past setting changes.
            </p>
          </div>
        </div>
        <div className="admin-actions" style={{ alignItems: 'center' }}>
          <span className="admin-chip admin-chip-muted">{total} total revisions</span>
          <Link href="/admin/settings" className="v2-btn v2-btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={15} />
            <span>Back to settings</span>
          </Link>
        </div>
      </div>

      {notice ? <p className="admin-subtle" style={{ color: '#16a34a', fontWeight: 600 }}>{notice}</p> : null}
      {error ? <p className="admin-error-text">{error}</p> : null}

      {loading ? (
        <AdminLoading label="Loading revisions..." />
      ) : revisions.length === 0 ? (
        <p className="admin-subtle" style={{ padding: '24px 0', textAlign: 'center' }}>No settings revisions saved yet.</p>
      ) : (
        <ul className="admin-plain-list admin-revision-list" style={{ marginTop: 16 }}>
          {revisions.map((revision) => (
            <li key={revision.id} style={{ marginBottom: 12 }}>
              <div className="admin-revision-row" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '14px 18px', background: 'var(--panel, #f8fafc)', border: '1px solid var(--line, #e2e8f0)', borderRadius: '10px' }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <strong style={{ fontSize: '0.95rem' }}>{revision.label}</strong>
                    <span className="admin-chip admin-chip-muted" style={{ fontSize: '0.72rem' }}>
                      {revision.entityType}
                    </span>
                  </div>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted, #64748b)' }}>{revision.summary}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, fontSize: '0.78rem', color: '#94a3b8', marginTop: 2 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                      <Clock size={13} />
                      {new Date(revision.createdAt).toLocaleString()}
                    </span>
                    {revision.userDisplayName ? (
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
                        <User size={13} />
                        {revision.userDisplayName}
                      </span>
                    ) : null}
                  </div>
                </div>
                <button
                  type="button"
                  className="v2-btn v2-btn-secondary"
                  style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: '0.82rem', padding: '6px 12px' }}
                  disabled={restoringId === revision.id}
                  onClick={() => void restoreRevision(revision.id)}
                >
                  <RotateCcw size={14} />
                  <span>{restoringId === revision.id ? 'Restoring...' : 'Restore'}</span>
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 ? (
        <div className="admin-actions" style={{ marginTop: 20, alignItems: 'center', justifyContent: 'center' }}>
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
