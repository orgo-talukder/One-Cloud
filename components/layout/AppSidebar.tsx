'use client';

import React, { useRef, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Cloud,
  HardDrive,
  Clock,
  Star,
  Trash2,
  Settings,
  Plus,
  FolderPlus,
  Upload,
  Send,
  HelpCircle,
  LayoutDashboard,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes } from '@/lib/drive/storage-calc';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export function AppSidebar() {
  const pathname = usePathname();
  const {
    storageSummary,
    telegramConnected,
    telegramUsername,
    uploadFiles,
  } = useDrive();

  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [newDropdownOpen, setNewDropdownOpen] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const navItems = [
    { label: 'Home', href: '/app', icon: LayoutDashboard },
    { label: 'My Drive', href: '/app/drive', icon: HardDrive },
    { label: 'Recent', href: '/app/recent', icon: Clock },
    { label: 'Starred', href: '/app/starred', icon: Star },
    { label: 'Trash', href: '/app/trash', icon: Trash2 },
  ];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      setNewDropdownOpen(false);
      e.target.value = '';
    }
  };

  return (
    <>
      <aside className="w-64 shrink-0 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 flex flex-col justify-between h-screen transition-colors">
        <div className="flex flex-col p-4 space-y-4">
          {/* Brand Header */}
          <Link
            href="/"
            className="flex items-center gap-2.5 px-2 py-1.5 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-600 text-white shadow-2xs shrink-0">
              <Cloud className="h-5 w-5" />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-bold text-slate-900 dark:text-slate-100 tracking-tight text-base leading-none">
                One Cloud
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium mt-1">
                Telegram Drive
              </span>
            </div>
          </Link>

          {/* "+ New" Action Button */}
          <div className="relative">
            <button
              onClick={() => setNewDropdownOpen(!newDropdownOpen)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 hover:bg-slate-800 dark:bg-sky-600 dark:hover:bg-sky-500 text-white font-semibold text-xs sm:text-sm py-2.5 px-4 rounded-xl shadow-xs transition-all active:scale-[0.98]"
            >
              <Plus className="h-4 w-4" />
              <span>New</span>
            </button>

            {newDropdownOpen && (
              <div
                className="absolute left-0 right-0 top-12 z-50 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-lg p-1.5 space-y-1"
                onMouseLeave={() => setNewDropdownOpen(false)}
              >
                <button
                  onClick={() => {
                    fileInputRef.current?.click();
                    setNewDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                >
                  <Upload className="h-4 w-4 text-sky-600 dark:text-sky-400" />
                  <span>Upload Files</span>
                </button>
                <button
                  onClick={() => {
                    setShowNewFolderModal(true);
                    setNewDropdownOpen(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:text-slate-900 dark:hover:text-white hover:bg-slate-50 dark:hover:bg-slate-800 rounded-lg transition-colors text-left"
                >
                  <FolderPlus className="h-4 w-4 text-amber-500" />
                  <span>New Folder</span>
                </button>
              </div>
            )}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              multiple
              className="hidden"
            />
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1 pt-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive =
                item.href === '/app'
                  ? pathname === '/app'
                  : pathname.startsWith(item.href);

              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-400 font-semibold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800/60'
                  }`}
                >
                  <Icon
                    className={`h-4 w-4 shrink-0 ${
                      isActive ? 'text-sky-600 dark:text-sky-400' : 'text-slate-400'
                    }`}
                  />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Bottom Section: Storage Box & Settings */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 space-y-3">
          {/* Storage card */}
          <div className="bg-slate-50/80 dark:bg-slate-800/50 rounded-2xl p-3.5 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1.5 truncate">
                <HardDrive className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                <span className="text-[11px] font-semibold text-slate-700 dark:text-slate-300">Storage Used</span>
              </span>
              <span
                title="Calculated from files indexed in your Drive. Unlimited cloud backed by Telegram."
                className="cursor-help text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 shrink-0 ml-1"
              >
                <HelpCircle className="h-3.5 w-3.5" />
              </span>
            </div>

            <div className="mt-2 text-xl font-bold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums">
              {formatBytes(storageSummary.trackedBytes)}
            </div>

            <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 tabular-nums">
              <span>{storageSummary.trackedFileCount} tracked files</span>
              <span>·</span>
              <span>{storageSummary.folderCount} folders</span>
            </div>

            <p className="mt-2 text-[10px] text-slate-400 dark:text-slate-500 leading-tight">
              Unlimited storage via Telegram Saved Messages.
            </p>
          </div>

          {/* Telegram Connection Quick Pill */}
          <button
            onClick={() => setShowConnectModal(true)}
            className="w-full flex items-center justify-between px-3 py-2 text-[11px] font-medium rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors text-left"
          >
            <span className="flex items-center gap-1.5 truncate">
              <Send className="h-3.5 w-3.5 text-sky-500 shrink-0" />
              <span className="truncate">
                {telegramConnected ? `@${telegramUsername}` : 'Connect Telegram'}
              </span>
            </span>
            <span className="text-[10px] font-semibold text-sky-600 dark:text-sky-400 shrink-0 ml-2">
              {telegramConnected ? 'Active' : 'Connect'}
            </span>
          </button>

          {/* Settings Nav Item */}
          <Link
            href="/app/settings"
            className={`flex items-center gap-3 px-3 py-2 rounded-xl text-xs sm:text-sm font-medium transition-colors ${
              pathname === '/app/settings'
                ? 'bg-slate-100 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-semibold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            <Settings className="h-4 w-4 text-slate-400 shrink-0" />
            <span>Settings</span>
          </Link>
        </div>
      </aside>

      {showNewFolderModal && (
        <NewFolderModal onClose={() => setShowNewFolderModal(false)} />
      )}
      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
    </>
  );
}
