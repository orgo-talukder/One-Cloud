'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Send,
  Database,
  ArrowRight,
  ShieldCheck,
  CheckCircle,
  Lock,
  Layers,
  Cpu,
  Server,
  Cloud,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto w-full space-y-16">
        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Hybrid Dual-Tier Architecture
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            How One Cloud Works
          </h1>
          <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
            A clean separation of concerns: heavy file payloads reside safely in your personal Telegram cloud,
            while fast hierarchical directory indexes are tracked in Google Cloud Firestore.
          </p>
        </div>

        {/* 4 Steps Architecture */}
        <div className="space-y-6">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-primary">
                PIPELINE ARCHITECTURE
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                Four Steps From Setup to Seamless Storage
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary max-w-md">
              Zero native software downloads required. Direct client-side streaming synchronizes raw payloads to your Telegram vault.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Step 1 */}
            <div className="flex flex-col bg-surface border border-border rounded-xl p-5 hover:border-primary-container/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                  01
                </span>
                <Lock className="h-5 w-5 text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Create Account & Auth</h3>
              <p className="text-xs text-text-secondary leading-relaxed flex-1 mb-4">
                Sign up in seconds. Firebase securely manages your workspace identity, folder trees, and tokens.
              </p>
              <div className="bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-[10px] text-text-muted space-y-1">
                <div className="flex justify-between text-tertiary">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-tertiary"></span>auth.init()
                  </span>
                  <span>JWT Verified</span>
                </div>
                <div className="h-1 bg-canvas rounded-full overflow-hidden">
                  <div className="w-full h-full bg-tertiary"></div>
                </div>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex flex-col bg-surface border border-border rounded-xl p-5 hover:border-primary-container/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                  02
                </span>
                <Send className="h-5 w-5 text-[#36AEEA]" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Link Telegram Session</h3>
              <p className="text-xs text-text-secondary leading-relaxed flex-1 mb-4">
                Connect via phone verification or QR code. No passwords shared with third parties; direct MTProto link.
              </p>
              <div className="bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-[10px] text-text-muted space-y-1">
                <div className="flex justify-between text-primary">
                  <span className="flex items-center gap-1">
                    <span className="w-1 h-1 rounded-full bg-primary animate-pulse"></span>MTProto Direct
                  </span>
                  <span>DC 4 (NL)</span>
                </div>
                <div className="text-text-secondary truncate">Saved Messages link OK</div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex flex-col bg-surface border border-border rounded-xl p-5 hover:border-primary-container/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                  03
                </span>
                <Cpu className="h-5 w-5 text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Chunked Streaming</h3>
              <p className="text-xs text-text-secondary leading-relaxed flex-1 mb-4">
                Files are streamed directly into Telegram documents. Message IDs are cataloged into Firestore.
              </p>
              <div className="bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-[10px] text-text-muted space-y-1">
                <div className="flex justify-between text-text-primary">
                  <span>Chunk: 512 KB</span>
                  <span className="text-tertiary">100% Streamed</span>
                </div>
                <div className="h-1 bg-canvas rounded-full overflow-hidden">
                  <div className="w-full h-full bg-primary-container"></div>
                </div>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex flex-col bg-surface border border-border rounded-xl p-5 hover:border-primary-container/40 transition-colors shadow-xs">
              <div className="flex items-center justify-between mb-4">
                <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                  04
                </span>
                <Layers className="h-5 w-5 text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1.5">Drive Organization</h3>
              <p className="text-xs text-text-secondary leading-relaxed flex-1 mb-4">
                Enjoy a desktop-class interface with instant search, subfolders, media previews, and starred access.
              </p>
              <div className="bg-surface-raised border border-border rounded-lg p-2.5 font-mono text-[10px] text-text-muted space-y-1">
                <div className="flex justify-between text-tertiary">
                  <span>Fast Search ⌘K</span>
                  <span>0.04s query</span>
                </div>
                <div className="text-text-secondary truncate">Firestore shadow index</div>
              </div>
            </div>
          </div>
        </div>

        {/* The Two Pillars Comparison Card */}
        <div className="p-8 rounded-2xl bg-surface border border-border space-y-6 shadow-md">
          <div className="text-center max-w-xl mx-auto">
            <h2 className="text-xl sm:text-2xl font-bold text-text-primary">The Two-Pillar Model</h2>
            <p className="text-xs sm:text-sm text-text-secondary mt-1">
              Guaranteed data custody: heavy bytes stay on Telegram, organization stays in Firestore.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 bg-surface-raised rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2.5 text-[#36AEEA] font-semibold text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center border border-border">
                  <Send className="h-4 w-4" />
                </div>
                <span>1. Telegram Saved Messages (Payload Layer)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Holds the actual binary file bytes as encrypted documents sent to your personal chat. You retain
                100% custody of your data within Telegram. Files remain accessible directly in official Telegram apps.
              </p>
              <ul className="text-xs text-text-muted space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Up to 2,000 MB per single file
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Unlimited aggregate personal storage
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Zero server hosting fees for raw bytes
                </li>
              </ul>
            </div>

            <div className="p-6 bg-surface-raised rounded-xl border border-border space-y-3">
              <div className="flex items-center gap-2.5 text-primary font-semibold text-sm">
                <div className="w-8 h-8 rounded-lg bg-brand-subtle flex items-center justify-center border border-border">
                  <Database className="h-4 w-4 text-primary" />
                </div>
                <span>2. Cloud Firestore & Auth (Metadata Layer)</span>
              </div>
              <p className="text-xs text-text-secondary leading-relaxed">
                Stores your folder hierarchy, file metadata, custom tags, and message ID pointers. No binary file
                bytes are ever uploaded to Firebase, keeping response times ultra-fast.
              </p>
              <ul className="text-xs text-text-muted space-y-1.5 pt-2">
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Sub-millisecond directory indexing
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Real-time sync across web sessions
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle className="h-3.5 w-3.5 text-tertiary" /> Strict per-user security rules enforced
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Footer Block */}
        <div className="text-center py-10 bg-surface rounded-2xl border border-border space-y-4 shadow-sm">
          <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
            Ready to experience unlimited cloud drive?
          </h2>
          <p className="text-xs sm:text-sm text-text-secondary max-w-md mx-auto">
            Sign up for free and connect your Telegram account in under a minute.
          </p>
          <div className="pt-2">
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-brand-hover text-text-primary font-semibold text-xs rounded-xl shadow-xs transition-colors"
            >
              <span>Launch One Cloud</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
