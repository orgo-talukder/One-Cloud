'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  ArrowLeft,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function LoginPage() {
  const router = useRouter();
  const { signInWithEmail, signInWithGoogle, signInAsGuest } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [authStatus, setAuthStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setAuthStatus('Verifying credentials with MTProto gateway...');

    try {
      await signInWithEmail(email, password);
      setAuthStatus('Decryption successful. Redirecting to workspace...');
      setTimeout(() => {
        router.push('/app');
      }, 500);
    } catch (err: unknown) {
      setAuthStatus(null);
      const msg =
        err instanceof Error
          ? err.message.replace('Firebase: ', '')
          : 'Invalid credentials. Please verify your email and password.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    setAuthStatus('Connecting to Google...');
    try {
      await signInWithGoogle();
      router.push('/app');
    } catch (err: unknown) {
      setAuthStatus(null);
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site or use email sign-in.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completion.');
      } else {
        const msg =
          err instanceof Error
            ? err.message.replace('Firebase: ', '')
            : 'Google sign-in was unable to proceed. Please try again or use email.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas text-on-surface font-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary transition-colors">
      {/* Header */}
      <header className="w-full py-6 px-6 lg:px-12 flex items-center justify-between border-b border-border/40">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="relative w-9 h-9 rounded-lg flex items-center justify-center shrink-0">
            <Image
              src="/website_logo.png"
              alt="One Cloud"
              width={36}
              height={36}
              priority
              className="w-9 h-9 object-contain group-hover:scale-105 transition-transform"
              referrerPolicy="no-referrer"
            />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary tracking-tight text-sm leading-tight">
              One Cloud
            </span>
            <span className="text-[10px] leading-none text-text-muted uppercase tracking-wider font-semibold mt-0.5">
              Telegram Drive
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Container */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 bg-canvas">
        <div className="flex flex-col w-full items-center justify-center">
          <div className="relative w-full max-w-[440px] px-4 sm:px-0">
            {/* Ambient Accent */}
            <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-72 h-36 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

            <div className="relative bg-surface rounded-xl p-8 sm:p-9 shadow-xl border border-border">
              {/* Header inside card */}
              <div className="flex flex-col items-center text-center">
                <div className="w-12 h-12 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border-strong shadow-xs mb-4">
                  <Image
                    src="/website_logo.png"
                    alt="One Cloud"
                    width={28}
                    height={28}
                    className="w-7 h-7 object-contain"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-col items-center">
                  <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    Welcome back
                  </h1>
                  <p className="text-xs sm:text-sm text-text-secondary mt-1.5 max-w-[320px] leading-relaxed">
                    Sign in to access your files and connected Telegram storage.
                  </p>
                </div>
              </div>

              {/* Continue with Google Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleGoogleAuth}
                  disabled={loading}
                  className="w-full h-11 px-4 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium group cursor-pointer active:scale-[0.99] disabled:opacity-60 shadow-xs"
                >
                  <svg className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </div>

              {/* Divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="w-full border-t border-border" />
                <span className="absolute bg-surface px-3 text-xs text-text-muted">
                  or sign in with email
                </span>
              </div>

              {/* Error Box */}
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span className="leading-relaxed">{error}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-text-secondary" htmlFor="email">
                    Email
                  </label>
                  <div className="relative">
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
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label
                      className="block text-xs font-medium text-text-secondary"
                      htmlFor="password"
                    >
                      Password
                    </label>
                    <Link
                      href="/forgot-password"
                      className="text-xs text-primary hover:text-focus-ring transition-colors"
                    >
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••••••"
                      className="w-full h-11 pl-3.5 pr-11 bg-canvas text-text-primary placeholder:text-text-muted rounded-lg border border-border focus:border-focus-ring focus:outline-none transition-colors text-sm"
                    />
                    <button
                      type="button"
                      aria-label="Toggle password visibility"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-0 top-0 h-11 w-11 flex items-center justify-center text-text-muted hover:text-text-secondary transition-colors cursor-pointer"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {authStatus && (
                  <div className="rounded-lg bg-surface-raised p-3 border border-border text-left animate-in fade-in duration-100">
                    <div className="flex items-start gap-2.5">
                      <Loader2 className="w-4 h-4 text-primary animate-spin shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <p className="text-xs text-text-primary font-medium">{authStatus}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="pt-1">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full h-[42px] rounded-lg bg-primary-container hover:bg-brand-hover active:scale-[0.99] text-text-primary text-sm font-medium flex items-center justify-center gap-2 transition-colors shadow-xs cursor-pointer disabled:opacity-60"
                  >
                    <span>{loading ? 'Authenticating...' : 'Log In'}</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </form>

              {/* Card Footer */}
              <div className="mt-6 pt-5 border-t border-border flex flex-col items-center gap-3">
                <p className="text-xs text-text-muted text-center">
                  Don&apos;t have an account?{' '}
                  <Link
                    href="/signup"
                    className="text-primary hover:text-focus-ring font-medium ml-1 transition-colors"
                  >
                    Sign up
                  </Link>
                </p>
                <div className="flex items-center gap-1.5 text-text-muted text-xs">
                  <Lock className="w-3.5 h-3.5 text-tertiary" />
                  <span>End-to-end encrypted storage</span>
                </div>
              </div>
            </div>

            <div className="mt-6 text-center">
              <p className="text-xs text-text-muted">
                Protected by Firebase Authentication &amp; Telegram MTProto
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
        <p className="text-xs text-text-muted">
          © 2025 One Cloud Inc. Secure Telegram storage client.
        </p>
        <div className="flex items-center gap-6">
          <Link
            href="/privacy"
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Terms
          </Link>
          <Link
            href="/help"
            className="text-xs text-text-muted hover:text-text-primary transition-colors"
          >
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
