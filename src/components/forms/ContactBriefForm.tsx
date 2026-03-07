'use client';

import { type FormEvent, useState } from 'react';
import { csrfFetch } from '@/lib/clientCsrf';

type ContactBriefFormProps = {
  heading: string;
  body: string;
  submitLabel: string;
  helperText: string;
};

const serviceOptions = [
  'Website Development',
  'Custom Business Tools',
  'Secure Online Shops',
  'Mobile Business App',
  'Official Business Email'
];

const initialForm = {
  name: '',
  email: '',
  serviceCategory: '',
  projectOverview: ''
};

export function ContactBriefForm({ heading, body, submitLabel, helperText }: ContactBriefFormProps) {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState('');

  const updateField = (field: keyof typeof initialForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setStatus('saving');
    setMessage('');

    const response = await csrfFetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: form.name,
        company: '',
        email: form.email,
        serviceCategory: form.serviceCategory,
        projectOverview: form.projectOverview
      })
    });

    if (!response.ok) {
      const payload = (await response.json().catch(() => null)) as { error?: string } | null;
      setStatus('error');
      setMessage(payload?.error || 'Failed to submit your brief.');
      return;
    }

    setStatus('success');
    setMessage('Project brief submitted. We will respond within 24 business hours.');
    setForm(initialForm);
  };

  return (
    <div className="glass-panel p-10 md:p-16 rounded-[3rem] border border-white/60 shadow-2xl shadow-blue-900/5">
      <div className="flex items-center justify-between mb-12 gap-6">
        <h2 className="text-3xl font-display font-black text-deepSlate italic">{heading}</h2>
        <span className="material-symbols-outlined text-slate-200 text-4xl">description</span>
      </div>
      <p className="text-slate-500 mb-12 font-light">{body}</p>

      <form className="space-y-8" onSubmit={handleSubmit}>
        <div className="grid md:grid-cols-2 gap-8">
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Name / Company</label>
            <input
              type="text"
              required
              value={form.name}
              onChange={(event) => updateField('name', event.target.value)}
              placeholder="John Doe or Acme Inc."
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate"
            />
          </div>
          <div className="space-y-3">
            <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Business Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(event) => updateField('email', event.target.value)}
              placeholder="hello@yourbrand.com"
              className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate"
            />
          </div>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">I am interested in</label>
          <select
            required
            value={form.serviceCategory}
            onChange={(event) => updateField('serviceCategory', event.target.value)}
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate appearance-none"
          >
            <option value="">Select a service category</option>
            {serviceOptions.map((option) => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
        </div>

        <div className="space-y-3">
          <label className="text-[10px] font-bold uppercase tracking-widest text-slate-400 ml-4">Project Overview</label>
          <textarea
            rows={4}
            required
            value={form.projectOverview}
            onChange={(event) => updateField('projectOverview', event.target.value)}
            placeholder="Tell us about your project goals, timeline, and current pain points..."
            className="w-full px-8 py-5 bg-slate-50 border border-slate-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-electricBlue/20 focus:bg-white transition-all font-medium text-deepSlate resize-none"
          />
        </div>

        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-3 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
            <span className="material-symbols-outlined text-electricBlue text-sm">verified_user</span>
            {helperText}
          </div>
          <button
            type="submit"
            disabled={status === 'saving'}
            className="w-full md:w-auto px-12 py-5 bg-deepSlate text-white font-display font-bold text-xs uppercase tracking-[0.2em] rounded-full hover:bg-black hover:shadow-2xl transition-all duration-300 disabled:opacity-70"
          >
            {status === 'saving' ? 'Submitting...' : submitLabel}
          </button>
        </div>

        {message ? (
          <p className={status === 'error' ? 'text-sm text-red-600' : 'text-sm text-emerald-600'}>{message}</p>
        ) : null}
      </form>
    </div>
  );
}

