import React from 'react';
import Link from 'next/link';
import { Cloud, ArrowLeft, Home, LayoutDashboard } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="bg-canvas text-text-primary min-h-screen flex flex-col justify-between selection:bg-brand-subtle selection:text-primary">
      <header className="w-full max-w-7xl mx-auto px-6 lg:px-12 py-6 flex items-center justify-between z-20 border-b border-border/40">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-lg bg-surface border border-border flex items-center justify-center text-primary">
            <Cloud className="w-5 h-5 text-primary" />
          </div>
          <div className="flex flex-col">
            <span className="font-semibold text-text-primary tracking-tight leading-none text-sm">
              One Cloud
            </span>
            <span className="text-[10px] tracking-wider uppercase text-text-muted mt-0.5">
              Telegram Drive
            </span>
          </div>
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-xs text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </header>

      <main className="w-full flex-1 flex flex-col items-center justify-center px-4 py-12 z-10">
        <div className="relative w-full max-w-[560px] mx-auto px-4 py-8 flex flex-col items-center text-center">
          <div className="absolute -top-10 w-72 h-72 rounded-full bg-primary-container/10 blur-3xl pointer-events-none -z-10" />
          
          <div className="inline-flex items-center gap-2 font-mono text-xs tracking-wider uppercase text-focus-ring bg-brand-subtle px-3 py-1 rounded-full mb-6 border border-primary/20">
            <span className="w-1.5 h-1.5 rounded-full bg-focus-ring animate-pulse" />
            <span>ERR_ROUTE_NOT_FOUND</span>
            <span className="text-text-muted opacity-60">•</span>
            <span className="text-text-primary font-semibold">404</span>
          </div>

          <div className="text-[76px] leading-[80px] font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-b from-text-primary via-text-secondary to-text-muted/20 select-none mb-3">
            404
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight mb-2">
            Page not found
          </h1>
          <p className="text-xs sm:text-sm text-text-secondary leading-relaxed max-w-[440px] mb-8">
            The file, folder, or page you are looking for has been moved, deleted, or does not exist.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 w-full max-w-[360px]">
            <Link
              href="/app"
              className="h-11 px-6 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors shadow-xs"
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Go to Drive</span>
            </Link>
            <Link
              href="/"
              className="h-11 px-6 rounded-lg bg-surface hover:bg-surface-hover text-text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 border border-border transition-colors"
            >
              <Home className="w-4 h-4" />
              <span>Go Home</span>
            </Link>
          </div>
        </div>
      </main>

      <footer className="w-full py-6 text-center text-xs text-text-muted border-t border-border/40">
        One Cloud &copy; {new Date().getFullYear()} — Telegram-Powered Cloud Drive
      </footer>
    </div>
  );
}
