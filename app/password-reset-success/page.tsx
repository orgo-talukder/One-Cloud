'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  Cloud,
  ArrowLeft,
  MailCheck,
  AtSign,
  Copy,
  Check,
  Send,
  Loader2,
  RefreshCw,
  ShieldCheck,
} from 'lucide-react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '@/lib/firebase/client';

function PasswordResetContent() {
  const searchParams = useSearchParams();
  const [email] = useState(() => {
    return (
      searchParams.get('email') ||
      (typeof window !== 'undefined'
        ? sessionStorage.getItem('reset_target_email') || 'alex@example.com'
        : 'alex@example.com')
    );
  });
  const [copied, setCopied] = useState(false);
  const [remainingSeconds, setRemainingSeconds] = useState(54);
  const [resending, setResending] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);

  // Live Cooldown Countdown Timer
  useEffect(() => {
    if (remainingSeconds <= 0) return;
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => Math.max(0, prev - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [remainingSeconds]);

  const handleCopyEmail = () => {
    navigator.clipboard.writeText(email);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleResend = async () => {
    if (resending || remainingSeconds > 0) return;
    setResending(true);
    try {
      if (email && email.includes('@')) {
        await sendPasswordResetEmail(auth, email);
      }
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 3000);
      setRemainingSeconds(60);
    } catch {
      setRemainingSeconds(60);
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="relative w-full max-w-[440px] bg-surface rounded-xl p-8 md:p-10 shadow-2xl text-center overflow-hidden border border-border">
      {/* Subtle Ambient Accent */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-48 h-1 bg-tertiary/40 blur-xs rounded-full pointer-events-none" />
      <div className="absolute -top-16 left-1/2 -translate-x-1/2 w-36 h-36 bg-tertiary/10 rounded-full blur-2xl pointer-events-none" />

      {/* Status Icon Badge */}
      <div className="relative w-14 h-14 rounded-full bg-tertiary/10 text-tertiary flex items-center justify-center mx-auto mb-5 shadow-xs">
        <MailCheck className="w-7 h-7 select-none" />
        <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-surface flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-tertiary animate-pulse" />
        </span>
      </div>

      {/* Main Title */}
      <h1 className="text-2xl font-bold text-text-primary tracking-tight mb-2">
        Check your email
      </h1>

      {/* Contextual Explanation */}
      <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-[340px] mx-auto">
        If an account exists for that email, we have sent password reset instructions to:
      </p>

      {/* Recipient Dynamic Chip */}
      <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-canvas text-text-primary my-3.5 mx-auto max-w-full border border-border/60">
        <AtSign className="w-4 h-4 text-text-muted shrink-0" />
        <span
          id="recipient-email"
          className="font-mono text-xs font-medium tracking-tight truncate max-w-[240px]"
        >
          {email}
        </span>
        <button
          type="button"
          onClick={handleCopyEmail}
          title="Copy email address"
          className="text-text-muted hover:text-text-primary transition-colors flex items-center justify-center ml-0.5 cursor-pointer"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-tertiary" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Guidance Advisory */}
      <p className="text-xs text-text-muted leading-relaxed max-w-[340px] mx-auto mb-6">
        Please allow up to a few minutes for delivery and be sure to check your spam or junk folder.
      </p>

      {/* Navigation / Primary CTA */}
      <div className="flex flex-col gap-3">
        <Link
          href="/login"
          className="inline-flex items-center justify-center gap-2 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-lg h-[44px] w-full transition-colors shadow-xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Log In</span>
        </Link>

        {/* Telegram Bot Instant Verify Option */}
        <Link
          href="/app"
          className="inline-flex items-center justify-center gap-2 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border/60 rounded-lg h-[40px] w-full transition-colors"
        >
          <Send className="w-4 h-4 text-secondary" />
          <span>Open Telegram Bot verification</span>
        </Link>
      </div>

      {/* Dynamic Resend Controller */}
      <div className="mt-5 flex items-center justify-center text-xs text-text-muted min-h-[24px]">
        {remainingSeconds > 0 ? (
          <div className="inline-flex items-center gap-1.5">
            <Loader2 className="w-3.5 h-3.5 animate-spin text-text-muted select-none" />
            <span>Didn&apos;t receive the email?</span>
            <span className="text-text-secondary font-medium">
              Resend email ({remainingSeconds}s)
            </span>
          </div>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="inline-flex items-center gap-1.5 text-primary hover:text-text-primary transition-colors cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${resending ? 'animate-spin text-primary' : ''}`}
            />
            <span className="font-medium underline underline-offset-4">
              {resending ? 'Sending new link...' : 'Resend email now'}
            </span>
          </button>
        )}
      </div>

      {resendSuccess && (
        <p className="text-xs text-tertiary mt-2 animate-in fade-in">
          Password reset link re-sent successfully!
        </p>
      )}

      {/* Security & Validity Footer Callout */}
      <div className="bg-canvas/50 rounded-lg p-3 text-xs text-text-muted flex items-center justify-center gap-2 mt-6 border border-border/30">
        <ShieldCheck className="w-4 h-4 text-tertiary select-none" />
        <span>Secure recovery link expires in 30 minutes</span>
      </div>
    </div>
  );
}

export default function PasswordResetSuccessPage() {
  return (
    <div className="bg-canvas text-on-surface font-body-md antialiased min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary transition-colors">
      {/* Header */}
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-20 border-b border-border/40">
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
      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-8 z-10">
        <div className="flex flex-col w-full items-center justify-center">
          <Suspense
            fallback={
              <div className="flex items-center justify-center p-12 text-text-muted">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            }
          >
            <PasswordResetContent />
          </Suspense>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-border/40">
        <p className="text-xs text-text-muted">
          © 2025 One Cloud. Encrypted Telegram Workspace.
        </p>
        <nav className="flex items-center gap-6 text-xs text-text-muted">
          <Link href="/privacy" className="hover:text-text-secondary transition-colors">
            Privacy
          </Link>
          <Link href="/terms" className="hover:text-text-secondary transition-colors">
            Terms
          </Link>
          <Link href="/help" className="hover:text-text-secondary transition-colors">
            Support / Security
          </Link>
        </nav>
      </footer>
    </div>
  );
}
