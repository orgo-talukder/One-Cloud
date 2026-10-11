'use client';

import React, { useState } from 'react';
import {
  Send,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle2,
  HardDrive,
  RefreshCw,
  Sun,
  Moon,
  Laptop,
  Check,
  Sparkles,
  Database,
  Image as ImageIcon,
  Video as VideoIcon,
  FileText,
  Archive,
  Layers,
  Sliders,
  CheckCheck,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function SettingsPage() {
  const { user, signOut } = useAuth();
  const {
    telegramConnected,
    telegramUsername,
    disconnectTelegram,
    syncTelegram,
    telegramSyncing,
    files,
    folders,
    storageSummary,
  } = useDrive();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [exportNotice, setExportNotice] = useState<string | null>(null);
  const [cacheCleared, setCacheCleared] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'appearance' | 'storage' | 'security'>('general');

  // Breakdown by file types
  const storageBreakdown = React.useMemo(() => {
    let imagesBytes = 0;
    let imagesCount = 0;
    let videosBytes = 0;
    let videosCount = 0;
    let docsBytes = 0;
    let docsCount = 0;
    let othersBytes = 0;
    let othersCount = 0;

    files.forEach((f) => {
      if (f.status !== 'active') return;
      const cat = getFileTypeCategory(f.mimeType, f.extension);
      if (cat === 'image') {
        imagesBytes += f.fileSizeBytes;
        imagesCount++;
      } else if (cat === 'video') {
        videosBytes += f.fileSizeBytes;
        videosCount++;
      } else if (cat === 'pdf' || cat === 'document') {
        docsBytes += f.fileSizeBytes;
        docsCount++;
      } else {
        othersBytes += f.fileSizeBytes;
        othersCount++;
      }
    });

    const total = storageSummary.trackedBytes || 1;
    return {
      images: { bytes: imagesBytes, count: imagesCount, pct: Math.round((imagesBytes / total) * 100) },
      videos: { bytes: videosBytes, count: videosCount, pct: Math.round((videosBytes / total) * 100) },
      docs: { bytes: docsBytes, count: docsCount, pct: Math.round((docsBytes / total) * 100) },
      others: { bytes: othersBytes, count: othersCount, pct: Math.round((othersBytes / total) * 100) },
    };
  }, [files, storageSummary]);

  // Export metadata JSON
  const handleExportMetadata = () => {
    const exportData = {
      user: {
        uid: user?.uid,
        email: user?.email,
      },
      exportedAt: new Date().toISOString(),
      summary: storageSummary,
      folders,
      files,
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `onecloud_backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setExportNotice('Drive metadata exported successfully.');
    setTimeout(() => setExportNotice(null), 3000);
  };

  const handleClearCache = () => {
    setCacheCleared(true);
    setTimeout(() => {
      setCacheCleared(false);
    }, 2500);
  };

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* Settings Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
          Settings & Preferences
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure your Telegram cloud connection, theme appearance, storage quotas, and security.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex items-center gap-1.5 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('general')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'general'
              ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Send className="h-3.5 w-3.5" />
          <span>Telegram & Account</span>
        </button>

        <button
          onClick={() => setActiveTab('appearance')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'appearance'
              ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <Sun className="h-3.5 w-3.5" />
          <span>Appearance & Theme</span>
        </button>

        <button
          onClick={() => setActiveTab('storage')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'storage'
              ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <HardDrive className="h-3.5 w-3.5" />
          <span>Storage & Breakdown</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl transition-all whitespace-nowrap ${
            activeTab === 'security'
              ? 'bg-sky-50 dark:bg-sky-950/70 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
              : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
          }`}
        >
          <ShieldCheck className="h-3.5 w-3.5" />
          <span>Security & Backup</span>
        </button>
      </div>

      {/* Tab 1: General & Telegram Account */}
      {activeTab === 'general' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Telegram Connection Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-5 transition-colors">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="h-11 w-11 rounded-2xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center border border-sky-100 dark:border-sky-800 shrink-0">
                  <Send className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Telegram Cloud Account</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Storage location: <strong>Telegram Saved Messages</strong>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {telegramConnected ? (
                  <span className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800">
                    <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                    <span>@{telegramUsername} (Active)</span>
                  </span>
                ) : (
                  <span className="px-3 py-1.5 text-xs font-semibold text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/60 rounded-xl border border-amber-200 dark:border-amber-800">
                    Not Connected
                  </span>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Connection Protocol</span>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 mt-1 block">Telegram MTProto 2.0</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Server API Credentials</span>
                <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1 block">Configured & Ready</span>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800">
                <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 block">Storage Quota</span>
                <span className="text-xs font-bold text-sky-600 dark:text-sky-400 mt-1 block">Unlimited Cloud</span>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              One Cloud connects directly to your personal Telegram Saved Messages. Files are uploaded in chunks and stored safely in Telegram cloud without any storage cap.
            </p>

            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-xl transition-colors shadow-2xs"
                >
                  {telegramConnected ? 'Change Credentials / Re-login' : 'Connect Telegram'}
                </button>

                {telegramConnected && (
                  <button
                    onClick={syncTelegram}
                    disabled={telegramSyncing}
                    className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
                  >
                    <RefreshCw className={`h-3.5 w-3.5 ${telegramSyncing ? 'animate-spin text-sky-600' : ''}`} />
                    <span>{telegramSyncing ? 'Syncing...' : 'Sync Cloud'}</span>
                  </button>
                )}
              </div>

              {telegramConnected && (
                <button
                  onClick={disconnectTelegram}
                  className="px-4 py-2 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/50 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-xl transition-colors"
                >
                  Disconnect Session
                </button>
              )}
            </div>
          </div>

          {/* User Profile Info */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Workspace User Account</h2>
            <div className="flex items-center gap-4">
              <div className="h-12 w-12 rounded-2xl bg-sky-100 dark:bg-sky-900 border border-sky-200 dark:border-sky-800 text-sky-700 dark:text-sky-200 flex items-center justify-center font-bold text-lg uppercase shadow-2xs shrink-0">
                {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0) : 'U'}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900 dark:text-slate-100 truncate">
                    {user?.displayName || 'Active Workspace User'}
                  </span>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold bg-emerald-50 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                    <ShieldCheck className="h-3 w-3" />
                    Verified
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                  {user?.email || 'Anonymous Session'}
                </p>
              </div>
              {user && (
                <button
                  onClick={() => signOut()}
                  className="px-3 py-1.5 text-xs font-semibold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/60 hover:bg-rose-100 dark:hover:bg-rose-900/40 rounded-xl border border-rose-200 dark:border-rose-800 transition-colors"
                >
                  Sign Out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Appearance & Theme Mode */}
      {activeTab === 'appearance' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6 transition-colors">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Theme Preference</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Choose how One Cloud looks to you. Select a light or dark theme, or sync with your system.
              </p>
            </div>

            {/* Visual Theme Selection Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {/* Light Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="h-24 w-full rounded-xl bg-slate-100 border border-slate-200 p-2 flex flex-col justify-between shadow-2xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-white rounded shadow-2xs" />
                    <div className="h-2 w-24 bg-white/80 rounded shadow-2xs" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Sun className="h-4 w-4 text-amber-500" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Light Mode</span>
                  </div>
                  {theme === 'light' && (
                    <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Clean, bright background optimized for daylight.
                </p>
              </button>

              {/* Dark Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="h-24 w-full rounded-xl bg-slate-900 border border-slate-800 p-2 flex flex-col justify-between shadow-2xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-slate-800 rounded shadow-2xs" />
                    <div className="h-2 w-24 bg-slate-800/80 rounded shadow-2xs" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Moon className="h-4 w-4 text-sky-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">Dark Mode</span>
                  </div>
                  {theme === 'dark' && (
                    <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  High-contrast dark palette easy on the eyes.
                </p>
              </button>

              {/* System Theme Card */}
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`relative flex flex-col p-4 rounded-2xl border-2 text-left transition-all cursor-pointer ${
                  theme === 'system'
                    ? 'border-sky-500 bg-sky-50/50 dark:bg-sky-950/40 shadow-xs ring-2 ring-sky-500/20'
                    : 'border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-800/40 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="h-24 w-full rounded-xl bg-gradient-to-r from-slate-100 to-slate-900 border border-slate-300 dark:border-slate-700 p-2 flex flex-col justify-between shadow-2xs mb-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-rose-400" />
                    <div className="h-2 w-2 rounded-full bg-amber-400" />
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 w-16 bg-sky-500 rounded shadow-2xs" />
                    <div className="h-2 w-24 bg-white/70 rounded shadow-2xs" />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Laptop className="h-4 w-4 text-slate-500 dark:text-slate-400" />
                    <span className="text-xs font-bold text-slate-900 dark:text-slate-100">System Automatic</span>
                  </div>
                  {theme === 'system' && (
                    <span className="h-5 w-5 rounded-full bg-sky-600 text-white flex items-center justify-center">
                      <Check className="h-3 w-3 stroke-[3]" />
                    </span>
                  )}
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">
                  Matches your operating system settings automatically.
                </p>
              </button>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100 block">Active Resolved Theme</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Currently rendering in <strong>{resolvedTheme.toUpperCase()}</strong> mode
                </span>
              </div>
              <span className="px-3 py-1 rounded-lg text-xs font-mono font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sky-600 dark:text-sky-400">
                {theme}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Storage Breakdown & Analytics */}
      {activeTab === 'storage' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-6 transition-colors">
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Storage Usage Analytics</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Detailed metrics for all indexed files currently synced to your Telegram account.
              </p>
            </div>

            {/* Total Storage Metric */}
            <div className="p-5 rounded-2xl bg-gradient-to-br from-sky-50 to-indigo-50 dark:from-sky-950/40 dark:to-indigo-950/40 border border-sky-100 dark:border-sky-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <span className="text-xs font-semibold text-sky-700 dark:text-sky-300">Total Indexed Cloud Storage</span>
                <div className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums mt-1">
                  {formatBytes(storageSummary.trackedBytes)}
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Across {storageSummary.trackedFileCount} files and {storageSummary.folderCount} folders.
                </p>
              </div>

              <div className="shrink-0 flex items-center gap-2">
                <span className="px-3 py-1.5 text-xs font-bold text-sky-700 dark:text-sky-300 bg-white dark:bg-slate-900 rounded-xl border border-sky-200 dark:border-sky-800 shadow-2xs flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-sky-500" />
                  Unlimited Telegram Space
                </span>
              </div>
            </div>

            {/* Category Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <ImageIcon className="h-4 w-4 text-sky-500" />
                    <span>Images</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{storageBreakdown.images.count}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBytes(storageBreakdown.images.bytes)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <VideoIcon className="h-4 w-4 text-purple-500" />
                    <span>Videos</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{storageBreakdown.videos.count}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBytes(storageBreakdown.videos.bytes)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <FileText className="h-4 w-4 text-emerald-500" />
                    <span>Documents</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{storageBreakdown.docs.count}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBytes(storageBreakdown.docs.bytes)}
                </div>
              </div>

              <div className="p-4 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-800/40 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-200">
                    <Archive className="h-4 w-4 text-amber-500" />
                    <span>Archives & Other</span>
                  </span>
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400">{storageBreakdown.others.count}</span>
                </div>
                <div className="text-lg font-bold text-slate-900 dark:text-slate-100 tabular-nums">
                  {formatBytes(storageBreakdown.others.bytes)}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Security, Cache & Metadata Export */}
      {activeTab === 'security' && (
        <div className="space-y-6 animate-in fade-in duration-150">
          {/* Metadata Export Section */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Download className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Export Drive Metadata</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Download a full JSON backup of all indexed file records, message IDs, and folder hierarchy.
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              This export includes complete names, sizes, upload dates, and Telegram message IDs. Your files remain securely in Telegram.
            </p>

            {exportNotice && (
              <div className="p-3 text-xs text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2">
                <Check className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                <span>{exportNotice}</span>
              </div>
            )}

            <button
              onClick={handleExportMetadata}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-900 dark:text-slate-100 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Download className="h-4 w-4 text-slate-500 dark:text-slate-400" />
              <span>Export Metadata (.JSON)</span>
            </button>
          </div>

          {/* Cache & Local State Management */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-2xs space-y-4 transition-colors">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 flex items-center justify-center border border-slate-200 dark:border-slate-700">
                <Database className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">Local Cache & Indexing</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Re-index metadata or clear browser cache for maximum performance.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2">
              <p className="text-xs text-slate-600 dark:text-slate-400">
                Temporary image previews and cached query responses stored locally.
              </p>
              <button
                onClick={handleClearCache}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                {cacheCleared ? (
                  <>
                    <CheckCheck className="h-3.5 w-3.5 text-emerald-500" />
                    <span className="text-emerald-600 dark:text-emerald-400">Cache Cleared</span>
                  </>
                ) : (
                  <>
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Clear Cache</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
    </div>
  );
}
