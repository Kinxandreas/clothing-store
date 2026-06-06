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

  // Show confirmation screen after signup
  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
        <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10 text-center">
          <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center mx-auto mb-6">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          </div>
          <h1 className="font-display text-2xl font-bold mb-3">Check your inbox</h1>
          <p className="text-stone-500 text-sm leading-relaxed mb-6">
            We sent a confirmation link to <span className="font-medium text-stone-800">{email}</span>.<br />
            Click it to activate your account.
          </p>
          <p className="text-xs text-stone-400">
            Didn&apos;t receive it? Check your spam folder or{' '}
            <button
              onClick={() => { setEmailSent(false); setMode('signup'); }}
              className="text-accent underline hover:no-underline"
            >
              try again
            </button>.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-brand-50 px-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-10">
        <h1 className="font-display text-3xl font-bold mb-2 text-center">
          {mode === 'login' ? 'Welcome back' : 'Create account'}
        </h1>
        <p className="text-brand-500 text-center mb-8 text-sm">
          {mode === 'login' ? 'Sign in to your account' : 'Join us today'}
        </p>

        {/* URL error (e.g. bad confirmation link) */}
        {urlError && (
          <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2 mb-4">
            {urlError === 'invalid_link' ? 'This confirmation link is invalid or has expired.' : urlError}
          </p>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Email</label>
            <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
              className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              placeholder="you@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Password</label>
            <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
              className="w-full border border-brand-300 rounded-xl px-4 py-3 focus:outline-none focus:border-accent"
              placeholder="••••••••" minLength={6} />
          </div>
          {error && <p className="text-red-500 text-sm bg-red-50 rounded-lg px-4 py-2">{error}</p>}
          <button type="submit" disabled={loading}
            className="w-full bg-accent text-white py-4 rounded-full font-medium hover:bg-accent-hover transition-colors disabled:opacity-60">
            {loading ? 'Please wait...' : mode === 'login' ? 'Sign In' : 'Create Account'}
          </button>
        </form>
        <p className="text-center text-sm text-brand-500 mt-6">
          {mode === 'login' ? "Don't have an account? " : 'Already have an account? '}
          <button onClick={() => { setMode(mode === 'login' ? 'signup' : 'login'); setError(''); }}
            className="text-accent font-medium hover:underline">
            {mode === 'login' ? 'Sign up' : 'Sign in'}
          </button>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
