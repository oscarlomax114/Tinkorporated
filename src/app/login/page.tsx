'use client';

import { Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';

type Mode = 'login' | 'signup' | 'forgot';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 text-center text-sm text-muted font-mono">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/profile';

  const [mode, setMode] = useState<Mode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success'>('idle');
  const [error, setError] = useState('');

  const supabase = createClient();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      router.push(redirectTo);
      router.refresh();
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name },
        emailRedirectTo: `${window.location.origin}/auth/callback?redirect=${redirectTo}`,
      },
    });

    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      // Notify admin of new signup (fire-and-forget).
      fetch('/api/auth/signup-notify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      }).catch(() => {});
      setStatus('success');
    }
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    setError('');

    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback?redirect=/profile`,
    });

    if (error) {
      setError(error.message);
      setStatus('idle');
    } else {
      setStatus('success');
    }
  };

  if (status === 'success' && mode === 'signup') {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-md mx-auto text-center">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-4">ACCOUNT CREATED</div>
          <h1 className="text-2xl font-bold tracking-[0.08em] mb-4">Verify your email</h1>
          <p className="text-sm text-muted mb-8">
            A confirmation link has been sent to <span className="font-mono text-foreground">{email}</span>. Check your inbox and click the link to activate your account.
          </p>
          <button
            onClick={() => { setStatus('idle'); setMode('login'); }}
            className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  if (status === 'success' && mode === 'forgot') {
    return (
      <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-20 md:py-28">
        <div className="max-w-md mx-auto text-center">
          <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-4">RESET REQUESTED</div>
          <h1 className="text-2xl font-bold tracking-[0.08em] mb-4">Check your email</h1>
          <p className="text-sm text-muted mb-8">
            If an account exists for <span className="font-mono text-foreground">{email}</span>, a password reset link has been sent.
          </p>
          <button
            onClick={() => { setStatus('idle'); setMode('login'); }}
            className="border border-foreground px-8 py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-foreground hover:text-background transition-colors"
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-16 md:py-24">
      <div className="max-w-md mx-auto">
        <div className="text-[10px] font-mono tracking-[0.2em] text-muted mb-3">
          {mode === 'login' && 'AUTHENTICATION REQUIRED'}
          {mode === 'signup' && 'CREATE ACCOUNT'}
          {mode === 'forgot' && 'PASSWORD RECOVERY'}
        </div>
        <h1 className="text-3xl font-bold tracking-[0.08em] mb-8">
          {mode === 'login' && 'Sign In'}
          {mode === 'signup' && 'Create Account'}
          {mode === 'forgot' && 'Reset Password'}
        </h1>

        <div className="border border-border">
          <div className="p-5 border-b border-border bg-surface">
            <div className="flex gap-6">
              <button
                onClick={() => { setMode('login'); setError(''); }}
                className={`text-[10px] font-mono tracking-[0.15em] uppercase transition-colors ${mode === 'login' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
              >
                Sign In
              </button>
              <button
                onClick={() => { setMode('signup'); setError(''); }}
                className={`text-[10px] font-mono tracking-[0.15em] uppercase transition-colors ${mode === 'signup' ? 'text-foreground' : 'text-muted hover:text-foreground'}`}
              >
                Create Account
              </button>
            </div>
          </div>

          <form
            onSubmit={mode === 'login' ? handleLogin : mode === 'signup' ? handleSignup : handleForgotPassword}
            className="p-6 md:p-8 space-y-6"
          >
            {mode === 'signup' && (
              <div>
                <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Full Name *</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                />
              </div>
            )}

            <div>
              <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Email Address *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
              />
            </div>

            {mode !== 'forgot' && (
              <div>
                <label className="text-[10px] font-mono tracking-[0.15em] text-muted uppercase block mb-2">Password *</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="w-full bg-transparent border border-border px-4 py-3 text-sm text-foreground focus:border-foreground outline-none transition-colors"
                />
              </div>
            )}

            {error && (
              <div className="text-[10px] font-mono text-accent-red tracking-[0.1em]">{error}</div>
            )}

            <button
              type="submit"
              disabled={status === 'loading'}
              className="w-full bg-foreground text-background py-3 text-[11px] font-mono tracking-[0.2em] uppercase hover:bg-muted transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {status === 'loading' ? 'Processing…' : mode === 'login' ? 'Sign In' : mode === 'signup' ? 'Create Account' : 'Send Reset Link'}
            </button>

            <div className="flex justify-between text-[10px] font-mono text-muted tracking-[0.1em]">
              {mode === 'login' && (
                <button type="button" onClick={() => { setMode('forgot'); setError(''); }} className="hover:text-foreground transition-colors">
                  Forgot password?
                </button>
              )}
              {mode === 'forgot' && (
                <button type="button" onClick={() => { setMode('login'); setError(''); }} className="hover:text-foreground transition-colors">
                  Back to sign in
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
