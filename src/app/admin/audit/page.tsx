'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';

type AuditLogEntry = {
  id: string;
  action: string;
  entityType: string;
  entityId: string | null;
  userId: string | null;
  ip: string;
  userAgent: string;
  createdAt: string;
  metadata: Record<string, unknown>;
};

type AuditLogPanelProps = {
  user: AdminSessionUser;
};

function AuditLogPanel({ user }: AuditLogPanelProps) {
  const [entries, setEntries] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState('');
  const canViewAudit = user.permissions.includes('audit:view');

  useEffect(() => {
    if (!canViewAudit) {
      return;
    }

    fetch('/api/admin/audit?limit=100')
      .then(async (response) => {
        if (!response.ok) {
          throw new Error('Failed to load audit logs.');
        }
        const payload = (await response.json()) as { auditLogs: AuditLogEntry[] };
        setEntries(payload.auditLogs);
      })
      .catch((err: unknown) => {
        setError(err instanceof Error ? err.message : 'Failed to load audit logs.');
      });
  }, [canViewAudit]);

  if (!canViewAudit) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include access to audit logs.</p>
      </section>
    );
  }
  if (error) return <p className="error">{error}</p>;

  return (
    <section className="admin-card">
      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>When</th>
              <th>Action</th>
              <th>Entity</th>
              <th>User</th>
              <th>IP</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr key={entry.id}>
                <td>{new Date(entry.createdAt).toLocaleString()}</td>
                <td>{entry.action}</td>
                <td>
                  {entry.entityType}
                  {entry.entityId ? <span className="admin-subtle">{entry.entityId}</span> : null}
                </td>
                <td>{entry.userId || 'system'}</td>
                <td>{entry.ip}</td>
                <td>
                  <pre className="admin-json-preview">{JSON.stringify(entry.metadata, null, 2)}</pre>
                </td>
              </tr>
            ))}
            {entries.length === 0 ? (
              <tr>
                <td colSpan={6} className="admin-subtle">No audit events recorded yet.</td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </section>
  );
}

export default function AdminAuditPage() {
  return (
    <AdminShell title="Audit Log" description="Review admin activity for publishing, media, and settings changes.">
      {(user) => <AuditLogPanel user={user} />}
    </AdminShell>
  );
}
