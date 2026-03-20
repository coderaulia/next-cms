'use client';

import { useEffect, useState } from 'react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { csrfFetch } from '@/lib/clientCsrf';

type Redirect = {
  id: string;
  fromPath: string;
  toPath: string;
  type: string;
  createdAt: string;
  updatedAt: string;
};

type RedirectForm = {
  id: string | null;
  fromPath: string;
  toPath: string;
  type: string;
};

const emptyForm: RedirectForm = {
  id: null,
  fromPath: '',
  toPath: '',
  type: '302'
};

function RedirectCard({
  redirect,
  onEdit,
  onDelete
}: {
  redirect: Redirect;
  onEdit: (redirect: Redirect) => void;
  onDelete: (id: string) => void;
}) {
  const typeLabels: Record<string, string> = {
    '301': 'Permanent',
    '302': 'Temporary',
    '307': 'Temporary (POST)',
    '308': 'Permanent (POST)'
  };

  return (
    <div className="redirect-card">
      <div className="redirect-card-paths">
        <div className="redirect-from">
          <span className="redirect-label">From</span>
          <code>{redirect.fromPath}</code>
        </div>
        <div className="redirect-arrow">→</div>
        <div className="redirect-to">
          <span className="redirect-label">To</span>
          <code>{redirect.toPath}</code>
        </div>
      </div>
      <div className="redirect-card-meta">
        <span className="admin-chip admin-chip-muted">{typeLabels[redirect.type] || redirect.type}</span>
        <span className="admin-subtle">
          Updated {new Date(redirect.updatedAt).toLocaleDateString()}
        </span>
      </div>
      <div className="redirect-card-actions">
        <button type="button" onClick={() => onEdit(redirect)}>
          Edit
        </button>
        <button type="button" onClick={() => onDelete(redirect.id)} className="danger">
          Delete
        </button>
      </div>
    </div>
  );
}

type RedirectsManagerProps = {
  user: AdminSessionUser;
};

function RedirectsManager({ user }: RedirectsManagerProps) {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [form, setForm] = useState<RedirectForm>(emptyForm);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const canManage = user.permissions.includes('settings:edit');

  const loadRedirects = async () => {
    setLoading(true);
    setError('');

    const response = await csrfFetch('/api/admin/redirects');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load redirects.');
      return;
    }

    const payload = (await response.json()) as { redirects: Redirect[] };
    setRedirects(payload.redirects);
    setLoading(false);
  };

  useEffect(() => {
    if (!canManage) {
      setLoading(false);
      return;
    }

    void loadRedirects();
  }, [canManage]);

  const resetForm = () => {
    setForm(emptyForm);
    setError('');
    setNotice('');
  };

  const handleEdit = (redirect: Redirect) => {
    setForm({
      id: redirect.id,
      fromPath: redirect.fromPath,
      toPath: redirect.toPath,
      type: redirect.type
    });
    setError('');
    setNotice('');
  };

  const handleSave = async () => {
    if (!form.fromPath.trim() || !form.toPath.trim()) {
      setError('Both from path and to path are required.');
      return;
    }

    setSaving(true);
    setError('');
    setNotice('');

    const method = form.id ? 'PUT' : 'POST';
    const url = form.id ? `/api/admin/redirects/${form.id}` : '/api/admin/redirects';

    const response = await csrfFetch(url, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fromPath: form.fromPath,
        toPath: form.toPath,
        type: form.type
      })
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to save redirect.');
      return;
    }

    setNotice(form.id ? 'Redirect updated.' : 'Redirect created.');
    resetForm();
    await loadRedirects();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this redirect?')) return;

    setError('');
    setNotice('');

    const response = await csrfFetch(`/api/admin/redirects/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to delete redirect.');
      return;
    }

    setNotice('Redirect deleted.');
    if (form.id === id) {
      resetForm();
    }
    await loadRedirects();
  };

  if (!canManage) {
    return (
      <section className="admin-card">
        <p className="admin-subtle">Your role does not include redirect management.</p>
      </section>
    );
  }

  if (loading) return <p>Loading redirects...</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <h2>Manage Redirects</h2>
        <p className="admin-subtle">
          Create permanent (301) or temporary (302) redirects to handle changed URLs, moved content, or branding updates.
        </p>
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h3>{form.id ? 'Edit redirect' : 'Add new redirect'}</h3>
          {form.id && (
            <button type="button" className="v2-btn v2-btn-secondary" onClick={resetForm}>
              Cancel edit
            </button>
          )}
        </div>

        <div className="redirect-form">
          <div className="redirect-form-row">
            <label>
              From path
              <input
                type="text"
                value={form.fromPath}
                onChange={(e) => setForm((current) => ({ ...current, fromPath: e.target.value }))}
                placeholder="/old-page"
              />
            </label>
            <label>
              To path
              <input
                type="text"
                value={form.toPath}
                onChange={(e) => setForm((current) => ({ ...current, toPath: e.target.value }))}
                placeholder="/new-page"
              />
            </label>
            <label>
              Type
              <select
                value={form.type}
                onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
              >
                <option value="301">301 - Permanent</option>
                <option value="302">302 - Temporary</option>
                <option value="307">307 - Temporary (POST)</option>
                <option value="308">308 - Permanent (POST)</option>
              </select>
            </label>
          </div>

          <div className="admin-actions">
            <button type="button" onClick={() => void handleSave()} disabled={saving}>
              {saving ? 'Saving...' : form.id ? 'Update redirect' : 'Create redirect'}
            </button>
          </div>
        </div>

        {notice ? <p className="admin-success">{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h3>Active redirects ({redirects.length})</h3>
        </div>

        {redirects.length === 0 ? (
          <p className="admin-subtle">No redirects configured yet.</p>
        ) : (
          <div className="redirect-list">
            {redirects.map((redirect) => (
              <RedirectCard
                key={redirect.id}
                redirect={redirect}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

export default function AdminRedirectsPage() {
  return (
    <AdminShell
      title="Redirects"
      description="Manage URL redirects to handle changed slugs, moved content, and branding updates."
    >
      {(user) => <RedirectsManager user={user} />}
    </AdminShell>
  );
}
