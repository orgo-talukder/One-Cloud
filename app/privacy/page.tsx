import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />
      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-3xl mx-auto space-y-8 text-xs text-slate-600 leading-relaxed">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">Privacy Policy</h1>
          <p className="mt-2 text-slate-400">Effective Date: October 2026</p>
        </div>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">1. Information We Collect</h2>
          <p>
            One Cloud collects only the minimal information required to authenticate you and
            maintain your file index:
          </p>
          <ul className="list-disc pl-5 space-y-1">
            <li>Account identity information (Email, User ID) provided via Firebase Authentication.</li>
            <li>File organizational metadata (File names, extensions, byte sizes, folder assignments, Telegram message identifiers).</li>
            <li>Encrypted session credentials required to interface with Telegram on your behalf.</li>
          </ul>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">2. Where File Contents Are Stored</h2>
          <p>
            All uploaded file content bytes are transmitted to and stored within your personal
            Telegram account (Saved Messages chat). We do not store, copy, or retain your binary
            file payloads on One Cloud database servers.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">3. Telegram Account Access</h2>
          <p>
            One Cloud accesses your Telegram account solely to send document messages to your
            personal Saved Messages chat and retrieve them when requested. We do not access, read,
            or alter your personal chats, group messages, or contacts.
          </p>
        </section>

        <section className="space-y-3">
          <h2 className="text-sm font-bold text-slate-900">4. Session Security</h2>
          <p>
            Telegram session tokens are encrypted at rest using AES-256-GCM. We never share session
            keys with third parties or telemetry systems.
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
