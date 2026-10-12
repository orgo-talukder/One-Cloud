'use client';

import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  ArrowRight,
  Shield,
  CheckCircle,
  Folder,
  Star,
  Search,
  Trash2,
  Zap,
  Eye,
  Send,
  Database,
  Laptop,
  CheckCircle2,
  FolderPlus,
  Rocket,
  Lock,
} from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md antialiased selection:bg-brand-subtle selection:text-primary-fixed flex flex-col transition-colors">
      <Navbar />

      <main className="w-full pt-16 bg-canvas flex-1">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="relative w-full overflow-hidden py-16 lg:py-24">
            <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-[720px] h-[360px] bg-primary-container/10 blur-[130px] rounded-full pointer-events-none" />
            <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-10 flex flex-col items-center text-center">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border shadow-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                  HOW ONE CLOUD WORKS
                </span>
              </div>

              {/* Title & Subtitle */}
              <h1 className="text-3xl sm:text-4xl lg:text-[44px] lg:leading-[52px] font-bold max-w-4xl text-text-primary tracking-tight">
                A Modern Cloud Drive, Built On Your Telegram Infrastructure.
              </h1>
              <p className="mt-5 max-w-2xl text-base sm:text-lg text-text-secondary leading-relaxed">
                Learn how One Cloud bridges the familiarity of a desktop cloud drive with the security,
                speed, and reliability of Telegram Saved Messages.
              </p>

              {/* Action Buttons */}
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary font-medium text-sm transition-all shadow-md gap-2"
                >
                  <span>Get Started Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  href="/security"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-sm font-medium transition-colors"
                >
                  <span>View Security Specs</span>
                </Link>
              </div>

              {/* Metric Strips */}
              <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl pt-6 border-t border-border/60">
                <div className="flex flex-col items-center p-3 rounded-lg bg-surface/50 border border-border/50">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">2 GB</span>
                  <span className="text-xs text-text-muted mt-0.5">Per-file Bot Ceiling</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-surface/50 border border-border/50">
                  <span className="text-2xl font-bold text-tertiary tracking-tight">0%</span>
                  <span className="text-xs text-text-muted mt-0.5">Compression Applied</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-surface/50 border border-border/50">
                  <span className="text-2xl font-bold text-primary tracking-tight">MTProto</span>
                  <span className="text-xs text-text-muted mt-0.5">Direct Telegram Protocol</span>
                </div>
                <div className="flex flex-col items-center p-3 rounded-lg bg-surface/50 border border-border/50">
                  <span className="text-2xl font-bold text-text-primary tracking-tight">&lt;80ms</span>
                  <span className="text-xs text-text-muted mt-0.5">Firestore Index Query</span>
                </div>
              </div>
            </div>
          </section>

          {/* Pipeline Architecture (4 Steps) */}
          <section className="w-full py-16 bg-sidebar/60 border-y border-border">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
                <div>
                  <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                    PIPELINE ARCHITECTURE
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                    Four Steps From Setup to Seamless Storage
                  </h2>
                </div>
                <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                  Zero software downloads required. Direct client-side streaming synchronizes raw
                  payloads to your Telegram instance.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Step 1 */}
                <div className="flex flex-col bg-surface border border-border rounded-xl p-6 relative group hover:border-border-strong transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                      01
                    </span>
                    <Lock className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Create Account &amp; Authenticate
                  </h3>
                  <p className="text-xs text-text-secondary mb-6 flex-grow leading-relaxed">
                    Sign up with email or Telegram in seconds. Firebase securely manages your profile
                    and session tokens.
                  </p>
                  <div className="w-full bg-surface-raised border border-border rounded-lg p-3 flex flex-col gap-2 font-mono text-[11px] text-text-muted">
                    <div className="flex items-center justify-between text-tertiary">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />auth.init()
                      </span>
                      <span className="text-text-muted text-[10px]">JWT 256-bit</span>
                    </div>
                    <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
                      <div className="w-full h-full bg-tertiary" />
                    </div>
                    <div className="flex items-center justify-between text-text-secondary text-[10px]">
                      <span>Identity Verified</span>
                      <span>firebase_uid#8924</span>
                    </div>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex flex-col bg-surface border border-border rounded-xl p-6 relative group hover:border-border-strong transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                      02
                    </span>
                    <Send className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Link Your Telegram
                  </h3>
                  <p className="text-xs text-text-secondary mb-6 flex-grow leading-relaxed">
                    Connect your Telegram account via secure MTProto session string. No passwords shared,
                    direct bot channel setup.
                  </p>
                  <div className="w-full bg-surface-raised border border-border rounded-lg p-3 flex flex-col gap-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-primary">
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse" />MTProto Handshake
                      </span>
                      <span className="text-text-muted text-[10px]">DC 4 (NL)</span>
                    </div>
                    <div className="bg-canvas px-2 py-1 rounded text-text-secondary truncate text-[10px]">
                      1BVtsOGwBux...saved_msgs
                    </div>
                    <div className="flex items-center justify-between text-tertiary text-[10px]">
                      <span>Handshake OK</span>
                      <span>Bot Hook Ready</span>
                    </div>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex flex-col bg-surface border border-border rounded-xl p-6 relative group hover:border-border-strong transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                      03
                    </span>
                    <Zap className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Upload &amp; Organize via Drive UI
                  </h3>
                  <p className="text-xs text-text-secondary mb-6 flex-grow leading-relaxed">
                    Drag and drop documents, photos, and video. Files chunk and stream directly to
                    Telegram Saved Messages while Firestore tracks structure.
                  </p>
                  <div className="w-full bg-surface-raised border border-border rounded-lg p-3 flex flex-col gap-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between">
                      <span className="text-text-primary text-[10px] truncate max-w-[120px]">
                        annual_report.pdf
                      </span>
                      <span className="text-primary text-[10px]">68% (32MB/s)</span>
                    </div>
                    <div className="h-1.5 bg-canvas rounded-full overflow-hidden">
                      <div className="w-[68%] h-full bg-primary-container" />
                    </div>
                    <div className="flex items-center justify-between text-text-muted text-[10px]">
                      <span>Chunk 4 of 6</span>
                      <span>Saved Messages</span>
                    </div>
                  </div>
                </div>

                {/* Step 4 */}
                <div className="flex flex-col bg-surface border border-border rounded-xl p-6 relative group hover:border-border-strong transition-all">
                  <div className="flex items-center justify-between mb-5">
                    <span className="w-8 h-8 rounded-lg bg-brand-subtle text-primary font-bold text-sm flex items-center justify-center">
                      04
                    </span>
                    <Eye className="w-5 h-5 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Browse, Search, Preview &amp; Restore
                  </h3>
                  <p className="text-xs text-text-secondary mb-6 flex-grow leading-relaxed">
                    Access your files anywhere via One Cloud&apos;s responsive interface. Instant previews
                    for PDFs, images, and audio with zero compression.
                  </p>
                  <div className="w-full bg-surface-raised border border-border rounded-lg p-3 flex flex-col gap-2 font-mono text-[11px]">
                    <div className="flex items-center justify-between text-text-primary">
                      <span className="flex items-center gap-1.5">
                        <Eye className="w-3.5 h-3.5 text-file-image" /> render_preview()
                      </span>
                      <span className="text-tertiary text-[10px]">Instant 200 OK</span>
                    </div>
                    <div className="flex items-center gap-2 pt-1">
                      <span className="px-1.5 py-0.5 rounded bg-brand-subtle text-primary text-[9px] uppercase tracking-wider font-semibold">
                        Raw Byte Stream
                      </span>
                      <span className="px-1.5 py-0.5 rounded bg-surface border border-border text-text-secondary text-[9px]">
                        Decrypted
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* System Topology (3 Nodes Architecture) */}
          <section className="w-full py-20 bg-canvas">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="text-center max-w-3xl mx-auto mb-16">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  SYSTEM TOPOLOGY
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                  Tearing Down the Architecture
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed">
                  Metadata stays lightning-fast and searchable in sub-millisecond indices; binary file
                  payloads remain private in your Telegram storage.
                </p>
              </div>

              <div className="bg-surface rounded-xl border border-border p-6 md:p-10 shadow-xl relative overflow-hidden">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch relative">
                  {/* Node A */}
                  <div className="flex flex-col bg-surface-raised border border-border rounded-xl p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-primary">
                        <Laptop className="w-5 h-5" />
                      </div>
                      <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-canvas border border-border">
                        Client Node A
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-text-primary">One Cloud Web UI</h4>
                    <p className="text-xs text-text-secondary mt-2 mb-6 leading-relaxed">
                      React single-page dashboard. Handles instant ⌘K navigation, file virtualization,
                      and multi-file drag-drop queueing.
                    </p>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">⌘K Global Filter</span>
                        <span className="text-primary font-semibold">Client Memory</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">Chunk Dispatcher</span>
                        <span className="text-tertiary font-semibold">Worker Thread</span>
                      </div>
                    </div>
                  </div>

                  {/* Node B */}
                  <div className="flex flex-col bg-surface-raised border border-border rounded-xl p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-surface flex items-center justify-center text-warning border border-border/60">
                        <Database className="w-5 h-5 text-warning" />
                      </div>
                      <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-canvas border border-border">
                        Metadata Node B
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-text-primary">
                      Firestore Metadata Engine
                    </h4>
                    <p className="text-xs text-text-secondary mt-2 mb-6 leading-relaxed">
                      Blazing fast indexed storage for file names, virtual directory paths, starred
                      markers, timestamps, and message IDs.
                    </p>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">Tree Index Cache</span>
                        <span className="text-tertiary font-semibold">&lt; 80ms Latency</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">Telegram Pointers</span>
                        <span className="text-text-muted font-mono">msg_id + part_ids</span>
                      </div>
                    </div>
                  </div>

                  {/* Node C */}
                  <div className="flex flex-col bg-surface-raised border border-border rounded-xl p-6 relative">
                    <div className="flex items-center justify-between mb-4">
                      <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-primary-container">
                        <Send className="w-5 h-5 text-primary-container" />
                      </div>
                      <span className="text-xs text-text-muted px-2 py-0.5 rounded bg-canvas border border-border">
                        Storage Node C
                      </span>
                    </div>
                    <h4 className="text-base font-semibold text-text-primary">
                      Telegram Cloud Storage
                    </h4>
                    <p className="text-xs text-text-secondary mt-2 mb-6 leading-relaxed">
                      Encrypted MTProto object stores. Files are vaulted in your account&apos;s private
                      &quot;Saved Messages&quot; channel.
                    </p>
                    <div className="space-y-2 mt-auto">
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">Payload Transport</span>
                        <span className="text-primary font-semibold">MTProto Direct</span>
                      </div>
                      <div className="flex items-center justify-between p-2 rounded bg-canvas border border-border/60 text-xs">
                        <span className="text-text-secondary font-mono">Storage Integrity</span>
                        <span className="text-tertiary font-semibold">100% User Custody</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 p-4 rounded-lg bg-sidebar border border-border flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <span className="w-2.5 h-2.5 rounded-full bg-tertiary shrink-0" />
                    <span className="text-xs sm:text-sm text-text-primary">
                      <span className="font-semibold text-text-primary">
                        Zero Knowledge Payload Separation:
                      </span>{' '}
                      One Cloud never hosts or inspects your binary file content.
                    </span>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-xs text-primary px-3 py-1 rounded bg-brand-subtle border border-border shrink-0 font-medium">
                    <Shield className="w-4 h-4 text-primary" />
                    End-to-End Channel Isolation
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Capabilities & Precision Grid (6 Cards) */}
          <section className="w-full py-16 bg-sidebar/40 border-t border-border">
            <div className="max-w-7xl mx-auto px-6 lg:px-12">
              <div className="mb-12">
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  CAPABILITIES &amp; PRECISION
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-1">
                  Complete File Management Power
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 max-w-2xl">
                  Everything expected from enterprise cloud file managers, optimized for extreme speed
                  and keyboard-first workflows.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary mb-4">
                    <Folder className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Virtual Folder Trees</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Telegram lacks deep directories, but One Cloud provides full nesting, breadcrumb
                    navigation, and tree views via fast indexing.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-warning mb-4">
                    <Star className="w-5 h-5 text-warning" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Instant Starred Files</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Mark critical documents and folders with single-click starring. Instant aggregation
                    for lightning-fast retrieval across all folders.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary mb-4">
                    <Search className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Real-Time File Search</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Full regex, prefix matching, and extension sorting using desktop shortcut ⌘K. Filter
                    by document type in real time.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-danger mb-4">
                    <Trash2 className="w-5 h-5 text-danger" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Trash &amp; Safe Restore</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Accidental deletions are held in a 30-day reversible safety bin. Restore nested files
                    with their full hierarchy intact.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-tertiary mb-4">
                    <Zap className="w-5 h-5 text-tertiary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">
                    Direct MTProto Streaming
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Bypass intermediate proxy servers. Payloads stream in parallel encrypted chunks
                    directly between client and Telegram servers.
                  </p>
                </div>

                <div className="p-6 rounded-xl bg-surface border border-border flex flex-col hover:border-border-strong transition-all">
                  <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary mb-4">
                    <Eye className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-text-primary mb-2">Zero-Transcode Previews</h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    In-browser visualizers for PNG, SVG, PDF, MP4, MP3, and source code files with
                    complete syntax highlighting.
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* Transparent Storage & Telegram Guidelines Card */}
          <section className="w-full py-16 bg-canvas">
            <div className="max-w-5xl mx-auto px-6 lg:px-12">
              <div className="p-8 md:p-10 rounded-2xl bg-surface border border-border relative overflow-hidden shadow-sm">
                <div className="flex items-start gap-4">
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 border border-tertiary/20 flex-shrink-0 flex items-center justify-center text-tertiary">
                    <CheckCircle2 className="w-6 h-6 text-tertiary" />
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold text-text-primary">
                      Transparent Storage &amp; Telegram Guidelines
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                      One Cloud does not make disingenuous &quot;infinite storage&quot; claims. We respect
                      Telegram&apos;s API guidelines and operational policies:
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6">
                      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-raised border border-border/80">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            2 GB Bot File Limit
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            Strict adherence to standard Telegram MTProto limits for individual files.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-raised border border-border/80">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            No Arbitrary Paywalls
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            No artificial tiering for your own personal drive capacity.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-raised border border-border/80">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            Full Self-Custody
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            Files stay inside your personal Telegram account if you disconnect One Cloud.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-3 p-3.5 rounded-lg bg-surface-raised border border-border/80">
                        <CheckCircle className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            Responsible Concurrency
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 leading-relaxed">
                            Integrated rate-limit buffers protect your account from API abuse blocks.
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Final Call to Action */}
          <section className="w-full py-16 bg-sidebar border-t border-border">
            <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center flex flex-col items-center">
              <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-primary mb-6 border border-border/60">
                <FolderPlus className="w-6 h-6 text-primary" />
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Ready to take control of your cloud files?
              </h2>
              <p className="mt-3 text-sm text-text-secondary max-w-xl leading-relaxed">
                Deploy your personal vault in under 60 seconds with no credit card required.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center h-11 px-7 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary font-medium text-sm transition-all shadow-md gap-2"
                >
                  <span>Get Started Now</span>
                  <Rocket className="w-4 h-4" />
                </Link>
                <Link
                  href="/security"
                  className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-sm font-medium transition-colors"
                >
                  <span>View Security Details</span>
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
