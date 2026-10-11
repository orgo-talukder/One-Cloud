'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, ArrowRight, HardDrive } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-slate-200 bg-white/95 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-8 px-4 sm:px-6 lg:px-8">
        {/* Zone 1: Single text element wordmark */}
        <Link
          href="/"
          className="flex items-center gap-2 text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap shrink-0 hover:opacity-90 transition-opacity"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-sky-600 text-white shadow-sm">
            <Cloud className="h-5 w-5" />
          </div>
          <span>One Cloud</span>
        </Link>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <Link href="/#features" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Features
          </Link>
          <Link href="/how-it-works" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            How It Works
          </Link>
          <Link href="/security" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Security
          </Link>
          <Link href="/help" className="hover:text-slate-900 transition-colors whitespace-nowrap shrink-0">
            Help & FAQ
          </Link>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center gap-3 shrink-0">
          {user ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-2 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
            >
              <HardDrive className="h-4 w-4" />
              <span>Go to Drive</span>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                href="/login"
                className="hidden sm:inline-flex rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition-colors whitespace-nowrap shrink-0"
              >
                Sign In
              </Link>
              <Link
                href="/app"
                className="inline-flex items-center gap-1.5 rounded-lg bg-sky-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-sky-500 transition-colors whitespace-nowrap shrink-0"
              >
                <span>Open Drive</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
