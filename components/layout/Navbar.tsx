'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Cloud, ArrowRight, HardDrive, Menu, X, ShieldCheck, HelpCircle, Info, Sparkles } from 'lucide-react';
import { useAuth } from '@/lib/firebase/auth-context';

export function Navbar() {
  const { user } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 w-full z-50 bg-canvas/90 backdrop-blur-md border-b border-border transition-colors">
      <div className="h-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link href="/" className="flex items-center gap-3 group shrink-0">
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
        <nav className="hidden md:flex items-center gap-1 lg:gap-2">
          <Link
            href="/about"
            className="text-xs font-medium px-3 py-1.5 rounded-lg text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            About
          </Link>
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
            Help &amp; FAQ
          </Link>
        </nav>

        {/* Action Buttons & Mobile Hamburger Toggle */}
        <div className="flex items-center gap-2 sm:gap-3">
          {user ? (
            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-all shadow-xs"
            >
              <HardDrive className="w-4 h-4" />
              <span className="hidden sm:inline">Go to Drive</span>
              <span className="sm:hidden">Drive</span>
            </Link>
          ) : (
            <>
              <Link
                href="/login"
                className="hidden sm:inline-flex items-center justify-center px-3.5 py-2 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center gap-1.5 px-3 sm:px-4 py-2 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-all shadow-xs active:scale-[0.99]"
              >
                <span>Get Started</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-surface-raised px-4 pt-3 pb-5 space-y-3 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            <Link
              href="/about"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Info className="w-4 h-4 text-text-muted" />
              <span>About One Cloud</span>
            </Link>
            <Link
              href="/how-it-works"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <Sparkles className="w-4 h-4 text-primary" />
              <span>How It Works (Telegram MTProto)</span>
            </Link>
            <Link
              href="/security"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <ShieldCheck className="w-4 h-4 text-tertiary" />
              <span>Security &amp; Encryption</span>
            </Link>
            <Link
              href="/help"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
            >
              <HelpCircle className="w-4 h-4 text-text-muted" />
              <span>Help &amp; FAQ</span>
            </Link>
          </nav>

          <div className="pt-2 border-t border-border/60 flex flex-col gap-2">
            {!user ? (
              <div className="grid grid-cols-2 gap-2">
                <Link
                  href="/login"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-lg text-xs font-medium bg-surface text-text-primary border border-border hover:bg-surface-hover transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-3 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-colors shadow-xs"
                >
                  Get Started
                </Link>
              </div>
            ) : (
              <Link
                href="/app"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-3 rounded-lg text-xs font-semibold bg-primary-container text-text-primary hover:bg-brand-hover transition-colors shadow-xs flex items-center justify-center gap-2"
              >
                <HardDrive className="w-4 h-4" />
                <span>Open Drive Dashboard</span>
              </Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
