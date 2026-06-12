'use client';
import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Suspense } from 'react';

function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [emailSent, setEmailSent] = useState(false);
  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect') || '/';
  const urlError = searchParams.get('error');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    const supabase = createClient();

    if (mode === 'login') {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      setLoading(false);
      if (error) { setError(error.message); return; }
      router.push(redirect);
      router.refresh();
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/confirm?next=${encodeURIComponent(redirect)}`,
        },
      });
      setLoading(false);
      if (error) { setError(error.message); return; }
      setEmailSent(true);
    }
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-paper px-4">
        <div className="w-full max-w-md bg-paper border border-stone-200 p-10 text-center">
          <div className="w-14 h-14 border border-stone-300 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="display text-2xl mb-3">Check your inbox</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <span className="font-medium text-ink">{email}</span>.<br />
            Click it to activate your account.
          </p>
          <p className="text-xs text-stone-400">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => { setEmailSent(false); setMode('signup'); }}
              className="text-ink underline hover:no-underline"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-paper px-4">
      <div className="w-full max-w-md border border-stone-200 p-10">
        <span className="eyebrow text-stone-400 block mb-2 text-center">
          {mode === 'login' ? 'Welcome back' : 'New here'}
        </span>
        <h1 className="display text-3xl mb-8 text-center">
          {mode === 'login' ? 'Sign in' : 'Create account'}
        </h1>

        {urlError && (
          <p className="text-red-600 text-sm border border-red-200 px-4 py-2 mb-4">
            {urlError === 'invalid_link' ? 'This confirmation link is invalid or has expired.' : urlError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="eyebrow text-stone-400 block mb-2 text-xs">Email</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors bg-paper"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="eyebrow text-stone-400 block mb-2 text-xs">Password</label>
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              className="w-full border border-stone-200 px-4 py-3 text-sm focus:outline-none focus:border-ink transition-colors bg-paper"
              placeholder="••••••••"
              minLength={6}
            />
          </div>
          {error && (
            <p className="text-red-600 text-sm border border-red-200 px-4 py-2">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-4 eyebrow hover:bg-stone-800 transition-colors disabled:opacity-60"
          >
            {loading ? 'Please wait…' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>

        <p className="text-center text-sm text-stone-400 mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button
            onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-ink font-medium hover:underline"
          >
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
