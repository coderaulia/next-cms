'use client';

import { FormEvent, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { saveAdminToken, verifyAdminToken } from '@/features/cms/adminClientAuth';

const sanitizeNext = (value: string | null) => {
  const fallback = '/admin';
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (!value.startsWith('/admin')) return fallback;
  return value;
};

export default function AdminLoginPage() {
  const router = useRouter();
  const params = useSearchParams();
  const [token, setToken] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const nextHref = useMemo(() => sanitizeNext(params.get('next')), [params]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');

    const ok = await verifyAdminToken(token);
    setPending(false);

    if (!ok) {
      setError('Invalid admin token.');
      return;
    }

    saveAdminToken(token);
    router.replace(nextHref);
    router.refresh();
  };

  return (
    <main className="admin-page">
      <section className="max-w-xl mx-auto px-6 py-20">
        <div className="admin-card">
          <h1 className="text-3xl font-display font-black text-deepSlate mb-3">Admin Login</h1>
          <p className="admin-subtle mb-8">Enter your admin token to access the CMS panel.</p>
          <form className="admin-form-wrap" onSubmit={handleSubmit}>
            <label htmlFor="token">
              Admin token
              <input
                id="token"
                type="password"
                value={token}
                onChange={(event) => setToken(event.target.value)}
                required
                autoFocus
              />
            </label>
            <button type="submit" disabled={pending}>
              {pending ? 'Checking...' : 'Login'}
            </button>
          </form>
          {error ? <p className="error mt-3">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
