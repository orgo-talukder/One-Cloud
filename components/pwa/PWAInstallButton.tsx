'use client';

import React, { useState } from 'react';
import { Download, Smartphone, Share, CheckCircle, X, ChevronRight } from 'lucide-react';
import { usePWAInstall } from '@/hooks/use-pwa-install';

interface PWAInstallButtonProps {
  variant?: 'button' | 'badge' | 'sidebar' | 'banner';
  className?: string;
}

export function PWAInstallButton({ variant = 'button', className = '' }: PWAInstallButtonProps) {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSModal, setShowIOSModal] = useState(false);
  const [installing, setInstalling] = useState(false);

  // If already running as installed standalone PWA, suppress the prompt
  if (isInstalled) {
    return null;
  }

  const handleInstallClick = async () => {
    if (isInstallable) {
      setInstalling(true);
      try {
        await install();
      } finally {
        setInstalling(false);
      }
    } else if (isIOS) {
      setShowIOSModal(true);
    } else {
      // General instructions modal if browser hasn't fired beforeinstallprompt yet
      setShowIOSModal(true);
    }
  };

  return (
    <>
      {variant === 'sidebar' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`flex items-center gap-3 px-3 py-2.5 rounded-xl bg-brand-subtle/80 hover:bg-brand-subtle text-primary border border-primary/20 transition-all text-xs font-semibold cursor-pointer group w-full text-left shadow-xs ${className}`}
        >
          <div className="w-7 h-7 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 text-primary group-hover:scale-105 transition-transform">
            <Download className="w-4 h-4" />
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="truncate">Install One Cloud</span>
            <span className="text-[10px] text-text-muted font-normal truncate">Add to Home Screen</span>
          </div>
          <ChevronRight className="w-3.5 h-3.5 text-text-muted shrink-0 group-hover:translate-x-0.5 transition-transform" />
        </button>
      )}

      {variant === 'button' && (
        <button
          type="button"
          onClick={handleInstallClick}
          disabled={installing}
          className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-primary text-on-primary-container text-xs font-semibold hover:bg-brand-hover hover:text-white transition-all shadow-xs cursor-pointer active:scale-95 disabled:opacity-50 ${className}`}
          title="Install One Cloud on your device"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {variant === 'badge' && (
        <button
          type="button"
          onClick={handleInstallClick}
          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-brand-subtle hover:bg-brand-subtle/80 text-primary border border-primary/20 text-[11px] font-semibold transition-colors cursor-pointer ${className}`}
        >
          <Smartphone className="w-3.5 h-3.5" />
          <span>Install App</span>
        </button>
      )}

      {/* Guided Installation Modal (for iOS or fallback instructions) */}
      {showIOSModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="relative w-full max-w-sm rounded-2xl bg-surface border border-border p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-brand-subtle text-primary flex items-center justify-center">
                  <Smartphone className="w-4 h-4" />
                </div>
                <h3 className="text-sm font-bold text-text-primary">Install One Cloud</h3>
              </div>
              <button
                type="button"
                onClick={() => setShowIOSModal(false)}
                className="p-1 rounded-lg hover:bg-surface-hover text-text-muted hover:text-text-primary transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Install One Cloud on your mobile device or desktop for instant full-screen access and native app experience:
            </p>

            <div className="space-y-3 bg-surface-raised rounded-xl p-3.5 border border-border text-xs text-text-secondary">
              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-subtle text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  1
                </span>
                <div>
                  <span className="font-semibold text-text-primary block">Tap Browser Menu / Share</span>
                  <span className="text-[11px] text-text-muted">
                    In Chrome, tap <strong className="text-text-primary">⋮ (three dots)</strong>. In Safari, tap the <strong className="text-text-primary">Share</strong> button.
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-subtle text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  2
                </span>
                <div>
                  <span className="font-semibold text-text-primary block">Select &ldquo;Install app&rdquo;</span>
                  <span className="text-[11px] text-text-muted">
                    Tap <strong className="text-text-primary">Install app</strong> (or &ldquo;Add to Home Screen&rdquo;).
                  </span>
                </div>
              </div>

              <div className="flex items-start gap-2.5">
                <span className="w-5 h-5 rounded-full bg-brand-subtle text-primary font-bold flex items-center justify-center shrink-0 text-[11px]">
                  3
                </span>
                <div>
                  <span className="font-semibold text-text-primary block">Launch from Home Screen</span>
                  <span className="text-[11px] text-text-muted">
                    One Cloud will launch in full-screen standalone mode without browser URL bars.
                  </span>
                </div>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setShowIOSModal(false)}
              className="w-full py-2.5 rounded-xl bg-primary-container hover:bg-brand-hover text-text-primary font-semibold text-xs transition-colors cursor-pointer"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}
