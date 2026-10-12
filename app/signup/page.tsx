'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Cloud,
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 6) {
      setError('Password must be at least 6 characters long.');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      await signUpWithEmail(email, password, name);
      router.push('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to create account.';
      setError(msg.replace('Firebase: ', ''));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas text-text-primary min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary">
      {/* Top Header */}
      <header className="w-full py-6 px-6 lg:px-12 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary tracking-tight text-sm leading-tight">
              One Cloud
            </span>
            <span className="text-[10px] leading-none text-text-muted uppercase tracking-wider font-semibold">
              Telegram Drive
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-12">
        <div className="relative w-full max-w-[440px]">
          {/* Subtle glow */}
          <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative bg-surface rounded-xl p-8 sm:p-9 shadow-xl border border-border">
            <div className="flex flex-col items-center text-center">
              <div className="w-12 h-12 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border-strong shadow-xs mb-4">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Create your account
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-[320px]">
                Start organizing your files with Telegram-backed cloud storage.
              </p>
            </div>

            {error && (
              <div className="mt-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span className="leading-relaxed">{error}</span>
              </div>
            )}

            {/* Social / One-click sign up */}
            <div className="mt-6 flex flex-col gap-2.5">
              <button
                type="button"
                disabled={loading}
                onClick={async () => {
                  setLoading(true);
                  setError(null);
                  try {
                    await signInWithGoogle();
                    router.push('/app');
                  } catch (err: unknown) {
                    const msg =
                      err instanceof Error
                        ? err.message
                        : 'Google sign-up canceled or failed.';
                    setError(msg.replace('Firebase: ', ''));
                  } finally {
                    setLoading(false);
                  }
                }}
                className="w-full h-11 px-4 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border transition-all flex items-center justify-center gap-2.5 text-xs font-semibold cursor-pointer active:scale-[0.99] disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Sign up with Google</span>
              </button>
            </div>

            <div className="relative my-6 flex items-center justify-center">
              <div className="w-full border-t border-border" />
              <span className="absolute bg-surface px-3 text-xs text-text-muted">
                or sign up with email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary" htmlFor="name">
                  Full Name
                </label>
                <input
                  id="name"
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Alex Morgan"
                  className="w-full h-11 px-3.5 bg-canvas text-text-primary placeholder:text-text-muted rounded-lg border border-border focus:border-focus-ring focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="alex@example.com"
                  className="w-full h-11 px-3.5 bg-canvas text-text-primary placeholder:text-text-muted rounded-lg border border-border focus:border-focus-ring focus:outline-none transition-colors text-sm"
                />
              </div>

              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-text-secondary" htmlFor="password">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    className="w-full h-11 pl-3.5 pr-11 bg-canvas text-text-primary placeholder:text-text-muted rounded-lg border border-border focus:border-focus-ring focus:outline-none transition-colors text-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    aria-label="Toggle password"
                    className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full h-11 rounded-lg bg-primary-container hover:bg-brand-hover active:scale-[0.99] text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <>
                      <span>Create Account</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </form>

            <div className="mt-6 pt-5 border-t border-border flex flex-col items-center gap-3">
              <p className="text-xs text-text-muted text-center">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:underline font-semibold ml-1 transition-colors"
                >
                  Sign in
                </Link>
              </p>
              <div className="flex items-center gap-1.5 text-text-muted text-[11px]">
                <Lock className="w-3.5 h-3.5 text-tertiary" />
                <span>End-to-end encrypted storage</span>
              </div>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-xs text-text-muted">
              Protected by Firebase Authentication & Telegram MTProto
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40 text-xs text-text-muted">
        <p>© {new Date().getFullYear()} One Cloud Inc. Secure Telegram storage client.</p>
        <div className="flex items-center gap-6">
          <Link href="/privacy" className="hover:text-text-primary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-primary transition-colors">
            Terms
          </Link>
          <Link href="/help" className="hover:text-text-primary transition-colors">
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
