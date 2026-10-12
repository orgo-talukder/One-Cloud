'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { FileText, Shield } from 'lucide-react';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold mb-3">
            <FileText className="h-3.5 w-3.5 text-primary" />
            Terms & Conditions
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">Terms of Service</h1>
          <p className="mt-1 text-xs text-text-muted">Effective Date: October 2026</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 text-xs text-text-secondary leading-relaxed shadow-sm">
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-text-primary">1. Acceptance of Terms</h2>
            <p>
              By accessing or using One Cloud, you agree to comply with and be bound by these Terms of
              Service, our Privacy Policy, and our Acceptable Use Policy.
            </p>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">2. Telegram Integration & Independent Status</h2>
            <p>
              One Cloud is an independent web application and is not endorsed by, sponsored by, or
              affiliated with Telegram FZ-LLC. Your use of Telegram services remains subject to
              Telegram&apos;s official Terms of Service and API terms.
            </p>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">3. Storage & Custody Semantics</h2>
            <p>
              You acknowledge that deleting your One Cloud account or removing files from the web
              metadata index may not automatically purge files from Telegram unless confirmed via
              supported permanent deletion operations. You retain sole custody of your Telegram account.
            </p>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">4. Limitation of Liability</h2>
            <p>
              One Cloud is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We are
              not responsible for disruptions resulting from Telegram API rate limiting, network
              downtime, or third-party account modifications.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
