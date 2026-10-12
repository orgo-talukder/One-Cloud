'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldAlert } from 'lucide-react';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold mb-3">
            <ShieldAlert className="h-3.5 w-3.5 text-warning" />
            Compliance Guidelines
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">Acceptable Use Policy</h1>
          <p className="mt-1 text-xs text-text-muted">Effective Date: October 2026</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 text-xs text-text-secondary leading-relaxed shadow-sm">
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-text-primary">1. Prohibited Content</h2>
            <p>
              You agree not to upload, store, or transmit any files or content that:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted">
              <li>Violates applicable local, national, or international laws or regulations.</li>
              <li>Contains malicious software, viruses, ransomware, trojans, or software exploits.</li>
              <li>Infringes on third-party intellectual property, trademark, or copyright.</li>
              <li>Distributes unsolicited promotional spam or engages in abusive storage attacks.</li>
            </ul>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">2. Telegram API Compliance</h2>
            <p>
              Users must comply with Telegram&apos;s official API Terms of Service. Any attempts to circumvent
              rate limits, engage in flood-wait violations, or abuse Telegram cloud servers will result in
              immediate account termination.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
