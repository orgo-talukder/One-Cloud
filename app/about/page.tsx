'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Cloud,
  ShieldCheck,
  HardDrive,
  ArrowRight,
  Database,
  Lock,
  FolderTree,
  UploadCloud,
  Eye,
  Search,
  Star,
  Trash2,
  Terminal,
  Zap,
  ExternalLink,
  ChevronDown,
  Layers,
  Server,
  FileText,
  Key,
  Users,
  Compass,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Sparkles,
  Smartphone,
  Cpu,
  Mail,
  Send,
} from 'lucide-react';

export default function AboutPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const coreFeatures = [
    {
      icon: <FolderTree className="w-5 h-5 text-primary" />,
      title: 'Hierarchical Folder Architecture',
      description:
        'Create nested directories with dynamic breadcrumb navigation. Organize thousands of files into clean workspaces instead of sorting through a chronological chat feed.',
    },
    {
      icon: <UploadCloud className="w-5 h-5 text-[#36AEEA]" />,
      title: 'Multi-Modal Upload Drawer',
      description:
        'Drag and drop files up to 2 GB per file. Monitor upload progress, active chunks, transfer velocities, and pause or cancel operations with immediate feedback.',
    },
    {
      icon: <Eye className="w-5 h-5 text-tertiary" />,
      title: 'Universal In-Browser Previews',
      description:
        'Inspect images with lossless zoom, stream high-bitrate video, listen to audio files, read PDFs, and view code files directly inside a distraction-free lightbox viewer.',
    },
    {
      icon: <Search className="w-5 h-5 text-warning" />,
      title: 'Sub-80ms Metadata Search',
      description:
        'Instantly locate files across your entire drive tree using indexed Firestore queries with keyboard-first shortcuts (⌘K / Ctrl+K) and real-time auto-suggestions.',
    },
    {
      icon: <Star className="w-5 h-5 text-[#F2B84B]" />,
      title: 'Starred Quick Access',
      description:
        'Pin important documents, contracts, media, and frequently used folders into a dedicated starred view for single-click retrieval across all devices.',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-danger" />,
      title: 'Two-Stage Safe Trash Recovery',
      description:
        'Soft-delete items with complete peace of mind. Restore accidentally removed files to their original directories or permanently purge them whenever you choose.',
    },
  ];

  const architecturalPillars = [
    {
      number: '01',
      title: 'Zero Binary Custody',
      subtitle: 'Your raw file bytes never touch our disks',
      description:
        'One Cloud operates strictly as a metadata indexer and secure client interface. File payloads travel directly to your private Telegram Saved Messages chat via MTProto. We do not maintain proprietary storage silos that could be compromised, held for ransom, or monetized.',
      tag: 'Data Sovereignty',
    },
    {
      number: '02',
      title: 'Transparent Byte Accounting',
      subtitle: 'Honest drive metrics, zero fake marketing claims',
      description:
        'We reject misleading "unlimited" cloud marketing tropes. One Cloud calculates and displays the exact aggregate byte size of the files indexed in your personal workspace, reflecting Telegram\'s documented per-file transfer boundaries (up to 2 GB per file).',
      tag: 'Measurable Reality',
    },
    {
      number: '03',
      title: 'Cryptographic Isolation',
      subtitle: 'AES-256-GCM session tokens & strict database rules',
      description:
        'Your Telegram authentication session strings are encrypted server-side using AES-256-GCM and never exposed to the client browser in plaintext. Cloud Firestore security rules strictly isolate data under /users/{uid}/, guaranteeing that no tenant can inspect another user\'s drive hierarchy.',
      tag: 'Hardened Security',
    },
    {
      number: '04',
      title: 'Desktop Productivity Ergonomics',
      subtitle: 'Engineered with high-velocity desktop discipline',
      description:
        'Built using Next.js 15, React 19, and Tailwind CSS. The workspace mirrors the density and visual restraint of developer platforms like Linear alongside the familiar spatial intuition of Google Drive, with keyboard navigation and zero UI bloat.',
      tag: 'Performance First',
    },
  ];

  const workflowSteps = [
    {
      step: 'Step 1',
      title: 'Authenticate Your Workspace',
      desc: 'Sign in to One Cloud using email/password or Google authentication via Firebase Auth to establish your private, isolated workspace environment.',
      icon: <Key className="w-5 h-5 text-primary" />,
    },
    {
      step: 'Step 2',
      title: 'Link Your Telegram Account',
      desc: 'Connect your personal Telegram account instantly by scanning an ephemeral QR code or requesting a standard login code with two-step verification (2FA) support.',
      icon: <Smartphone className="w-5 h-5 text-[#36AEEA]" />,
    },
    {
      step: 'Step 3',
      title: 'Upload, Structure & Tag',
      desc: 'Drag and drop folders and files. Organize them into nested directories, tag favorites, and search by file name or extension in milliseconds.',
      icon: <HardDrive className="w-5 h-5 text-tertiary" />,
    },
    {
      step: 'Step 4',
      title: 'Access & Stream Everywhere',
      desc: 'Open your drive from any browser on desktop, tablet, or mobile. Stream media, download original binaries, or manage your files with complete sovereign ownership.',
      icon: <Cloud className="w-5 h-5 text-[#4F8CFF]" />,
    },
  ];

  const comparisonRows = [
    {
      criteria: 'File Storage Location',
      oneCloud: "Your Personal Telegram 'Saved Messages'",
      traditionalCloud: 'Proprietary central servers (vendor locked)',
      rawTelegramChat: 'Chronological message stream (no folders)',
    },
    {
      criteria: 'Per-File Size Limits',
      oneCloud: 'Up to 2 GB per file (Telegram MTProto limit)',
      traditionalCloud: 'Subject to restrictive tier quotas (5–15 GB free total)',
      rawTelegramChat: 'Up to 2 GB per file (standard Telegram limit)',
    },
    {
      criteria: 'Folder Hierarchy & Tree',
      oneCloud: 'Full nested folder tree & path breadcrumbs',
      traditionalCloud: 'Supported',
      rawTelegramChat: 'None (flat unorganized chat history)',
    },
    {
      criteria: 'Search & Filtering',
      oneCloud: 'Instant indexed metadata search (sub-80ms)',
      traditionalCloud: 'Supported (often delayed or throttled)',
      rawTelegramChat: 'Basic message text search only',
    },
    {
      criteria: 'File Content Custody',
      oneCloud: 'Zero custody; we never scan, host, or read binaries',
      traditionalCloud: 'Hosted on proprietary servers with telemetry',
      rawTelegramChat: 'Stored in Telegram cloud',
    },
    {
      criteria: 'Recurring Storage Subscription',
      oneCloud: 'Zero recurring storage fees for user files',
      traditionalCloud: 'Expensive monthly tier paywalls ($2–$20/mo)',
      rawTelegramChat: 'Free with personal account',
    },
  ];

  const faqs = [
    {
      question: 'Is One Cloud officially affiliated with Telegram FZ-LLC?',
      answer:
        'No. One Cloud is an independent, third-party client interface built using open MTProto communication protocols. Telegram is a registered trademark of Telegram FZ-LLC. One Cloud interacts with the Telegram network using standard client session authentication, similar to other open-source Telegram desktop and web clients.',
    },
    {
      question: 'Can One Cloud administrators or servers view my private files?',
      answer:
        'No. One Cloud enforces a strict zero-binary-custody architectural model. Your file binaries are transferred directly to and from your personal Telegram "Saved Messages" chat via encrypted MTProto streams. Our database stores only structural metadata (file names, sizes, mime types, folder parent IDs) necessary to render your drive folder tree. We do not inspect, parse, or monetize your file contents.',
    },
    {
      question: 'What happens if I disconnect my Telegram account from One Cloud?',
      answer:
        'Your files remain completely safe in your Telegram account! Because every file uploaded through One Cloud is transmitted to your personal Telegram "Saved Messages", all file binaries persist in your Telegram chat indefinitely. If you disconnect your session or delete your One Cloud workspace, you still retain full access to all uploaded documents inside your native Telegram application.',
    },
    {
      question: 'How does storage accounting work in One Cloud?',
      answer:
        'We calculate your storage usage by aggregating the actual byte count of files currently indexed in your active drive database. We do not invent fake quotas or claim impossible "unlimited" allocations. Your actual storage boundaries correspond directly to your personal Telegram account rules and the documented 2 GB per-file bot ceiling.',
    },
    {
      question: 'How are my Telegram credentials and session tokens secured?',
      answer:
        'Your session credentials are encrypted on the server side using industry-standard AES-256-GCM cryptography. Session secrets are never exposed in browser localStorage or sent to third-party trackers. Furthermore, Cloud Firestore security rules restrict database access exclusively to your verified Firebase user identifier (UID).',
    },
    {
      question: 'What types of files can I store and preview in One Cloud?',
      answer:
        'You can store any file type supported by your operating system, including PDFs, documents, images (JPEG, PNG, WebP, GIF, SVG), audio tracks (MP3, WAV, FLAC), video files (MP4, WebM), and compressed archives (ZIP, RAR, 7Z). Our in-browser lightbox previewer supports native media playback, high-resolution image zoom, PDF reading, and syntax-highlighted code inspection.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-body-md antialiased selection:bg-brand-subtle selection:text-primary-fixed flex flex-col transition-colors">
      <Navbar />

      <main className="w-full pt-16 bg-canvas flex-1">
        {/* Hero Section */}
        <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-14 pb-20 md:pt-20 md:pb-28">
          {/* Subtle ambient lighting */}
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[720px] h-[380px] bg-primary-container/10 blur-[130px] rounded-full" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">
            {/* Identity Badge */}
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border shadow-xs mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-primary" />
              <span className="text-xs font-semibold uppercase tracking-wider text-text-secondary">
                ABOUT ONE CLOUD • MISSION & ARCHITECTURE
              </span>
            </div>

            {/* Main Headline */}
            <h1 className="text-3xl sm:text-4xl md:text-[46px] md:leading-[54px] font-bold text-text-primary tracking-tight max-w-4xl">
              Reimagining Personal Cloud Storage With Zero-Custody Architecture.
            </h1>

            {/* Subheading */}
            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mt-5 leading-relaxed">
              One Cloud bridges the gap between the familiar desktop ergonomics of modern cloud drives
              and the sovereign, encrypted infrastructure of your personal Telegram account.
            </p>

            {/* Action CTA Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-4 mt-8">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-all shadow-md active:scale-[0.99]"
              >
                <span>Launch Your Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/how-it-works"
                className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-medium bg-surface text-text-primary hover:bg-surface-hover border border-border transition-colors shadow-xs active:scale-[0.99]"
              >
                <span>How It Works</span>
              </Link>
              <Link
                href="/security"
                className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-medium bg-surface text-text-primary hover:bg-surface-hover border border-border transition-colors shadow-xs active:scale-[0.99]"
              >
                <ShieldCheck className="w-4 h-4 text-tertiary" />
                <span>Security Model</span>
              </Link>
            </div>

            {/* Verified Architectural Metric Strip */}
            <div className="mt-14 w-full grid grid-cols-2 md:grid-cols-4 gap-3 max-w-4xl pt-6 border-t border-border/60">
              <div className="flex flex-col items-center p-3.5 rounded-lg bg-surface/60 border border-border/60">
                <span className="text-2xl font-bold font-mono tabular-nums text-text-primary tracking-tight">
                  2 GB
                </span>
                <span className="text-xs text-text-muted mt-0.5">Per-File Payload Cap</span>
              </div>
              <div className="flex flex-col items-center p-3.5 rounded-lg bg-surface/60 border border-border/60">
                <span className="text-2xl font-bold font-mono tabular-nums text-tertiary tracking-tight">
                  0%
                </span>
                <span className="text-xs text-text-muted mt-0.5">Binary Compression</span>
              </div>
              <div className="flex flex-col items-center p-3.5 rounded-lg bg-surface/60 border border-border/60">
                <span className="text-2xl font-bold font-mono tabular-nums text-primary tracking-tight">
                  MTProto
                </span>
                <span className="text-xs text-text-muted mt-0.5">Direct Telegram Protocol</span>
              </div>
              <div className="flex flex-col items-center p-3.5 rounded-lg bg-surface/60 border border-border/60">
                <span className="text-2xl font-bold font-mono tabular-nums text-text-primary tracking-tight">
                  Zero
                </span>
                <span className="text-xs text-text-muted mt-0.5">Proprietary Binary Custody</span>
              </div>
            </div>
          </div>
        </section>

        {/* The Problem & Our Solution Section */}
        <section className="w-full py-16 lg:py-20 bg-sidebar/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  THE PROBLEM & OUR PURPOSE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                  Why We Built One Cloud
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                Modern cloud storage forces users to choose between expensive corporate lock-in and the chaos
                of unorganized messaging feeds. One Cloud resolves this dilemma.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card 1: Traditional Cloud */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-danger/10 border border-danger/20 flex items-center justify-center text-danger mb-4">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Traditional Cloud Storage
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Mainstream platforms lock you into aggressive 5 GB or 15 GB paywalls, demanding monthly
                    subscription fees for storage space you already own across personal devices. File binaries
                    remain under corporate custody with telemetry tracking.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-danger" />
                  <span>Costly subscriptions &amp; data silos</span>
                </div>
              </div>

              {/* Card 2: Telegram Chat Storage */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-[#36AEEA]/10 border border-[#36AEEA]/20 flex items-center justify-center text-[#36AEEA] mb-4">
                    <Send className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Raw Telegram &apos;Saved Messages&apos;
                  </h3>
                  <p className="text-xs sm:text-sm text-text-muted leading-relaxed">
                    Telegram provides reliable, generous file transfers up to 2 GB per file. However,
                    &apos;Saved Messages&apos; is a linear chat feed. Finding a document uploaded six months ago
                    without nested folders, breadcrumbs, or star tags is frustrating and time-consuming.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-text-muted">
                  <span className="w-2 h-2 rounded-full bg-[#36AEEA]" />
                  <span>Unstructured linear timeline</span>
                </div>
              </div>

              {/* Card 3: One Cloud Solution */}
              <div className="p-6 rounded-xl bg-surface border border-primary/40 relative flex flex-col justify-between shadow-lg">
                <div className="absolute top-4 right-4 px-2 py-0.5 rounded-full bg-primary/10 border border-primary/30 text-[10px] font-semibold text-primary uppercase">
                  The Synthesis
                </div>
                <div>
                  <div className="w-10 h-10 rounded-lg bg-primary-container/20 border border-primary/30 flex items-center justify-center text-primary mb-4">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    The One Cloud Experience
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    One Cloud bridges both worlds: your file bytes are stored directly in your own personal
                    Telegram Saved Messages chat, while our interface provides a desktop-grade folder tree,
                    sub-80ms search, drag-and-drop upload queue, and lightbox media player.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 flex items-center gap-2 text-xs text-tertiary font-medium">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Zero custody + Desktop ergonomics</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Core Principles & Architectural Pillars */}
        <section className="w-full py-16 lg:py-20 bg-canvas">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                OUR ENGINEERING PILLARS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Foundational Principles That Guide Every Commit
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                We design software according to strict architectural guidelines, prioritizing user control,
                cryptographic integrity, and measured performance.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {architecturalPillars.map((pillar) => (
                <div
                  key={pillar.number}
                  className="p-7 rounded-xl bg-surface border border-border hover:border-border-strong transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-primary px-2.5 py-1 rounded bg-brand-subtle border border-primary/20">
                        {pillar.number}
                      </span>
                      <span className="text-[11px] font-medium text-text-muted uppercase tracking-wider">
                        {pillar.tag}
                      </span>
                    </div>
                    <h3 className="text-lg font-bold text-text-primary mb-1">
                      {pillar.title}
                    </h3>
                    <p className="text-xs font-medium text-primary mb-3">
                      {pillar.subtitle}
                    </p>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      {pillar.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Technical Architecture Breakdown */}
        <section className="w-full py-16 lg:py-20 bg-sidebar/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                  SYSTEM ARCHITECTURE
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                  How One Cloud Works Under The Hood
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                A clean division of responsibilities ensures high performance, minimal server footprint,
                and absolute privacy.
              </p>
            </div>

            {/* Architecture Flow Diagram Container */}
            <div className="w-full p-6 sm:p-8 rounded-xl bg-surface border border-border">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 relative">
                {/* Layer 1: Client Workstation */}
                <div className="p-5 rounded-lg bg-surface-raised border border-border-strong flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 text-primary">
                      <Cpu className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Layer 1: Frontend Workspace
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Next.js 15 + React 19 Client
                    </h4>
                    <ul className="text-xs text-text-muted space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Responsive desktop/mobile workspace with Inter typography</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Zero-pill dense row alignment and tabular numerical display</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-primary mt-0.5">•</span>
                        <span>Multi-chunk drag &amp; drop file upload queue with cancel/retry</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-text-muted">
                    Runs in your browser
                  </div>
                </div>

                {/* Layer 2: API & Metadata Indexer */}
                <div className="p-5 rounded-lg bg-surface-raised border border-border-strong flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 text-[#36AEEA]">
                      <Database className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Layer 2: Metadata &amp; Auth
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Firebase Auth + Cloud Firestore
                    </h4>
                    <ul className="text-xs text-text-muted space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-[#36AEEA] mt-0.5">•</span>
                        <span>Multi-tenant isolation under strict /users/{'{uid}'}/ rules</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#36AEEA] mt-0.5">•</span>
                        <span>Sub-80ms index searches for folders, files, and tags</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-[#36AEEA] mt-0.5">•</span>
                        <span>AES-256-GCM encrypted Telegram session token store</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-text-muted">
                    No raw file binaries stored here
                  </div>
                </div>

                {/* Layer 3: Telegram Cloud Storage */}
                <div className="p-5 rounded-lg bg-surface-raised border border-border-strong flex flex-col justify-between">
                  <div>
                    <div className="flex items-center gap-2.5 mb-3 text-tertiary">
                      <Server className="w-5 h-5" />
                      <span className="text-xs font-bold uppercase tracking-wider">
                        Layer 3: Sovereign Byte Storage
                      </span>
                    </div>
                    <h4 className="text-sm font-semibold text-text-primary mb-2">
                      Telegram Saved Messages
                    </h4>
                    <ul className="text-xs text-text-muted space-y-2">
                      <li className="flex items-start gap-2">
                        <span className="text-tertiary mt-0.5">•</span>
                        <span>Transferred over direct MTProto pipe (chat_id = &apos;me&apos;)</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-tertiary mt-0.5">•</span>
                        <span>Up to 2 GB per single file upload ceiling</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="text-tertiary mt-0.5">•</span>
                        <span>Permanent availability inside your official Telegram apps</span>
                      </li>
                    </ul>
                  </div>
                  <div className="mt-4 pt-3 border-t border-border text-[11px] font-mono text-text-muted">
                    Your personal Telegram cloud
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Real Features & Functional Capabilities */}
        <section className="w-full py-16 lg:py-20 bg-canvas">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                VERIFIED CAPABILITIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Real Features Built Into Your Workspace
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                Every feature described below is actively implemented and operational in One Cloud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {coreFeatures.map((feat, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-surface border border-border hover:border-border-strong transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center mb-4">
                      {feat.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {feat.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* How Users Interact With One Cloud (Workflow) */}
        <section className="w-full py-16 lg:py-20 bg-sidebar/50 border-y border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                HOW TO USE ONE CLOUD
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Getting Started In Four Straightforward Steps
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                No complex server configurations or terminal setups required. Connect in under two minutes.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {workflowSteps.map((s, idx) => (
                <div
                  key={idx}
                  className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-[11px] font-mono font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                        {s.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center">
                        {s.icon}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">
                      {s.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {s.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Feature & Architecture Comparison Table */}
        <section className="w-full py-16 lg:py-20 bg-canvas overflow-hidden">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                ARCHITECTURAL COMPARISON
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Comparing One Cloud With Alternatives
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                See how One Cloud compares with traditional cloud drive providers and raw Telegram chat storage.
              </p>
            </div>

            {/* Desktop Comparison Table */}
            <div className="w-full overflow-x-auto rounded-xl border border-border bg-surface">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr className="border-b border-border bg-surface-raised text-[11px] font-semibold uppercase tracking-wider text-text-secondary">
                    <th className="py-3.5 px-4 sm:px-6">Criteria</th>
                    <th className="py-3.5 px-4 sm:px-6 text-primary font-bold">One Cloud</th>
                    <th className="py-3.5 px-4 sm:px-6 text-text-muted">Traditional Cloud (Drive/Dropbox)</th>
                    <th className="py-3.5 px-4 sm:px-6 text-text-muted">Raw Telegram Saved Messages</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border text-xs">
                  {comparisonRows.map((row, idx) => (
                    <tr
                      key={idx}
                      className={idx % 2 === 0 ? 'bg-surface' : 'bg-surface-raised/40 hover:bg-surface-hover/40'}
                    >
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-text-primary">
                        {row.criteria}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 font-medium text-primary">
                        {row.oneCloud}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-text-muted">
                        {row.traditionalCloud}
                      </td>
                      <td className="py-3.5 px-4 sm:px-6 text-text-muted">
                        {row.rawTelegramChat}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* Engineering Philosophy & Team Statement */}
        <section className="w-full py-16 lg:py-20 bg-sidebar/50 border-y border-border">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="p-8 sm:p-10 rounded-2xl bg-surface border border-border shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 rounded-xl bg-brand-subtle border border-primary/20 flex items-center justify-center text-primary">
                  <Compass className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Independent Engineering &amp; Data Sovereignty
                  </h3>
                  <span className="text-xs text-text-muted">
                    Our Product Philosophy
                  </span>
                </div>
              </div>

              <div className="space-y-4 text-xs sm:text-sm text-text-secondary leading-relaxed">
                <p>
                  One Cloud was created by an independent software engineering team passionate about sovereign
                  cloud architectures, user control, and protocol-level freedom.
                </p>
                <p>
                  For years, personal digital storage has steadily consolidated into a handful of closed corporate
                  walled gardens. When users fill their complimentary 15 GB tiers, they are greeted by persistent
                  upsell banners and artificial monthly subscription paywalls. At the same time, platforms scan
                  document content for advertising and training data.
                </p>
                <p>
                  We believe that open protocols, user sovereignty, and transparent technology offer a superior
                  path forward. By leveraging Telegram&apos;s existing distributed MTProto transport infrastructure
                  and combining it with Google Cloud Firestore&apos;s lightning-fast metadata querying, One Cloud
                  delivers a desktop-grade cloud drive without taking custody of your private files or imposing
                  arbitrary storage rents.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs">
                <div className="flex items-center gap-2 text-tertiary font-medium">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Zero telemetry on user file contents</span>
                </div>
                <div className="flex items-center gap-4 text-text-muted">
                  <Link href="/security" className="hover:text-text-primary transition-colors">
                    Security Architecture &rarr;
                  </Link>
                  <Link href="/privacy" className="hover:text-text-primary transition-colors">
                    Privacy Policy &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Transparent Data Boundaries Section */}
        <section className="w-full py-16 lg:py-20 bg-canvas">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                SECURITY &amp; PRIVACY BOUNDARIES
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Transparent Data Custody: What We Store vs What We Don&apos;t
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                Clear cryptographic guarantees backed by client-side verification and cloud security rules.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-5xl mx-auto">
              {/* Card 1: What We Store (Metadata Only) */}
              <div className="p-6 sm:p-7 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-primary">
                    <Database className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                      What We Store (Structural Metadata Only)
                    </h3>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-3">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Workspace Hierarchy:</strong> Folder names, nesting parent IDs, and path breadcrumbs to render your directory tree.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">File Descriptors:</strong> File names, extension types, exact byte sizes, and modification timestamps for search indexing.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Encrypted Session String:</strong> Telegram session tokens encrypted server-side with AES-256-GCM.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">UI Preferences:</strong> Starred item flags, sort orders, and soft-delete trash records.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-text-muted">
                  Stored exclusively in Firestore under /users/{'{uid}'}/ with strict rule validation.
                </div>
              </div>

              {/* Card 2: What We Never Store */}
              <div className="p-6 sm:p-7 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-tertiary">
                    <Lock className="w-5 h-5" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-text-primary">
                      What We Never Store (Zero Binary Custody)
                    </h3>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-3">
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Raw File Payloads:</strong> Video streams, audio tracks, PDFs, photos, and documents never touch our physical hard drives.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Unencrypted Auth Secrets:</strong> Telegram 2FA passwords or raw authentication keys are never cached in plaintext.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Telemetry &amp; Ad Trackers:</strong> We do not log reading activity, scan file contents, or train neural models on your data.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Artificial Paywall Quotas:</strong> We do not hold your files for ransom or throttle downloads behind monthly paywalls.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-border/60 text-[11px] text-text-muted">
                  Your files remain permanently in your sovereign Telegram account.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Frequently Asked Questions */}
        <section className="w-full py-16 lg:py-20 bg-sidebar/50 border-y border-border">
          <div className="max-w-4xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                COMMONLY ASKED QUESTIONS
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Frequently Asked Questions About One Cloud
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                Transparent answers to key questions about storage mechanics, privacy, and affiliation.
              </p>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors"
                  >
                    <span className="text-sm font-semibold text-text-primary">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-text-muted shrink-0 transition-transform duration-200 ${
                        openFaq === idx ? 'rotate-180 text-primary' : ''
                      }`}
                    />
                  </button>
                  {openFaq === idx && (
                    <div className="px-4 pb-5 sm:px-5 sm:pb-6 text-xs sm:text-sm text-text-secondary leading-relaxed border-t border-border/50 pt-3">
                      {faq.answer}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-8 text-center">
              <p className="text-xs text-text-muted">
                Have additional questions or need technical support? Visit our{' '}
                <Link href="/help" className="text-primary hover:underline font-medium">
                  Help Center &amp; FAQ
                </Link>{' '}
                or review our{' '}
                <Link href="/security" className="text-primary hover:underline font-medium">
                  Security Model
                </Link>
                .
              </p>
            </div>
          </div>
        </section>

        {/* Contact, Support & Community Section */}
        <section className="w-full py-16 lg:py-20 bg-canvas">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <span className="text-xs uppercase tracking-wider text-primary font-semibold">
                COMMUNITY &amp; ASSISTANCE
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                Contact &amp; Support Channels
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3">
                Reach out to our team, explore technical documentation, or report security observations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Help Center */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-brand-subtle border border-primary/20 flex items-center justify-center text-primary mb-4">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Help Center &amp; Docs
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Access step-by-step guides on file management, Telegram connection setup, and media preview tips.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    href="/help"
                    className="text-xs font-semibold text-primary hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>Browse Help Articles</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Security Inquiries */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-tertiary/10 border border-tertiary/25 flex items-center justify-center text-tertiary mb-4">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Security &amp; Vulnerability
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Review our zero-custody whitepaper or responsibly report security findings to our engineering team.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    href="/security"
                    className="text-xs font-semibold text-tertiary hover:underline inline-flex items-center gap-1.5"
                  >
                    <span>View Security Model</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Terms & Legal */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-primary mb-4">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-semibold text-text-primary mb-1">
                    Policies &amp; Fair Use
                  </h3>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    Learn about user rights, privacy guarantees, data ownership policies, and acceptable platform usage.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-border">
                  <Link
                    href="/terms"
                    className="text-xs font-semibold text-text-secondary hover:text-text-primary inline-flex items-center gap-1.5"
                  >
                    <span>Read Terms of Service</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Final Call to Action */}
        <section className="w-full py-16 bg-sidebar/60 border-t border-border">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="relative rounded-2xl bg-gradient-to-b from-surface-raised to-surface border border-border p-8 sm:p-12 text-center overflow-hidden shadow-2xl">
              <div className="pointer-events-none absolute -top-24 left-1/2 -translate-x-1/2 w-[480px] h-[240px] bg-primary-container/15 blur-[90px] rounded-full" />

              <div className="relative z-10 flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-surface border border-border flex items-center justify-center text-primary mb-4 shadow-sm">
                  <Cloud className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Take Full Ownership Of Your Personal Cloud Today
                </h2>

                <p className="mt-3 max-w-xl text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Experience sovereign, encrypted file storage powered by Telegram infrastructure
                  with desktop-grade drive organization.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  <Link
                    href="/signup"
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-all shadow-md active:scale-[0.99]"
                  >
                    <span>Get Started Free</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    href="/app"
                    className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-medium bg-surface text-text-primary hover:bg-surface-hover border border-border transition-colors shadow-xs active:scale-[0.99]"
                  >
                    <HardDrive className="w-4 h-4 text-text-secondary" />
                    <span>Open Drive Workspace</span>
                  </Link>
                </div>

                <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-[11px] text-text-muted">
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                    <span>No credit card required</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                    <span>Zero binary custody</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-tertiary" />
                    <span>Up to 2 GB per file transfer</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
