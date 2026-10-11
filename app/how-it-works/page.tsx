import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Send, HardDrive, ShieldCheck, Database, ArrowRight } from 'lucide-react';

export default function HowItWorksPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            How One Cloud Works
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A hybrid architecture separating heavy file byte storage in Telegram from fast metadata
            indexing in Firebase.
          </p>
        </div>

        {/* Architecture Overview Diagram Card */}
        <div className="p-8 rounded-2xl bg-slate-50 border border-slate-200 space-y-6">
          <h2 className="text-lg font-bold text-slate-900">The Two-Pillar Model</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-sky-600 font-bold text-sm mb-2">
                <Send className="h-4 w-4" />
                <span>1. Telegram Saved Messages</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Holds the actual binary file payloads as document messages sent to your own account
                chat. You retain full custody of your file data in your personal Telegram cloud.
              </p>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200">
              <div className="flex items-center gap-2 text-amber-600 font-bold text-sm mb-2">
                <Database className="h-4 w-4" />
                <span>2. Cloud Firestore & Auth</span>
              </div>
              <p className="text-xs text-slate-600 leading-relaxed">
                Stores the organizational structure: folders, file names, sizes, starred flags, and
                activity timestamps. No raw file bytes ever touch Firestore.
              </p>
            </div>
          </div>
        </div>

        {/* Step-by-Step Flow */}
        <div className="space-y-6">
          <h2 className="text-xl font-bold text-slate-900">Step-by-Step Lifecycle</h2>

          <div className="space-y-4">
            <div className="p-5 bg-white rounded-xl border border-slate-200 flex gap-4">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                1
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Authentication & Isolation</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  You log in using Firebase Authentication. Your unique user ID partitions all
                  storage records in Firestore so no user can access another user&apos;s metadata.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 flex gap-4">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                2
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Uploading Files</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  When you upload a file, the server-side MTProto connector streams the bytes
                  directly to your Telegram Saved Messages chat. Telegram confirms the upload and
                  returns a message identifier.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 flex gap-4">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                3
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Downloading & Previews</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  When you download or preview a file, our secure server proxy retrieves the stream
                  from Telegram and serves it to your browser with appropriate Content-Disposition
                  headers.
                </p>
              </div>
            </div>

            <div className="p-5 bg-white rounded-xl border border-slate-200 flex gap-4">
              <div className="h-7 w-7 rounded-full bg-slate-900 text-white font-bold text-xs flex items-center justify-center shrink-0">
                4
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900">Trash and Deletion</h3>
                <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                  Trashing a file hides it from active Drive and deducts it from &ldquo;Storage Used
                  in Your Drive&rdquo;. Permanent deletion sends an explicit delete command to Telegram
                  and purges the metadata record.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="pt-6 text-center">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-md hover:bg-slate-800 transition-colors"
          >
            <span>Launch One Cloud</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
