'use client';

import { useEffect, useMemo, useState } from 'react';
import { Clock, Inbox, Mail, Search, Sparkles } from 'lucide-react';
import { csrfFetch } from '@/lib/clientCsrf';

import { AdminShell } from '@/components/AdminShell';
import type { ContactSubmission, ContactSubmissionStatus } from '@/features/cms/types';
import { AdminLoading } from '@/components/admin/AdminLoading';

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

  if (loading) return <AdminLoading label="Loading contact submissions..." />;

  return (
    <div className="admin-form-wrap">
      {/* KPI Cards with lucide icons */}
      <section className="admin-kpi-grid">
        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-slate-600">
              <Inbox className="w-4 h-4 text-slate-500" />
              <span>Total leads</span>
            </p>
            <p className="admin-kpi-value text-slate-900">{metrics.total}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-600">
            <Inbox className="w-5 h-5" />
          </div>
        </article>

        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-blue-700">
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>New leads</span>
            </p>
            <p className="admin-kpi-value text-blue-600">{metrics.fresh}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
            <Sparkles className="w-5 h-5" />
          </div>
        </article>

        <article className="admin-card flex items-center justify-between p-5">
          <div>
            <p className="admin-kpi-label flex items-center gap-1.5 font-medium text-amber-700">
              <Clock className="w-4 h-4 text-amber-600" />
              <span>In review</span>
            </p>
            <p className="admin-kpi-value text-amber-600">{metrics.inReview}</p>
          </div>
          <div className="w-11 h-11 rounded-2xl bg-amber-50 flex items-center justify-center text-amber-600">
            <Clock className="w-5 h-5" />
          </div>
        </article>
      </section>

      {/* Main Table Card */}
      <section className="admin-card">
        <div className="admin-inline-header flex-wrap gap-3 mb-4">
          <div>
            <h2 className="m-0 text-lg font-bold text-slate-900">Lead inbox</h2>
            <p className="admin-subtle text-xs mt-0.5">Filter, review, and reply to inbound project inquiries.</p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search leads..."
                className="pl-9 text-xs py-2 w-56"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(event) => setStatusFilter(event.target.value as 'all' | ContactSubmissionStatus)}
              className="text-xs py-2 w-36"
            >
              <option value="all">All statuses</option>
              {statuses.map((status) => (
                <option key={status} value={status}>
                  {status === 'in_review' ? 'In review' : status.charAt(0).toUpperCase() + status.slice(1)}
                </option>
              ))}
            </select>
          </div>
        </div>

        {error ? <p className="error text-sm text-rose-700 bg-rose-50 border border-rose-200 p-2.5 rounded-lg mb-3">{error}</p> : null}

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
              {filtered.map((submission) => {
                const statusChipClass =
                  submission.status === 'new'
                    ? 'bg-blue-50 text-blue-700 border border-blue-200'
                    : submission.status === 'in_review'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 border border-emerald-200';

                return (
                  <tr key={submission.id}>
                    <td>
                      <strong className="text-slate-900">{submission.name}</strong>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <a
                          href={`mailto:${submission.email}?subject=Re:%20Consultation%20Inquiry%20-%20Vanaila`}
                          className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 hover:underline font-medium"
                          title="Click to email lead directly"
                        >
                          <Mail className="w-3 h-3" />
                          <span>{submission.email}</span>
                        </a>
                      </div>
                      {submission.company ? (
                        <span className="admin-subtle text-xs block mt-0.5">{submission.company}</span>
                      ) : null}
                    </td>
                    <td className="text-slate-700 text-sm font-medium">
                      {submission.serviceCategory || 'General Inquiry'}
                    </td>
                    <td className="max-w-md">
                      <p className="admin-subtle text-xs line-clamp-3 m-0 leading-relaxed">
                        {submission.projectOverview}
                      </p>
                    </td>
                    <td className="text-slate-600 text-xs whitespace-nowrap">
                      {new Date(submission.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td>
                      <div className="flex flex-col gap-1.5 min-w-[130px]">
                        <span className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-0.5 rounded-full w-fit ${statusChipClass}`}>
                          <span className="w-1.5 h-1.5 rounded-full bg-current opacity-75" />
                          {submission.status === 'in_review' ? 'in review' : submission.status}
                        </span>
                        <select
                          value={submission.status}
                          disabled={savingId === submission.id}
                          onChange={(event) => updateStatus(submission.id, event.target.value as ContactSubmissionStatus)}
                          className="text-[11px] py-1 px-2 border border-slate-200 rounded-lg bg-white"
                        >
                          {statuses.map((status) => (
                            <option key={status} value={status}>
                              Mark as {status === 'in_review' ? 'in review' : status}
                            </option>
                          ))}
                        </select>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="admin-subtle py-10 text-center">
                    No submissions found matching the current filters.
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

export default function AdminContactSubmissionsPage() {
  return (
    <AdminShell title="Contact Leads" description="Review and triage incoming consultation requests.">
      {() => <ContactSubmissionsManager />}
    </AdminShell>
  );
}

