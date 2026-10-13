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
  CheckCircle2,
  Circle,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export default function SignUpPage() {
  const router = useRouter();
  const { signUpWithEmail, signInWithGoogle, signInAsGuest } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password requirements calculation
  const hasLength = password.length >= 8;
  const hasSpecialOrNum = /[0-9!@#$%^&*(),.?":{}|<>]/.test(password);

  let strengthLabel = 'Pending';
  let strengthColor = 'text-text-muted';
  if (password.length > 0) {
    if (hasLength && hasSpecialOrNum) {
      strengthLabel = 'Strong';
      strengthColor = 'text-tertiary font-medium';
    } else {
      strengthLabel = 'Weak';
      strengthColor = 'text-warning font-medium';
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!hasLength) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    setError(null);

    try {
      await signUpWithEmail(email, password, fullName);
      router.push('/app');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message.replace('Firebase: ', '') : 'Failed to create account.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/app');
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code;
      if (code === 'auth/popup-blocked') {
        setError('Popup was blocked by your browser. Please allow popups for this site or use email sign-up.');
      } else if (code === 'auth/popup-closed-by-user') {
        setError('Google sign-in popup was closed before completion.');
      } else {
        const msg =
          err instanceof Error
            ? err.message.replace('Firebase: ', '')
            : 'Google sign-up was unable to complete. Please try email.';
        setError(msg);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-canvas font-body-md text-on-surface antialiased min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary-fixed">
      {/* Header */}
      <header className="w-full py-6 px-6 lg:px-12 flex items-center justify-between">
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
            <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight font-semibold">
              One Cloud
            </span>
            <span className="font-label-sm text-[10px] leading-none text-text-muted uppercase tracking-wider font-semibold">
              Telegram Drive
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 font-label-md text-label-md text-text-secondary hover:text-on-surface hover:bg-surface-hover px-2.5 py-1.5 rounded-lg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="w-full flex-1 flex items-center justify-center px-4 py-8 bg-canvas">
        <div className="flex flex-col w-full items-center justify-center">
          <div className="w-full max-w-[460px] bg-surface rounded-[14px] p-7 sm:p-8 flex flex-col shadow-xl relative border border-border">
            {/* Brand Header */}
            <div className="flex items-center gap-3 mb-6">
              <div className="relative w-10 h-10 rounded-lg flex items-center justify-center shrink-0">
                <Image
                  src="/website_logo.png"
                  alt="One Cloud"
                  width={36}
                  height={36}
                  className="w-9 h-9 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="font-headline-sm text-headline-sm text-text-primary tracking-tight font-bold">
                    One Cloud
                  </span>
                  <span className="font-label-sm text-[11px] leading-none px-2 py-0.5 rounded-full bg-brand-subtle text-primary font-medium tracking-wide border border-primary/20">
                    SECURE
                  </span>
                </div>
                <span className="font-label-sm text-xs text-text-muted">
                  Personal Telegram Drive
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-1 mb-6">
              <h1 className="font-headline-md text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Create your account
              </h1>
              <p className="font-body-md text-xs sm:text-sm text-text-secondary">
                Set up your personal cloud drive powered by Telegram.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 rounded-lg bg-danger/10 border border-danger/30 text-xs text-danger flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Google One-click */}
            <button
              type="button"
              onClick={handleGoogleAuth}
              disabled={loading}
              className="w-full h-11 px-4 rounded-[10px] bg-surface-raised hover:bg-surface-hover text-text-primary font-label-md text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors duration-150 group mb-6 border border-border cursor-pointer disabled:opacity-60 shadow-xs"
            >
              <svg className="w-4 h-4 shrink-0 transition-transform duration-150 group-hover:scale-105" viewBox="0 0 24 24">
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

            <div className="relative flex items-center justify-center mb-6">
              <div className="w-full h-[1px] bg-surface-raised" />
              <span className="absolute px-3 bg-surface font-label-sm text-[11px] text-text-muted tracking-wider uppercase">
                or email
              </span>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-medium text-text-primary" htmlFor="fullName">
                  Full name
                </label>
                <div className="relative flex items-center">
                  <input
                    id="fullName"
                    name="fullName"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Alex Morgan"
                    className="w-full h-11 px-3.5 bg-surface-container text-text-primary placeholder:text-text-muted rounded-[10px] text-xs sm:text-sm border border-border focus:outline-none focus:ring-2 focus:ring-focus-ring transition-shadow duration-150"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="font-label-md text-xs font-medium text-text-primary" htmlFor="email">
                  Email address
                </label>
                <div className="relative flex items-center">
                  <input
                    id="email"
                    name="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full h-11 px-3.5 bg-surface-container text-text-primary placeholder:text-text-muted rounded-[10px] text-xs sm:text-sm border border-border focus:outline-none focus:ring-2 focus:ring-focus-ring transition-shadow duration-150"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="font-label-md text-xs font-medium text-text-primary" htmlFor="password">
                    Password
                  </label>
                  <span className="font-label-sm text-[11px] text-text-muted">Master Vault Key</span>
                </div>
                <div className="relative flex items-center">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-3.5 pr-11 bg-surface-container text-text-primary placeholder:text-text-muted rounded-[10px] text-xs sm:text-sm border border-border focus:outline-none focus:ring-2 focus:ring-focus-ring transition-shadow duration-150"
                  />
                  <button
                    aria-label="Toggle password visibility"
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-2.5 w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Security Complexity Checklist */}
              <div className="bg-surface-raised rounded-[10px] p-3 flex flex-col gap-2 border border-border/60">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-text-muted">Security complexity</span>
                  <span className={strengthColor}>{strengthLabel}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="flex items-center gap-1.5">
                    {hasLength ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    )}
                    <span className={hasLength ? 'text-text-primary' : 'text-text-muted'}>
                      8+ characters
                    </span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {hasSpecialOrNum ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-tertiary shrink-0" />
                    ) : (
                      <Circle className="w-3.5 h-3.5 text-text-muted shrink-0" />
                    )}
                    <span className={hasSpecialOrNum ? 'text-text-primary' : 'text-text-muted'}>
                      1 number or symbol
                    </span>
                  </div>
                </div>
              </div>

              <p className="font-body-sm text-[11px] text-text-muted leading-relaxed mt-1">
                By signing up, you agree to our{' '}
                <Link
                  href="/terms"
                  className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="text-text-secondary hover:text-text-primary underline underline-offset-2 transition-colors"
                >
                  Privacy Policy
                </Link>
                .
              </p>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-11 px-4 mt-2 bg-primary-container hover:bg-brand-hover text-text-primary font-label-md text-xs sm:text-sm rounded-[10px] transition-colors duration-150 flex items-center justify-center gap-2 shadow-xs font-semibold cursor-pointer disabled:opacity-60"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating account...</span>
                  </>
                ) : (
                  <>
                    <span>Create Account</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 bg-surface flex flex-col items-center gap-4 border-t border-border/50">
              <p className="font-body-md text-xs sm:text-sm text-text-secondary">
                Already have an account?{' '}
                <Link
                  href="/login"
                  className="text-primary hover:text-primary-fixed font-medium transition-colors ml-1"
                >
                  Log in
                </Link>
              </p>

              <div className="w-full py-2.5 px-3 rounded-lg bg-surface-raised flex items-center justify-center gap-2 border border-border/40">
                <Lock className="w-4 h-4 text-tertiary shrink-0" />
                <span className="font-body-sm text-xs text-text-muted">
                  End-to-end encrypted storage via Telegram Saved Messages
                </span>
              </div>

              <div className="flex items-center gap-3 pt-1 text-xs">
                <Link
                  href="/privacy"
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  Privacy
                </Link>
                <span className="text-text-muted opacity-40">•</span>
                <Link
                  href="/terms"
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  Terms
                </Link>
                <span className="text-text-muted opacity-40">•</span>
                <Link
                  href="/security"
                  className="text-text-muted hover:text-text-secondary transition-colors"
                >
                  Security
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-6 px-6 lg:px-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
        <p className="font-body-sm text-xs text-text-muted">
          © 2025 One Cloud Inc. Secure Telegram storage client.
        </p>
        <div className="flex items-center gap-6 text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-on-surface transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-on-surface transition-colors">
            Terms
          </Link>
          <Link href="/help" className="hover:text-on-surface transition-colors">
            Support
          </Link>
        </div>
      </footer>
    </div>
  );
}
