import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-xs text-slate-600 leading-relaxed">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Terms of Service</h1>
          <p className="mt-2 text-slate-400">Effective Date: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Acceptance of Terms</h2>
          <p>
            By accessing or using One Cloud, you agree to comply with and be bound by these Terms of
            Service and our Acceptable Use Policy.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. Telegram Integration & Independent Status</h2>
          <p>
            One Cloud is an independent web application and is not endorsed by, sponsored by, or
            affiliated with Telegram FZ-LLC. Your use of Telegram services remains subject to
            Telegram&apos;s official Terms of Service and API terms.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">3. Storage & Deletion Semantics</h2>
          <p>
            You acknowledge that deleting your One Cloud account or removing files from the web
            metadata index may not automatically purge files from Telegram unless confirmed via
            supported deletion operations.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">4. Limitation of Liability</h2>
          <p>
            One Cloud is provided on an &ldquo;as is&rdquo; and &ldquo;as available&rdquo; basis. We are
            not responsible for disruptions resulting from Telegram API rate limiting, network
            downtime, or external account changes.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
