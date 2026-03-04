'use client';

import { FormEvent, ReactNode, useEffect, useState } from 'react';

type AdminAuthGateProps = {
  children: (token: string) => ReactNode;
};

const STORAGE_KEY = 'cms_admin_token';

async function verifyToken(token: string) {
  const response = await fetch('/api/admin/auth', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token })
  });
  return response.ok;
}

export function AdminAuthGate({ children }: AdminAuthGateProps) {
  const [token, setToken] = useState<string>('');
  const [input, setInput] = useState('');
  const [ready, setReady] = useState(false);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      setReady(true);
      return;
    }
    verifyToken(stored)
      .then((ok) => {
        if (ok) setToken(stored);
      })
      .finally(() => setReady(true));
  }, []);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setPending(true);
    setError('');
    const ok = await verifyToken(input);
    setPending(false);
    if (!ok) {
      setError('Invalid admin token.');
      return;
    }
    localStorage.setItem(STORAGE_KEY, input);
    setToken(input);
  };

  if (!ready) {
    return <p>Checking admin access...</p>;
  }

  if (!token) {
    return (
      <section className="admin-login">
        <h1>CMS Admin Login</h1>
        <p>Enter admin token from `.env.local` (`CMS_ADMIN_TOKEN`).</p>
        <form onSubmit={handleSubmit}>
          <label htmlFor="token">Admin token</label>
          <input
            id="token"
            type="password"
            value={input}
            onChange={(event) => setInput(event.target.value)}
            required
          />
          <button type="submit" disabled={pending}>
            {pending ? 'Checking...' : 'Login'}
          </button>
        </form>
        {error ? <p className="error">{error}</p> : null}
      </section>
    );
  }

  return <>{children(token)}</>;
}
