'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { AlertCircle, RotateCcw, Home } from 'lucide-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error);
  }, [error]);

  return (
    <div className="bg-canvas text-text-primary min-h-screen flex flex-col justify-center items-center p-6 selection:bg-brand-subtle selection:text-primary">
      <div className="w-full max-w-md bg-surface border border-border rounded-xl p-8 text-center space-y-6 shadow-xl">
        <div className="w-12 h-12 rounded-xl bg-danger/10 border border-danger/30 text-danger flex items-center justify-center mx-auto">
          <AlertCircle className="w-6 h-6" />
        </div>

        <div className="space-y-2">
          <h1 className="text-xl font-bold text-text-primary">Something went wrong</h1>
          <p className="text-xs text-text-secondary leading-relaxed">
            An unexpected error occurred. You can retry the current action or return to the dashboard.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <button
            onClick={() => reset()}
            className="w-full sm:w-auto h-10 px-5 rounded-lg bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
          <Link
            href="/app"
            className="w-full sm:w-auto h-10 px-5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-primary text-xs font-semibold inline-flex items-center justify-center gap-2 border border-border transition-colors"
          >
            <Home className="w-4 h-4" />
            <span>Go to Drive</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
