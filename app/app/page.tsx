'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Folder,
  Cloud,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { formatBytes } from '@/lib/drive/storage-calc';
import { FileList } from '@/components/drive/FileList';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    files,
    folders,
    storageSummary,
    telegramConnected,
    telegramUsername,
    searchQuery,
  } = useDrive();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Active files sorted by date
  const activeFiles = files.filter((f) => f.status === 'active');
  const activeFolders = folders.filter((f) => f.status === 'active');

  // Filter if search query exists
  const displayFiles = React.useMemo(() => {
    let list = activeFiles;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
      );
    }
    return [...list]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 12);
  }, [activeFiles, searchQuery]);

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner — Clean Google Drive Style without cluttered action buttons */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.displayName || 'Drive User'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Your personal cloud drive connected to Telegram Saved Messages.
          </p>
        </div>

        {/* Telegram Cloud Status Indicator */}
        <div className="flex items-center gap-2.5 shrink-0">
          {telegramConnected ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800 shadow-2xs">
              <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Connected: @{telegramUsername}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Send className="h-4 w-4 text-sky-500" />
              <span>Connect Telegram Account</span>
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Used Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                <span>Storage Used in Drive</span>
              </span>
              <span
                title="Calculated from files indexed in your Drive. Unlimited cloud backed by Telegram."
                className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
              {formatBytes(storageSummary.trackedBytes)}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 leading-tight">
            Unlimited storage via Telegram Saved Messages.
          </p>
        </div>

        {/* Tracked Files Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-amber-500" />
                <span>Drive Contents</span>
              </span>
              <Link
                href="/app/drive"
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>

            <div className="mt-3 text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
              {storageSummary.trackedFileCount}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400">files</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400">
            Organized across {storageSummary.folderCount} folders.
          </p>
        </div>

        {/* Telegram Connection Card */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-sky-500" />
                <span>Cloud Account</span>
              </span>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
              >
                Configure
              </button>
            </div>

            <div className="mt-3">
              {telegramConnected ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800 whitespace-nowrap">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span className="truncate">
                    @{telegramUsername}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-700 dark:text-amber-400">Not Connected</span>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Files safely stored in Saved Messages</span>
          </p>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {searchQuery.trim() ? `Search Results for "${searchQuery}"` : 'Recent Files'}
            </h3>
          </div>
          <Link
            href="/app/drive"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1"
          >
            <span>Open My Drive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <FileList
          files={displayFiles}
          folders={activeFolders.slice(0, 4)}
          showFolders={false}
          emptyTitle={searchQuery.trim() ? 'No matching files' : 'Your Drive is clean and empty'}
          emptySubtitle={
            searchQuery.trim()
              ? 'Try searching with a different file name or extension.'
              : 'Use the "+ New" button on the left sidebar to upload files or create folders.'
          }
        />
      </div>

      {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} />}
      {showConnectModal && <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
