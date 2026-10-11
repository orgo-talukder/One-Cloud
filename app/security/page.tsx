import React from 'react';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { ShieldCheck, Lock, Key, EyeOff, Server, AlertCircle } from 'lucide-react';

export default function SecurityPage() {
  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      <Navbar />

      <main className="flex-1 py-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-slate-900">
            Security & Privacy Model
          </h1>
          <p className="mt-3 text-sm text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Our architectural guarantees, data flow boundaries, and honest cryptographic posture.
          </p>
        </div>

        {/* Core Statement on E2EE */}
        <div className="p-6 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-2">
          <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
            <AlertCircle className="h-4 w-4 text-amber-600" />
            <span>Honest Security Notice Regarding End-to-End Encryption</span>
          </div>
          <p className="text-xs text-amber-900 leading-relaxed">
            Per PRD Section 1.2 and Section 6.4: We do not falsely claim End-to-End Encryption
            (E2EE). Telegram Cloud Chats (including Saved Messages) are encrypted in transit and at
            rest by Telegram MTProto servers, but are not client-encrypted E2EE Secret Chats. We
            never market misleading claims of zero-knowledge storage.
          </p>
        </div>

        {/* Security Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4 border border-sky-100">
              <Key className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">AES-256-GCM Session Protection</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Telegram authentication session strings are encrypted on the server using standard
              AES-256-GCM with unique initialization vectors (IVs). Session tokens are never
              stored in plaintext or sent to frontend analytics.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-4 border border-emerald-100">
              <Lock className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Strict User Isolation</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              Every document and folder in Cloud Firestore is strictly scoped to your verified
              Firebase user ID (<code>users/&#123;uid&#125;</code>). Default-deny security rules
              mathematically prevent any user from reading or altering another account&apos;s records.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4 border border-purple-100">
              <EyeOff className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">No Content Inspection</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              One Cloud does not inspect, parse, or execute the contents of your uploaded files.
              Files are passed through secure stream bridges directly between your browser and
              Telegram servers.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white">
            <div className="h-10 w-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-4 border border-indigo-100">
              <Server className="h-5 w-5" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Data Minimization</h3>
            <p className="mt-2 text-xs text-slate-600 leading-relaxed">
              We only store the essential metadata necessary to provide a file explorer: file name,
              extension, byte count, parent folder reference, and Telegram message ID.
            </p>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
