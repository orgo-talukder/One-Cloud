'use client';

import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock, Database, Send } from 'lucide-react';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full space-y-8">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold mb-3">
            <ShieldCheck className="h-3.5 w-3.5 text-tertiary" />
            Zero-Custody Privacy Standard
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">Privacy Policy</h1>
          <p className="mt-1 text-xs text-text-muted">Effective Date: October 2026</p>
        </div>

        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-6 text-xs text-text-secondary leading-relaxed shadow-sm">
          <section className="space-y-2.5">
            <h2 className="text-sm font-semibold text-text-primary">1. Information We Collect</h2>
            <p>
              One Cloud collects only the minimal information required to authenticate you and
              maintain your file index:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-text-muted">
              <li>Account identity information (Email, User ID) managed via Firebase Authentication.</li>
              <li>File organizational metadata (File names, extensions, byte sizes, folder assignments, Telegram message identifiers).</li>
              <li>Encrypted session credentials required to interface with Telegram on your behalf.</li>
            </ul>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">2. Where File Contents Are Stored</h2>
            <p>
              All uploaded file content bytes are transmitted to and stored directly within your personal
              Telegram account (Saved Messages chat). We do not store, duplicate, or inspect your binary
              file payloads on One Cloud database servers.
            </p>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">3. Telegram Account Access Scopes</h2>
            <p>
              One Cloud accesses your Telegram account solely to send document messages to your
              personal Saved Messages chat and retrieve them when you choose to download or stream them.
              We do not access, read, or alter your personal private chats, group messages, or address contacts.
            </p>
          </section>

          <section className="space-y-2.5 pt-4 border-t border-border">
            <h2 className="text-sm font-semibold text-text-primary">4. Session Security & Encryption</h2>
            <p>
              Telegram session tokens are encrypted at rest using industry-standard AES-256-GCM. We never share session
              keys with third parties, ad networks, or telemetry trackers.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
