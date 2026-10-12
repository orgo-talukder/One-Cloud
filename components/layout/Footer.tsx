import React from 'react';
import Link from 'next/link';
import { Cloud, ShieldCheck, Lock } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-border bg-canvas text-text-secondary transition-colors">
      <div className="mx-auto max-w-7xl px-6 py-12 lg:px-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 text-base font-semibold text-text-primary">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface border border-border text-primary">
                <Cloud className="h-4 w-4 text-primary" />
              </div>
              <span>One Cloud</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-text-muted">
              A personal cloud drive powered by your Telegram account. Store, organize, and access your files from a clean web interface.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-tertiary font-medium">
              <ShieldCheck className="h-4 w-4 text-tertiary" />
              <span>Zero telemetry on user file contents</span>
            </div>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Product</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/how-it-works" className="text-text-secondary hover:text-text-primary transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link href="/app" className="text-text-secondary hover:text-text-primary transition-colors">
                  Launch Drive
                </Link>
              </li>
              <li>
                <Link href="/app/recent" className="text-text-secondary hover:text-text-primary transition-colors">
                  Recent Files
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Trust & Security</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/security" className="text-text-secondary hover:text-text-primary transition-colors">
                  Security Model
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-text-secondary hover:text-text-primary transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link href="/acceptable-use" className="text-text-secondary hover:text-text-primary transition-colors">
                  Acceptable Use Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-text-primary">Support & Legal</h4>
            <ul className="mt-3 space-y-2 text-xs">
              <li>
                <Link href="/help" className="text-text-secondary hover:text-text-primary transition-colors">
                  Help Center & FAQ
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-text-secondary hover:text-text-primary transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <span className="text-[11px] text-text-muted leading-tight block">
                  Telegram is a trademark of Telegram FZ-LLC. One Cloud is an independent client interface.
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-12 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-text-muted">
          <p>© {new Date().getFullYear()} One Cloud Inc. Telegram-backed distributed personal drive.</p>
          <div className="flex items-center gap-2">
            <Lock className="w-3.5 h-3.5 text-tertiary" />
            <span className="text-text-muted">End-to-End Encrypted Cloud</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
