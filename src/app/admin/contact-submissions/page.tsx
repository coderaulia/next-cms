'use client';

import { useEffect, useMemo, useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import type { ContactSubmission, ContactSubmissionStatus } from '@/features/cms/types';

type ContactSubmissionsResponse = {
  submissions: ContactSubmission[];
};

const statuses: ContactSubmissionStatus[] = ['new', 'in_review', 'closed'];

function ContactSubmissionsManager() {
  const [submissions, setSubmissions] = useState<ContactSubmission[]>([]);
  const [query, setQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | ContactSubmissionStatus>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [savingId, setSavingId] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');
    const response = await csrfFetch('/api/admin/contact-submissions');
    if (!response.ok) {
      setLoading(false);
      setError('Failed to load contact submissions.');
      return;
    }

    const payload = (await response.json()) as ContactSubmissionsResponse;
    setSubmissions(payload.submissions);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return submissions.filter((submission) => {
      if (statusFilter !== 'all' && submission.status !== statusFilter) return false;
      if (!needle) return true;
      const haystack = `${submission.name} ${submission.company} ${submission.email} ${submission.serviceCategory} ${submission.projectOverview}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [query, statusFilter, submissions]);

  const metrics = useMemo(
    () => ({
      total: submissions.length,
      fresh: submissions.filter((submission) => submission.status === 'new').length,
      inReview: submissions.filter((submission) => submission.status === 'in_review').length
    }),
    [submissions]
  );

  const updateStatus = async (id: string, status: ContactSubmissionStatus) => {
    setSavingId(id);
    setError('');
    const response = await csrfFetch(`/api/admin/contact-submissions/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status })
    });
    setSavingId('');

    if (!response.ok) {
      setError('Failed to update submission status.');
      return;
    }

    const payload = (await response.json()) as { submission: ContactSubmission };
    setSubmissions((current) =>
      current.map((submission) => (submission.id === id ? payload.submission : submission))
    );
  };

  if (loading) return <p>Loading contact submissions...</p>;

  return (
    <div className="admin-form-wrap">
      <section className="admin-kpi-grid">
        <article className="admin-card">
          <p className="admin-kpi-label">Total leads</p>
          <p className="admin-kpi-value">{metrics.total}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">New leads</p>
          <p className="admin-kpi-value">{metrics.fresh}</p>
        </article>
        <article className="admin-card">
          <p className="admin-kpi-label">In review</p>
          <p className="admin-kpi-value">{metrics.inReview}</p>
        </article>
      </section>

      <section className="admin-card">
        <div className="admin-inline-header">
          <h2>Lead inbox</h2>
          <div className="admin-actions">
            <label>
              Search
              <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search leads" />
            </label>
            <label>
              Status
              <select
                value={statusFilter}
                onChange={(event) => setStatusFilter(event.target.value as 'all' | ContactSubmissionStatus)}
              >
                <option value="all">All</option>
                {statuses.map((status) => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </label>
          </div>
        </div>

        {error ? <p className="error">{error}</p> : null}

        <div className="admin-table-wrap">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Lead</th>
                <th>Service</th>
                <th>Brief</th>
                <th>Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((submission) => (
                <tr key={submission.id}>
                  <td>
                    <strong>{submission.name}</strong>
                    <span className="admin-subtle">{submission.email}</span>
                    {submission.company ? <span className="admin-subtle">{submission.company}</span> : null}
                  </td>
                  <td>{submission.serviceCategory}</td>
                  <td>
                    <span className="admin-subtle">{submission.projectOverview}</span>
                  </td>
                  <td>{new Date(submission.createdAt).toLocaleString()}</td>
                  <td>
                    <select
                      value={submission.status}
                      disabled={savingId === submission.id}
                      onChange={(event) => updateStatus(submission.id, event.target.value as ContactSubmissionStatus)}
                    >
                      {statuses.map((status) => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filtered.length === 0 ? <p className="admin-subtle">No submissions found.</p> : null}
      </section>
    </div>
  );
}

export default function AdminContactSubmissionsPage() {
  return (
    <AdminShell title="Contact Leads" description="Review and triage incoming consultation requests.">
      {() => <ContactSubmissionsManager />}
    </AdminShell>
  );
}

