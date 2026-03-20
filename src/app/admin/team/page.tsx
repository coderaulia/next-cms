'use client';

import { useEffect, useMemo, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import { formatAdminRoleLabel, permissionsForRole } from '@/features/cms/adminPermissions';
import type { AdminTeamMember, AdminSessionUser } from '@/features/cms/adminTypes';
import { csrfFetch } from '@/lib/clientCsrf';

import type { AdminRole } from '@/features/cms/types';

type TeamResponse = {
  available: boolean;
  members: AdminTeamMember[];
};

type TeamMemberForm = {
  id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  password: string;
};

const roleOptions: AdminRole[] = ['super_admin', 'admin', 'editor', 'analyst'];

const emptyForm: TeamMemberForm = {
  id: '',
  email: '',
  displayName: '',
  role: 'editor',
  password: ''
};

type TeamManagerProps = {
  user: AdminSessionUser;
};

function TeamManager({ user }: TeamManagerProps) {
  const [members, setMembers] = useState<AdminTeamMember[]>([]);
  const [form, setForm] = useState<TeamMemberForm>(emptyForm);
  const [available, setAvailable] = useState(true);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const canManageTeam = user.permissions.includes('team:manage');
  const isEditing = Boolean(form.id);
  const isCurrentUser = isEditing && form.id === user.id;

  const load = async (selectedId?: string) => {
    setLoading(true);
    setError('');

    const response = await csrfFetch('/api/admin/team');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load team members.');
      return;
    }

    const payload = (await response.json()) as TeamResponse;
    setAvailable(payload.available);
    setMembers(payload.members);
    setLoading(false);

    if (!payload.available) {
      setForm(emptyForm);
      return;
    }

    if (selectedId) {
      const selected = payload.members.find((member) => member.id === selectedId);
      if (selected) {
        setForm({
          id: selected.id,
          email: selected.email,
          displayName: selected.displayName,
          role: selected.role,
          password: ''
        });
        return;
      }
    }

    setForm((current) => {
      if (!current.id) return current;
      const selected = payload.members.find((member) => member.id === current.id);
      if (!selected) return emptyForm;
      return {
        id: selected.id,
        email: selected.email,
        displayName: selected.displayName,
        role: selected.role,
        password: ''
      };
    });
  };

  useEffect(() => {
    if (!canManageTeam) {
      setLoading(false);
      return;
    }

    void load();
  }, [canManageTeam]);

  const selectedRolePermissions = useMemo(() => permissionsForRole(form.role), [form.role]);

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
    setNotice('');
  };

  const selectMember = (member: AdminTeamMember) => {
    setForm({
      id: member.id,
      email: member.email,
      displayName: member.displayName,
      role: member.role,
      password: ''
    });
    setError('');
    setNotice('');
  };

  const handleSave = async () => {
    if (!form.displayName.trim()) {
      setError('Display name is required.');
      return;
    }

    if (!isEditing && !form.email.trim()) {
      setError('Email is required.');
      return;
    }

    if (!isEditing && !form.password.trim()) {
      setError('Password is required for new team members.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const response = await csrfFetch(isEditing ? `/api/admin/team/${form.id}` : '/api/admin/team', {
      method: isEditing ? 'PUT' : 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: form.email,
        displayName: form.displayName,
        role: form.role,
        password: form.password
      })
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to save team member.');
      return;
    }

    const body = (await response.json()) as { member: AdminTeamMember };
    setNotice(isEditing ? 'Team member updated.' : 'Team member created.');
    setForm({
      id: body.member.id,
      email: body.member.email,
      displayName: body.member.displayName,
      role: body.member.role,
      password: ''
    });
    await load(body.member.id);
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this admin account? Existing sessions for that user will be revoked.')) return;

    setError('');
    setNotice('');

    const response = await csrfFetch(`/api/admin/team/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to delete team member.');
      return;
    }

    if (form.id === id) {
      setForm(emptyForm);
    }

    setNotice('Team member deleted.');
    await load();
  };

  if (!canManageTeam) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include team management.</p>
      </section>
    );
  }

  if (loading) return <p>Loading team members...</p>;

  if (!available) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Team management is available when the CMS is running in database mode.</p>
      </section>
    );
  }

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>{isEditing ? 'Edit admin user' : 'Invite admin user'}</h2>
          <button type="button" className="v2-btn v2-btn-secondary" onClick={resetForm}>
            {isEditing ? 'New team member' : 'Reset form'}
          </button>
        </div>
        <p className="admin-subtle">Roles control publish access, analytics visibility, settings access, and media management. At least one super admin must remain.</p>
        <div className="admin-grid-2">
          <label>
            Display name
            <input
              value={form.displayName}
              onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
              placeholder="Operations Lead"
            />
          </label>
          <label>
            Email
            <input
              value={form.email}
              onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              disabled={isEditing}
              placeholder="editor@example.com"
            />
          </label>
          <label>
            Role
            <select
              value={form.role}
              disabled={isCurrentUser}
              onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRole }))}
            >
              {roleOptions.map((role) => (
                <option key={role} value={role}>
                  {formatAdminRoleLabel(role)}
                </option>
              ))}
            </select>
          </label>
          <label>
            {isEditing ? 'Reset password' : 'Temporary password'}
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
              placeholder={isEditing ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
            />
          </label>
        </div>

        <div className="admin-card" style={{ marginTop: 16 }}>
          <div className="admin-inline-header">
            <h3>Role permissions</h3>
            <span className="admin-chip admin-chip-muted">{formatAdminRoleLabel(form.role)}</span>
          </div>
          <ul className="admin-plain-list">
            {selectedRolePermissions.map((permission) => (
              <li key={permission}>
                <strong>{permission}</strong>
              </li>
            ))}
          </ul>
          {isCurrentUser ? <p className="admin-subtle">Your current account role must be changed by another super admin.</p> : null}
        </div>

        <div className="admin-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : isEditing ? 'Update team member' : 'Create team member'}
          </button>
          {isEditing ? (
            <button type="button" disabled={isCurrentUser} onClick={() => void handleDelete(form.id)}>
              Delete team member
            </button>
          ) : null}
        </div>

        {notice ? <p>{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Admin team</h2>
          <span className="admin-subtle">{members.length} users</span>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Permissions</th>
                <th>Last login</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <strong>{member.displayName}</strong>
                    {member.id === user.id ? <span className="admin-chip admin-chip-success">current</span> : null}
                  </td>
                  <td>{member.email}</td>
                  <td>
                    <span className="admin-chip admin-chip-muted">{formatAdminRoleLabel(member.role)}</span>
                  </td>
                  <td>{member.permissions.join(', ')}</td>
                  <td>{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleString() : 'Never'}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" onClick={() => selectMember(member)}>
                        Edit
                      </button>
                      <button type="button" disabled={member.id === user.id} onClick={() => void handleDelete(member.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={6} className="admin-subtle">
                    No admin users found.
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

export default function AdminTeamPage() {
  return (
    <AdminShell title="Team" description="Manage admin roles, editor access, and password resets for client handoff.">
      {(user) => <TeamManager user={user} />}
    </AdminShell>
  );
}
