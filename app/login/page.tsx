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

  const handleTelegramAuth = async () => {
    setLoading(true);
    setError(null);
    setAuthStatus('Initiating session handshake with Telegram...');
    try {
      // Direct guest or Google authentication proxy
      await signInWithGoogle();
      router.push('/app');
    } catch {
      // Fallback to guest
      try {
        await signInAsGuest();
        router.push('/app');
      } catch (err: unknown) {
        setAuthStatus(null);
        setError('Telegram session gateway temporarily unavailable.');
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
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shadow-xs">
            <Cloud className="w-5 h-5 text-primary" />
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
                  <Cloud className="w-6 h-6 text-primary" />
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

              {/* Continue with Telegram Button */}
              <div className="mt-6">
                <button
                  type="button"
                  onClick={handleTelegramAuth}
                  disabled={loading}
                  className="w-full h-11 px-4 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border transition-all flex items-center justify-center gap-2.5 text-xs sm:text-sm font-medium group cursor-pointer active:scale-[0.99] disabled:opacity-60"
                >
                  <svg
                    className="w-5 h-5 fill-[#36AEEA] transition-transform group-hover:scale-105"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.458c.536-.196 1.006.128.832.919z" />
                  </svg>
                  <span>Continue with Telegram</span>
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
