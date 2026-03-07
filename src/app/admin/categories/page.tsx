'use client';

import { useEffect, useMemo, useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import type { Category } from '@/features/cms/types';

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
    setSaving(true);
    setNotice('');
    setError('');

    const method = form.id ? 'PUT' : 'POST';
    const endpoint = form.id ? `/api/admin/categories/${form.id}` : '/api/admin/categories';
    const payload = {
      ...form,
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
    setNotice(form.id ? 'Category updated.' : 'Category created.');
    await load();
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this category? Posts using it will be updated.')) return;

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

    setNotice('Category deleted.');
    await load();
  };

  if (loading) return <p>Loading categories...</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>{form.id ? 'Edit category' : 'New category'}</h2>
          <button type="button" onClick={resetForm} className="v2-btn v2-btn-secondary">
            New category
          </button>
        </div>
        <div className="admin-grid-2">
          <label>
            Name
            <input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
          </label>
          <label>
            Slug
            <input value={form.slug} onChange={(event) => setForm({ ...form, slug: event.target.value })} />
          </label>
        </div>
        <label>
          Description
          <textarea
            rows={4}
            value={form.description}
            onChange={(event) => setForm({ ...form, description: event.target.value })}
          />
        </label>
        <div className="admin-actions">
          <button type="button" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving...' : form.id ? 'Update category' : 'Create category'}
          </button>
          {form.id ? (
            <button type="button" onClick={() => handleDelete(form.id)}>
              Delete category
            </button>
          ) : null}
        </div>
        {notice ? <p>{notice}</p> : null}
        {error ? <p className="error">{error}</p> : null}
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Categories</h2>
          <label>
            Search
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search categories" />
          </label>
        </div>
        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Updated</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {filtered.map((category) => (
                <tr key={category.id}>
                  <td>
                    <strong>{category.name}</strong>
                  </td>
                  <td>
                    <span className="admin-chip admin-chip-muted">{category.slug}</span>
                  </td>
                  <td>{category.description || 'No description'}</td>
                  <td>{new Date(category.updatedAt).toLocaleDateString()}</td>
                  <td>
                    <div className="admin-actions">
                      <button type="button" onClick={() => setForm(category)}>
                        Edit
                      </button>
                      <button type="button" onClick={() => handleDelete(category.id)}>
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-subtle">
                    No categories found.
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

export default function AdminCategoriesPage() {
  return (
    <AdminShell title="Categories" description="Manage blog categories used across posts and defaults.">
      {() => <CategoriesManager />}
    </AdminShell>
  );
}

