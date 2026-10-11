import React from 'react';
import Link from 'next/link';
import { Cloud, ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 text-lg font-bold text-slate-900">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-600 text-white">
                <Cloud className="h-4 w-4" />
              </div>
              <span>One Cloud</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              A personal cloud drive powered by your Telegram account. Store, organize, and access your files from the web.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-emerald-700 font-medium">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>Zero telemetry on user file contents</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Product</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/#features" className="hover:text-slate-900 transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className="hover:text-slate-900 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/app" className="hover:text-slate-900 transition-colors">
                  Launch Drive
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Trust & Security</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/security" className="hover:text-slate-900 transition-colors">
                  Security Model
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="hover:text-slate-900 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="hover:text-slate-900 transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900">Support & Legal</h4>
            <ul className="mt-3 space-y-2 text-sm">
              <li>
                <Link href="/help" className="hover:text-slate-900 transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="hover:text-slate-900 transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-xs text-slate-400">
                  Telegram is a trademark of Telegram FZ-LLC. One Cloud is an independent client interface.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-slate-100 pt-6 text-center text-xs text-slate-400">
          <p>© {new Date().getFullYear()} One Cloud. All rights reserved. Your Files. Your Cloud. Your Control.</p>
        </div>
      </div>
    </footer>
  );
}
