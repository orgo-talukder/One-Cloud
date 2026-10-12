'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Cloud, ArrowLeft, Send, AtSign, Loader2, CheckCircle2, Shield } from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      return;
    }
    setLoading(true);

    try {
      await sendPasswordResetEmail(auth, email);
    } catch {
      // Proceed gracefully for user security
    } finally {
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('reset_target_email', email);
      }
      setLoading(false);
      setFeedbackSent(true);
      setTimeout(() => {
        router.push(`/password-reset-success?email=${encodeURIComponent(email)}`);
      }, 700);
    }
  };

  return (
    <div className="bg-canvas text-on-surface min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary transition-colors">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-20">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shadow-xs">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary tracking-tight text-sm leading-tight">
              One Cloud
            </span>
            <span className="text-[10px] tracking-wider uppercase text-text-muted mt-0.5 font-semibold">
              Telegram Drive
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      {/* Main Form */}
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 md:px-6 lg:px-8 py-6 z-10">
        <div className="flex flex-col w-full items-center justify-center relative">
          <div className="absolute -top-32 w-80 h-80 rounded-full bg-primary-container/10 blur-[100px] pointer-events-none" />

          <div className="w-full max-w-[440px] bg-surface rounded-xl p-8 md:p-10 shadow-2xl relative transition-all duration-300 border border-border">
            {/* Top Icon Badge */}
            <div className="flex justify-center">
              <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-primary-container shadow-inner border border-primary/20">
                <Cloud className="w-6 h-6 text-primary" />
              </div>
            </div>

            <div className="text-center mt-4">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Forgot your password?
              </h1>
              <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                Enter the email address associated with your account and we&apos;ll send you a secure link to reset your password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label htmlFor="email" className="text-xs font-medium text-text-secondary">
                    Email address
                  </label>
                </div>
                <div className="relative flex items-center">
                  <div className="absolute left-3.5 flex items-center pointer-events-none text-text-muted">
                    <AtSign className="w-4 h-4" />
                  </div>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="alex@example.com"
                    className="w-full h-11 bg-canvas/60 rounded-lg pl-10 pr-3.5 text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-focus-ring/70 transition-all border border-border shadow-inner"
                  />
                </div>
              </div>

              <button
                id="submit-btn"
                type="submit"
                disabled={loading || feedbackSent}
                className="w-full h-11 bg-primary-container hover:bg-brand-hover text-text-primary font-medium text-sm rounded-lg flex items-center justify-center gap-2 mt-5 shadow-xs transition-colors active:scale-[0.99] cursor-pointer disabled:opacity-75"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Sending Link...</span>
                  </>
                ) : feedbackSent ? (
                  <>
                    <span>Link Sent</span>
                    <CheckCircle2 className="w-4 h-4 text-tertiary" />
                  </>
                ) : (
                  <>
                    <span>Send Reset Link</span>
                    <Send className="w-4 h-4" />
                  </>
                )}
              </button>

              {feedbackSent && (
                <div className="rounded-lg p-3 text-xs flex items-start gap-2.5 bg-brand-subtle text-text-primary border border-primary/20">
                  <CheckCircle2 className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <span className="font-semibold text-tertiary block">Recovery email sent</span>
                    <span className="text-text-secondary text-xs">
                      If an account exists, instructions were dispatched to that address.
                    </span>
                  </div>
                </div>
              )}

              <div className="pt-2 text-center">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors py-1 group"
                >
                  <ArrowLeft className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" />
                  <span>Back to Log In</span>
                </Link>
              </div>
            </form>

            <div className="rounded-lg p-3 bg-canvas/40 flex items-center gap-2.5 mt-6 border border-border/50">
              <Shield className="w-4 h-4 text-text-muted shrink-0" />
              <p className="text-[11px] leading-tight text-text-muted">
                End-to-end encrypted storage via Telegram Saved Messages
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span className="text-xs text-text-muted font-medium">MTProto 2.0 Vault Active</span>
            </div>
            <span className="text-text-muted/40 text-xs">•</span>
            <span className="text-xs text-text-muted">Direct Session Auth</span>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 z-20 border-t border-border/40">
        <div className="text-xs text-text-muted">
          © 2025 One Cloud. Encrypted Telegram Workspace.
        </div>
        <nav className="flex items-center gap-6 text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            Terms
          </Link>
          <Link href="/security" className="hover:text-text-secondary transition-colors">
            Support / Security
          </Link>
        </nav>
      </footer>
    </div>
  );
}
