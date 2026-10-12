'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Calendar,
  CheckCircle,
  Clock,
  History,
  Share2,
  Download,
  ListTree,
  ChevronRight,
  Lock,
  ShieldCheck,
  BadgeAlert,
  Folder,
  Search,
  KeyRound,
  FileDown,
  Unlink,
  Trash2,
  Mail,
  ArrowRight,
  Shield,
  FileText,
  Gavel,
  Check,
} from 'lucide-react';

export default function PrivacyPolicyPage() {
  const [copiedLink, setCopiedLink] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState('section-1');

  const handleCopyLink = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('main section[id]');
      const scrollPosition = window.scrollY + 180;

      sections.forEach((sec) => {
        const top = (sec as HTMLElement).offsetTop;
        const height = (sec as HTMLElement).offsetHeight;
        if (scrollPosition >= top && scrollPosition < top + height) {
          setActiveSectionId(sec.getAttribute('id') || 'section-1');
        }
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const tocItems = [
    { id: 'section-1', title: '1. Architecture Overview' },
    { id: 'section-2', title: '2. Information We Collect' },
    { id: 'section-3', title: '3. Telegram & Data Custody' },
    { id: 'section-4', title: '4. Firebase & Index Metadata' },
    { id: 'section-5', title: '5. How Data Is Processed' },
    { id: 'section-6', title: '6. Third Parties & No-Monetization' },
    { id: 'section-7', title: '7. Data Retention & Deletion' },
    { id: 'section-8', title: '8. User Rights & Portability' },
    { id: 'section-9', title: '9. Security & Payload Isolation' },
    { id: 'section-10', title: '10. Policy Amendments & Inquiries' },
  ];

  return (
    <div className="min-h-screen bg-canvas text-on-surface font-body-md antialiased selection:bg-brand-subtle selection:text-primary flex flex-col transition-colors">
      <Navbar />

      <main className="w-full pt-[72px] bg-canvas flex-1">
        <div className="flex flex-col w-full">
          {/* Document Header Section */}
          <header className="w-full bg-surface-container-lowest py-12 px-6 lg:px-12 border-b border-border/40">
            <div className="max-w-7xl mx-auto flex flex-col gap-4">
              {/* Breadcrumb / Badge */}
              <div className="flex items-center gap-2 flex-wrap">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-brand-subtle text-primary text-xs font-semibold border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  LEGAL &amp; TRANSPARENCY
                </span>
                <span className="text-text-muted text-xs">•</span>
                <span className="text-text-secondary text-xs font-mono">
                  Document Ref: OC-POL-PRV-2025
                </span>
              </div>

              {/* Title & Subtitle */}
              <div className="flex flex-col gap-1.5 max-w-4xl">
                <h1 className="text-3xl sm:text-4xl font-bold text-text-primary tracking-tight">
                  Privacy Policy
                </h1>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  How One Cloud handles your account credentials, file indexing metadata, and
                  client-side Telegram storage orchestration with zero raw byte custody.
                </p>
              </div>

              {/* Metadata & Document Actions */}
              <div className="flex flex-wrap items-center justify-between gap-4 pt-4 bg-surface-container-low/40 p-4 rounded-lg border border-border/50">
                <div className="flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Calendar className="w-4 h-4 text-primary" />
                    <span>Effective Date: January 15, 2025</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <CheckCircle className="w-4 h-4 text-tertiary" />
                    <span>Version 1.4</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <History className="w-4 h-4 text-text-muted" />
                    <span>Last Reviewed: October 2024</span>
                  </div>
                  <span>•</span>
                  <div className="flex items-center gap-1.5 text-text-secondary">
                    <Clock className="w-4 h-4 text-secondary" />
                    <span>6 min read</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border transition-colors text-xs font-medium cursor-pointer"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-4 h-4 text-tertiary" />
                        <span className="text-tertiary">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-4 h-4" />
                        <span>Copy link</span>
                      </>
                    )}
                  </button>
                  <a
                    href="#"
                    onClick={(e) => {
                      e.preventDefault();
                      window.print();
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border transition-colors text-xs font-medium"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download PDF</span>
                  </a>
                </div>
              </div>
            </div>
          </header>

          {/* Main Legal Content Layout: 2-Column Grid */}
          <div className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
              {/* Sticky Left Column: Table of Contents */}
              <aside className="lg:col-span-4 xl:col-span-3">
                <div className="lg:sticky lg:top-[96px] flex flex-col gap-3 bg-surface border border-border p-4 rounded-xl shadow-xs">
                  <div className="flex items-center justify-between pb-1 border-b border-border/40">
                    <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                      <ListTree className="w-4 h-4 text-primary" />
                      Table of Contents
                    </span>
                    <span className="text-[11px] text-text-muted">10 Sections</span>
                  </div>

                  <nav className="flex flex-col gap-1 text-xs" id="toc-nav">
                    {tocItems.map((item) => {
                      const isActive = activeSectionId === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`flex items-center justify-between py-2 px-2.5 rounded-lg transition-colors group ${
                            isActive
                              ? 'bg-brand-subtle text-primary font-semibold'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          <ChevronRight
                            className={`w-3.5 h-3.5 transition-opacity ${
                              isActive ? 'opacity-100 text-primary' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        </a>
                      );
                    })}
                  </nav>

                  {/* Quick Trust Pill */}
                  <div className="mt-2 p-3 rounded-lg bg-surface-raised border border-border/60 flex flex-col gap-1">
                    <div className="flex items-center gap-1.5 text-tertiary text-xs font-semibold">
                      <Lock className="w-3.5 h-3.5" />
                      <span>Zero-Byte Knowledge</span>
                    </div>
                    <p className="text-text-muted text-[11px] leading-relaxed">
                      We never access, decrypt, or duplicate your uploaded binary assets on external
                      servers.
                    </p>
                  </div>
                </div>
              </aside>

              {/* Right Column: Legal Prose & Structural Breakdowns */}
              <div className="lg:col-span-8 xl:col-span-9 flex flex-col gap-12 max-w-3xl">
                {/* Callout Banner: Zero Data Monopolization */}
                <div className="p-6 rounded-xl bg-surface-raised border border-border flex flex-col sm:flex-row items-start gap-4 shadow-xs">
                  <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0 mt-0.5 border border-primary/20">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col gap-1">
                    <span className="text-base font-semibold text-text-primary">
                      Zero Binary Custody Guarantee
                    </span>
                    <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                      One Cloud does <strong className="text-text-primary font-medium">not store, inspect, sell, or monetize</strong> the binary byte content of your files. All files are encrypted using standard MTProto protocols and relayed directly to your own Telegram account&apos;s <em className="text-primary not-italic font-medium">&quot;Saved Messages&quot;</em> channel.
                    </p>
                  </div>
                </div>

                {/* Section 1 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      01
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Introduction &amp; Architecture Overview
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Welcome to One Cloud (&ldquo;we&rdquo;, &ldquo;us&rdquo;, or &ldquo;our&rdquo;). One Cloud operates as a specialized client orchestration layer designed to give users a full-featured desktop and web drive interface powered entirely by Telegram&apos;s cloud storage infrastructure.
                  </p>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    By accessing or using our services at onecloud.app or our desktop applications, you acknowledge and accept the data handling practices outlined in this Privacy Policy. This policy explains how we collect and separate identity credentials, organizational metadata indexes, and MTProto media streams.
                  </p>
                </section>

                {/* Section 2 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      02
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Information We Collect
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    To provide instantaneous file navigation, search filtering, and virtual hierarchical folders, One Cloud bifurcates user data into strict operational categories:
                  </p>

                  {/* Data Comparison Cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                        <BadgeAlert className="w-5 h-5 text-primary" />
                        <span>Account &amp; Auth</span>
                      </div>
                      <ul className="text-xs text-text-secondary flex flex-col gap-1.5 list-disc list-inside">
                        <li>Primary verified email address</li>
                        <li>Firebase Authentication User Identifier (UID)</li>
                        <li>Telegram Telegram-ID (numeric pointer)</li>
                        <li>Hashed session tokens (stored locally)</li>
                      </ul>
                    </div>

                    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                        <Folder className="w-5 h-5 text-file-document" />
                        <span>Virtual Index Metadata</span>
                      </div>
                      <ul className="text-xs text-text-secondary flex flex-col gap-1.5 list-disc list-inside">
                        <li>User-defined file and directory names</li>
                        <li>MIME type extensions &amp; byte sizes</li>
                        <li>Parent/child folder relational IDs</li>
                        <li>Telegram message ID mapping references</li>
                        <li>Favorites, star markers, and custom tags</li>
                      </ul>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    <strong className="text-text-primary font-medium">Diagnostic Telemetry:</strong> We collect non-identifiable runtime crash reports and network latency metrics to optimize chunk transfer reliability. Telemetry never contains file names, directory structures, or Telegram authentication hashes.
                  </p>
                </section>

                {/* Section 3 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      03
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Telegram Storage &amp; Data Custody
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    One Cloud acts exclusively as a visual operating system on top of your own personal Telegram cloud space. When you upload any asset:
                  </p>

                  {/* Stepper Graphic */}
                  <div className="p-5 rounded-xl bg-surface-container-lowest border border-border flex flex-col gap-4">
                    <div className="flex items-center justify-between text-text-muted text-xs">
                      <span>MTProto Direct Pipe Pipeline</span>
                      <span className="text-tertiary font-medium">Zero intermediary caching</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 relative">
                      <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-primary/20 text-primary flex items-center justify-center text-xs font-bold">
                          1
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          Local Browser
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Chunking and hash digest verification occurs directly on your client hardware.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-secondary/20 text-secondary flex items-center justify-center text-xs font-bold">
                          2
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          Telegram MTProto
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          Payloads stream straight into Telegram&apos;s servers via authorized bot worker pipes.
                        </p>
                      </div>

                      <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1.5">
                        <div className="w-7 h-7 rounded-full bg-tertiary/20 text-tertiary flex items-center justify-center text-xs font-bold">
                          3
                        </div>
                        <span className="text-xs font-semibold text-text-primary">
                          Saved Messages
                        </span>
                        <p className="text-xs text-text-secondary leading-relaxed">
                          The native file entity exists permanently inside your personal chat history.
                        </p>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Because One Cloud does not possess the physical hard drive infrastructure where your binary payload rests, Telegram FZ-LLC remains the legal and technical custodian of the underlying encrypted file chunks. You can read Telegram&apos;s official privacy terms directly on telegram.org.
                  </p>
                </section>

                {/* Section 4 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      04
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Firebase Authentication &amp; Metadata Indexing
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Without metadata caching, a drive system would be forced to fetch and parse tens of thousands of messages from your Telegram chat timeline every time you open a folder. To achieve sub-second speeds:
                  </p>
                  <ul className="text-xs sm:text-sm text-text-secondary space-y-2 list-disc list-inside leading-relaxed">
                    <li>
                      <strong className="text-text-primary font-medium">
                        Firestore Clustered Trees:
                      </strong>{' '}
                      Directory structures, nested hierarchies, file labels, and permissions are indexed in secure Google Firebase / Google Cloud Firestore clusters.
                    </li>
                    <li>
                      <strong className="text-text-primary font-medium">Pointer Encryption:</strong>{' '}
                      Pointers to Telegram message IDs are isolated so only your authenticated Firebase UID holds read and write permissions under strict Cloud Security Rules.
                    </li>
                    <li>
                      <strong className="text-text-primary font-medium">Local IndexedDB Sync:</strong>{' '}
                      Frequently referenced folder paths are cached locally inside your browser storage for instant navigation.
                    </li>
                  </ul>
                </section>

                {/* Section 5 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      05
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      How Your Data Is Processed
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    We use the limited information we process solely for delivering the core product experience:
                  </p>

                  <div className="space-y-3">
                    <div className="p-4 rounded-lg bg-surface border border-border flex items-start gap-3">
                      <Folder className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-text-primary font-semibold text-xs sm:text-sm block">
                          Hierarchical File Browsing
                        </span>
                        <span className="text-text-secondary text-xs">
                          Converting linear chat messages into standard nested folder systems with drag-and-drop support.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-border flex items-start gap-3">
                      <Search className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-text-primary font-semibold text-xs sm:text-sm block">
                          Real-time Search &amp; Index Filtering
                        </span>
                        <span className="text-text-secondary text-xs">
                          Querying file names, extensions, tags, and size thresholds instantly without network latency.
                        </span>
                      </div>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-border flex items-start gap-3">
                      <KeyRound className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="text-text-primary font-semibold text-xs sm:text-sm block">
                          Authentication Handshakes
                        </span>
                        <span className="text-text-secondary text-xs">
                          Maintaining valid MTProto bot communication sessions between your account and client UI.
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 6 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-6">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      06
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Third-Party Disclosures &amp; Non-Monetization
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    One Cloud is founded on a privacy-respecting business model. We do not sell user data, license indexing trends, or construct behavioral advertising profiles.
                  </p>

                  <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-2">
                    <span className="text-xs font-semibold text-text-primary">
                      Sub-processors we work with:
                    </span>
                    <div className="space-y-2 text-xs text-text-secondary mt-1">
                      <div className="flex items-center justify-between py-2 bg-surface-raised px-3 rounded border border-border/50">
                        <span className="font-medium text-text-primary">
                          Google Firebase / Cloud Infrastructure
                        </span>
                        <span className="text-text-muted">
                          User authentication &amp; encrypted index persistence
                        </span>
                      </div>
                      <div className="flex items-center justify-between py-2 bg-surface-raised px-3 rounded border border-border/50">
                        <span className="font-medium text-text-primary">Telegram FZ-LLC</span>
                        <span className="text-text-muted">
                          Direct file payload transfer and encrypted data storage
                        </span>
                      </div>
                    </div>
                  </div>
                </section>

                {/* Section 7 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-7">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      07
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Data Retention &amp; Permanent Deletion
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    When you interact with the deletion lifecycle in One Cloud:
                  </p>

                  <div className="space-y-3 text-xs sm:text-sm text-text-secondary">
                    <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1">
                      <span className="text-text-primary font-semibold">1. Move to Trash</span>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        The metadata record is flagged as soft-deleted. The underlying Telegram message remains untouched in your Saved Messages history.
                      </p>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-border flex flex-col gap-1">
                      <span className="text-text-primary font-semibold">
                        2. Empty Trash / Permanent Purge
                      </span>
                      <p className="text-xs text-text-secondary leading-relaxed">
                        The metadata document is permanently and irreversibly destroyed from our Firestore clusters. If enabled in your settings, our bot worker also sends an MTProto deletion command to remove the message from your Saved Messages.
                      </p>
                    </div>
                  </div>
                </section>

                {/* Section 8 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-8">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      08
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      User Rights &amp; Data Portability
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    Regardless of geographic residence, all One Cloud users retain comprehensive control over their personal records:
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
                    <div className="p-4 rounded-lg bg-surface border border-border flex flex-col items-center gap-2 shadow-xs">
                      <FileDown className="w-7 h-7 text-primary" />
                      <span className="text-xs font-semibold text-text-primary">
                        Metadata Export
                      </span>
                      <span className="text-[11px] text-text-secondary leading-relaxed">
                        Export your entire folder hierarchy index as JSON or CSV anytime.
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-border flex flex-col items-center gap-2 shadow-xs">
                      <Unlink className="w-7 h-7 text-warning" />
                      <span className="text-xs font-semibold text-text-primary">
                        Unlink Bot Session
                      </span>
                      <span className="text-[11px] text-text-secondary leading-relaxed">
                        Revoke bot access directly in Telegram via BotFather in 1 click.
                      </span>
                    </div>

                    <div className="p-4 rounded-lg bg-surface border border-border flex flex-col items-center gap-2 shadow-xs">
                      <Trash2 className="w-7 h-7 text-danger" />
                      <span className="text-xs font-semibold text-text-primary">
                        Complete Account Wipe
                      </span>
                      <span className="text-[11px] text-text-secondary leading-relaxed">
                        Purge account credentials and cloud metadata records instantly.
                      </span>
                    </div>
                  </div>
                </section>

                {/* Section 9 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-9">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      09
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Security &amp; Payload Isolation
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    All traffic between your client device and our metadata services utilizes strictly enforced TLS 1.3 encryption. Internal datastores utilize Google Cloud AES-256 server-side encryption at rest. We continuously subject our codebase to automated static security analyses to prevent token exfiltration.
                  </p>
                </section>

                {/* Section 10 */}
                <section className="scroll-mt-28 flex flex-col gap-3" id="section-10">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-primary px-2 py-0.5 rounded bg-brand-subtle border border-primary/20">
                      10
                    </span>
                    <h2 className="text-xl font-bold text-text-primary tracking-tight">
                      Policy Amendments &amp; Inquiries
                    </h2>
                  </div>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    We may revise this Privacy Policy periodically to reflect architectural upgrades or regulatory adjustments. If modifications are substantial, we will publish a notification badge within the web application interface prior to implementation.
                  </p>

                  <div className="p-5 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-brand-subtle text-primary flex items-center justify-center shrink-0 border border-primary/20">
                        <Mail className="w-5 h-5 text-primary" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-xs sm:text-sm font-semibold text-text-primary">
                          Privacy &amp; Security Office
                        </span>
                        <span className="text-[11px] sm:text-xs text-text-secondary">
                          Direct questions, inquiries, and GDPR data requests
                        </span>
                      </div>
                    </div>
                    <a
                      href="mailto:privacy@onecloud.app"
                      className="px-4 py-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border transition-colors text-xs font-semibold shrink-0"
                    >
                      privacy@onecloud.app
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </div>

          {/* Bottom Cross-Navigation Bar */}
          <section className="w-full bg-surface-container-low py-12 px-6 lg:px-12 border-t border-border">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <h3 className="text-lg font-bold text-text-primary">
                  Related Legal &amp; Architectural Standards
                </h3>
                <p className="text-xs text-text-secondary">
                  Read more on how we balance privacy, speed, and platform rules.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Terms Card */}
                <Link
                  href="/terms"
                  className="group p-5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all flex flex-col justify-between h-44 shadow-xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center border border-primary/20">
                      <FileText className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors mt-2">
                      Terms of Service
                    </span>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      Account terms, user conduct, rate limits, and Telegram API compliance.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-primary text-xs font-medium transition-colors">
                    <span>Read document</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                {/* Security Card */}
                <Link
                  href="/security"
                  className="group p-5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all flex flex-col justify-between h-44 shadow-xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center border border-tertiary/20">
                      <Shield className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-primary group-hover:text-tertiary transition-colors mt-2">
                      Security Architecture
                    </span>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      Deep-dive into 256-bit MTProto client streaming and credential isolation.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-primary text-xs font-medium transition-colors">
                    <span>Explore architecture</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                </Link>

                {/* Acceptable Use Card */}
                <Link
                  href="/acceptable-use"
                  className="group p-5 rounded-xl bg-surface hover:bg-surface-hover border border-border transition-all flex flex-col justify-between h-44 shadow-xs"
                >
                  <div className="flex flex-col gap-1.5">
                    <div className="w-8 h-8 rounded-lg bg-secondary/10 text-secondary flex items-center justify-center border border-secondary/20">
                      <Gavel className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-semibold text-text-primary group-hover:text-secondary transition-colors mt-2">
                      Acceptable Use
                    </span>
                    <p className="text-xs text-text-secondary line-clamp-2 leading-relaxed">
                      Storage policies, zero spam tolerance, and copyright enforcement.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 text-text-muted group-hover:text-text-primary text-xs font-medium transition-colors">
                    <span>Review guidelines</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
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
