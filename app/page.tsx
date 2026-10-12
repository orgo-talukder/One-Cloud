'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cloud,
  ArrowRight,
  HardDrive,
  Folder,
  Search,
  Star,
  Upload,
  Lock,
  ShieldCheck,
  CheckCircle,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  PlayCircle,
  Keyboard,
  Bookmark,
  MoreVertical,
  HelpCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/firebase/auth-context';

export default function LandingPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const faqs = [
    {
      q: 'Where are my actual files stored?',
      a: 'Your files are stored directly inside your personal Telegram account under your Saved Messages channel via official Telegram MTProto protocols. One Cloud does not operate any centralized storage servers or rent storage hard drives.',
    },
    {
      q: 'Is there a limit on file size?',
      a: 'Single file upload limits are determined by Telegram: standard Telegram accounts support files up to 2 GB each, while Telegram Premium users can upload files up to 4 GB each. There is no artificial restriction added by One Cloud.',
    },
    {
      q: 'What happens to my files if I stop using One Cloud?',
      a: 'All your files remain permanently preserved in your personal Telegram Saved Messages. You can download and access them at any time directly through the official Telegram mobile or desktop applications.',
    },
    {
      q: 'Can One Cloud staff or other users see my files?',
      a: 'No. File contents are transferred directly between your browser and Telegram. Your session credentials stay securely tied to your authenticated Firebase session and Telegram authentication token.',
    },
    {
      q: 'How does folder organization and search work?',
      a: 'We use Google Cloud Firestore to maintain a virtual hierarchical file system (folders, subfolders, custom tags, starred bookmarks, and instant search index). This provides instant navigation while keeping the underlying files safely housed in Telegram.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary antialiased selection:bg-brand-subtle selection:text-primary">
      <Navbar />

      <main className="w-full pt-16 bg-canvas">
        <div className="flex flex-col w-full">
          {/* Hero Section */}
          <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-16 pb-20 md:pt-20 md:pb-28">
            {/* Subtle glow backdrop */}
            <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-primary-container/10 blur-[130px] rounded-full" />

            <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
              {/* Trust Badge Chip */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-subtle text-primary border border-primary/20 shadow-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                <span className="text-xs font-medium tracking-wide">
                  Telegram-Powered Personal Cloud • MTProto Encrypted
                </span>
              </div>

              {/* Main Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[46px] font-bold text-text-primary tracking-tight max-w-4xl leading-tight sm:leading-tight">
                Your Telegram, Transformed Into a Premium Personal Cloud Drive.
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-text-secondary max-w-2xl mt-5 leading-relaxed">
                One Cloud delivers a clean, high-performance file management workspace. Store,
                organize, and preview files seamlessly using Telegram&apos;s infrastructure and Firestore
                metadata.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
                {user ? (
                  <Link
                    href="/app"
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-colors shadow-md active:scale-[0.99]"
                  >
                    <HardDrive className="w-4 h-4" />
                    <span>Open Your Drive</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signup"
                      className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-colors shadow-md active:scale-[0.99]"
                    >
                      <span>Get Started</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <Link
                      href="/how-it-works"
                      className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-medium bg-surface text-text-primary border border-border hover:bg-surface-hover transition-colors shadow-xs active:scale-[0.99]"
                    >
                      <PlayCircle className="w-4 h-4 text-text-secondary" />
                      <span>See How It Works</span>
                    </Link>
                  </>
                )}
              </div>

              {/* Interactive Desktop Drive Mockup (1080px Container) */}
              <div className="w-full max-w-[1080px] mt-14 rounded-xl bg-surface border border-border shadow-2xl overflow-hidden text-left relative">
                {/* Mockup Window Bar */}
                <div className="h-12 bg-surface-raised px-4 flex items-center justify-between border-b border-border">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full bg-danger/80" />
                    <span className="w-3 h-3 rounded-full bg-warning/80" />
                    <span className="w-3 h-3 rounded-full bg-tertiary/80" />
                    <span className="ml-4 text-xs text-text-muted hidden sm:inline-block font-mono">
                      workspace.onecloud.io/drive
                    </span>
                  </div>
                  {/* Live status badge */}
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-surface-hover text-tertiary text-xs border border-border/50">
                    <span className="w-2 h-2 rounded-full bg-tertiary animate-ping" />
                    <span>Synced with Telegram</span>
                  </div>
                </div>

                {/* Mockup Workspace Body */}
                <div className="grid grid-cols-12 min-h-[460px]">
                  {/* Mock Sidebar */}
                  <div className="hidden md:flex md:col-span-3 bg-sidebar p-4 flex-col justify-between border-r border-border">
                    <div className="flex flex-col gap-5">
                      <div className="flex items-center gap-2 px-2.5 py-2 rounded-lg bg-surface-hover text-text-primary text-xs font-semibold">
                        <Folder className="w-4 h-4 text-primary" />
                        <span>All Drive Files</span>
                      </div>
                      <div className="flex flex-col gap-1 px-1 text-xs">
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                          <span className="flex items-center gap-2">
                            <Star className="w-3.5 h-3.5 text-warning" /> Starred
                          </span>
                          <span className="text-[11px] text-text-muted">14</span>
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                          <span className="flex items-center gap-2">
                            <Clock className="w-3.5 h-3.5" /> Recent
                          </span>
                        </div>
                        <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg text-text-secondary hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer">
                          <span className="flex items-center gap-2">
                            <Cloud className="w-3.5 h-3.5" /> Telegram Saved
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Storage progress indicator */}
                    <div className="bg-surface-raised p-3 rounded-xl flex flex-col gap-2 border border-border">
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-text-secondary">Telegram Vault</span>
                        <span className="text-primary font-semibold">42.8 GB</span>
                      </div>
                      <div className="w-full bg-canvas h-1.5 rounded-full overflow-hidden">
                        <div className="bg-primary-container h-full w-[44%] rounded-full" />
                      </div>
                      <span className="text-[10px] text-text-muted">
                        Saved in Telegram Saved Messages
                      </span>
                    </div>
                  </div>

                  {/* Mock File Canvas Area */}
                  <div className="col-span-12 md:col-span-9 bg-canvas p-4 sm:p-6 flex flex-col gap-6">
                    {/* Mock Header Bar with Search */}
                    <div className="flex items-center justify-between gap-4">
                      <div className="flex-1 max-w-md bg-surface border border-border rounded-lg px-3 py-2 flex items-center gap-2.5 text-text-muted">
                        <Search className="w-4 h-4 text-text-muted" />
                        <span className="text-xs text-text-muted">
                          Search files, archives, media...
                        </span>
                        <kbd className="ml-auto px-1.5 py-0.5 text-[10px] bg-canvas text-text-secondary rounded border border-border font-mono">
                          ⌘K
                        </kbd>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="px-3 py-2 rounded-lg bg-primary-container text-text-primary text-xs font-semibold flex items-center gap-1.5 shadow-xs">
                          <Upload className="w-3.5 h-3.5" />
                          <span className="hidden sm:inline">Upload</span>
                        </div>
                      </div>
                    </div>

                    {/* Folder tiles */}
                    <div>
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider">
                        Folders
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-2.5">
                        <div className="h-16 bg-surface hover:bg-surface-hover border border-border transition-colors rounded-lg px-3.5 flex items-center gap-3 cursor-pointer shadow-xs">
                          <Folder className="w-5 h-5 text-primary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text-primary truncate">
                              Product Design
                            </span>
                            <span className="text-[10px] text-text-muted">128 items • 1.4 GB</span>
                          </div>
                        </div>
                        <div className="h-16 bg-surface hover:bg-surface-hover border border-border transition-colors rounded-lg px-3.5 flex items-center gap-3 cursor-pointer shadow-xs">
                          <Folder className="w-5 h-5 text-tertiary shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text-primary truncate">
                              Legal & Contracts
                            </span>
                            <span className="text-[10px] text-text-muted">34 items • 82 MB</span>
                          </div>
                        </div>
                        <div className="h-16 bg-surface hover:bg-surface-hover border border-border transition-colors rounded-lg px-3.5 hidden sm:flex items-center gap-3 cursor-pointer shadow-xs">
                          <Folder className="w-5 h-5 text-file-audio shrink-0" />
                          <div className="flex flex-col min-w-0">
                            <span className="text-xs font-semibold text-text-primary truncate">
                              Master Audio Takes
                            </span>
                            <span className="text-[10px] text-text-muted">19 items • 8.9 GB</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Standard 56px File Rows Table */}
                    <div className="flex flex-col">
                      <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mb-2">
                        Files
                      </span>
                      <div className="flex flex-col rounded-lg overflow-hidden bg-surface border border-border">
                        {/* Header Labels */}
                        <div className="h-9 px-4 bg-surface-raised flex items-center text-text-muted text-[11px] font-semibold uppercase tracking-wider border-b border-border">
                          <span className="w-8" />
                          <span className="flex-1">Name</span>
                          <span className="w-28 hidden sm:inline-block">Date Modified</span>
                          <span className="w-20 text-right">Size</span>
                          <span className="w-10" />
                        </div>

                        {/* Row 1: PDF */}
                        <div className="h-14 px-4 flex items-center justify-between hover:bg-surface-hover transition-colors group cursor-pointer border-b border-border/50">
                          <div className="w-8 flex items-center text-file-document">
                            <FileText className="w-5 h-5 text-file-document" />
                          </div>
                          <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                            <span className="text-xs sm:text-sm font-medium text-text-primary truncate">
                              Q3_Security_Audit_Report.pdf
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-subtle text-file-document font-medium hidden md:inline">
                              PDF
                            </span>
                          </div>
                          <span className="w-28 text-xs text-text-secondary hidden sm:inline-block">
                            Today, 14:20
                          </span>
                          <span className="w-20 text-xs text-text-secondary text-right">4.2 MB</span>
                          <div className="w-10 flex items-center justify-end text-text-muted group-hover:text-text-primary">
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Row 2: MP4 */}
                        <div className="h-14 px-4 flex items-center justify-between bg-brand-subtle transition-colors group cursor-pointer border-b border-border/50">
                          <div className="w-8 flex items-center text-file-video">
                            <VideoIcon className="w-5 h-5 text-file-video" />
                          </div>
                          <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                            <span className="text-xs sm:text-sm font-medium text-text-primary truncate">
                              Mobile_Release_V2_Demo.mp4
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-surface text-file-video font-medium hidden md:inline">
                              MP4
                            </span>
                          </div>
                          <span className="w-28 text-xs text-text-secondary hidden sm:inline-block">
                            Yesterday
                          </span>
                          <span className="w-20 text-xs text-text-secondary text-right">
                            184.6 MB
                          </span>
                          <div className="w-10 flex items-center justify-end text-text-primary">
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </div>

                        {/* Row 3: SVG */}
                        <div className="h-14 px-4 flex items-center justify-between hover:bg-surface-hover transition-colors group cursor-pointer">
                          <div className="w-8 flex items-center text-file-image">
                            <ImageIcon className="w-5 h-5 text-file-image" />
                          </div>
                          <div className="flex-1 flex items-center gap-2 min-w-0 pr-4">
                            <span className="text-xs sm:text-sm font-medium text-text-primary truncate">
                              System_Iconography_Master.svg
                            </span>
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-brand-subtle text-file-image font-medium hidden md:inline">
                              SVG
                            </span>
                          </div>
                          <span className="w-28 text-xs text-text-secondary hidden sm:inline-block">
                            Aug 24
                          </span>
                          <span className="w-20 text-xs text-text-secondary text-right">
                            920 KB
                          </span>
                          <div className="w-10 flex items-center justify-end text-text-muted group-hover:text-text-primary">
                            <MoreVertical className="w-4 h-4" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Value Pillars / Features Grid Section */}
          <section className="w-full bg-sidebar py-20 px-6 lg:px-12 border-y border-border">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div>
                  <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                    Engineered For Fluidity
                  </span>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2 tracking-tight">
                    The power of Telegram. The precision of Linear.
                  </h2>
                </div>
                <p className="text-sm text-text-secondary max-w-md">
                  A high-density workspace crafted for technical users who demand fast directory
                  structures, instant search, and zero bloat.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Feature Card 1 */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between hover:bg-surface-hover transition-colors shadow-xs group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary transition-colors">
                      <Folder className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      Effortless File Organization
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Virtual folders, nested directory paths, instant sorting, and multi-select
                      batch actions designed for pure keyboard-first velocity.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-text-muted text-xs">
                    <CheckCircle className="w-4 h-4 text-tertiary" />
                    <span>Nested path support</span>
                  </div>
                </div>

                {/* Feature Card 2 */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between hover:bg-surface-hover transition-colors shadow-xs group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-primary transition-colors">
                      <Search className="w-5 h-5 text-primary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      Fast Global Search & Filters
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Real-time instant search by filename, extension, or category with instant
                      keyboard shortcut (⌘K) and blazing Firestore response times.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-text-muted text-xs">
                    <Keyboard className="w-4 h-4 text-primary" />
                    <span>Instant ⌘K launcher</span>
                  </div>
                </div>

                {/* Feature Card 3 */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between hover:bg-surface-hover transition-colors shadow-xs group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-warning transition-colors">
                      <Star className="w-5 h-5 text-warning" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      Starred & Priority Access
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Star vital documents, key videos, and assets for instant one-click retrieval
                      without having to navigate through deep directories.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-text-muted text-xs">
                    <Bookmark className="w-4 h-4 text-warning" />
                    <span>Quick-drawer retrieval</span>
                  </div>
                </div>

                {/* Feature Card 4 */}
                <div className="bg-surface border border-border rounded-xl p-6 flex flex-col justify-between hover:bg-surface-hover transition-colors shadow-xs group">
                  <div className="flex flex-col gap-4">
                    <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-tertiary transition-colors">
                      <Lock className="w-5 h-5 text-tertiary" />
                    </div>
                    <h3 className="text-base font-semibold text-text-primary">
                      Telegram-Backed Reliability
                    </h3>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      File bytes stored directly in your private Telegram Saved Messages channel
                      with zero third-party data lock-in or surprise billings.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-border/50 flex items-center gap-2 text-text-muted text-xs">
                    <ShieldCheck className="w-4 h-4 text-tertiary" />
                    <span>Direct Saved Messages sync</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Telegram-Powered Storage Deep Dive Section */}
          <section className="w-full bg-canvas py-24 px-6 lg:px-12">
            <div className="max-w-7xl mx-auto flex flex-col gap-12">
              <div>
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Decoupled Architecture
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2 tracking-tight">
                  How One Cloud redefines personal cloud infrastructure
                </h2>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                {/* Visual architectural split card: Left Side Explanation */}
                <div className="lg:col-span-7 bg-surface border border-border rounded-xl p-8 sm:p-10 flex flex-col justify-between shadow-xs">
                  <div className="flex flex-col gap-6">
                    <div className="flex items-center gap-3">
                      <span className="px-2.5 py-1 rounded bg-brand-subtle text-primary text-xs font-semibold">
                        Dual-Tier Pipeline
                      </span>
                      <span className="text-text-muted text-xs">Zero File Byte Renting</span>
                    </div>

                    <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                      Separating high-speed directory metadata from secure encrypted payload
                      storage.
                    </h3>

                    <p className="text-sm text-text-secondary leading-relaxed">
                      Traditional cloud providers charge heavy markups for simple storage and force
                      closed ecosystems. One Cloud utilizes an intelligent hybrid architecture: your
                      folder trees, stars, tags, and searchable indexes are managed in
                      lightning-fast Google Cloud Firestore, while the encrypted binary data stays
                      safely inside your personal Telegram account via MTProto.
                    </p>

                    {/* Architecture Diagram Illustration */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-2">
                      <div className="bg-surface-raised border border-border/60 p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
                          <Dataset className="w-4 h-4" />
                          <span>1. Metadata Tier</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Instant folder lookups, sub-second search querying, and quick tags indexed
                          directly via Cloud Firestore.
                        </p>
                      </div>

                      <div className="bg-surface-raised border border-border/60 p-4 rounded-xl flex flex-col gap-2">
                        <div className="flex items-center gap-2 text-tertiary font-semibold text-sm">
                          <Lock className="w-4 h-4" />
                          <span>2. Payload Vault</span>
                        </div>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Chunked binary transfers stored directly in your private Telegram Saved
                          Messages via official MTProto protocols.
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 pt-6 border-t border-border/60 flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="text-tertiary w-4 h-4" />
                      <span className="text-xs text-text-secondary">
                        Storage strictly respects Telegram platform limits
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">No bogus &quot;infinite storage&quot; claims</span>
                  </div>
                </div>

                {/* Right Side: Technical Specs & Metrics Card */}
                <div className="lg:col-span-5 bg-sidebar border border-border rounded-xl p-8 sm:p-10 flex flex-col justify-between shadow-xs">
                  <div className="flex flex-col gap-6">
                    <h4 className="text-base font-semibold text-text-primary">
                      Operational Parameters
                    </h4>
                    <div className="flex flex-col gap-5">
                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shrink-0">
                          <Cloud className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            Direct MTProto Transfer
                          </span>
                          <span className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                            Files stream straight from Telegram nodes directly to your browser
                            viewport with zero intermediary storage proxying.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shrink-0">
                          <HardDrive className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            Tracked Storage Usage
                          </span>
                          <span className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                            Real-time bytes monitoring so you always know your exact footprint in
                            your Telegram chat channel.
                          </span>
                        </div>
                      </div>

                      <div className="flex items-start gap-4">
                        <div className="w-8 h-8 rounded-lg bg-surface border border-border flex items-center justify-center text-primary shrink-0">
                          <Lock className="w-4 h-4 text-primary" />
                        </div>
                        <div className="flex flex-col">
                          <span className="text-xs font-semibold text-text-primary">
                            Telegram Native File Capacities
                          </span>
                          <span className="text-xs text-text-secondary mt-0.5 leading-relaxed">
                            Upload files up to standard Telegram allowances (up to 2GB per file, or
                            4GB for Telegram Premium subscribers).
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-8 bg-surface border border-border p-4 rounded-xl flex items-center justify-between">
                    <span className="text-xs text-text-secondary">Platform Status</span>
                    <span className="text-xs text-tertiary flex items-center gap-1.5 font-medium">
                      <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                      100% Operational
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Security & Privacy Overview Section */}
          <section className="w-full bg-sidebar py-20 px-6 lg:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto">
              <div className="bg-surface border border-border rounded-xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs relative overflow-hidden">
                <div className="absolute -right-24 -bottom-24 w-80 h-80 rounded-full bg-brand-subtle/40 pointer-events-none blur-3xl" />
                <div className="flex flex-col gap-4 max-w-2xl relative z-10">
                  <div className="inline-flex items-center gap-2 px-2.5 py-1 rounded bg-surface-raised text-tertiary text-xs font-semibold w-max border border-border/50">
                    <ShieldCheck className="w-4 h-4 text-tertiary" />
                    <span>Zero Data Monopolization</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Your files remain yours in Telegram. Always.
                  </h2>
                  <p className="text-sm text-text-secondary leading-relaxed">
                    One Cloud is strictly a presentation and organization layer. We never monetize
                    personal data, insert intrusive trackers, or retain proprietary decryption keys
                    over your documents. If you ever stop using One Cloud, every file remains intact
                    inside your private Telegram Saved Messages channel.
                  </p>
                </div>
                <div className="flex flex-col gap-4 shrink-0 relative z-10">
                  <Link
                    href="/security"
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-semibold bg-surface-raised text-text-primary hover:bg-surface-hover border border-border transition-colors shadow-xs"
                  >
                    <span>Learn more in our Security architecture</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          </section>

          {/* Frequently Asked Questions (FAQ) */}
          <section className="w-full bg-canvas py-20 px-6 lg:px-12">
            <div className="max-w-3xl mx-auto flex flex-col gap-8">
              <div className="text-center">
                <span className="text-xs font-semibold text-primary uppercase tracking-wider">
                  Transparent Answers
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary mt-2 tracking-tight">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-2">
                  Clear, honest information about how One Cloud handles your storage and data.
                </p>
              </div>

              <div className="flex flex-col gap-3">
                {faqs.map((faq, index) => {
                  const isOpen = openFaq === index;
                  return (
                    <div
                      key={index}
                      className="bg-surface border border-border rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        onClick={() => toggleFaq(index)}
                        className="w-full p-4 sm:p-5 flex items-center justify-between text-left gap-4 cursor-pointer hover:bg-surface-hover transition-colors"
                      >
                        <span className="text-sm font-semibold text-text-primary">
                          {faq.q}
                        </span>
                        <ChevronDown
                          className={`w-4 h-4 text-text-muted transition-transform shrink-0 ${
                            isOpen ? 'rotate-180 text-primary' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-4 pb-5 sm:px-5 sm:pb-5 pt-0 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Final Call-to-Action Banner */}
          <section className="w-full bg-sidebar py-24 px-6 lg:px-12 border-t border-border">
            <div className="max-w-4xl mx-auto">
              <div className="bg-surface-raised border border-border rounded-2xl p-10 sm:p-14 flex flex-col items-center text-center gap-6 shadow-2xl relative overflow-hidden">
                <div className="absolute -top-32 left-1/2 -translate-x-1/2 w-96 h-96 bg-primary-container/15 rounded-full blur-[100px] pointer-events-none" />

                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary shadow-xs relative z-10">
                  <Cloud className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary max-w-xl relative z-10 tracking-tight">
                  Start organizing your cloud files today.
                </h2>

                <p className="text-sm text-text-secondary max-w-md relative z-10">
                  Connect your Telegram account in under two minutes and enjoy an organized,
                  searchable workspace.
                </p>

                <div className="flex flex-wrap items-center justify-center gap-4 mt-2 relative z-10">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center px-6 h-11 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-colors shadow-md"
                  >
                    Create Free Account
                  </Link>
                  <Link
                    href="/login"
                    className="inline-flex items-center justify-center px-6 h-11 rounded-lg text-xs font-medium bg-surface text-text-primary border border-border hover:bg-surface-hover transition-colors shadow-xs"
                  >
                    Sign In
                  </Link>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Custom Dataset icon component for clean outline styling
function Dataset(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}
// Helper Clock icon alias
function Clock(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}
