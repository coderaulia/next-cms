'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { csrfFetch } from '@/lib/clientCsrf';

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

function SessionCard({ session, onRevoke, revoking }: { session: SessionInfo; onRevoke: (id: string) => void; revoking: boolean }) {
  const expiresDate = new Date(session.expiresAt);
  const createdDate = new Date(session.createdAt);
  const isExpired = expiresDate < new Date();

  return (
    <article className="admin-card">
      <div className="admin-session-header">
        <div className="admin-session-user">
          <span className="admin-session-avatar">{session.userDisplayName.slice(0, 2).toUpperCase()}</span>
          <div>
            <strong>{session.userDisplayName}</strong>
            <span className="admin-subtle">{session.userEmail}</span>
          </div>
        </div>
        <div className="admin-session-badges">
          {session.isCurrent ? <span className="admin-chip admin-chip-success">current session</span> : null}
          <span className={`admin-chip ${isExpired ? 'admin-chip-danger' : 'admin-chip-muted'}`}>
            {isExpired ? 'expired' : `expires ${expiresDate.toLocaleDateString()}`}
          </span>
        </div>
      </div>
      <div className="admin-session-meta">
        <span>Created {createdDate.toLocaleString()}</span>
        <span>Lasts {formatTimeAgo(session.createdAt)}</span>
        <span>Session ID: {session.id.slice(0, 8)}...</span>
      </div>
      {!session.isCurrent && (
        <div className="admin-actions">
          <button type="button" disabled={revoking} onClick={() => onRevoke(session.id)}>
            {revoking ? 'Revoking...' : 'Revoke session'}
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
    if (!confirm('Revoke this session? The user will be logged out immediately.')) return;

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

  if (!canManageTeam) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include session management.</p>
      </section>
    );
  }

  if (loading) return <p>Loading active sessions...</p>;

  const currentUserSessions = sessions.filter((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Active sessions</h2>
          <span className="admin-subtle">{sessions.length} sessions</span>
        </div>
        <p className="admin-subtle">
          Sessions expire automatically after 7 days. Revoke sessions to force logout on specific devices.
        </p>
        {notice ? <p className="admin-success">{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      {currentUserSessions.length > 0 ? (
        <section className="admin-card">
          <h3>Your current sessions</h3>
          <div className="admin-session-list">
            {currentUserSessions.map((session) => (
              <SessionCard key={session.id} session={session} onRevoke={handleRevoke} revoking={revokingId === session.id} />
            ))}
          </div>
        </section>
      ) : null}

      {otherSessions.length > 0 ? (
        <section className="admin-card">
          <h3>Other active sessions</h3>
          <div className="admin-session-list">
            {otherSessions.map((session) => (
              <SessionCard key={session.id} session={session} onRevoke={handleRevoke} revoking={revokingId === session.id} />
            ))}
          </div>
        </section>
      ) : (
        <section className="admin-card">
          <p className="admin-subtle">No other active sessions found.</p>
        </section>
      )}
    </div>
  );
}

export default function AdminSessionsPage() {
  return (
    <AdminShell title="Sessions" description="Manage active admin sessions and force logout.">
      {(user) => <SessionsManager user={user} />}
    </AdminShell>
  );
}
