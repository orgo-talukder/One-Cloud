'use client';

import React from 'react';
import Link from 'next/link';
import {
  Cloud,
  ArrowRight,
  HardDrive,
  FolderTree,
  Upload,
  Search,
  Eye,
  Trash2,
  Send,
  ShieldCheck,
  CheckCircle2,
  Lock,
  Layers,
  Sparkles,
  Music,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Check,
  HelpCircle,
  Folder,
  Star,
  RefreshCw,
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/firebase/auth-context';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col selection:bg-sky-100 selection:text-sky-900">
      <Navbar />

      {/* 1. Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100 bg-linear-to-b from-slate-50/70 via-white to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          {/* Unboxed Brand Kicker */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-6">
            <Send className="h-3.5 w-3.5 text-sky-500" />
            <span>Turn Telegram into Your Unlimited Google Drive</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight text-balance">
            Unlimited Cloud Storage.
            <br />
            <span className="text-sky-600">Organized Like Google Drive.</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Telegram Saved Messages offers unlimited cloud storage, but lacks folders and organization.
            One Cloud gives you a beautiful web drive with nested folders, storage analytics, and instant media streaming.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? '/app' : '/login'}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <span>{user ? 'Open Your Drive' : 'Get Started Free'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="#how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Genuine Trust Markers */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-10 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Unlimited Telegram Cloud Storage</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Up to 2GB Single File Uploads</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>100% Free · No Subscription Caps</span>
            </div>
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>Stored in Your Private Saved Messages</span>
            </div>
          </div>

          {/* Interactive UI Showcase Frame */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 shadow-2xl bg-white overflow-hidden text-left">
            <div className="h-11 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                one-cloud.app/app · Cloud Command Dashboard
              </span>
              <div className="w-10" />
            </div>

            <div className="p-6 sm:p-8 bg-slate-50/50 space-y-6">
              {/* Top Drive Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-base font-bold text-slate-900">Personal Cloud Drive</h3>
                  <p className="text-xs text-slate-500">
                    Storage Used: <strong className="font-mono text-slate-800">4.2 GB</strong> of{' '}
                    <span className="text-emerald-600 font-semibold">Unlimited Telegram Storage</span>
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                    <span>Telegram Saved Messages Connected</span>
                  </span>
                </div>
              </div>

              {/* Real Storage Breakdown Meter Simulation */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-xs text-slate-600 font-medium">
                  <span>Storage by File Type</span>
                  <span className="font-mono text-[11px]">Videos · Images · Documents · Audio</span>
                </div>
                <div className="h-3.5 w-full bg-slate-200/70 rounded-full overflow-hidden flex gap-0.5 p-0.5">
                  <div style={{ width: '42%' }} className="h-full bg-purple-500 rounded-sm" title="Videos: 1.8 GB" />
                  <div style={{ width: '28%' }} className="h-full bg-sky-500 rounded-sm" title="Images: 1.2 GB" />
                  <div style={{ width: '18%' }} className="h-full bg-emerald-500 rounded-sm" title="Documents: 780 MB" />
                  <div style={{ width: '12%' }} className="h-full bg-pink-500 rounded-sm" title="Audio: 450 MB" />
                </div>
                <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-purple-500" />
                    <span>Videos (1.8 GB)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-sky-500" />
                    <span>Images (1.2 GB)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-emerald-500" />
                    <span>Documents (780 MB)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-pink-500" />
                    <span>Audio (450 MB)</span>
                  </span>
                </div>
              </div>

              {/* Sample Files Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
                    <Folder className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Projects & Work</p>
                    <p className="text-[10px] text-slate-400">18 files · Folder</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                    <VideoIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Vacation_4K.mp4</p>
                    <p className="text-[10px] text-slate-400 font-mono">1.2 GB · Video</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center shrink-0">
                    <ImageIcon className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Design_System.png</p>
                    <p className="text-[10px] text-slate-400 font-mono">4.8 MB · Image</p>
                  </div>
                </div>

                <div className="p-3.5 bg-white rounded-xl border border-slate-200 flex items-center gap-3 shadow-2xs">
                  <div className="h-9 w-9 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                    <FileText className="h-5 w-5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Report_2026.pdf</p>
                    <p className="text-[10px] text-slate-400 font-mono">2.4 MB · Document</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 2. The Problem & Solution: Why One Cloud? */}
      <section className="py-20 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">
              The Real Problem
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Telegram gives you free storage.
              <br />
              One Cloud gives you an actual Drive.
            </p>
            <p className="mt-3 text-sm text-slate-600">
              Anyone using Telegram Saved Messages knows the pain: thousands of files buried in an endless chat thread with zero folder organization.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Telegram Alone Card */}
            <div className="p-8 rounded-2xl border border-rose-200 bg-rose-50/30 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-rose-700 bg-rose-100/70 px-2.5 py-1 rounded-md">
                <span>Telegram Alone (Without One Cloud)</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                An Endless, Messy Chat Stream
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-600">
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>No folders or subfolders — all files sit in a single chaotic timeline.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>No storage analytics — you cannot see how many GBs of videos or images you have.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>Hard to browse on desktop browsers without opening the full desktop chat app.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-rose-500 font-bold shrink-0">✕</span>
                  <span>No Trash protection — deleted messages are immediately gone forever.</span>
                </li>
              </ul>
            </div>

            {/* One Cloud Solution Card */}
            <div className="p-8 rounded-2xl border border-emerald-200 bg-emerald-50/30 space-y-4">
              <div className="inline-flex items-center gap-2 text-xs font-bold text-emerald-800 bg-emerald-100/70 px-2.5 py-1 rounded-md">
                <span>With One Cloud Drive</span>
              </div>
              <h3 className="text-lg font-bold text-slate-900">
                Full Google Drive Organization & Power
              </h3>
              <ul className="space-y-3 text-xs sm:text-sm text-slate-700">
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span>Unlimited nested folders, path breadcrumbs, move, and rename.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span>Live storage breakdown: see exact GB used by Videos, Photos, and Documents.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span>Stream video, play audio, and preview documents directly in your browser.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="h-4 w-4 text-emerald-600 font-bold shrink-0 mt-0.5" />
                  <span>Two-stage Trash: restore accidentally deleted files anytime.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* 3. Real Platform Features Showcase */}
      <section id="features" className="py-20 border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Core Capabilities
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Speed, Capacity, and Privacy
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <HardDrive className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Unlimited Cloud Storage</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                No 15GB quotas or monthly paid tiers. Your storage capacity is powered by Telegram Saved Messages, which imposes no overall storage ceiling.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">2GB Single File Limit</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Upload full 4K movies, heavy ZIP archives, large raw photographs, and datasets up to 2,048 MB each via direct streaming.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <FolderTree className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Nested Folders & Hierarchy</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Build deep directory trees just like Google Drive. Organize files into folders, move them seamlessly, and navigate with breadcrumbs.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Live Storage Breakdown</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Visual analytics show exact byte usage for Videos, Images, Documents, Audio, and Archives. Filter any category with a single click.
              </p>
            </div>

            {/* Feature 5 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">In-Browser Media Player</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Play videos, stream audio playlists, view image galleries, and inspect PDF documents directly in the web browser without downloading first.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Two-Stage Trash & Recovery</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Accidental deletion protection. Trashing a file preserves it for easy restoration. Permanent deletion purges both the index and Telegram message.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. How It Works (3 Clear, Real Steps) */}
      <section id="how-it-works" className="py-20 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Simple Workflow
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Get Started in Under 60 Seconds
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Create Free Account</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Sign up with your email using Firebase Authentication. Your user space is private and strictly isolated.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Connect Telegram Account</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Provide your Telegram bot token or chat ID. One Cloud links directly to your personal Saved Messages chat.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload & Organize</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Drag and drop files. Binary data is stored inside Telegram Saved Messages, while One Cloud indexes and displays your folders.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. Trust, Privacy & Data Custody */}
      <section className="py-20 border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Complete Data Sovereignty</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
            You Own Your Files. Always.
          </h2>

          <p className="text-sm text-slate-600 leading-relaxed max-w-2xl mx-auto">
            Unlike commercial cloud providers that lock your data into proprietary walled gardens, One Cloud acts as an organizational layer over your Telegram account. Your actual files reside safely inside your own Telegram chat. Even if you stop using One Cloud, your files remain forever accessible in your Telegram app.
          </p>
        </div>
      </section>

      {/* 6. Frequently Asked Questions (FAQ) */}
      <section id="faq" className="py-20 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Where are my uploaded files stored?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                All uploaded files are sent directly to your own Telegram account inside your personal <strong>Saved Messages</strong> chat. One Cloud only stores the directory hierarchy, folder names, and file sizes in Cloud Firestore so you can view them as a structured drive.
              </p>
            </div>

            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Is the storage really unlimited?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Yes. Telegram Saved Messages does not impose an overall account storage quota limit. You can upload thousands of files without hitting a 15GB or 100GB subscription wall.
              </p>
            </div>

            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                What is the maximum file size I can upload?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                You can upload single files up to <strong>2,048 MB (2 GB)</strong> each, which is the official maximum document size supported by Telegram Bot API.
              </p>
            </div>

            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Can other users or One Cloud see my files?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                No. All user accounts are strictly isolated using Firebase Authentication. Every database query enforces per-user ownership rules, and file bytes reside in your private Telegram chat.
              </p>
            </div>

            <div className="p-5 bg-slate-50/60 rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                What happens if I stop using One Cloud?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Nothing happens to your files! Because your files are stored in Telegram Saved Messages, they remain available in your official Telegram mobile, desktop, and web apps forever.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 7. Final High-Impact CTA Banner */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
            Ready to organize your Telegram storage?
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Enjoy the familiar convenience of Google Drive powered by unlimited Telegram cloud storage.
          </p>

          <div className="mt-8">
            <Link
              href={user ? '/app' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
            >
              <span>{user ? 'Open Your Drive' : 'Get Started Free'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
