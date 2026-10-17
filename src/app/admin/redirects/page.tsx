'use client';

import { useEffect, useMemo, useState } from 'react';
import { ArrowRight, ArrowRightLeft, PenSquare, Plus, Search, Trash2 } from 'lucide-react';

import { AdminShell } from '@/components/AdminShell';
import type { AdminSessionUser } from '@/features/cms/adminTypes';
import { csrfFetch } from '@/lib/clientCsrf';
import { AdminLoading } from '@/components/admin/AdminLoading';

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

const typeLabels: Record<string, string> = {
  '301': '301 Permanent',
  '302': '302 Temporary',
  '307': '307 Temporary (POST)',
  '308': '308 Permanent (POST)'
};

type RedirectsManagerProps = {
  user: AdminSessionUser;
};

function RedirectsManager({ user }: RedirectsManagerProps) {
  const [redirects, setRedirects] = useState<Redirect[]>([]);
  const [form, setForm] = useState<RedirectForm>(emptyForm);
  const [query, setQuery] = useState('');
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

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return redirects;
    return redirects.filter(
      (r) => r.fromPath.toLowerCase().includes(needle) || r.toPath.toLowerCase().includes(needle)
    );
  }, [redirects, query]);

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
        fromPath: form.fromPath.trim(),
        toPath: form.toPath.trim(),
        type: form.type
      })
    });

    setSaving(false);

    if (!response.ok) {
      const body = (await response.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || 'Failed to save redirect.');
      return;
    }

    setNotice(form.id ? 'Redirect updated successfully.' : 'Redirect created successfully.');
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

    setNotice('Redirect deleted successfully.');
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

  if (loading) return <AdminLoading label="Loading redirects..." />;

  return (
    <div className="admin-form-wrap">
      {/* 2-Column Workspace Grid */}
      <div className="admin-workspace-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Form Card */}
        <section className="admin-card lg:col-span-5 sticky top-6">
          <div className="admin-inline-header pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {form.id ? <PenSquare className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
              <h2 className="m-0 text-base font-bold text-slate-900">
                {form.id ? 'Edit redirect' : 'Add new redirect'}
              </h2>
            </div>
            {form.id ? (
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
            Forward changed URLs, migrated assets, or custom shortlinks permanently or temporarily.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">
              From path
              <input
                type="text"
                value={form.fromPath}
                onChange={(e) => setForm((current) => ({ ...current, fromPath: e.target.value }))}
                placeholder="/old-page-path"
                className="mt-1 font-mono text-xs"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              To path or URL
              <input
                type="text"
                value={form.toPath}
                onChange={(e) => setForm((current) => ({ ...current, toPath: e.target.value }))}
                placeholder="/new-page-path or https://..."
                className="mt-1 font-mono text-xs"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              Redirect type
              <select
                value={form.type}
                onChange={(e) => setForm((current) => ({ ...current, type: e.target.value }))}
                className="mt-1 text-xs"
              >
                <option value="301">301 - Permanent (SEO transfer)</option>
                <option value="302">302 - Temporary (standard)</option>
                <option value="307">307 - Temporary (preserve POST)</option>
                <option value="308">308 - Permanent (preserve POST)</option>
              </select>
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="v2-btn v2-btn-primary flex-1 text-xs py-2 inline-flex items-center justify-center gap-1.5"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : form.id ? 'Update redirect' : 'Create redirect'}</span>
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => void handleDelete(form.id!)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors"
                title="Delete redirect"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {notice ? <p className="admin-subtle text-xs text-emerald-700 mt-2">{notice}</p> : null}
          {error ? <p className="error text-xs text-rose-700 mt-2">{error}</p> : null}
        </section>

        {/* Right Column: Active Redirects Table Card */}
        <section className="admin-card lg:col-span-7">
          <div className="admin-inline-header flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-blue-600" />
              <h2 className="m-0 text-base font-bold text-slate-900">Active Redirects</h2>
              <span className="admin-chip admin-chip-muted text-[10px] font-semibold">
                {redirects.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search paths..."
                className="pl-8 text-xs py-1.5 w-48"
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Route mapping</th>
                  <th>Type</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((redirect) => {
                  const isSelected = form.id === redirect.id;

                  return (
                    <tr key={redirect.id} className={isSelected ? 'bg-blue-50/40' : ''}>
                      <td>
                        <div className="flex flex-wrap items-center gap-2 text-xs">
                          <code className="text-[11px] font-mono bg-slate-100 text-slate-800 px-1.5 py-0.5 rounded border border-slate-200">
                            {redirect.fromPath}
                          </code>
                          <ArrowRight className="w-3 h-3 text-slate-400 shrink-0" />
                          <code className="text-[11px] font-mono bg-blue-50 text-blue-800 px-1.5 py-0.5 rounded border border-blue-200">
                            {redirect.toPath}
                          </code>
                        </div>
                      </td>
                      <td>
                        <span className="admin-chip admin-chip-muted text-[10px]">
                          {typeLabels[redirect.type] || redirect.type}
                        </span>
                      </td>
                      <td className="text-slate-600 text-xs whitespace-nowrap">
                        {new Date(redirect.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => handleEdit(redirect)}
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
                            onClick={() => void handleDelete(redirect.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete redirect"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="admin-subtle py-8 text-center">
                      No redirects found. Configure route redirects using the form on the left.
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
