'use client';

import { useEffect, useMemo, useState } from 'react';
import { FolderTree, PenSquare, Plus, Search, Tag, Trash2 } from 'lucide-react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import type { Category } from '@/features/cms/types';
import { AdminLoading } from '@/components/admin/AdminLoading';

type CategoriesResponse = {
  categories: Category[];
};

const emptyCategory: Category = {
  id: '',
  name: '',
  slug: '',
  description: '',
  createdAt: '',
  updatedAt: ''
};

function CategoriesManager() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [form, setForm] = useState<Category>(emptyCategory);
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const response = await csrfFetch('/api/admin/categories');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load categories.');
      return;
    }

    const payload = (await response.json()) as CategoriesResponse;
    setCategories(payload.categories);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return categories;
    return categories.filter((category) => {
      const haystack = `${category.name} ${category.slug} ${category.description}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [categories, query]);

  const resetForm = () => {
    setForm(emptyCategory);
    setNotice('');
    setError('');
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError('Category name is required.');
      return;
    }

    setSaving(true);
    setNotice('');
    setError('');

    const method = form.id ? 'PUT' : 'POST';
    const endpoint = form.id ? `/api/admin/categories/${form.id}` : '/api/admin/categories';
    const payload = {
      ...form,
      slug: form.slug.trim() || form.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
      id: form.id || crypto.randomUUID()
    };

    const response = await csrfFetch(endpoint, {
      method,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    setSaving(false);

    if (!response.ok) {
      setError('Failed to save category.');
      return;
    }

    const body = (await response.json()) as { category: Category };
    setForm(body.category);
    setNotice(form.id ? 'Category updated successfully.' : 'Category created successfully.');
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Posts using it will have the category unassigned.')) return;

    const response = await csrfFetch(`/api/admin/categories/${id}`, {
      method: 'DELETE'
    });

    if (!response.ok) {
      setError('Failed to delete category.');
      return;
    }

    if (form.id === id) {
      resetForm();
    }

    setNotice('Category deleted successfully.');
    await load();
  };

  if (loading) return <AdminLoading label="Loading categories..." />;

  return (
    <div className="admin-form-wrap">
      {/* 2-Column Workspace: Form on Left, Table on Right */}
      <div className="admin-workspace-grid grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Category Editor Form Card */}
        <section className="admin-card lg:col-span-5 sticky top-6">
          <div className="admin-inline-header pb-2 border-b border-slate-100">
            <div className="flex items-center gap-2">
              {form.id ? <PenSquare className="w-4 h-4 text-blue-600" /> : <Plus className="w-4 h-4 text-blue-600" />}
              <h2 className="m-0 text-base font-bold text-slate-900">
                {form.id ? 'Edit category' : 'New category'}
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
            Categories organize blog posts and can be filtered by readers on the public site.
          </p>

          <div className="space-y-3">
            <label className="text-xs font-semibold text-slate-700">
              Name
              <input
                value={form.name}
                onChange={(event) => {
                  const val = event.target.value;
                  setForm((prev) => ({
                    ...prev,
                    name: val,
                    slug: prev.id ? prev.slug : val.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
                  }));
                }}
                placeholder="e.g. Design Systems"
                className="mt-1"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              Slug
              <input
                value={form.slug}
                onChange={(event) => setForm({ ...form, slug: event.target.value })}
                placeholder="e.g. design-systems"
                className="mt-1 font-mono text-xs"
              />
            </label>

            <label className="text-xs font-semibold text-slate-700">
              Description
              <textarea
                rows={3}
                value={form.description}
                onChange={(event) => setForm({ ...form, description: event.target.value })}
                placeholder="Brief summary of topics covered in this category"
                className="mt-1 text-xs"
              />
            </label>
          </div>

          <div className="flex items-center justify-between gap-2 mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="v2-btn v2-btn-primary flex-1 text-xs py-2 inline-flex items-center justify-center gap-1.5"
            >
              <Tag className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : form.id ? 'Update category' : 'Create category'}</span>
            </button>
            {form.id ? (
              <button
                type="button"
                onClick={() => void handleDelete(form.id)}
                className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 border border-rose-200 text-xs font-semibold transition-colors"
                title="Delete category"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            ) : null}
          </div>

          {notice ? <p className="admin-subtle text-xs text-emerald-700 mt-2">{notice}</p> : null}
          {error ? <p className="error text-xs text-rose-700 mt-2">{error}</p> : null}
        </section>

        {/* Right Column: Categories List Table Card */}
        <section className="admin-card lg:col-span-7">
          <div className="admin-inline-header flex-wrap gap-3 mb-4">
            <div className="flex items-center gap-2">
              <FolderTree className="w-4 h-4 text-blue-600" />
              <h2 className="m-0 text-base font-bold text-slate-900">Categories</h2>
              <span className="admin-chip admin-chip-muted text-[10px] font-semibold">
                {categories.length}
              </span>
            </div>

            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search categories..."
                className="pl-8 text-xs py-1.5 w-48"
              />
            </div>
          </div>

          <div className="admin-table-wrap">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Slug</th>
                  <th>Description</th>
                  <th>Updated</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((category) => {
                  const isSelected = form.id === category.id;

                  return (
                    <tr key={category.id} className={isSelected ? 'bg-blue-50/40' : ''}>
                      <td>
                        <strong className="text-slate-900">{category.name}</strong>
                      </td>
                      <td>
                        <code className="text-[11px] font-mono bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded border border-slate-200">
                          /{category.slug}
                        </code>
                      </td>
                      <td className="text-slate-600 text-xs max-w-xs">
                        <span className="line-clamp-2">{category.description || '—'}</span>
                      </td>
                      <td className="text-slate-600 text-xs whitespace-nowrap">
                        {new Date(category.updatedAt).toLocaleDateString()}
                      </td>
                      <td className="text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            type="button"
                            onClick={() => {
                              setForm(category);
                              setError('');
                              setNotice('');
                            }}
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
                            onClick={() => void handleDelete(category.id)}
                            className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors"
                            title="Delete category"
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
                    <td colSpan={5} className="admin-subtle py-8 text-center">
                      No categories found. Create a category using the form on the left.
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

export default function AdminCategoriesPage() {
  return (
    <AdminShell title="Categories" description="Manage blog categories used across posts and defaults.">
      {() => <CategoriesManager />}
    </AdminShell>
  );
}

