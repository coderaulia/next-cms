'use client';

import type { FormEvent } from 'react';
import { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { AlertCircle, ArrowLeft, Eye, EyeOff, Loader2, Lock, Mail } from 'lucide-react';

import { siteProfile } from '@/config/site-profile';
import { getAdminSession, loginAdmin } from '@/features/cms/adminClientAuth';

const sanitizeNext = (value: string | null) => {
  const fallback = '/admin';
  if (!value) return fallback;
  if (!value.startsWith('/')) return fallback;
  if (value.startsWith('//')) return fallback;
  if (!value.startsWith('/admin')) return fallback;
  return value;
};

function AdminLoginContent() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
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
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50 relative overflow-hidden">
      {/* Subtle background glow */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[340px] bg-gradient-to-b from-blue-100/70 to-transparent blur-3xl pointer-events-none"
        aria-hidden="true"
      />

      <div className="w-full max-w-md relative z-10">
        <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-900/5">
          {/* Brand header */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="inline-flex items-center gap-2.5 mb-4">
              <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg shadow-md shadow-blue-500/25">
                {siteProfile.brand.mark}
              </span>
              <span className="text-xl font-bold tracking-tight text-slate-900">
                {siteProfile.brand.wordmark}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Sign In</h1>
            <p className="text-sm text-slate-500 mt-1">Enter your credentials to access the management portal</p>
          </div>

          {error ? (
            <div
              className="flex items-start gap-3 p-3.5 rounded-xl bg-red-50 border border-red-200/90 text-red-700 text-sm mb-6 animate-in fade-in"
              role="alert"
            >
              <AlertCircle size={18} className="shrink-0 mt-0.5 text-red-600" />
              <span className="flex-1">{error}</span>
            </div>
          ) : null}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  autoComplete="email"
                  placeholder="admin@example.com"
                  required
                  autoFocus
                  style={{ paddingLeft: '40px' }}
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
                  aria-hidden="true"
                />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  autoComplete="current-password"
                  placeholder="••••••••••••"
                  required
                  style={{ paddingLeft: '40px', paddingRight: '42px' }}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  style={{ background: 'transparent', minHeight: 'auto', border: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={pending}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-medium text-sm transition-all shadow-sm hover:shadow disabled:opacity-60 disabled:cursor-not-allowed"
              style={{ minHeight: '42px' }}
            >
              {pending ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                <span>Sign in to Dashboard</span>
              )}
            </button>
          </form>

          <div className="text-center mt-8 pt-6 border-t border-slate-100">
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              <ArrowLeft size={14} />
              <span>Back to website</span>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}

function AdminLoginFallback() {
  return (
    <main className="min-h-screen flex flex-col justify-center items-center px-4 py-12 bg-slate-50">
      <div className="w-full max-w-md bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-xl shadow-slate-900/5 text-center">
        <div className="inline-flex items-center gap-2.5 mb-4">
          <span className="w-10 h-10 rounded-xl bg-blue-600 text-white font-bold flex items-center justify-center text-lg">
            {siteProfile.brand.mark}
          </span>
          <span className="text-xl font-bold tracking-tight text-slate-900">
            {siteProfile.brand.wordmark}
          </span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Admin Sign In</h1>
        <p className="text-sm text-slate-500 mt-2">Preparing secure sign-in form...</p>
      </div>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={<AdminLoginFallback />}>
      <AdminLoginContent />
    </Suspense>
  );
}
