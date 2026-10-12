'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/firebase/auth-context';
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
  Download,
  Send,
  ChevronDown,
  FileText,
  Key,
  Compass,
  CheckCircle2,
  HelpCircle,
  Layers,
  Code2,
  MessageSquare,
  ExternalLink,
  RefreshCw,
  UserCheck,
  GitBranch,
} from 'lucide-react';

interface QuickJumpItem {
  id: string;
  label: string;
}

export default function AboutPage() {
  const { user } = useAuth();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeSection, setActiveSection] = useState<string>('what-is-one-cloud');

  const quickJumpItems: QuickJumpItem[] = [
    { id: 'what-is-one-cloud', label: 'What Is One Cloud' },
    { id: 'problem-and-mission', label: 'Problem & Mission' },
    { id: 'capabilities', label: 'What You Can Do' },
    { id: 'how-it-works', label: 'How It Works' },
    { id: 'principles', label: 'Product Principles' },
    { id: 'founder', label: 'Meet the Founder' },
    { id: 'vision', label: 'Vision & Open Source' },
    { id: 'privacy-security', label: 'Privacy & Security' },
    { id: 'support', label: 'FAQ & Support' },
  ];

  useEffect(() => {
    const handleScroll = () => {
      const scrollPosition = window.scrollY + 180;
      for (const item of quickJumpItems) {
        const el = document.getElementById(item.id);
        if (el) {
          const top = el.offsetTop;
          const height = el.offsetHeight;
          if (scrollPosition >= top && scrollPosition < top + height) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -128;
      const y = element.getBoundingClientRect().top + window.scrollY + yOffset;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const verifiedCapabilities = [
    {
      icon: <UploadCloud className="w-5 h-5 text-[#36AEEA]" />,
      title: 'Upload files',
      description:
        'Add supported files (up to 2 GB per file via Telegram boundaries) to your connected storage workflow using a multi-file upload drawer with progress tracking.',
    },
    {
      icon: <FolderTree className="w-5 h-5 text-primary" />,
      title: 'Organize files & folders',
      description:
        'Create nested folders, rename items, move files between directories, and navigate your workspace hierarchy with clear path breadcrumbs.',
    },
    {
      icon: <Search className="w-5 h-5 text-warning" />,
      title: 'Browse and search',
      description:
        'Switch between table and grid views, filter by file category, and locate items across your collection using filename and extension search.',
    },
    {
      icon: <Eye className="w-5 h-5 text-tertiary" />,
      title: 'Preview files in browser',
      description:
        'Open previews for supported images, video, audio, PDFs, and text or code documents inside a clean modal viewer without downloading first.',
    },
    {
      icon: <Download className="w-5 h-5 text-[#4F8CFF]" />,
      title: 'Download original files',
      description:
        'Retrieve your stored files in their original, uncompressed binary format directly through the application download route.',
    },
    {
      icon: <Star className="w-5 h-5 text-[#F2B84B]" />,
      title: 'Manage recent & starred items',
      description:
        'Quickly revisit recently uploaded files in the Recent view or mark important files and folders with a star for priority access.',
    },
    {
      icon: <Trash2 className="w-5 h-5 text-danger" />,
      title: 'Trash and restore',
      description:
        'Move unwanted items to Trash first, restore accidentally removed files back to their folder, or permanently delete them when you choose.',
    },
    {
      icon: <Send className="w-5 h-5 text-[#36AEEA]" />,
      title: 'Telegram connection management',
      description:
        'Link or disconnect your personal Telegram account from the workspace using QR login or phone verification with two-step verification (2FA) support.',
    },
  ];

  const howItWorksSteps = [
    {
      step: '01',
      title: 'Connect or sign in',
      description:
        'Sign in to your One Cloud account using supported email/password or Google authentication handled via Firebase Authentication.',
      icon: <Key className="w-5 h-5 text-primary" />,
    },
    {
      step: '02',
      title: 'Link your Telegram account',
      description:
        'When you are ready to store and sync files, connect your personal Telegram account so One Cloud can work with your Saved Messages storage.',
      icon: <Send className="w-5 h-5 text-[#36AEEA]" />,
    },
    {
      step: '03',
      title: 'Manage your files',
      description:
        'Use the available upload, folder creation, search, star, preview, move, trash, and download tools from a familiar drive interface.',
      icon: <HardDrive className="w-5 h-5 text-tertiary" />,
    },
    {
      step: '04',
      title: 'Return when needed',
      description:
        'Access your organized folder structure and file index again whenever you sign in from a supported desktop, tablet, or mobile browser.',
      icon: <Cloud className="w-5 h-5 text-[#4F8CFF]" />,
    },
  ];

  const productPrinciples = [
    {
      number: '01',
      title: 'Simplicity',
      description:
        'We aim to make common file-management actions easy to understand and complete without forcing users through complicated steps.',
    },
    {
      number: '02',
      title: 'Clarity',
      description:
        'We aim to provide understandable labels, honest storage usage metrics, and predictable navigation across every workspace view.',
    },
    {
      number: '03',
      title: 'Reliability',
      description:
        'We aim to make file operations, upload states, and connection statuses clear so users always know what is happening with their files.',
    },
    {
      number: '04',
      title: 'Respect for users',
      description:
        'We aim to explain account behavior, Telegram storage workflows, and privacy practices honestly without exaggerated marketing claims.',
    },
    {
      number: '05',
      title: 'Continuous improvement',
      description:
        'We aim to keep refining the product experience step by step based on real usage, careful testing, and constructive feedback.',
    },
  ];

  const confirmedIntentions = [
    'Continue improving One Cloud and addressing usability gaps.',
    'Work steadily toward a dependable, production-ready product.',
    'Try to keep the project open source and free to use as much as reasonably possible.',
    'If operating costs ever require paid plans, aim to price them affordably and below comparable cloud-storage alternatives.',
  ];

  const proposedExplorations = [
    'Improve file organization, folder workflows, and search usability.',
    'Improve application performance, transfer feedback, and overall reliability.',
    'Make the interface clearer and smoother across desktop, tablet, and mobile screens.',
    'Strengthen documentation and contributor workflows as the open-source codebase evolves.',
    'Gather real user feedback and use it to prioritize what to build or refine next.',
  ];

  const faqs = [
    {
      question: 'What is One Cloud and what problem does it aim to solve?',
      answer:
        'One Cloud is a web-based file-management workspace designed to help you organize, browse, search, preview, and access your stored files more easily. It was created to bridge the usability gap between storing files in Telegram Saved Messages and managing them through a structured, folder-based cloud drive interface.',
    },
    {
      question: 'How does Telegram fit into One Cloud?',
      answer:
        'When you connect your Telegram account, One Cloud transfers your uploaded files to your personal Telegram Saved Messages via MTProto while storing folder structure and file metadata (such as names, sizes, and parent folders) in Cloud Firestore. One Cloud is an independent application and is not affiliated with or endorsed by Telegram FZ-LLC.',
    },
    {
      question: 'Who founded One Cloud?',
      answer:
        'One Cloud was created by Argo Talukder (Founder & Owner). Argo started the project after looking for a convenient way to store files without hitting restrictive free-tier limits and realizing that Telegram Saved Messages needed a cleaner, dedicated interface for organizing and finding files.',
    },
    {
      question: 'Does One Cloud promise unlimited free storage?',
      answer:
        'No. We do not make unverified claims of unlimited storage. One Cloud displays the tracked byte usage of the files indexed in your drive workspace, and file transfers follow Telegram’s documented per-file size boundaries (up to 2 GB per file).',
    },
    {
      question: 'Is One Cloud open source and free to use?',
      answer:
        'The founder’s intention is to keep One Cloud open source and free to use for as much as is reasonably possible. Because running a reliable web service can involve real operating costs, if paid plans ever become necessary in the future, the goal is to keep them affordable and priced below comparable alternatives.',
    },
    {
      question: 'What happens to my files if I disconnect my Telegram account?',
      answer:
        'Files uploaded through your connected Telegram workflow are sent to your personal Telegram Saved Messages. If you disconnect your Telegram session from One Cloud, the files already stored in your Telegram Saved Messages remain in your Telegram account.',
    },
  ];

  return (
    <div className="min-h-screen bg-canvas text-text-primary font-body-md antialiased selection:bg-brand-subtle selection:text-primary flex flex-col transition-colors">
      <Navbar />

      <main className="w-full pt-16 bg-canvas flex-1">
        {/* 1. HERO — ABOUT ONE CLOUD */}
        <section className="relative w-full overflow-hidden px-6 lg:px-12 pt-14 pb-16 md:pt-20 md:pb-20 border-b border-border">
          <div className="pointer-events-none absolute -top-40 left-1/2 -translate-x-1/2 w-[680px] h-[320px] bg-primary-container/10 blur-[120px] rounded-full" />

          <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
            <div className="flex items-center gap-2 text-xs font-semibold text-primary tracking-wide mb-4">
              <span>About One Cloud</span>
              <span aria-hidden="true" className="text-text-muted">·</span>
              <span className="text-text-secondary font-normal">Product Overview &amp; Founder Story</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-[44px] md:leading-[52px] font-bold text-text-primary tracking-tight max-w-3xl text-balance">
              Simple, Organized File Management Built Around Your Workflow.
            </h1>

            <p className="text-base sm:text-lg text-text-secondary max-w-2xl mt-5 leading-relaxed">
              One Cloud is a file-management experience designed to help you keep your digital files
              organized and easier to access. Our goal is to make everyday file management feel
              simple, clear, and convenient.
            </p>

            {/* Primary & Secondary CTAs */}
            <div className="flex flex-wrap items-center justify-center gap-3.5 mt-8">
              {user ? (
                <Link
                  href="/app"
                  className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  <HardDrive className="w-4 h-4" />
                  <span>Open Your Drive</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <Link
                  href="/signup"
                  className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-sm font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-colors shadow-xs whitespace-nowrap shrink-0"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              )}

              <button
                type="button"
                onClick={() => scrollToSection('founder')}
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-lg text-sm font-medium bg-surface text-text-primary hover:bg-surface-hover border border-border transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <UserCheck className="w-4 h-4 text-primary" />
                <span>Meet the Founder</span>
              </button>

              <Link
                href="/help"
                className="inline-flex items-center justify-center gap-2 px-5 h-11 rounded-lg text-sm font-medium bg-surface text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-border transition-colors whitespace-nowrap shrink-0"
              >
                <HelpCircle className="w-4 h-4 text-text-muted" />
                <span>Help &amp; Support</span>
              </Link>
            </div>

            {/* Key Factual Summary Strip */}
            <div className="mt-12 w-full grid grid-cols-2 lg:grid-cols-4 gap-3 max-w-4xl pt-6 border-t border-border/60 text-left">
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs text-text-muted">Core Purpose</div>
                <div className="text-sm font-semibold text-text-primary mt-1">
                  Organized Cloud Drive UI
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Folders, search, previews &amp; stars
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs text-text-muted">Storage Workflow</div>
                <div className="text-sm font-semibold text-[#36AEEA] mt-1">
                  Telegram Saved Messages
                </div>
                <div className="text-xs text-text-secondary mt-0.5 tabular-nums">
                  Up to 2 GB per file limit
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs text-text-muted">Account &amp; Index</div>
                <div className="text-sm font-semibold text-text-primary mt-1">
                  Firebase Auth &amp; Firestore
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Per-user isolated metadata
                </div>
              </div>
              <div className="p-4 rounded-xl bg-surface border border-border">
                <div className="text-xs text-text-muted">Founder &amp; Owner</div>
                <div className="text-sm font-semibold text-primary mt-1">
                  Argo Talukder
                </div>
                <div className="text-xs text-text-secondary mt-0.5">
                  Open &amp; accessible by intention
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* QUICK-JUMP SECTION NAVIGATION BAR */}
        <div className="sticky top-16 z-30 w-full bg-sidebar/95 backdrop-blur-md border-b border-border">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 py-2.5 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {quickJumpItems.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-brand-subtle text-primary border border-primary/25 font-semibold'
                      : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover border border-transparent'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* 2. WHAT IS ONE CLOUD? */}
        <section id="what-is-one-cloud" className="w-full py-16 lg:py-20 bg-canvas scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Column: Plain-English Product Explanation */}
              <div className="lg:col-span-7 flex flex-col justify-between bg-surface rounded-xl p-6 sm:p-8 border border-border">
                <div>
                  <div className="text-xs font-semibold text-primary mb-2">
                    01. Product Overview
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    What Is One Cloud?
                  </h2>

                  <div className="mt-4 space-y-4 text-sm sm:text-[15px] text-text-secondary leading-relaxed">
                    <p>
                      One Cloud brings key file-management tasks into one place. It is designed to
                      help users organize files, navigate folders, and work with their stored content
                      through a straightforward web interface.
                    </p>
                    <p>
                      Where connected, One Cloud works alongside your personal Telegram account as
                      part of its storage workflow: uploaded file bytes are sent to your Telegram
                      Saved Messages, while One Cloud uses Firebase Authentication and Cloud
                      Firestore to maintain your account access, folder hierarchy, starred items,
                      and search index.
                    </p>
                    <p>
                      This separation lets you browse and organize your files like a conventional
                      cloud drive instead of scrolling through a long chronological chat thread.
                    </p>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border flex flex-wrap items-center justify-between gap-4 text-xs text-text-muted">
                  <span>Independent web application · Not affiliated with Telegram FZ-LLC</span>
                  <Link
                    href="/how-it-works"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1"
                  >
                    <span>See detailed workflow</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Right Column: How Responsibilities & Boundaries Work */}
              <div className="lg:col-span-5 flex flex-col justify-between bg-surface rounded-xl p-6 sm:p-8 border border-border">
                <div>
                  <div className="text-xs font-semibold text-text-secondary mb-2">
                    Clear Service Roles &amp; Important Boundaries
                  </div>
                  <h3 className="text-lg font-bold text-text-primary">
                    Which Service Handles Each Part
                  </h3>
                  <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                    Understanding how One Cloud works helps you know what to expect before relying on it:
                  </p>

                  <div className="mt-5 space-y-4">
                    <div className="p-3.5 rounded-lg bg-surface-raised border border-border">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Layers className="w-4 h-4 text-primary shrink-0" />
                        <span>One Cloud Web Interface</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Provides the folder tree, upload queue, search bar, file previews, starred
                        list, and trash management controls in your browser.
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-raised border border-border">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Database className="w-4 h-4 text-tertiary shrink-0" />
                        <span>Firebase Auth &amp; Firestore</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Manages account sign-in and stores structural metadata (file names, sizes,
                        folder paths, and encrypted Telegram session strings).
                      </p>
                    </div>

                    <div className="p-3.5 rounded-lg bg-surface-raised border border-border">
                      <div className="flex items-center gap-2 text-xs font-semibold text-text-primary">
                        <Send className="w-4 h-4 text-[#36AEEA] shrink-0" />
                        <span>Telegram Saved Messages</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1 leading-relaxed">
                        Stores the underlying uploaded file bytes in your personal Telegram account,
                        subject to Telegram&apos;s platform rules and 2 GB per-file limit.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border text-xs text-text-muted leading-relaxed">
                  One Cloud does not own or operate Telegram&apos;s servers and does not claim
                  unlimited storage.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 3. THE PROBLEM WE WANT TO SOLVE & OUR MISSION */}
        <section
          id="problem-and-mission"
          className="w-full py-16 lg:py-20 bg-sidebar/60 border-y border-border scroll-mt-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-12">
              <div className="text-xs font-semibold text-primary mb-2">
                02. Problem &amp; Mission
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                The Problem We Want to Solve
              </h2>
              <p className="text-sm sm:text-base text-text-secondary mt-3 leading-relaxed">
                Digital files are useful only when you can find and manage them when you need them.
                As file collections grow, keeping everything organized can become frustrating. One
                Cloud aims to make common file-management tasks more straightforward by bringing
                supported actions into a clear, organized interface.
              </p>
            </div>

            {/* 3-Column Realistic Problem Breakdown */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-text-muted mb-2">Challenge 01</div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Growing File Collections Become Hard to Navigate
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    When documents, media, and archives accumulate without a clean folder structure,
                    finding a specific file months later takes unnecessary time and effort.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/60 text-xs text-text-muted">
                  Need: Clear hierarchy &amp; fast search
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-text-muted mb-2">Challenge 02</div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    Chat Feeds Are Not Built Like File Managers
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    While Telegram&apos;s Saved Messages is convenient for keeping files in one place,
                    a chronological message stream lacks nested folders, path breadcrumbs, and drive-style
                    file organization.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/60 text-xs text-text-muted">
                  Need: Dedicated drive-style organization
                </div>
              </div>

              <div className="p-6 rounded-xl bg-surface border border-primary/35 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-mono text-primary mb-2">Our Approach</div>
                  <h3 className="text-base font-semibold text-text-primary mb-2">
                    A Focused, User-Friendly File Interface
                  </h3>
                  <p className="text-xs sm:text-sm text-text-secondary leading-relaxed">
                    One Cloud pairs your personal Telegram storage workflow with a clean web drive
                    so you can organize folders, search by name, star key items, and preview files
                    in one consistent place.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-border/60 text-xs text-tertiary font-medium">
                  Result: Practical everyday file management
                </div>
              </div>
            </div>

            {/* Our Mission Banner Card */}
            <div className="p-6 sm:p-8 rounded-xl bg-surface-raised border border-border flex flex-col lg:flex-row lg:items-center justify-between gap-6">
              <div className="max-w-3xl">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-primary mb-2">
                  <Compass className="w-4 h-4" />
                  <span>Our Mission</span>
                </div>
                <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  Our mission is to make file management simpler and more approachable.
                </h3>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  We want users to spend less time navigating confusing workflows and more time
                  working with the files that matter to them.
                </p>
              </div>
              <div className="shrink-0">
                <Link
                  href={user ? '/app' : '/signup'}
                  className="inline-flex items-center justify-center gap-2 px-5 h-10 rounded-lg text-xs font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-colors whitespace-nowrap"
                >
                  <span>{user ? 'Go to Workspace' : 'Explore One Cloud'}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* 4. WHAT YOU CAN DO WITH ONE CLOUD */}
        <section id="capabilities" className="w-full py-16 lg:py-20 bg-canvas scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="text-xs font-semibold text-primary mb-2">
                  03. Current Product Capabilities
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  What You Can Do With One Cloud Today
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                Every capability listed below is implemented and available in the current One Cloud
                web application.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {verifiedCapabilities.map((item, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-xl bg-surface border border-border hover:border-border-strong transition-colors flex flex-col justify-between"
                >
                  <div>
                    <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center mb-4">
                      {item.icon}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-1.5">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 5. HOW IT WORKS */}
        <section
          id="how-it-works"
          className="w-full py-16 lg:py-20 bg-sidebar/60 border-y border-border scroll-mt-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-12">
              <div>
                <div className="text-xs font-semibold text-primary mb-2">
                  04. User Journey
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  How It Works in Four Simple Steps
                </h2>
              </div>
              <p className="text-xs sm:text-sm text-text-secondary max-w-md">
                A straightforward flow from signing in to organizing and accessing your stored files.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {howItWorksSteps.map((item) => (
                <div
                  key={item.step}
                  className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-4">
                      <span className="text-xs font-mono font-bold text-primary tabular-nums">
                        Step {item.step}
                      </span>
                      <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">
                      {item.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {item.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 6. OUR PRODUCT PRINCIPLES / WHAT WE VALUE */}
        <section id="principles" className="w-full py-16 lg:py-20 bg-canvas scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-12">
              <div className="text-xs font-semibold text-primary mb-2">
                05. What We Value
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Our Product Principles
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-2.5 leading-relaxed">
                These standards guide how we design, build, and communicate about One Cloud.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-5">
              {productPrinciples.map((principle) => (
                <div
                  key={principle.number}
                  className="p-5 rounded-xl bg-surface border border-border flex flex-col justify-between"
                >
                  <div>
                    <div className="text-xs font-mono font-semibold text-primary tabular-nums mb-2">
                      {principle.number}
                    </div>
                    <h3 className="text-sm font-semibold text-text-primary mb-2">
                      {principle.title}
                    </h3>
                    <p className="text-xs text-text-secondary leading-relaxed">
                      {principle.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 7. MEET THE FOUNDER & ORIGIN STORY (ARGO TALUKDER) */}
        <section
          id="founder"
          className="w-full py-16 lg:py-24 bg-sidebar/70 border-y border-border scroll-mt-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            {/* Section A: Founder Introduction */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
              {/* Left Column: Stylized Founder Monogram & Identity Card */}
              <div className="lg:col-span-4 bg-surface rounded-xl p-6 sm:p-8 border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-4 mb-6">
                    <div
                      aria-hidden="true"
                      className="w-16 h-16 rounded-2xl bg-brand-subtle border border-primary/30 flex items-center justify-center text-primary font-bold text-xl tracking-tight shrink-0 shadow-inner"
                    >
                      AT
                    </div>
                    <div>
                      <div className="text-xs font-medium text-primary">
                        Founder &amp; Owner
                      </div>
                      <h3 className="text-xl font-bold text-text-primary tracking-tight">
                        Argo Talukder
                      </h3>
                      <div className="text-xs text-text-muted mt-0.5">
                        One Cloud Personal Drive
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3 pt-4 border-t border-border text-xs">
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-text-muted">Role</span>
                      <span className="text-text-primary font-medium text-right">
                        Founder &amp; Owner
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-text-muted">Core Motivation</span>
                      <span className="text-text-primary font-medium text-right">
                        Accessible File Organization
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-text-muted">Long-Term Goal</span>
                      <span className="text-text-primary font-medium text-right">
                        Production-Ready Product
                      </span>
                    </div>
                    <div className="flex items-start justify-between gap-4">
                      <span className="text-text-muted">Project Values</span>
                      <span className="text-tertiary font-medium text-right">
                        Open &amp; Affordable by Intention
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-5 border-t border-border">
                  <div className="text-xs text-text-muted mb-3">
                    Public Repository &amp; Feedback
                  </div>
                  <div className="flex flex-wrap items-center gap-2.5">
                    <a
                      href="https://github.com/orgo-talukder/One-Cloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border text-xs font-medium transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      <span>GitHub Repository</span>
                      <ExternalLink className="w-3 h-3 text-text-muted" />
                    </a>
                    <Link
                      href="/help"
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border text-xs font-medium transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-tertiary" />
                      <span>Share Feedback</span>
                    </Link>
                  </div>
                </div>
              </div>

              {/* Right Column: Meet the Founder & Why I Started One Cloud */}
              <div className="lg:col-span-8 bg-surface rounded-xl p-6 sm:p-8 border border-border flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-primary mb-2">
                    THE PERSON BEHIND ONE CLOUD
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                    Meet the Founder
                  </h2>
                  <p className="text-xs sm:text-sm text-text-muted mt-1">
                    Argo Talukder · Founder &amp; Owner, One Cloud
                  </p>

                  <p className="mt-4 text-sm sm:text-[15px] text-text-secondary leading-relaxed">
                    I started One Cloud with a simple goal: make managing stored files feel more
                    organized and approachable. The idea came from my own search for a convenient
                    way to keep files and find them again without dealing with an interface that
                    felt difficult to navigate. What began as a personal attempt to improve that
                    experience has grown into a project I want to keep developing into a reliable,
                    production-ready product.
                  </p>

                  {/* Section B: The Origin Story */}
                  <div className="mt-8 pt-6 border-t border-border">
                    <h3 className="text-lg sm:text-xl font-bold text-text-primary tracking-tight">
                      Why I Started One Cloud
                    </h3>
                    <div className="mt-3 space-y-3.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                      <p>
                        When I was looking for a convenient way to store files without running into
                        the free-storage limits I had encountered, I started exploring alternatives.
                        I began using Telegram&apos;s Saved Messages to keep files in one place. It
                        was useful, but I found the experience less convenient for organizing and
                        finding files than I wanted from a dedicated file-management interface.
                      </p>
                      <p>
                        I wanted a simpler way to browse, organize, and locate stored files—an
                        experience that felt closer to using a purpose-built cloud-storage product.
                        That gap inspired me to start building One Cloud.
                      </p>
                      <p>
                        One Cloud is my attempt to make that experience more user-friendly. The goal
                        is not simply to store files, but to make managing them feel clearer and
                        easier.
                      </p>
                    </div>
                  </div>

                  {/* Section C: The Problem and the Purpose */}
                  <div className="mt-6 pt-6 border-t border-border">
                    <h3 className="text-base sm:text-lg font-bold text-text-primary">
                      Making File Management Easier
                    </h3>
                    <p className="mt-2 text-xs sm:text-sm text-text-secondary leading-relaxed">
                      Files are most useful when people can find and manage them without unnecessary
                      friction. One Cloud is being built around that idea: provide a more
                      approachable interface for working with stored files and make everyday file
                      management simpler. The product will continue to evolve as I improve its
                      experience, learn from real use, and work toward a more complete and reliable
                      release.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 8. FOUNDER'S VISION, OPEN SOURCE INTENTIONS, FUTURE DIRECTION & NOTE FROM ARGO */}
        <section id="vision" className="w-full py-16 lg:py-20 bg-canvas scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12 space-y-8">
            {/* Top Row: Section D (Vision) + Section E (Open Source & Affordability) */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Section D: The Founder's Vision */}
              <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-primary mb-2">
                    Long-Term Direction
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    Building One Cloud for the Long Term
                  </h2>
                  <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    <p>
                      My long-term goal is to bring One Cloud to a production-ready level. That
                      means continuing to improve the product carefully, focusing on a useful user
                      experience and the reliability needed for people to depend on it.
                    </p>
                    <p>
                      I know that getting there takes ongoing work. I want to keep learning,
                      improving the implementation, addressing problems, and making thoughtful
                      decisions about what the product needs next.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border text-xs text-text-muted">
                  Focused on usability, reliability, performance, and maintainability.
                </div>
              </div>

              {/* Section E: Open Source and Accessibility Intentions */}
              <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-tertiary mb-2">
                    Openness &amp; Affordability
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    Open by Intention. Accessible by Design.
                  </h2>
                  <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    <p>
                      I want One Cloud to remain open source and free to use for as much as I
                      reasonably can. I believe useful tools should be accessible to people who do
                      not have a large budget.
                    </p>
                    <p>
                      Keeping a service reliable can involve real operating costs. If paid plans
                      ever become necessary, my intention is to keep them affordable and priced
                      below comparable cloud-storage alternatives wherever the economics allow. That
                      is a goal I want to work toward, not a promise of a specific price or a
                      guarantee that every feature will always be free.
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between gap-4 text-xs text-text-muted">
                  <span>Transparent commitment to everyday accessibility</span>
                  <a
                    href="https://github.com/orgo-talukder/One-Cloud"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline font-medium inline-flex items-center gap-1 shrink-0"
                  >
                    <Code2 className="w-3.5 h-3.5" />
                    <span>View Source on GitHub</span>
                  </a>
                </div>
              </div>
            </div>

            {/* Middle Row: Section F — What I Hope to Improve Next (Confirmed vs Proposed) */}
            <div className="p-6 sm:p-8 rounded-xl bg-surface border border-border">
              <div className="max-w-3xl mb-6">
                <div className="text-xs font-semibold text-primary mb-1.5">
                  Future Direction &amp; Work in Progress
                </div>
                <h2 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                  What I Hope to Improve Next
                </h2>
                <p className="text-xs sm:text-sm text-text-secondary mt-2 leading-relaxed">
                  One Cloud is an ongoing project, and I intend to keep improving it. My broader
                  priority is to move toward a production-ready experience and make file management
                  feel more natural and dependable. Possible areas for future improvement include
                  clearer file organization, easier discovery, performance and reliability
                  improvements, and a better experience across screen sizes. These are directions I
                  may explore as the project develops; they are not a published roadmap or promises
                  of specific features or release dates.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border">
                {/* Confirmed Intentions */}
                <div className="p-5 rounded-lg bg-surface-raised border border-border">
                  <div className="flex items-center gap-2 text-xs font-semibold text-tertiary mb-3">
                    <CheckCircle2 className="w-4 h-4 shrink-0" />
                    <span>Confirmed Founder Intentions</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-text-secondary">
                    {confirmedIntentions.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-tertiary font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Proposed Areas to Explore */}
                <div className="p-5 rounded-lg bg-surface-raised border border-border">
                  <div className="flex items-center gap-2 text-xs font-semibold text-primary mb-3">
                    <RefreshCw className="w-4 h-4 shrink-0" />
                    <span>Possible Areas to Explore (Not Fixed Commitments)</span>
                  </div>
                  <ul className="space-y-2.5 text-xs text-text-secondary">
                    {proposedExplorations.map((item, i) => (
                      <li key={i} className="flex items-start gap-2.5">
                        <span className="text-primary font-bold mt-0.5">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Bottom Row: Section G (A Note from Argo) + Section H (Connect) */}
            <div className="p-6 sm:p-8 rounded-xl bg-surface-raised border border-border-strong">
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                <div className="lg:col-span-8">
                  <div className="text-xs font-semibold text-primary mb-1.5">
                    Personal Message
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                    A Note from Argo
                  </h3>
                  <div className="mt-4 space-y-3 text-xs sm:text-sm text-text-secondary leading-relaxed">
                    <p>
                      I started One Cloud because I wanted a file-management experience that felt
                      easier to use. I am building it with the intention of making it more useful,
                      more reliable, and more accessible over time.
                    </p>
                    <p>
                      There is still work to do, and I do not want to pretend the product is
                      finished before it is ready. My focus is to keep improving it, listen to
                      useful feedback, and make responsible decisions about its future. If you try
                      One Cloud and have suggestions, thoughtful feedback will help guide that work.
                    </p>
                    <p>
                      Thank you for taking the time to learn about the project and the person
                      building it.
                    </p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-border/60">
                    <div className="text-sm font-bold text-text-primary">
                      — Argo Talukder
                    </div>
                    <div className="text-xs text-text-muted">
                      Founder &amp; Owner, One Cloud
                    </div>
                  </div>
                </div>

                {/* Section H: Connect Block */}
                <div className="lg:col-span-4 p-5 rounded-xl bg-surface border border-border flex flex-col justify-between">
                  <div>
                    <h4 className="text-base font-bold text-text-primary">
                      Connect &amp; Share Feedback
                    </h4>
                    <p className="text-xs text-text-secondary mt-2 leading-relaxed">
                      I welcome constructive feedback and ideas that can help improve One Cloud.
                      Explore our Help Center or visit the GitHub repository to share suggestions.
                    </p>
                  </div>
                  <div className="mt-5 flex flex-col gap-2.5">
                    <Link
                      href="/help"
                      className="w-full h-10 px-4 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold flex items-center justify-center gap-2 transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Share Feedback &amp; Help Center</span>
                    </Link>
                    <a
                      href="https://github.com/orgo-talukder/One-Cloud"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full h-10 px-4 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary border border-border text-xs font-medium flex items-center justify-center gap-2 transition-colors"
                    >
                      <GitBranch className="w-3.5 h-3.5 text-primary" />
                      <span>GitHub (orgo-talukder/One-Cloud)</span>
                      <ExternalLink className="w-3 h-3 text-text-muted" />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 9. PRIVACY AND SECURITY */}
        <section
          id="privacy-security"
          className="w-full py-16 lg:py-20 bg-sidebar/60 border-y border-border scroll-mt-28"
        >
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="max-w-3xl mb-10">
              <div className="text-xs font-semibold text-primary mb-2">
                06. Privacy &amp; Account Safety
              </div>
              <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Privacy and Security
              </h2>
              <p className="text-xs sm:text-sm text-text-secondary mt-3 leading-relaxed">
                We take account and file privacy seriously. We aim to explain clearly how One Cloud
                handles account access and file-related workflows. For detailed information about
                data collection, use, storage, and your available choices, please read our Privacy
                Policy.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* What One Cloud Indexes in Firestore */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-primary">
                    <Database className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-text-primary">
                      Account &amp; Metadata Handling (Firebase)
                    </h3>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2.5 leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Authentication:</strong> Sign-in is
                        handled through Firebase Authentication (Email/Password and Google sign-in).
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Workspace Index:</strong> Cloud
                        Firestore stores your folder hierarchy, file names, byte sizes, starred
                        flags, and trash status under your authenticated user ID.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Session Protection:</strong> Connected
                        Telegram session strings are encrypted server-side using AES-256-GCM before
                        being stored.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">Per-UID Firestore security rules</span>
                  <Link href="/privacy" className="text-primary hover:underline font-medium">
                    Read Privacy Policy &rarr;
                  </Link>
                </div>
              </div>

              {/* How File Storage Works with Telegram */}
              <div className="p-6 rounded-xl bg-surface border border-border flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2.5 mb-4 text-tertiary">
                    <Lock className="w-5 h-5" />
                    <h3 className="text-sm font-bold text-text-primary">
                      File Workflow &amp; Policy Transparency
                    </h3>
                  </div>
                  <ul className="text-xs text-text-secondary space-y-2.5 leading-relaxed">
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Telegram Storage Workflow:</strong>{' '}
                        When connected, uploaded file payloads are transmitted to your personal
                        Telegram Saved Messages via MTProto rather than stored in a permanent local
                        disk bucket on our web server.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">User Control:</strong> You can unlink
                        your Telegram session or delete indexed items from your One Cloud workspace
                        at any time through Settings.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <ShieldCheck className="w-4 h-4 text-tertiary shrink-0 mt-0.5" />
                      <span>
                        <strong className="text-text-primary">Published Legal Policies:</strong> Review
                        our Security page, Privacy Policy, Terms of Service, and Acceptable Use
                        Policy for complete details.
                      </span>
                    </li>
                  </ul>
                </div>
                <div className="mt-6 pt-4 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-text-muted">Architecture &amp; compliance docs</span>
                  <Link href="/security" className="text-tertiary hover:underline font-medium">
                    View Security Details &rarr;
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ, CONTACT & SUPPORT */}
        <section id="support" className="w-full py-16 lg:py-20 bg-canvas scroll-mt-28">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
              {/* Left 7 Cols: Interactive FAQ */}
              <div className="lg:col-span-7">
                <div className="text-xs font-semibold text-primary mb-2">
                  07. Frequently Asked Questions
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-6">
                  Common Questions About One Cloud
                </h2>

                <div className="space-y-3">
                  {faqs.map((faq, idx) => (
                    <div
                      key={idx}
                      className="rounded-xl border border-border bg-surface overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(idx)}
                        className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 hover:bg-surface-hover/50 transition-colors cursor-pointer"
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
              </div>

              {/* Right 5 Cols: Contact & Support Channels */}
              <div className="lg:col-span-5 flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold text-primary mb-2">
                    08. Contact &amp; Support
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-3">
                    Need Help or Have Questions?
                  </h2>
                  <p className="text-xs sm:text-sm text-text-secondary mb-6 leading-relaxed">
                    Use the resources below for account guidance, technical documentation, privacy
                    information, or project feedback.
                  </p>

                  <div className="space-y-4">
                    <div className="p-5 rounded-xl bg-surface border border-border">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                        <HelpCircle className="w-4 h-4 text-primary shrink-0" />
                        <span>Help Center &amp; Guides</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        Find answers on connecting Telegram, organizing folders, uploading files,
                        and troubleshooting common issues.
                      </p>
                      <Link
                        href="/help"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Visit Help Center</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </div>

                    <div className="p-5 rounded-xl bg-surface border border-border">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                        <FileText className="w-4 h-4 text-tertiary shrink-0" />
                        <span>Privacy, Terms &amp; Security</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        Read our published policies covering account data, session encryption,
                        acceptable use, and service terms.
                      </p>
                      <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium">
                        <Link href="/privacy" className="text-primary hover:underline">
                          Privacy Policy
                        </Link>
                        <Link href="/terms" className="text-primary hover:underline">
                          Terms of Service
                        </Link>
                        <Link href="/security" className="text-primary hover:underline">
                          Security
                        </Link>
                      </div>
                    </div>

                    <div className="p-5 rounded-xl bg-surface border border-border">
                      <div className="flex items-center gap-2.5 text-sm font-semibold text-text-primary">
                        <GitBranch className="w-4 h-4 text-[#36AEEA] shrink-0" />
                        <span>GitHub Project Repository</span>
                      </div>
                      <p className="text-xs text-text-secondary mt-1.5 leading-relaxed">
                        Explore the project repository maintained by founder Argo Talukder or submit
                        constructive suggestions and issue reports.
                      </p>
                      <a
                        href="https://github.com/orgo-talukder/One-Cloud"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                      >
                        <span>Open GitHub Repository</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* 11. FINAL CALL TO ACTION */}
        <section className="w-full py-16 bg-sidebar/60 border-t border-border">
          <div className="max-w-5xl mx-auto px-6 lg:px-12">
            <div className="rounded-2xl bg-surface border border-border p-8 sm:p-12 text-center shadow-lg">
              <div className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-xl bg-surface-raised border border-border flex items-center justify-center text-primary mb-4">
                  <Cloud className="w-6 h-6 text-primary" />
                </div>

                <h2 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                  Make file management feel simpler
                </h2>

                <p className="mt-3 max-w-xl text-xs sm:text-sm text-text-secondary leading-relaxed">
                  Explore One Cloud and see whether its available tools fit your everyday file
                  organization workflow.
                </p>

                <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                  {user ? (
                    <Link
                      href="/app"
                      className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-colors shadow-xs"
                    >
                      <HardDrive className="w-4 h-4" />
                      <span>Open Your Drive</span>
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                  ) : (
                    <>
                      <Link
                        href="/signup"
                        className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-semibold bg-primary-container hover:bg-brand-hover text-text-primary transition-colors shadow-xs"
                      >
                        <span>Get Started</span>
                        <ArrowRight className="w-4 h-4" />
                      </Link>
                      <Link
                        href="/login"
                        className="inline-flex items-center justify-center gap-2 px-6 h-11 rounded-lg text-xs font-medium bg-surface-raised text-text-primary hover:bg-surface-hover border border-border transition-colors"
                      >
                        <span>Sign In</span>
                      </Link>
                    </>
                  )}
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
