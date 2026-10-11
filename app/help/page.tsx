import React from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { HelpCircle, Send, HardDrive, ShieldAlert, ArrowRight } from 'lucide-react';

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Help Center & FAQ
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Everything you need to know about connecting Telegram, managing files, and storage
            limits.
          </p>
        </div>

        <div className="space-y-6">
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Send className="h-4 w-4 text-sky-600" />
              <span>How do I get my Telegram API ID and API Hash?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              To connect your real Telegram account:
              <br />
              1. Visit <a href="https://my.telegram.org" target="_blank" rel="noreferrer" className="text-sky-600 underline">my.telegram.org</a> in your browser.
              <br />
              2. Log in with your phone number and confirm the Telegram login code.
              <br />
              3. Click <strong>API Development Tools</strong> and create a client application.
              <br />
              4. Copy the <code>api_id</code> and <code>api_hash</code> into One Cloud&apos;s Connect dialog.
              <br />
              <em>Note: You can also use our Sandbox Demo Mode instantly without any credentials!</em>
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-amber-600" />
              <span>What is the maximum file size I can upload?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Telegram accounts natively support uploading files up to 2 GB each (and up to 4 GB for
              Telegram Premium accounts). One Cloud handles chunked transfers to accommodate large
              documents, media, and archives within Telegram&apos;s official limits.
            </p>
          </div>

          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <ShieldAlert className="h-4 w-4 text-rose-600" />
              <span>What if I delete a message inside the Telegram mobile app?</span>
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              If you externally delete a message from your Saved Messages chat inside Telegram,
              One Cloud will detect that the message is missing during download or when you click
              <strong>Sync with Telegram</strong> in the top header, updating the file record
              accordingly.
            </p>
          </div>
        </div>

        <div className="text-center pt-4">
          <Link
            href="/app"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white font-semibold text-xs shadow-md hover:bg-slate-800 transition-colors"
          >
            <span>Open One Cloud Drive</span>
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
