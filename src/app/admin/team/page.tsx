'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, KeyRound, PenSquare, Search, Shield, Trash2, UserPlus, Users } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import { formatAdminRoleLabel, permissionsForRole } from '@/features/cms/adminPermissions';
import type { AdminTeamMember, AdminSessionUser } from '@/features/cms/adminTypes';
import { csrfFetch } from '@/lib/clientCsrf';

import type { AdminRole } from '@/features/cms/types';
import { AdminLoading } from '@/components/admin/AdminLoading';

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
  const [query, setQuery] = useState('');
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

  const filteredMembers = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return members;
    return members.filter(
      (m) =>
        m.displayName.toLowerCase().includes(needle) ||
        m.email.toLowerCase().includes(needle) ||
        m.role.toLowerCase().includes(needle)
    );
  }, [members, query]);

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
    setNotice(isEditing ? 'Team member updated successfully.' : 'Team member created successfully.');
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

    setNotice('Team member deleted successfully.');
    await load();
  };

  if (!canManageTeam) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include team management.</p>
      </section>
    );
  }

  if (loading) return <AdminLoading label="Loading team members..." />;

  if (!available) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Team management is available when the CMS is running in database mode.</p>
      </section>
    );
  }

  return (
    <div className="admin-form-wrap">
      {/* 2-Column Workspace Grid: Invite Form on Left, Members List on Right */}
      <div className="admin-workspace-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card */}
        <section className="admin-card lg:col-span-5 sticky top-6">
          <div className="admin-inline-header pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {isEditing ? <PenSquare className="w-4 h-4 text-blue-600" /> : <UserPlus className="w-4 h-4 text-blue-600" />}
              <h2 className="m-0 text-base font-bold text-slate-900">
                {isEditing ? 'Edit admin user' : 'Invite admin user'}
              </h2>
            </div>
            {isEditing ? (
              <button
                type="button"
                onClick={resetForm}
                className="text-xs text-slate-500 hover:text-slate-800"
              >
                Cancel edit
              </button>
            ) : null}
          </div>

          <p className="admin-subtle text-xs mt-2 mb-4">
            Manage administrative privileges. Super admins can manage team access and all site settings.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">
              Display name
              <input
                value={form.displayName}
                onChange={(event) => setForm((current) => ({ ...current, displayName: event.target.value }))}
                placeholder="e.g. Operations Lead"
                className="mt-1 text-xs"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              Email
              <input
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                disabled={isEditing}
                placeholder="editor@vanaila.com"
                className="mt-1 text-xs"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              Role
              <select
                value={form.role}
                disabled={isCurrentUser}
                onChange={(event) => setForm((current) => ({ ...current, role: event.target.value as AdminRole }))}
                className="mt-1 text-xs"
              >
                {roleOptions.map((role) => (
                  <option key={role} value={role}>
                    {formatAdminRoleLabel(role)}
                  </option>
                ))}
              </select>
            </label>

            <label className="text-xs font-semibold text-slate-700">
              {isEditing ? 'Reset password' : 'Temporary password'}
              <input
                type="password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder={isEditing ? 'Leave blank to preserve current' : 'Minimum 8 characters'}
                className="mt-1 text-xs font-mono"
              />
            </label>
          </div>

          {/* Role permissions card */}
          <div className="mt-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-blue-600" />
                <span>Granted permissions</span>
              </span>
              <span className="admin-chip admin-chip-muted text-[10px]">
                {formatAdminRoleLabel(form.role)}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto">
              {selectedRolePermissions.map((permission) => (
                <span
                  key={permission}
                  className="text-[10px] font-mono bg-white text-slate-700 px-2 py-0.5 rounded border border-slate-200"
                >
                  {permission}
                </span>
              ))}
            </div>
            {isCurrentUser ? (
              <p className="admin-subtle text-[11px] mt-2 mb-0">
                Your own account role cannot be demoted by yourself.
              </p>
            ) : null}
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="v2-btn v2-btn-primary flex-1 text-xs py-2 inline-flex items-center justify-center gap-1.5"
            >
              <KeyRound className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : isEditing ? 'Update member' : 'Create member'}</span>
            </button>
            {isEditing ? (
              <button
                type="button"
                disabled={isCurrentUser}
                onClick={() => void handleDelete(form.id)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold disabled:opacity-50 transition-colors"
                title="Delete team member"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {notice ? <p className="admin-subtle text-xs text-emerald-700 mt-2">{notice}</p> : null}
          {error ? <p className="error text-xs text-rose-700 mt-2">{error}</p> : null}
        </section>

        {/* Right Column: Member List Table Card */}
        <section className="admin-card lg:col-span-7">
          <div className="admin-inline-header flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-blue-600" />
              <h2 className="m-0 text-base font-bold text-slate-900">Admin Team</h2>
              <span className="admin-chip admin-chip-muted text-[10px] font-semibold">
                {members.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search team members..."
                className="pl-8 text-xs py-1.5 w-48"
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Role</th>
                  <th>Last active</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredMembers.map((member) => {
                  const isSelected = form.id === member.id;
                  const isMe = member.id === user.id;

                  return (
                    <tr key={member.id} className={isSelected ? 'bg-blue-50/40' : ''}>
                      <td>
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-700 flex items-center justify-center text-xs font-bold shrink-0">
                            {member.displayName.slice(0, 2).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <strong className="text-slate-900 text-xs truncate">{member.displayName}</strong>
                              {isMe ? (
                                <span className="admin-chip admin-chip-success text-[9px] py-0 px-1.5">
                                  you
                                </span>
                              ) : null}
                            </div>
                            <span className="text-[11px] text-slate-500 block truncate">{member.email}</span>
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="admin-chip admin-chip-muted text-[10px] whitespace-nowrap">
                          {formatAdminRoleLabel(member.role)}
                        </span>
                      </td>
                      <td className="text-slate-600 text-xs whitespace-nowrap">
                        <div className="flex items-center gap-1 text-[11px]">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>{member.lastLoginAt ? new Date(member.lastLoginAt).toLocaleDateString() : 'Never'}</span>
                        </div>
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => selectMember(member)}
                            className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-lg border transition-colors ${
                              isSelected
                                ? 'bg-blue-600 text-white border-blue-600'
                                : 'border-slate-300 text-slate-700 hover:bg-slate-100'
                            }`}
                          >
                            <PenSquare className="w-3 h-3" />
                            <span>{isSelected ? 'Editing' : 'Edit'}</span>
                          </button>
                          <button
                            type="button"
                            disabled={isMe}
                            onClick={() => void handleDelete(member.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 disabled:opacity-30 rounded transition-colors"
                            title={isMe ? 'Cannot delete current account' : 'Delete user'}
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filteredMembers.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-subtle py-8 text-center">
                      No admin users found matching the filter.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </section>
      </div>
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
