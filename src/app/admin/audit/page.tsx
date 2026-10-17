'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, History, Search, Shield, User } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { AdminLoading } from '@/components/admin/AdminLoading';

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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [entityFilter, setEntityFilter] = useState('all');
  const canViewAudit = user.permissions.includes('audit:view');

  useEffect(() => {
    if (!canViewAudit) {
      setLoading(false);
      return;
    }

    setLoading(true);
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
      })
      .finally(() => {
        setLoading(false);
      });
  }, [canViewAudit]);

  const entityTypes = useMemo(() => {
    const set = new Set<string>();
    for (const entry of entries) {
      if (entry.entityType) set.add(entry.entityType);
    }
    return Array.from(set).sort();
  }, [entries]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return entries.filter((entry) => {
      if (entityFilter !== 'all' && entry.entityType !== entityFilter) return false;
      if (!needle) return true;
      const haystack = `${entry.action} ${entry.entityType} ${entry.entityId ?? ''} ${entry.userId ?? ''} ${entry.ip}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [entries, entityFilter, query]);

  if (!canViewAudit) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include access to audit logs.</p>
      </section>
    );
  }

  if (loading) return <AdminLoading label="Loading audit logs..." />;

  const getActionChipClass = (action: string) => {
    const act = action.toLowerCase();
    if (act.includes('delete') || act.includes('revoke') || act.includes('unpublish')) {
      return 'admin-chip-danger';
    }
    if (act.includes('create') || act.includes('publish') || act.includes('import')) {
      return 'admin-chip-success';
    }
    if (act.includes('update') || act.includes('replace') || act.includes('edit')) {
      return 'admin-chip-warning';
    }
    return 'admin-chip-muted';
  };

  return (
    <div className="admin-form-wrap">
      {/* Header & Filter Card */}
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              <h2 className="m-0 text-lg font-bold text-slate-900">System Activity Stream</h2>
            </div>
            <p className="admin-subtle text-xs mt-0.5">
              Append-only audit trail recording changes across content, users, media, and settings.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search action, user, or IP..."
                className="pl-8 text-xs py-1.5 w-52"
              />
            </div>

            <select
              value={entityFilter}
              onChange={(e) => setEntityFilter(e.target.value)}
              className="text-xs py-1.5 px-3 border border-slate-200 rounded-lg"
            >
              <option value="all">All entity types</option>
              {entityTypes.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {error ? <p className="error text-sm text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg">{error}</p> : null}

      {/* Audit Log Table */}
      <section className="admin-card">
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Timestamp</th>
                <th>Action</th>
                <th>Entity</th>
                <th>Operator</th>
                <th>Origin IP</th>
                <th>Payload details</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((entry) => (
                <tr key={entry.id}>
                  <td className="text-slate-600 text-xs whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-slate-400" />
                      <span>{new Date(entry.createdAt).toLocaleString()}</span>
                    </div>
                  </td>
                  <td>
                    <span className={`admin-chip ${getActionChipClass(entry.action)} inline-flex items-center gap-1.5 text-[11px]`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                      {entry.action}
                    </span>
                  </td>
                  <td>
                    <strong className="text-slate-900 text-xs">{entry.entityType}</strong>
                    {entry.entityId ? (
                      <span className="admin-subtle text-[11px] block font-mono">
                        ID: {entry.entityId.slice(0, 12)}
                      </span>
                    ) : null}
                  </td>
                  <td className="text-xs">
                    <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                      <User className="w-3 h-3 text-slate-400" />
                      <span>{entry.userId || 'system'}</span>
                    </div>
                  </td>
                  <td>
                    <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                      {entry.ip}
                    </code>
                  </td>
                  <td>
                    <details className="cursor-pointer text-xs">
                      <summary className="text-blue-600 hover:text-blue-800 font-medium select-none text-[11px]">
                        Inspect JSON ({Object.keys(entry.metadata || {}).length} keys)
                      </summary>
                      <pre className="admin-json-preview mt-2 max-h-48 overflow-y-auto text-[11px]">
                        {JSON.stringify(entry.metadata, null, 2)}
                      </pre>
                    </details>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-subtle py-10 text-center">
                    No audit events match the current filter.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

export default function AdminAuditPage() {
  return (
    <AdminShell
      title="Audit Log"
      description="Review chronological admin activity for publishing, media, security, and settings operations."
      actions={() => (
        <span className="inline-flex items-center gap-1.5 text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-xl border border-slate-200">
          <Shield className="w-3.5 h-3.5 text-emerald-600" />
          <span>Immutable audit record</span>
        </span>
      )}
    >
      {(user) => <AuditLogPanel user={user} />}
    </AdminShell>
  );
}
