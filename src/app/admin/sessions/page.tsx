'use client';

import { useEffect, useState } from 'react';
import { Clock, Laptop, LogOut, ShieldCheck, Trash2, User } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { logoutAllAdminSessions } from '@/features/cms/adminClientAuth';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

type SessionInfo = {
  id: string;
  userId: string;
  userEmail: string;
  userDisplayName: string;
  userRole: string;
  expiresAt: string;
  createdAt: string;
  isCurrent: boolean;
};

function formatTimeAgo(dateStr: string): string {
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  return `${diffDays}d ago`;
}

function SessionCard({
  session,
  onRevoke,
  revoking
}: {
  session: SessionInfo;
  onRevoke: (id: string) => void;
  revoking: boolean;
}) {
  const expiresDate = new Date(session.expiresAt);
  const createdDate = new Date(session.createdAt);
  const isExpired = expiresDate < new Date();

  return (
    <article
      className={`p-4 rounded-2xl border transition-all ${
        session.isCurrent ? 'bg-blue-50/40 border-blue-200' : 'bg-white border-slate-200'
      }`}
    >
      <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center font-bold text-sm shrink-0">
            {session.userDisplayName.slice(0, 2).toUpperCase()}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <strong className="text-slate-900 text-sm">{session.userDisplayName}</strong>
              {session.isCurrent ? (
                <span className="admin-chip admin-chip-success inline-flex items-center gap-1 text-[10px]">
                  <span className="w-1.5 h-1.5 rounded-full bg-current opacity-80" />
                  current device
                </span>
              ) : null}
            </div>
            <span className="admin-subtle text-xs block">{session.userEmail}</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span
            className={`admin-chip ${
              isExpired ? 'admin-chip-danger' : 'admin-chip-muted'
            } inline-flex items-center gap-1.5 text-[10px]`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
            {isExpired ? 'expired' : `expires ${expiresDate.toLocaleDateString()}`}
          </span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500 pt-2 border-t border-slate-100">
        <div className="flex items-center gap-1">
          <Clock className="w-3.5 h-3.5 text-slate-400" />
          <span>Active for {formatTimeAgo(session.createdAt)}</span>
        </div>
        <div className="flex items-center gap-1">
          <Laptop className="w-3.5 h-3.5 text-slate-400" />
          <span>Created {createdDate.toLocaleDateString()}</span>
        </div>
        <div>
          <span className="text-slate-400">ID: </span>
          <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1 py-0.5 rounded border border-slate-200">
            {session.id.slice(0, 8)}...
          </code>
        </div>
      </div>

      {!session.isCurrent && (
        <div className="mt-3 pt-2 border-t border-slate-100 flex justify-end">
          <button
            type="button"
            disabled={revoking}
            onClick={() => onRevoke(session.id)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 transition-colors"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{revoking ? 'Revoking...' : 'Revoke session'}</span>
          </button>
        </div>
      )}
    </article>
  );
}

type SessionsManagerProps = {
  user: AdminSessionUser;
};

function SessionsManager({ user }: SessionsManagerProps) {
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [signingOutAll, setSigningOutAll] = useState(false);
  const [notice, setNotice] = useState('');

  const canManageTeam = user.permissions.includes('team:manage');

  const loadSessions = async () => {
    setLoading(true);
    setError('');

    const response = await csrfFetch('/api/admin/sessions');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load sessions.');
      return;
    }

    const payload = (await response.json()) as { sessions: SessionInfo[] };
    setSessions(payload.sessions);
    setLoading(false);
  };

  useEffect(() => {
    if (!canManageTeam) {
      setLoading(false);
      return;
    }

    void loadSessions();
  }, [canManageTeam]);

  const handleRevoke = async (sessionId: string) => {
    if (!confirm('Revoke this session? The user will be logged out on that device immediately.')) return;

    setRevokingId(sessionId);
    setError('');
    setNotice('');

    const response = await csrfFetch(`/api/admin/sessions?id=${sessionId}`, {
      method: 'DELETE'
    });

    setRevokingId(null);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to revoke session.');
      return;
    }

    setNotice('Session revoked successfully.');
    await loadSessions();
  };

  const handleSignOutAllDevices = async () => {
    if (!confirm('Sign out all devices for your account? You will need to sign in again.')) return;

    setSigningOutAll(true);
    setError('');
    setNotice('');

    try {
      await logoutAllAdminSessions();
      window.location.href = '/admin/login';
    } catch {
      setSigningOutAll(false);
      setError('Failed to sign out all devices.');
    }
  };

  if (!canManageTeam) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include session management.</p>
      </section>
    );
  }

  if (loading) return <AdminLoading label="Loading active sessions..." />;

  const currentUserSessions = sessions.filter((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="admin-form-wrap">
      {/* Overview Card */}
      <section className="admin-card">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-blue-600" />
              <h2 className="m-0 text-lg font-bold text-slate-900">Active Admin Sessions</h2>
              <span className="admin-chip admin-chip-muted text-xs font-semibold">
                {sessions.length} active
              </span>
            </div>
            <p className="admin-subtle text-xs mt-1">
              Sessions automatically expire after 7 days. Revoke individual sessions to invalidate lost or stale devices.
            </p>
          </div>

          <button
            type="button"
            className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-xl bg-rose-600 text-white hover:bg-rose-700 disabled:opacity-50 transition-colors"
            disabled={signingOutAll}
            onClick={handleSignOutAllDevices}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>{signingOutAll ? 'Signing out...' : 'Sign out all devices'}</span>
          </button>
        </div>

        {notice ? <p className="admin-subtle text-xs text-emerald-700 mt-3 p-2 bg-emerald-50 rounded-lg border border-emerald-200">{notice}</p> : null}
        {error ? <p className="error text-xs text-rose-700 mt-3 p-2 bg-rose-50 rounded-lg border border-rose-200">{error}</p> : null}
      </section>

      {/* Your Current Session */}
      {currentUserSessions.length > 0 ? (
        <section className="admin-card">
          <div className="flex items-center gap-2 mb-3">
            <User className="w-4 h-4 text-blue-600" />
            <h3 className="m-0 text-sm font-bold text-slate-900">Your Current Session</h3>
          </div>
          <div className="space-y-3">
            {currentUserSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
                revoking={revokingId === session.id}
              />
            ))}
          </div>
        </section>
      ) : null}

      {/* Other Active Sessions */}
      <section className="admin-card">
        <div className="flex items-center gap-2 mb-3">
          <Laptop className="w-4 h-4 text-slate-600" />
          <h3 className="m-0 text-sm font-bold text-slate-900">
            Other Active Sessions ({otherSessions.length})
          </h3>
        </div>

        {otherSessions.length > 0 ? (
          <div className="space-y-3">
            {otherSessions.map((session) => (
              <SessionCard
                key={session.id}
                session={session}
                onRevoke={handleRevoke}
                revoking={revokingId === session.id}
              />
            ))}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-8 text-center bg-slate-50 rounded-xl border border-slate-200">
            <ShieldCheck className="w-8 h-8 text-emerald-600 mb-2" />
            <p className="admin-subtle text-xs m-0">No other devices are currently logged in to this workspace.</p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminSessionsPage() {
  return (
    <AdminShell title="Sessions" description="Manage active admin sessions and enforce security across devices.">
      {(user) => <SessionsManager user={user} />}
    </AdminShell>
  );
}
