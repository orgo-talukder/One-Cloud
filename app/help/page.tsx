'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import {
  Search,
  Rocket,
  FolderUp,
  Send,
  Eye,
  ShieldCheck,
  RotateCcw,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  Terminal,
  Shield,
  Layers,
} from 'lucide-react';

interface FaqItem {
  id: number;
  question: string;
  answer: string;
  answerHighlight?: string;
  keywords: string[];
}

interface CategoryCard {
  id: string;
  title: string;
  description: string;
  countLabel: string;
  icon: React.ReactNode;
  iconBg: string;
  hoverColor: string;
  keywords: string[];
}

export default function HelpPage() {
  const [searchQuery, setSearchQuery] = useState('');
  const [openFaqId, setOpenFaqId] = useState<number | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const categories: CategoryCard[] = [
    {
      id: 'getting-started',
      title: 'Getting Started',
      description:
        'Account provisioning, granting Bot session permissions, and performing your first cross-platform workspace synchronization.',
      countLabel: '8 comprehensive guides',
      icon: <Rocket className="w-6 h-6 text-primary" />,
      iconBg: 'bg-brand-subtle',
      hoverColor: 'group-hover:text-primary',
      keywords: ['account', 'provisioning', 'bot', 'session', 'first', 'sync', 'start'],
    },
    {
      id: 'uploading-organizing',
      title: 'Uploading & Organizing',
      description:
        'Drag-and-drop batch streams, navigating the 2GB per-file Telegram threshold, and managing complex nested directory hierarchies.',
      countLabel: '11 articles',
      icon: <FolderUp className="w-6 h-6 text-file-document" />,
      iconBg: 'bg-brand-subtle',
      hoverColor: 'group-hover:text-file-document',
      keywords: ['upload', 'drag', 'drop', '2gb', 'file', 'folders', 'organize', 'nested'],
    },
    {
      id: 'telegram-connection',
      title: 'Telegram Connection',
      description:
        'Linking your personal Saved Messages vault, safeguarding personal bot tokens, and configuring MTProto transport proxies.',
      countLabel: '6 security notes',
      icon: <Send className="w-6 h-6 text-[#36AEEA]" />,
      iconBg: 'bg-[#36AEEA]/15',
      hoverColor: 'group-hover:text-[#36AEEA]',
      keywords: ['telegram', 'saved messages', 'vault', 'bot token', 'mtproto', 'proxy', 'connect'],
    },
    {
      id: 'viewing-previews',
      title: 'Viewing & Previews',
      description:
        'Zero-transcode browser rendering for PDF documents, vector SVGs, MP4 containers, and syntax-highlighted source code.',
      countLabel: '9 media specs',
      icon: <Eye className="w-6 h-6 text-file-image" />,
      iconBg: 'bg-surface-raised',
      hoverColor: 'group-hover:text-file-image',
      keywords: ['preview', 'render', 'pdf', 'svg', 'mp4', 'code', 'player', 'view'],
    },
    {
      id: 'security-encryption',
      title: 'Security & Encryption',
      description:
        'Zero-knowledge metadata separation, client-side payload scrambling, and understanding distributed storage threat vectors.',
      countLabel: '14 protocols',
      icon: <ShieldCheck className="w-6 h-6 text-tertiary" />,
      iconBg: 'bg-tertiary/15',
      hoverColor: 'group-hover:text-tertiary',
      keywords: ['security', 'encryption', 'zero-knowledge', 'metadata', 'payload', 'privacy'],
    },
    {
      id: 'trash-recovery',
      title: 'Trash & Recovery',
      description:
        'Undoing metadata removals, managing retention windows, and handling permanent multi-chunk file purges.',
      countLabel: '5 runbooks',
      icon: <RotateCcw className="w-6 h-6 text-file-archive" />,
      iconBg: 'bg-brand-subtle',
      hoverColor: 'group-hover:text-file-archive',
      keywords: ['trash', 'recovery', 'restore', 'delete', 'purge', 'undo', 'retention'],
    },
  ];

  const faqs: FaqItem[] = [
    {
      id: 1,
      question: 'Where are my actual file bytes stored?',
      answer:
        'Your files are uploaded directly to your own Telegram account under Saved Messages via encrypted MTProto sessions. One Cloud stores only the directory structure, file names, tags, and index pointers in an isolated cloud Firestore metadata database. We never possess custody of your binary payload chunks.',
      keywords: ['bytes', 'stored', 'saved messages', 'mtproto', 'where', 'custody', 'server'],
    },
    {
      id: 2,
      question: 'What is the maximum file size I can upload?',
      answer:
        'Standard Telegram bot uploads natively support files up to 2 GB per single file. One Cloud does not impose arbitrary downsampling, hidden throttling, or paywalled transfer ceilings. If your personal Telegram account has Telegram Premium active, our direct client can seamlessly support files up to 4 GB.',
      keywords: ['maximum', 'file size', 'limit', '2gb', '4gb', 'premium', 'ceiling', 'capacity'],
    },
    {
      id: 3,
      question: 'What happens to my files if I disconnect One Cloud?',
      answer:
        "All file payloads remain completely intact, permanent, and accessible inside your personal Telegram account. Because raw files are written directly into your Saved Messages channel, you never lose access to your binary files even if you revoke One Cloud's access keys or delete your workspace index.",
      keywords: ['disconnect', 'delete', 'leave', 'access', 'intact', 'permanent', 'revoke'],
    },
    {
      id: 4,
      question: 'Are my files compressed when uploaded?',
      answer:
        'No, absolutely not. Files are dispatched strictly as raw, uncompressed binary document chunks (sendDocument primitive). Photos, video footage, sound stems, and archives retain 100% bit-for-bit cryptographic fidelity with zero transcoding loss.',
      keywords: ['compressed', 'compression', 'quality', 'senddocument', 'transcode', 'loss'],
    },
    {
      id: 5,
      question: 'How do I restore files moved to Trash?',
      answer:
        "Navigate to the Trash tab in your web workspace sidebar. Select any deleted file or folder and click Restore. One Cloud immediately re-attaches the item's metadata back into its original folder tree hierarchy without needing to re-upload any bytes.",
      keywords: ['restore', 'trash', 'recover', 'undelete', 'hierarchy', 'accidental'],
    },
  ];

  // Global ⌘K keyboard listener to focus the search input
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const toggleFaq = (id: number) => {
    setOpenFaqId((prev) => (prev === id ? null : id));
  };

  const handlePopularTopicClick = (term: string) => {
    setSearchQuery(term);
    searchInputRef.current?.focus();
  };

  const query = searchQuery.trim().toLowerCase();

  // Filter Categories
  const filteredCategories = categories.filter((cat) => {
    if (!query) return true;
    return (
      cat.title.toLowerCase().includes(query) ||
      cat.description.toLowerCase().includes(query) ||
      cat.keywords.some((k) => k.includes(query))
    );
  });

  // Filter FAQs
  const filteredFaqs = faqs.filter((faq) => {
    if (!query) return true;
    return (
      faq.question.toLowerCase().includes(query) ||
      faq.answer.toLowerCase().includes(query) ||
      faq.keywords.some((k) => k.includes(query))
    );
  });

  return (
    <div className="min-h-screen bg-canvas text-text-primary flex flex-col font-body-md antialiased selection:bg-brand-subtle selection:text-primary transition-colors">
      <Navbar />

      <main className="w-full pt-16 bg-canvas flex-1">
        <div className="flex flex-col w-full">
          {/* Interactive Support Center Hero */}
          <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-12 pb-16">
            <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
              {/* Tag Pill */}
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-raised border border-border shadow-xs mb-6">
                <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                <span className="text-xs font-semibold text-text-secondary tracking-widest uppercase">
                  Support &amp; Knowledge Base
                </span>
              </div>

              {/* Main Heading & Micro Typography */}
              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-text-primary mb-4 tracking-tight">
                How can we help you?
              </h1>
              <p className="text-sm sm:text-base text-text-secondary max-w-xl mb-10 leading-relaxed">
                Find guides, answers, and technical documentation for your Telegram-backed cloud drive.
              </p>

              {/* Search Input Container */}
              <div className="w-full max-w-[540px] relative shadow-md">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-text-muted">
                  <Search className="w-5 h-5 text-text-muted" />
                </div>
                <input
                  ref={searchInputRef}
                  id="kb-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search articles, setup guides, error codes... (e.g., MTProto, 2GB limit, restore)"
                  className="w-full h-12 pl-11 pr-14 rounded-xl bg-surface border border-border text-text-primary placeholder:text-text-muted text-sm shadow-inner outline-none transition-all focus:bg-surface-raised focus:border-focus-ring"
                />
                <div className="absolute inset-y-0 right-0 pr-3.5 flex items-center pointer-events-none">
                  <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border text-text-muted text-[11px] font-mono shadow-xs">
                    ⌘K
                  </kbd>
                </div>
              </div>

              {/* Quick Index Pill Links */}
              <div className="flex flex-wrap items-center justify-center gap-2 mt-6">
                <span className="text-xs text-text-muted">Popular topics:</span>
                <button
                  type="button"
                  onClick={() => handlePopularTopicClick('2GB')}
                  className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs border border-border/60 shadow-xs transition-all cursor-pointer"
                >
                  2GB Ceilings
                </button>
                <button
                  type="button"
                  onClick={() => handlePopularTopicClick('MTProto')}
                  className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs border border-border/60 shadow-xs transition-all cursor-pointer"
                >
                  MTProto Security
                </button>
                <button
                  type="button"
                  onClick={() => handlePopularTopicClick('restore')}
                  className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs border border-border/60 shadow-xs transition-all cursor-pointer"
                >
                  Trash Restore
                </button>
                <button
                  type="button"
                  onClick={() => handlePopularTopicClick('Saved Messages')}
                  className="px-2.5 py-1 rounded-full bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs border border-border/60 shadow-xs transition-all cursor-pointer"
                >
                  Saved Messages Vault
                </button>
                {query && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="px-2.5 py-1 rounded-full bg-primary-container text-text-primary text-xs font-semibold shadow-xs cursor-pointer"
                  >
                    Clear Filter
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* Technical Infrastructure Status Strip */}
          <section className="w-full px-6 lg:px-12 mb-12">
            <div className="max-w-7xl mx-auto rounded-xl bg-surface border border-border shadow-xs p-4 sm:p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-2.5 h-2.5 rounded-full bg-tertiary shadow-xs shrink-0 animate-pulse" />
                <div className="flex flex-col">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm text-text-primary font-semibold">
                      MTProto Gateway 4.19
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-tertiary/20 text-tertiary font-medium border border-tertiary/30">
                      All Systems Nominal
                    </span>
                  </div>
                  <span className="text-xs text-text-muted mt-0.5">
                    End-to-end multi-chunk Telegram session conduits operating at zero latency degradation.
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-6 text-text-secondary text-xs shrink-0">
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Chunk Relay:</span>
                  <span className="text-text-primary font-semibold">48ms avg</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-text-muted">Index Uptime:</span>
                  <span className="text-text-primary font-semibold">99.99%</span>
                </div>
              </div>
            </div>
          </section>

          {/* Knowledge Base Categories: 3x2 Grid */}
          <section className="w-full px-6 lg:px-12 mb-20">
            <div className="max-w-7xl mx-auto">
              <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
                <div>
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    Directory
                  </span>
                  <h2 className="text-2xl font-bold text-text-primary tracking-tight mt-1">
                    Help Categories
                  </h2>
                </div>
                <p className="text-xs text-text-secondary max-w-sm">
                  Technical references tailored specifically to One Cloud&apos;s zero-custody Telegram proxy architecture.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCategories.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => {
                      setSearchQuery(cat.title);
                      searchInputRef.current?.focus();
                    }}
                    className="category-card group rounded-2xl bg-surface border border-border p-6 shadow-xs hover:bg-surface-hover hover:border-primary/40 transition-all flex flex-col justify-between cursor-pointer"
                  >
                    <div>
                      <div
                        className={`w-12 h-12 rounded-xl ${cat.iconBg} border border-border/40 flex items-center justify-center mb-5 group-hover:scale-105 transition-transform shadow-xs`}
                      >
                        {cat.icon}
                      </div>
                      <h3
                        className={`text-base font-semibold text-text-primary ${cat.hoverColor} transition-colors mb-2`}
                      >
                        {cat.title}
                      </h3>
                      <p className="text-xs text-text-secondary leading-relaxed mb-6">
                        {cat.description}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-4 bg-surface-raised/40 -mx-6 -mb-6 px-6 py-3.5 rounded-b-2xl border-t border-border/40">
                      <span className="text-xs text-text-muted font-medium">{cat.countLabel}</span>
                      <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Interactive Accordion FAQ Section */}
          <section className="w-full px-6 lg:px-12 mb-20">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-10">
                <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                  Direct Answers
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mt-1">
                  Frequently Asked Questions
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-2">
                  Clear, unvarnished details regarding how One Cloud interfaces with Telegram infrastructure.
                </p>
              </div>

              <div className="flex flex-col gap-3" id="faq-accordion-list">
                {filteredFaqs.map((faq) => {
                  const isOpen = openFaqId === faq.id;
                  return (
                    <div
                      key={faq.id}
                      className={`faq-item rounded-xl bg-surface border border-border overflow-hidden shadow-xs transition-all ${
                        isOpen ? 'bg-surface-raised border-primary/30' : ''
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(faq.id)}
                        className="w-full flex items-center justify-between p-5 text-left transition-colors hover:bg-surface-hover focus:outline-none cursor-pointer"
                      >
                        <span className="text-sm font-semibold text-text-primary pr-4 flex items-center gap-3">
                          <span className="text-text-muted text-xs font-mono">
                            {String(faq.id).padStart(2, '0')}
                          </span>
                          <span>{faq.question}</span>
                        </span>
                        {isOpen ? (
                          <ChevronUp className="w-5 h-5 text-text-muted shrink-0 transition-transform duration-200" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-text-muted shrink-0 transition-transform duration-200" />
                        )}
                      </button>
                      {isOpen && (
                        <div className="px-5 pb-5 pt-1 text-text-secondary text-xs sm:text-sm leading-relaxed border-t border-border/40 bg-surface/50 animate-in fade-in duration-100">
                          <p>{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          {/* Technical Verification Card / Community Banner */}
          <section className="w-full px-6 lg:px-12 mb-20">
            <div className="max-w-5xl mx-auto rounded-2xl bg-surface border border-border p-8 sm:p-10 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
              <div className="flex flex-col gap-2 max-w-xl">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-file-document shrink-0" />
                  <span className="text-xs text-text-muted uppercase tracking-wider font-semibold">
                    Direct Verification
                  </span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Still need assistance?
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Explore our complete architectural schematics, inspect transparent system status probes, or audit the client-side cryptographic source.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-3 shrink-0">
                <Link
                  href="/how-it-works"
                  className="px-4 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Layers className="w-4 h-4 text-text-secondary" />
                  <span>How It Works</span>
                </Link>
                <Link
                  href="/security"
                  className="px-4 py-2.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary text-xs font-semibold border border-border shadow-xs transition-colors flex items-center gap-2 cursor-pointer"
                >
                  <Shield className="w-4 h-4 text-text-secondary" />
                  <span>Whitepaper</span>
                </Link>
                <div className="px-4 py-2.5 rounded-lg bg-primary-container text-text-primary hover:bg-brand-hover text-xs font-semibold shadow-xs transition-all flex items-center gap-2 cursor-pointer">
                  <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
                  <span>System Status</span>
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
