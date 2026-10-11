'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  Send,
  ArrowRight,
  CheckCircle2,
  Clock,
  Upload,
  Plus,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  FolderPlus,
  File as FileGenericIcon,
  X,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  calculateDetailedStorage,
  getFileTypeCategory,
  type StorageCategoryKey,
} from '@/lib/drive/storage-calc';
import { FileList } from '@/components/drive/FileList';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    files,
    folders,
    telegramConnected,
    telegramUsername,
    searchQuery,
    uploadFiles,
  } = useDrive();

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);

  // Active Category Filter for Recent Files
  const [selectedCategory, setSelectedCategory] = useState<StorageCategoryKey | 'all'>('all');
  const [isDragging, setIsDragging] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active files & folders
  const activeFiles = useMemo(() => files.filter((f) => f.status === 'active'), [files]);
  const activeFolders = useMemo(() => folders.filter((f) => f.status === 'active'), [folders]);

  // Storage breakdown (Videos, Images, Documents, Audio, Archives/Others)
  const storageBreakdown = useMemo(() => calculateDetailedStorage(files), [files]);

  // Filtered files for recent section
  const filteredRecentFiles = useMemo(() => {
    let list = activeFiles;

    if (selectedCategory !== 'all') {
      list = list.filter((f) => {
        const cat = getFileTypeCategory(f.mimeType, f.extension);
        if (selectedCategory === 'videos') return cat === 'video';
        if (selectedCategory === 'images') return cat === 'image';
        if (selectedCategory === 'documents') return cat === 'document' || cat === 'pdf';
        if (selectedCategory === 'audio') return cat === 'audio';
        if (selectedCategory === 'archives') return cat === 'archive';
        if (selectedCategory === 'others') return cat === 'other';
        return true;
      });
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
      );
    }

    return [...list]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 12);
  }, [activeFiles, selectedCategory, searchQuery]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const getCategoryIcon = (key: StorageCategoryKey) => {
    switch (key) {
      case 'videos':
        return <VideoIcon className="h-4 w-4 text-purple-500" />;
      case 'images':
        return <ImageIcon className="h-4 w-4 text-sky-500" />;
      case 'documents':
        return <FileText className="h-4 w-4 text-emerald-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-pink-500" />;
      default:
        return <FileGenericIcon className="h-4 w-4 text-slate-400" />;
    }
  };

  return (
    <div
      className={`p-4 sm:p-6 lg:p-8 max-w-6xl mx-auto space-y-6 min-h-screen transition-colors ${
        isDragging ? 'ring-4 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20 rounded-3xl' : ''
      }`}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Hidden File Input */}
      <input
        ref={fileInputRef}
        type="file"
        multiple
        className="hidden"
        onChange={handleFileUpload}
      />

      {/* 1. Clean Header (Welcome & Primary Actions) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Welcome back, {user?.displayName || 'Drive User'}
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Your personal cloud drive connected to Telegram Saved Messages.
          </p>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2.5 shrink-0">
          {telegramConnected ? (
            <div className="inline-flex items-center gap-2 px-3 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800/70">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400 shrink-0" />
              <span>Connected: @{telegramUsername}</span>
            </div>
          ) : (
            <button
              onClick={() => setShowConnectModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
            >
              <Send className="h-3.5 w-3.5 text-sky-500" />
              <span>Connect Telegram</span>
            </button>
          )}

          <button
            onClick={() => setShowNewFolderModal(true)}
            title="Create new folder"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <FolderPlus className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">New Folder</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-xl shadow-xs transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload</span>
          </button>
        </div>
      </div>

      {/* 2. Core Storage Breakdown Card (Simple, Professional, Clear) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-5">
        {/* Top summary row */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
              <HardDrive className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums">
                  {storageBreakdown.formattedTotalBytes}
                </span>
                <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                  used of <strong className="text-emerald-600 dark:text-emerald-400">Unlimited</strong> Telegram cloud
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-3">
            <span>{activeFiles.length} files</span>
            <span>·</span>
            <span>{activeFolders.length} folders</span>
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1 text-sky-600 dark:text-sky-400 hover:underline font-medium ml-1"
              >
                <X className="h-3 w-3" />
                <span>Show all</span>
              </button>
            )}
          </div>
        </div>

        {/* Visual Multi-color Progress Bar */}
        <div className="h-3 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex gap-0.5 p-0.5 border border-slate-200/80 dark:border-slate-700/60">
          {storageBreakdown.totalBytes > 0 ? (
            storageBreakdown.categories.map((cat) => {
              if (cat.bytes <= 0) return null;
              const visualWidth = Math.max(cat.percentage, 2);
              return (
                <div
                  key={cat.key}
                  style={{ width: `${visualWidth}%`, backgroundColor: cat.color }}
                  className="h-full rounded-sm transition-all duration-300 cursor-pointer"
                  onClick={() =>
                    setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)
                  }
                  title={`${cat.label}: ${cat.formattedBytes} (${cat.count} files, ${cat.percentage}%)`}
                />
              );
            })
          ) : (
            <div className="h-full w-full bg-slate-200/50 dark:bg-slate-700/40 rounded-full" />
          )}
        </div>

        {/* Category Breakdown (Videos, Images, Documents, Audio, Others) */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 pt-1">
          {storageBreakdown.categories.slice(0, 5).map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <button
                key={cat.key}
                type="button"
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)
                }
                className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                  isSelected
                    ? 'bg-sky-50/70 dark:bg-sky-950/40 border-sky-400 dark:border-sky-500 shadow-2xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/70 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/80'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700 dark:text-slate-300">
                    {getCategoryIcon(cat.key)}
                    <span>{cat.label.split(' ')[0]}</span>
                  </span>
                  <span
                    className="h-2 w-2 rounded-full shrink-0"
                    style={{ backgroundColor: cat.color }}
                  />
                </div>

                <div className="mt-2.5">
                  <div className="text-sm font-bold text-slate-900 dark:text-slate-100 font-mono tabular-nums">
                    {cat.formattedBytes}
                  </div>
                  <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">
                    {cat.count} {cat.count === 1 ? 'file' : 'files'}
                  </div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* 3. Recent Files Section */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden">
        {/* Header with Title and "Open Drive" */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {searchQuery.trim()
                ? `Search Results for "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `${storageBreakdown.byKey[selectedCategory]?.label || selectedCategory} (${filteredRecentFiles.length})`
                : 'Recent Files'}
            </h2>
          </div>

          <Link
            href="/app/drive"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1"
          >
            <span>Open My Drive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* File List */}
        <FileList
          files={filteredRecentFiles}
          folders={activeFolders.slice(0, 4)}
          showFolders={false}
          emptyTitle={
            searchQuery.trim()
              ? 'No matching files found'
              : selectedCategory !== 'all'
              ? `No ${selectedCategory} files in your Drive`
              : 'Your Drive is empty'
          }
          emptySubtitle={
            searchQuery.trim()
              ? 'Try searching with a different file name.'
              : selectedCategory !== 'all'
              ? `Upload ${selectedCategory} files or click "Show all".`
              : 'Click the "+ Upload" button above or drag files here to start storing in Telegram cloud.'
          }
        />
      </div>

      {/* Modals */}
      {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} />}
      {showConnectModal && <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />}
    </div>
  );
}
