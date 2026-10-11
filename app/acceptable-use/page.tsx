import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function AcceptableUsePage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-xs text-slate-600 leading-relaxed">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Acceptable Use Policy</h1>
          <p className="mt-2 text-slate-400">Effective Date: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Prohibited Content</h2>
          <p>
            You agree not to upload, store, or transmit any files or content that:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Violates applicable local, national, or international laws.</li>
            <li>Contains malicious software, viruses, ransomware, or exploits.</li>
            <li>Infringes on third-party intellectual property or copyright.</li>
            <li>Distributes unsolicited promotional spam or abuse.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. Telegram API Compliance</h2>
          <p>
            Users must comply with Telegram&apos;s API Terms of Service. Any attempts to circumvent
            rate limits, engage in flood-wait violations, or abuse Telegram servers will result in
            immediate account revocation.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
