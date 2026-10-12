'use client';

import React from 'react';
import Link from 'next/link';
import { Cloud, ArrowRight, HardDrive } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export function Navbar() {
  const { user } = useAuth();

  return (
    <header className="fixed top-0 w-full z-50 bg-canvas/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="h-16 max-w-7xl mx-auto px-6 lg:px-12 flex items-center justify-between gap-6">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border/80 flex items-center justify-center text-primary transition-colors group-hover:border-primary/50">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary tracking-tight text-[15px] leading-tight">
              One Cloud
            </span>
            <span className="text-[10px] leading-none text-text-muted uppercase tracking-wider font-semibold mt-0.5">
              Telegram Drive
            </span>
          </div>
        </Link>

        {/* Desktop Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link
            href="/how-it-works"
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            How It Works
          </Link>
          <Link
            href="/security"
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Security
          </Link>
          <Link
            href="/help"
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            Help & FAQ
          </Link>
        </nav>

        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          {user ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-all shadow-xs"
            >
              <HardDrive className="w-4 h-4" />
              <span>Go to Drive</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center px-4 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-all shadow-xs active:scale-[0.99]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
