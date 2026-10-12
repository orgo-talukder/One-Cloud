'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  ShieldCheck,
  Lock,
  Key,
  EyeOff,
  Server,
  AlertCircle,
  Database,
  CheckCircle2,
  Cpu,
  ArrowRight,
} from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-12">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Zero-Custody Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Security & Privacy Model
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Our architectural guarantees, data boundaries, and honest cryptographic posture.
          </p>
        </div>

        {/* Honest E2EE Notice Box */}
        <div className="p-6 rounded-2xl bg-warning/10 border border-warning/30 space-y-2.5">
          <div className="flex items-center gap-2 text-warning font-semibold text-sm">
            <AlertCircle className="h-4.5 w-4.5 shrink-0" />
            <span>Honest Security Notice Regarding Encryption</span>
          </div>
          <p className="text-xs text-text-secondary leading-relaxed">
            We never market false claims of client-side zero-knowledge or End-to-End Encryption (E2EE).
            Telegram Cloud Chats (including Saved Messages) are encrypted in transit and at rest on Telegram MTProto
            servers, but are distinct from Telegram Secret Chats. One Cloud never inspects or proxies your raw binary
            files, but the underlying cloud encryption is governed by Telegram&apos;s MTProto protocol.
          </p>
        </div>

        {/* Core Guarantees Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col justify-between shadow-xs hover:border-primary-container/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-tertiary border border-border">
                <ShieldCheck className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Zero-Custody File Payloads</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Your binary bytes stream directly between your browser and Telegram Saved Messages via MTProto.
                One Cloud application servers never inspect, store, or cache your actual files.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border font-mono text-[11px] text-tertiary">
              Direct Browser ➔ Telegram DC
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col justify-between shadow-xs hover:border-primary-container/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-primary border border-border">
                <Database className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Isolated Metadata Index</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Folder hierarchies, custom tags, and file names are stored in secure Firestore metadata nodes
                protected with strict Firebase Auth security rules mapped directly to authenticated UIDs.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border font-mono text-[11px] text-primary">
              UID Partitioned / Rule-Locked
            </div>
          </div>

          <div className="bg-surface rounded-xl border border-border p-6 flex flex-col justify-between shadow-xs hover:border-primary-container/40 transition-colors">
            <div className="space-y-3">
              <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-file-document border border-border">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Client-Side Sandbox</h3>
              <p className="text-xs text-text-secondary leading-relaxed">
                Previews, thumbnails, and streaming downloads execute entirely inside your local browser runtime,
                preventing third-party introspection or data exfiltration.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-border font-mono text-[11px] text-text-muted">
              Browser Web APIs & Streams
            </div>
          </div>
        </div>

        {/* Security Controls Table */}
        <div className="p-6 bg-surface rounded-2xl border border-border space-y-4 shadow-sm">
          <h2 className="text-base font-semibold text-text-primary">Data Boundary Verification</h2>
          <div className="divide-y divide-border/60 text-xs">
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-text-primary">Telegram Session Credentials</span>
              <span className="text-text-secondary">
                Encrypted in server environment or stored securely in your active session. Never shared or sold.
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-text-primary">File Deletion Protocol</span>
              <span className="text-text-secondary">
                Permanent deletion in One Cloud issues an API request to delete the message from Telegram Saved Messages.
              </span>
            </div>
            <div className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <span className="font-medium text-text-primary">Account Isolation</span>
              <span className="text-text-secondary">
                Firestore rules strictly prohibit cross-user reads. Users can only query documents matching their auth UID.
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-8">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-brand-hover text-text-primary font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <span>Launch Secure Workspace</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
