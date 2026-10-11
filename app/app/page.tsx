'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  FolderPlus,
  Upload,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  HelpCircle,
  Folder,
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
    uploadFiles,
  } = useDrive();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active files sorted by date
  const activeFiles = files.filter((f) => f.status === 'active');
  const activeFolders = folders.filter((f) => f.status === 'active');
  const recentFiles = [...activeFiles]
    .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
    .slice(0, 8);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back, {user?.displayName || 'Drive User'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500">
            Your personal cloud drive connected to Telegram Saved Messages.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-2xs transition-colors active:scale-[0.98]"
          >
            <Upload className="h-4 w-4" />
            <span>Upload Files</span>
          </button>
          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors active:scale-[0.98]"
          >
            <FolderPlus className="h-4 w-4 text-amber-500" />
            <span>New Folder</span>
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            multiple
            className="hidden"
          />
        </div>
      </div>

      {/* KPI Stats Cards — PRD Section 3.1 & 7.5 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Storage Used Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <HardDrive className="h-3.5 w-3.5 text-sky-500" />
                <span>Storage Used in Your Drive</span>
              </span>
              <span
                title="Calculated from files indexed in your Drive. This is not a measurement of all storage used by your Telegram account."
                className="cursor-help text-slate-400 hover:text-slate-600"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {formatBytes(storageSummary.trackedBytes)}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 leading-tight">
            Calculated strictly from files indexed in your Drive.
          </p>
        </div>

        {/* Tracked Files Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Folder className="h-3.5 w-3.5 text-amber-500" />
                <span>Drive Contents</span>
              </span>
              <Link
                href="/app/drive"
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
              >
                <span>View All</span>
                <ArrowRight className="h-3 w-3" />
              </Link>
            </div>

            <div className="mt-3 text-2xl font-extrabold text-slate-900 tracking-tight tabular-nums">
              {storageSummary.trackedFileCount}{' '}
              <span className="text-sm font-normal text-slate-500">files</span>
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500">
            Organized across {storageSummary.folderCount} folders.
          </p>
        </div>

        {/* Telegram Connection Card */}
        <div className="p-5 bg-white rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-600 flex items-center gap-1.5">
                <Send className="h-3.5 w-3.5 text-sky-500" />
                <span>Telegram Account</span>
              </span>
              <button
                onClick={() => setShowConnectModal(true)}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700"
              >
                Configure
              </button>
            </div>

            <div className="mt-3">
              {telegramConnected ? (
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-800 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200 whitespace-nowrap">
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 shrink-0" />
                  <span className="truncate">
                    @{telegramUsername}
                  </span>
                </div>
              ) : (
                <span className="text-xs font-bold text-amber-700">Not Connected</span>
              )}
            </div>
          </div>

          <p className="mt-3 text-[11px] text-slate-500 flex items-center gap-1">
            <ShieldCheck className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <span>Files store in Saved Messages</span>
          </p>
        </div>
      </div>

      {/* Recent Files Section */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900">Recent Files</h3>
          </div>
          <Link
            href="/app/drive"
            className="text-xs font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-1"
          >
            <span>Open My Drive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        <FileList
          files={recentFiles}
          folders={activeFolders.slice(0, 4)}
          showFolders={false}
          emptyTitle="Your Drive is clean and empty"
          emptySubtitle="Upload any document, image, or video to see it stored in Telegram Saved Messages."
        />
      </div>

      {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} />}
      {showConnectModal && <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
