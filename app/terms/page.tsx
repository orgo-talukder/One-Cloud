'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  History,
  ShieldCheck,
  CheckCircle,
  ArrowRight,
  Info,
  Key,
  AlertTriangle,
  Lock,
  Ban,
  ShieldAlert,
  Bug,
  Gavel,
  Check,
  FileCode,
  Shield,
  BookOpen,
  Cloud,
} from 'lucide-react';

export default function TermsPage() {
  const [activeSectionId, setActiveSectionId] = useState('section-1');

  useEffect(() => {
    const handleScroll = () => {
      const sections = document.querySelectorAll('article > section[id]');
      const scrollPosition = window.scrollY + 160;

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
    { id: 'section-1', title: '1. Acceptance of Terms' },
    { id: 'section-2', title: '2. Service Description & Scope' },
    { id: 'section-3', title: '3. Account & Telegram Linking' },
    { id: 'section-4', title: '4. User Content & Ownership' },
    { id: 'section-5', title: '5. Compliance & Rate Limits' },
    { id: 'section-6', title: '6. Service Availability' },
    { id: 'section-7', title: '7. Prohibited Uses & Termination' },
    { id: 'section-8', title: '8. Disclaimers & Liability' },
    { id: 'section-9', title: '9. Modifications to Terms' },
    { id: 'section-10', title: '10. Governing Law & Disputes' },
  ];

  return (
    <div className="bg-canvas text-on-surface font-body-md text-body-md antialiased min-h-screen flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="w-full pt-[72px] bg-canvas flex-1">
        <div className="flex flex-col w-full">
          {/* Document Master Header */}
          <header className="w-full bg-surface-container-lowest py-12 px-6 lg:px-12 border-b border-border/40">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary text-xs font-semibold border border-primary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-container" />
                  <span>LEGAL AGREEMENT</span>
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-text-primary text-xs sm:text-sm font-medium transition-colors border border-border shadow-xs cursor-pointer"
                    title="Download Official Terms as PDF"
                  >
                    <Download className="w-4 h-4 text-secondary" />
                    <span>Download PDF</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs sm:text-sm font-medium transition-colors border border-border shadow-xs cursor-pointer"
                  >
                    <Printer className="w-4 h-4" />
                    <span>Print</span>
                  </button>
                </div>
              </div>

              <div className="flex flex-col gap-2 max-w-4xl">
                <h1 className="text-3xl sm:text-4xl font-extrabold text-text-primary tracking-tight">
                  Terms of Service
                </h1>
                <p className="text-sm sm:text-base text-text-secondary leading-relaxed">
                  The terms governing your access to and use of the One Cloud personal cloud workspace,
                  client application, and Telegram-backed storage orchestration infrastructure.
                </p>
              </div>

              {/* Metadata Strip */}
              <div className="flex flex-wrap items-center gap-y-2 gap-x-6 pt-2 text-text-muted text-xs border-t border-border/30">
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4 text-primary" />
                  <span>Effective Date: January 15, 2025</span>
                </div>
                <span className="hidden sm:inline text-border-strong">•</span>
                <div className="flex items-center gap-2">
                  <History className="w-4 h-4 text-tertiary" />
                  <span>Version 1.4</span>
                </div>
                <span className="hidden sm:inline text-border-strong">•</span>
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  <span>Applies to all One Cloud Accounts &amp; Workspaces</span>
                </div>
                <span className="hidden sm:inline text-border-strong">•</span>
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-file-image" />
                  <span>Legal Entity: One Cloud Technologies Ltd.</span>
                </div>
              </div>
            </div>
          </header>

          {/* Dual Column Documentation Grid */}
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10 w-full">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
              {/* Sticky Navigation Sidebar (Desktop) */}
              <aside className="hidden lg:block lg:col-span-4 sticky top-28 space-y-6">
                <div className="bg-surface p-5 rounded-xl flex flex-col gap-4 shadow-xs border border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                      Document Outline
                    </span>
                    <span className="text-xs text-primary font-semibold">10 Articles</span>
                  </div>

                  <nav aria-label="Table of contents" className="flex flex-col gap-1 text-xs" id="terms-toc">
                    {tocItems.map((item) => {
                      const isActive = activeSectionId === item.id;
                      return (
                        <a
                          key={item.id}
                          href={`#${item.id}`}
                          className={`group flex items-center justify-between px-3 py-2 rounded-lg transition-colors ${
                            isActive
                              ? 'text-text-primary bg-brand-subtle font-semibold border border-primary/20'
                              : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
                          }`}
                        >
                          <span className="truncate">{item.title}</span>
                          <ArrowRight
                            className={`w-3.5 h-3.5 text-primary transition-opacity ${
                              isActive ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'
                            }`}
                          />
                        </a>
                      );
                    })}
                  </nav>
                </div>

                {/* Quick Summary Box */}
                <div className="bg-surface-container p-5 rounded-xl space-y-3 border border-border">
                  <div className="flex items-center gap-2 text-warning text-xs font-semibold">
                    <Info className="w-4 h-4" />
                    <span>Key Takeaway</span>
                  </div>
                  <p className="text-xs text-text-secondary leading-relaxed">
                    One Cloud acts as a high-performance visual file system for your existing
                    Telegram cloud storage. You keep complete ownership of files; Telegram stores
                    them; we index and organize them securely.
                  </p>
                  <Link
                    href="/security"
                    className="inline-flex items-center gap-1.5 text-primary hover:text-brand-hover text-xs font-medium pt-1"
                  >
                    <span>Learn about our security model</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </aside>

              {/* Reading Body Column */}
              <article className="lg:col-span-8 flex flex-col gap-12 text-text-secondary text-sm leading-relaxed">
                {/* SECTION 1 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-1">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      01
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Acceptance of Terms
                    </h2>
                  </div>
                  <p>
                    By accessing, creating an account on, or interacting with the One Cloud web
                    application, desktop client, or accompanying Telegram bots (collectively referred to
                    as the <strong className="text-text-primary">&ldquo;Service&rdquo;</strong>), you enter into a legally
                    binding agreement with One Cloud Technologies Ltd. (
                    <strong className="text-text-primary">&ldquo;One Cloud&rdquo;</strong>,{' '}
                    <strong className="text-text-primary">&ldquo;we&rdquo;</strong>,{' '}
                    <strong className="text-text-primary">&ldquo;us&rdquo;</strong>, or{' '}
                    <strong className="text-text-primary">&ldquo;our&rdquo;</strong>).
                  </p>
                  <p>
                    If you represent a legal entity, you affirmatively declare and warrant that you
                    possess adequate institutional authority to bind such entity to these Terms. If you
                    do not agree with any provision set forth herein, you must immediately terminate use
                    of the Service and unlink your associated Telegram credentials.
                  </p>
                </section>

                {/* SECTION 2 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-2">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      02
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Service Description &amp; Scope
                    </h2>
                  </div>
                  <p>
                    One Cloud provides an advanced interface, metadata indexing layer, virtual directory
                    system, and local client suite that operates symbiotically with the Telegram
                    messaging protocol (MTProto).
                  </p>
                  <p>Our infrastructure enables users to:</p>
                  <ul className="list-none space-y-2 pl-2">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
                      <span>
                        Establish virtual nested directories, custom tags, and categorized taxonomies
                        on top of raw chat-stream uploads.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
                      <span>
                        Perform sub-second full-text metadata searches across historical Telegram
                        messages, documents, and media.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
                      <span>
                        Execute encrypted stream previews, audio scrubbing, video transcoding
                        manifests, and document renders in-browser.
                      </span>
                    </li>
                  </ul>

                  {/* Platform Callout Warning */}
                  <div className="my-3 p-5 rounded-xl bg-surface-raised border-l-4 border-l-primary-container shadow-xs flex flex-col gap-3 border border-border/60">
                    <div className="flex items-center gap-2 text-text-primary font-semibold text-sm">
                      <Cloud className="w-5 h-5 text-primary" />
                      <span>Telegram Platform Dependency Notice</span>
                    </div>
                    <p className="text-text-secondary text-xs leading-relaxed">
                      One Cloud does not operate a standalone, independent, or proprietary hosting farm
                      for your binary files. File payloads are persisted and transported via official
                      Telegram MTProto endpoints. File transfer limits (such as the standard 2 GB
                      single-file boundary for non-premium accounts or 4 GB for Telegram Premium accounts)
                      and platform persistence rules remain governed exclusively by Telegram’s
                      infrastructure policies.
                    </p>
                  </div>
                  <p>
                    One Cloud explicitly disclaims representation as an &ldquo;unlimited raw storage
                    vendor.&rdquo; We are a client-side management and indexing workstation.
                  </p>
                </section>

                {/* SECTION 3 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      03
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Account Registration &amp; Telegram Linking
                    </h2>
                  </div>
                  <p>
                    To use the Service, you must authenticate through Telegram’s official OAuth protocol
                    or secure Bot API webhook tokens. You are completely responsible for maintaining the
                    confidentiality of your session tokens, passcodes, and physical devices.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
                        <Key className="w-4 h-4 text-secondary" />
                        <span>Session Credentials</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        One Cloud never requests or stores your plain-text Telegram account passwords or
                        Two-Step Verification master keys.
                      </p>
                    </div>
                    <div className="p-4 rounded-xl bg-surface border border-border flex flex-col gap-2">
                      <div className="flex items-center gap-2 text-text-primary font-semibold text-xs">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span>Compromise Notification</span>
                      </div>
                      <p className="text-xs text-text-muted leading-relaxed">
                        You agree to notify our security desk within 24 hours if you suspect your linked
                        Telegram session or bot token has been compromised.
                      </p>
                    </div>
                  </div>
                </section>

                {/* SECTION 4 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-4">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      04
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      User Responsibilities &amp; Content Ownership
                    </h2>
                  </div>
                  <p>
                    <strong className="text-text-primary">
                      You retain 100% full legal title, intellectual property rights, and custody of all
                      files, documents, databases, audio, and images
                    </strong>{' '}
                    indexed or routed via One Cloud.
                  </p>
                  <p>
                    We claim zero ownership rights over your personal files. By syncing files, you grant
                    One Cloud strictly the limited, non-exclusive, worldwide license required to read,
                    encrypt, render cache tiles, generate search embeddings, and display content back to
                    you within authenticated sessions.
                  </p>
                  <div className="p-4 rounded-xl bg-surface-container border border-border flex items-start gap-3">
                    <Lock className="w-4 h-4 text-tertiary mt-0.5 shrink-0" />
                    <p className="text-xs text-text-secondary leading-relaxed">
                      We do not mine user document contents for generative model training, commercial
                      profiling, advertising matching, or third-party syndication under any circumstances.
                    </p>
                  </div>
                </section>

                {/* SECTION 5 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-5">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      05
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Telegram Platform Compliance &amp; Rate Limits
                    </h2>
                  </div>
                  <p>
                    As a condition of using One Cloud, you agree to respect both One Cloud operating
                    guidelines and the broader{' '}
                    <a
                      className="text-primary underline hover:text-brand-hover"
                      href="https://telegram.org/tos"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Telegram Terms of Service
                    </a>
                    . Specifically:
                  </p>
                  <ul className="list-none space-y-3 pl-2 text-xs">
                    <li className="flex items-start gap-2.5">
                      <Ban className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-text-primary">No Flood Automation:</strong> You shall
                        not deploy scripted loops, brute-force bots, or automated scrapers engineered to
                        bypass Telegram’s server-side{' '}
                        <code className="px-1.5 py-0.5 bg-surface-raised rounded text-text-primary font-mono text-[11px]">
                          FLOOD_WAIT
                        </code>{' '}
                        throttling mechanisms.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Ban className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-text-primary">No Distributed Mirroring:</strong> Using One
                        Cloud as an illicit public file distribution node or warez relay is strictly
                        prohibited.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <Ban className="w-4 h-4 text-danger mt-0.5 shrink-0" />
                      <span>
                        <strong className="text-text-primary">Respect Bot API Thresholds:</strong> Synchronous
                        uploads are automatically capped by our desktop queues to respect Telegram’s
                        per-channel concurrency rules.
                      </span>
                    </li>
                  </ul>
                </section>

                {/* SECTION 6 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-6">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      06
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Service Availability &amp; Maintenance
                    </h2>
                  </div>
                  <p>
                    While One Cloud targets 99.9% uptime for our metadata clusters, search indexing
                    nodes, and web clients, we do not guarantee uninterrupted access. Scheduled
                    maintenance windows will be communicated via the official dashboard or our Telegram
                    announcement channel at least 12 hours in advance.
                  </p>
                  <p>
                    We cannot be held responsible for localized network blocking, country-level ISP
                    blackouts of Telegram MTProto protocols, or regional Telegram data center downtimes.
                  </p>
                </section>

                {/* SECTION 7 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-7">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      07
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Prohibited Uses &amp; Account Termination
                    </h2>
                  </div>
                  <p>We maintain zero tolerance for unlawful activities. You may not use the Service to store, index, or distribute:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 my-2 text-xs">
                    <div className="bg-surface p-4 rounded-xl flex flex-col gap-1.5 border border-border">
                      <ShieldAlert className="w-5 h-5 text-danger" />
                      <span className="text-text-primary font-semibold">Exploitation</span>
                      <span className="text-text-muted leading-relaxed">
                        Any abusive or non-consensual exploitation material. Immediate permanent ban.
                      </span>
                    </div>
                    <div className="bg-surface p-4 rounded-xl flex flex-col gap-1.5 border border-border">
                      <Bug className="w-5 h-5 text-danger" />
                      <span className="text-text-primary font-semibold">Malware &amp; Exploits</span>
                      <span className="text-text-muted leading-relaxed">
                        Weaponized rootkits, ransomware payloads, or phishing attack packages.
                      </span>
                    </div>
                    <div className="bg-surface p-4 rounded-xl flex flex-col gap-1.5 border border-border">
                      <Gavel className="w-5 h-5 text-danger" />
                      <span className="text-text-primary font-semibold">Infringing Media</span>
                      <span className="text-text-muted leading-relaxed">
                        Commercial pirated libraries subject to repeated DMCA copyright notices.
                      </span>
                    </div>
                  </div>
                  <p>
                    <strong className="text-text-primary">Voluntary Account Deletion:</strong> You may
                    unlink your Telegram account or permanently purge your One Cloud workspace indexing
                    database at any time from your Account Settings. Unlinking immediately expunges all
                    cataloged metadata, tags, and cached previews from our servers. Files already saved
                    within your Telegram Saved Messages or private channels remain in your personal
                    Telegram custody.
                  </p>
                </section>

                {/* SECTION 8 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-8">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      08
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Disclaimers &amp; Limitation of Liability
                    </h2>
                  </div>
                  <div className="bg-surface-raised p-5 rounded-xl text-xs uppercase tracking-wide text-text-muted leading-relaxed border border-border">
                    TO THE MAXIMUM EXTENT PERMITTED BY APPLICABLE LAW, ONE CLOUD IS PROVIDED &ldquo;AS IS&rdquo;
                    AND &ldquo;AS AVAILABLE&rdquo; WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED,
                    INCLUDING BUT NOT LIMITED TO MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND
                    NON-INFRINGEMENT. IN NO EVENT SHALL ONE CLOUD TECHNOLOGIES LTD., ITS DIRECTORS, OR
                    ENGINEERS BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, OR CONSEQUENTIAL DAMAGES
                    RESULTING FROM DATA LOSS, TELEGRAM PLATFORM DELETION, OR SERVICE OUTAGES.
                  </div>
                  <p>
                    Our cumulative liability for any verified legal claims arising under these terms
                    shall not exceed the total fees paid by you to One Cloud in the twelve (12) months
                    preceding the claim, or $100 USD, whichever is greater.
                  </p>
                </section>

                {/* SECTION 9 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-9">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      09
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Modifications to Service &amp; Terms
                    </h2>
                  </div>
                  <p>
                    As web standards, cloud paradigms, and Telegram’s Bot API evolve, we may amend these
                    Terms. If a revision is deemed material, we will provide at least 30 days’ notice
                    prior to the new terms taking effect via a persistent workspace banner and our
                    official news channel. Continued use of One Cloud following such amendments
                    constitutes explicit assent to the updated Terms.
                  </p>
                </section>

                {/* SECTION 10 */}
                <section className="scroll-mt-28 flex flex-col gap-4" id="section-10">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded bg-surface border border-border text-primary text-xs font-semibold">
                      10
                    </span>
                    <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                      Governing Law &amp; Dispute Resolution
                    </h2>
                  </div>
                  <p>
                    These Terms shall be interpreted and governed in accordance with the laws of England
                    and Wales, excluding conflict of law principles. Any dispute or claim arising out of
                    or related to these Terms will be settled exclusively through binding arbitration
                    conducted in London, UK, in the English language.
                  </p>
                  <p>
                    Prior to filing formal arbitration, both parties agree to engage in informal
                    good-faith negotiation for a period of not less than thirty (30) days by contacting{' '}
                    <span className="text-text-primary font-mono text-xs">legal@onecloud.app</span>.
                  </p>
                </section>

                {/* Contact Support Module */}
                <div className="mt-8 p-6 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
                  <div className="flex flex-col gap-1">
                    <h3 className="text-base font-semibold text-text-primary">
                      Have questions regarding our terms?
                    </h3>
                    <p className="text-xs text-text-secondary">
                      Our legal and compliance team typically responds within 1 business day.
                    </p>
                  </div>
                  <a
                    className="px-5 py-2.5 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer shadow-xs"
                    href="mailto:legal@onecloud.app"
                  >
                    Contact Legal Team
                  </a>
                </div>
              </article>
            </div>
          </div>

          {/* Related Legal Policies Strip */}
          <section className="w-full bg-surface-container py-12 px-6 lg:px-12 mt-12 border-t border-border">
            <div className="max-w-7xl mx-auto flex flex-col gap-6">
              <div className="flex flex-col gap-1">
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                  Compliance &amp; Trust
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary">
                  Related Agreements &amp; Documentation
                </h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Privacy Policy Card */}
                <Link
                  href="/privacy"
                  className="group bg-surface p-6 rounded-xl hover:bg-surface-hover transition-colors flex flex-col justify-between gap-4 border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-primary border border-border">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-primary transition-colors">
                      Privacy Policy
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Read how we protect your metadata, index files safely, and never sell personal
                      identifiable records.
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted">Updated Dec 2024</span>
                </Link>

                {/* Security Whitepaper Card */}
                <Link
                  href="/security"
                  className="group bg-surface p-6 rounded-xl hover:bg-surface-hover transition-colors flex flex-col justify-between gap-4 border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-tertiary border border-border">
                      <Shield className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-tertiary transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-tertiary transition-colors">
                      Security Architecture
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      In-depth analysis of client-side encryption keys, token encapsulation, and MTProto
                      isolation.
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted">Version 2.1 Standard</span>
                </Link>

                {/* Acceptable Use Policy Card */}
                <Link
                  href="/acceptable-use"
                  className="group bg-surface p-6 rounded-xl hover:bg-surface-hover transition-colors flex flex-col justify-between gap-4 border border-border shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center text-secondary border border-border">
                      <FileCode className="w-5 h-5" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-secondary transition-colors" />
                  </div>
                  <div className="flex flex-col gap-1.5">
                    <h3 className="text-sm font-semibold text-text-primary group-hover:text-secondary transition-colors">
                      Acceptable Use Policy
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      Bandwidth utilization rules, automated bot limits, and community safety
                      guidelines for shared folders.
                    </p>
                  </div>
                  <span className="text-[11px] text-text-muted">Enforced Globally</span>
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
