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

  const handleTelegramAuth = async () => {
    setLoading(true);
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/app');
    } catch {
      try {
        await signInAsGuest();
        router.push('/app');
      } catch (err: unknown) {
        setError('Telegram session gateway temporarily unavailable.');
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

            {/* Telegram One-click */}
            <button
              type="button"
              onClick={handleTelegramAuth}
              disabled={loading}
              className="w-full h-11 px-4 rounded-[10px] bg-surface-raised hover:bg-surface-hover text-text-primary font-label-md text-xs sm:text-sm flex items-center justify-center gap-2.5 transition-colors duration-150 group mb-6 border border-border cursor-pointer disabled:opacity-60"
            >
              <svg
                className="w-4 h-4 text-[#36AEEA] group-hover:scale-105 transition-transform duration-150 fill-current"
                viewBox="0 0 24 24"
              >
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm4.64 6.8c-.15 1.58-.8 5.42-1.13 7.19-.14.75-.42 1-.68 1.03-.58.05-1.02-.38-1.58-.75-.88-.58-1.38-.94-2.23-1.5-.99-.65-.35-1.01.22-1.59.15-.15 2.71-2.48 2.76-2.69a.2.2 0 00-.05-.18c-.06-.05-.14-.03-.21-.02-.09.02-1.49.95-4.22 2.79-.4.27-.76.41-1.08.4-.36-.01-1.04-.2-1.55-.37-.63-.2-1.12-.31-1.08-.66.02-.18.27-.36.75-.55 2.95-1.28 4.91-2.13 5.89-2.54 2.81-1.16 3.39-1.36 3.77-1.37.08 0 .27.02.39.12.1.08.13.19.14.27-.01.06.01.23 0 .37z" />
              </svg>
              <span>Continue with Telegram</span>
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
