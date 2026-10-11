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
} from 'lucide-react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { useAuth } from '@/lib/firebase/auth-context';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-slate-100 bg-linear-to-b from-slate-50/60 to-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-50 border border-sky-100 text-sky-700 text-xs font-semibold mb-6">
            <Send className="h-3.5 w-3.5 text-sky-500" />
            <span>Powered by Telegram Saved Messages & Firebase</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-slate-900 max-w-4xl mx-auto leading-tight text-balance">
            Your Files. Your Cloud. Your Control.
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A personal cloud drive powered by your Telegram account. Store, organize, and access
            your files from the web with a clean, Google Drive-style interface.
          </p>

          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Link
              href={user ? '/app' : '/login'}
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.98]"
            >
              <span>{user ? 'Go to Your Drive' : 'Get Started with One Cloud'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>

            <Link
              href="/how-it-works"
              className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-sm transition-colors"
            >
              <span>How It Works</span>
            </Link>
          </div>

          {/* Honest Metric Badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 sm:gap-12 text-xs text-slate-500 font-medium">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
              <span>Personal Telegram Saved Messages</span>
            </div>
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-sky-600" />
              <span>AES-256 Server Session Protection</span>
            </div>
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-slate-600" />
              <span>Truthful Storage Accounting</span>
            </div>
          </div>

          {/* Interactive UI Preview Frame */}
          <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-slate-200/90 shadow-2xl bg-white overflow-hidden text-left">
            <div className="h-10 bg-slate-100/90 border-b border-slate-200 px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
                <div className="h-3 w-3 rounded-full bg-slate-300" />
              </div>
              <span className="text-[11px] font-mono text-slate-500">
                https://onecloud.app/app/drive
              </span>
              <div className="w-10" />
            </div>

            <div className="p-6 bg-slate-50/50">
              <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                <div>
                  <h3 className="text-sm font-bold text-slate-900">My Drive</h3>
                  <p className="text-xs text-slate-500">
                    Storage Used in Your Drive: <strong className="font-mono">248.4 MB</strong>
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs font-semibold text-emerald-800 bg-emerald-50 rounded-lg border border-emerald-200">
                  Telegram Connected
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-amber-50 text-amber-600 flex items-center justify-center">
                    <FolderTree className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Work Documents</p>
                    <p className="text-[10px] text-slate-400">12 files</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center">
                    <HardDrive className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Quarterly Report.pdf</p>
                    <p className="text-[10px] text-slate-400 font-mono">14.2 MB</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center">
                    <Eye className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Team Demo.mp4</p>
                    <p className="text-[10px] text-slate-400 font-mono">185.0 MB</p>
                  </div>
                </div>

                <div className="p-3 bg-white rounded-xl border border-slate-200 flex items-center gap-2 shadow-2xs">
                  <div className="h-8 w-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <Sparkles className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-900 truncate">Design Assets.zip</p>
                    <p className="text-[10px] text-slate-400 font-mono">48.2 MB</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-20 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">
              Modern Cloud Drive Features
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Everything you expect from Google Drive, powered by Telegram.
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4 border border-amber-100">
                <FolderTree className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Nested Folders & Breadcrumbs</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Create structured hierarchies with unlimited nested subfolders, intuitive
                breadcrumbs, and easy drag-and-drop or move actions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100">
                <Upload className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Real Upload Manager</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Multi-file upload queue with percentage progress indicators, retry for interrupted
                transfers, and cancellation support.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
                <Eye className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Safe Multi-Format Preview</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Stream images, audio players, HTML5 video, and PDFs directly in the browser with
                instant download fallbacks for archives and binaries.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
                <Search className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Fast Metadata Search</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Search through thousands of files by filename, extension, or MIME category in
                milliseconds using indexed Firestore metadata.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4 border border-rose-100">
                <Trash2 className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Trash & Confirmed Deletion</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Safe two-stage deletion. Trashing preserves files for quick restore. Permanent
                purge deletes both the metadata and the Telegram message.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-slate-200 bg-slate-50/50 hover:bg-white hover:shadow-xs transition-all">
              <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
                <Layers className="h-5 w-5" />
              </div>
              <h3 className="text-base font-bold text-slate-900">Recent & Starred Collections</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                One-click access to your frequently referenced documents and favorites without
                digging through deep folder structures.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 3-Step How It Works */}
      <section className="py-20 border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto">
            <h2 className="text-xs font-bold uppercase tracking-wider text-sky-600">
              How It Works
            </h2>
            <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              Simple 3-step setup in under 60 seconds
            </p>
          </div>

          <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                01
              </div>
              <h3 className="text-base font-bold text-slate-900">Sign Up & Connect</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Create an account using Firebase Authentication. Connect your Telegram account or
                start immediately with our built-in Sandbox Demo Mode.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                02
              </div>
              <h3 className="text-base font-bold text-slate-900">Upload to Saved Messages</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Drag and drop your documents, photos, or videos. Files are dispatched as document
                messages directly into your personal Saved Messages chat.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
              <div className="h-8 w-8 rounded-lg bg-slate-900 text-white font-bold text-xs flex items-center justify-center mb-4">
                03
              </div>
              <h3 className="text-base font-bold text-slate-900">Access Anywhere</h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Organize, search, preview, and download your cloud storage from any desktop,
                tablet, or smartphone browser with complete user privacy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Storage Transparency Section */}
      <section className="py-20 border-b border-slate-100 bg-white">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold mb-4">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
            <span>Honest Storage Policy</span>
          </div>

          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl text-balance">
            No marketing gimmicks. Truthful metrics only.
          </h2>

          <p className="mt-4 text-sm text-slate-600 leading-relaxed">
            Unlike third-party tools that advertise &ldquo;unlimited storage forever&rdquo;, One Cloud
            displays <strong>Storage Used in Your Drive</strong> strictly calculated from the exact
            byte size of your tracked files in Firestore. We never hallucinate arbitrary quotas,
            percentage bars, or unsupported claims.
          </p>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 border-b border-slate-100 bg-slate-50/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 text-center mb-10">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Where are my files actually stored?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Your file bytes are stored in your own Telegram account inside your personal{' '}
                <strong>Saved Messages</strong> chat. One Cloud only indexes file names, folder
                paths, and sizes in Cloud Firestore so you can navigate them like Google Drive.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                Can other users see my files or sessions?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                No. All records are isolated per user in Firebase Authentication and Cloud Firestore
                with strict Attribute-Based Access Control security rules. Session tokens are
                encrypted with AES-256-GCM on the server.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <h3 className="text-sm font-bold text-slate-900">
                What happens if I delete a file or my account?
              </h3>
              <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                Moving a file to Trash only marks it as trashed in Drive metadata. Performing a
                permanent deletion confirms both the metadata removal and sends a delete message
                call to Telegram. Deleting your website account clears your drive organization, but
                your original files stay safe in your Telegram account.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Footer Section */}
      <section className="py-20 bg-slate-900 text-white text-center">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-extrabold tracking-tight sm:text-4xl text-balance">
            Ready to organize your Telegram storage?
          </h2>
          <p className="mt-4 text-sm text-slate-400">
            Experience the familiar convenience of Google Drive powered by your own cloud.
          </p>

          <div className="mt-8">
            <Link
              href={user ? '/app' : '/login'}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-400 text-slate-950 font-bold text-sm shadow-lg transition-all active:scale-[0.98]"
            >
              <span>{user ? 'Open Your Drive' : 'Get Started with One Cloud'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
