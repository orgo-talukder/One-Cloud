'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  HelpCircle,
  Send,
  HardDrive,
  ShieldCheck,
  ArrowRight,
  Search,
  Upload,
  Lock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';

export default function HelpPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const faqs = [
    {
      q: 'How does One Cloud store my files in Telegram?',
      a: 'When you upload a file, One Cloud streams the raw file chunks directly into your personal Telegram "Saved Messages" chat using Telegram\'s official MTProto client protocol. Only the file metadata (name, size, folder path, and Telegram message ID) is cataloged in your private Firestore database.',
    },
    {
      q: 'What is the maximum file size limit?',
      a: 'Telegram MTProto supports up to 2,000 MB (2 GB) per single file for standard accounts. There is no aggregate storage ceiling; you can store hundreds of gigabytes or terabytes across multiple files in your personal Telegram cloud.',
    },
    {
      q: 'Can anyone else see my files?',
      a: 'No. File payloads are stored in your own Telegram account\'s Saved Messages chat. Only your authenticated Telegram session has access to those message IDs. In addition, Firestore metadata is locked down with strict security rules enforcing user-level isolation.',
    },
    {
      q: 'What happens if I disconnect Telegram?',
      a: 'If you disconnect Telegram, One Cloud will pause syncing new uploads. However, all files previously stored remain 100% intact and accessible in your official Telegram mobile or desktop app.',
    },
    {
      q: 'Do I need custom API credentials?',
      a: 'No. One Cloud includes a default server gateway for immediate plug-and-play connection. If you are an advanced developer self-hosting your own bot, you can optionally input your own api_id and api_hash from my.telegram.org in the connection modal.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-14">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-brand-subtle text-primary border border-primary-container/30 text-xs font-semibold">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
            Knowledge Base & Support
          </div>
          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-text-primary">
            Help Center & FAQ
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
            Technical guides, connection walkthroughs, and answers to common questions about One Cloud.
          </p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-surface rounded-2xl border border-border p-6 hover:bg-surface-raised transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center text-primary mb-4 border border-border">
              <Send className="h-5 w-5 text-[#36AEEA]" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Telegram Connection</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Step-by-step instructions on phone verification, QR login, 2FA cloud passwords, and MTProto sessions.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 hover:bg-surface-raised transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center text-file-document mb-4 border border-border">
              <Upload className="h-5 w-5 text-file-document" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Uploads & Limits</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Managing large 2GB payloads, queue tracking, background uploads, and network resumption.
            </p>
          </div>

          <div className="bg-surface rounded-2xl border border-border p-6 hover:bg-surface-raised transition-colors shadow-xs">
            <div className="w-10 h-10 rounded-xl bg-brand-subtle flex items-center justify-center text-tertiary mb-4 border border-border">
              <ShieldCheck className="h-5 w-5 text-tertiary" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">Security & Rules</h3>
            <p className="text-xs text-text-secondary leading-relaxed">
              Understanding our zero-custody data model, Firestore security rules, and data retention guarantees.
            </p>
          </div>
        </div>

        {/* FAQ Accordion */}
        <div className="bg-surface rounded-2xl border border-border p-6 sm:p-8 space-y-4 shadow-sm">
          <h2 className="text-lg font-bold text-text-primary mb-4">Frequently Asked Questions</h2>
          <div className="divide-y divide-border/60">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="py-4">
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 cursor-pointer text-xs sm:text-sm font-semibold text-text-primary hover:text-primary transition-colors"
                  >
                    <span>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="h-4 w-4 shrink-0 text-text-muted" />
                    ) : (
                      <ChevronDown className="h-4 w-4 shrink-0 text-text-muted" />
                    )}
                  </button>
                  {isOpen && (
                    <p className="mt-2.5 text-xs text-text-secondary leading-relaxed animate-in fade-in duration-100">
                      {faq.a}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="text-center py-6">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 bg-primary-container hover:bg-brand-hover text-text-primary font-semibold text-xs rounded-xl shadow-xs transition-colors"
          >
            <span>Open Your Cloud Drive</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
