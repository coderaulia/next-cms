'use client';

import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

import { getAdminSession, loginAdmin } from '@/features/cms/adminClientAuth';

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
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState('');

  const nextHref = useMemo(() => sanitizeNext(params.get('next')), [params]);

  useEffect(() => {
    getAdminSession().then((user) => {
      if (user) {
        router.replace(nextHref);
        router.refresh();
      }
    });
  }, [nextHref, router]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');

    const result = await loginAdmin({ email, password });
    setPending(false);

    if (!result.user) {
      setError(result.error || 'Invalid email or password.');
      return;
    }

    router.replace(nextHref);
    router.refresh();
  };

  return (
    <main className="admin-page">
      <section className="max-w-xl mx-auto px-6 py-20">
        <div className="admin-card admin-login">
          <h1 className="text-3xl font-display font-black text-deepSlate mb-3">Admin Login</h1>
          <p className="admin-subtle mb-8">Sign in with your admin email and password to access the CMS panel.</p>
          <form className="admin-form-wrap" onSubmit={handleSubmit}>
            <label htmlFor="email">
              Email
              <input
                id="email"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
                required
                autoFocus
              />
            </label>
            <label htmlFor="password">
              Password
              <input
                id="password"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                required
              />
            </label>
            <button type="submit" disabled={pending}>
              {pending ? 'Signing in...' : 'Login'}
            </button>
          </form>
          {error ? <p className="error mt-3">{error}</p> : null}
        </div>
      </section>
    </main>
  );
}
