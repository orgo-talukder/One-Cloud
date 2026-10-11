'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  HardDrive,
  Send,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Folder,
  Cloud,
  Upload,
  Plus,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Archive,
  Layers,
  Zap,
  BarChart3,
  Filter,
  Star,
  ExternalLink,
  Eye,
  Download,
  RefreshCw,
  FolderPlus,
  Search,
  X,
  File as FileGenericIcon,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  formatBytes,
  calculateDetailedStorage,
  getFileTypeCategory,
  type StorageCategoryKey,
} from '@/lib/drive/storage-calc';
import { FileList } from '@/components/drive/FileList';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import type { FileItem } from '@/lib/drive/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    files,
    folders,
    storageSummary,
    telegramConnected,
    telegramUsername,
    searchQuery,
    setSearchQuery,
    uploadFiles,
    telegramSyncing,
    syncTelegram,
    viewMode,
    setViewMode,
    sessionToken,
  } = useDrive();

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Active Category Filter for Recent Files list
  const [selectedCategory, setSelectedCategory] = useState<StorageCategoryKey | 'all'>('all');
  const [isDragging, setIsDragging] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active files & folders
  const activeFiles = useMemo(() => files.filter((f) => f.status === 'active'), [files]);
  const activeFolders = useMemo(() => folders.filter((f) => f.status === 'active'), [folders]);
  const starredCount = useMemo(
    () => files.filter((f) => f.status === 'active' && f.isStarred).length,
    [files]
  );

  // Detailed Storage breakdown (Videos, Images, Documents, Audio, Archives, Others)
  const storageBreakdown = useMemo(() => calculateDetailedStorage(files), [files]);

  // Filtered files for recent section
  const filteredRecentFiles = useMemo(() => {
    let list = activeFiles;

    // Apply category filter if selected
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

    // Apply search filter if query is present
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
      );
    }

    // Sort by uploaded date descending and take top 16
    return [...list]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 16);
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

  const getCategoryIcon = (iconType: string, className: string = 'h-5 w-5') => {
    switch (iconType) {
      case 'video':
        return <VideoIcon className={className} />;
      case 'image':
        return <ImageIcon className={className} />;
      case 'document':
        return <FileText className={className} />;
      case 'audio':
        return <Music className={className} />;
      case 'archive':
        return <Archive className={className} />;
      default:
        return <FileGenericIcon className={className} />;
    }
  };

  return (
    <div
      className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6"
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

      {/* 1. Header Banner & Quick Actions Hub */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5 bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs transition-colors">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
              Welcome back, {user?.displayName || 'Drive User'}
            </h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Unified cloud storage dashboard powered by Telegram Saved Messages.
          </p>
        </div>

        {/* Header Actions & Telegram Cloud Status */}
        <div className="flex flex-wrap items-center gap-2.5">
          {telegramConnected ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl border border-emerald-200 dark:border-emerald-800/70 shadow-2xs">
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

          <button
            onClick={() => syncTelegram()}
            disabled={telegramSyncing}
            title="Synchronize file index with Telegram Saved Messages"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/80 hover:bg-slate-100 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 rounded-xl transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${telegramSyncing ? 'animate-spin text-sky-500' : ''}`} />
            <span>{telegramSyncing ? 'Syncing...' : 'Sync'}</span>
          </button>

          <button
            onClick={() => fileInputRef.current?.click()}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 dark:bg-sky-500 dark:hover:bg-sky-400 rounded-xl shadow-xs transition-colors"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Upload Files</span>
          </button>

          <button
            onClick={() => setShowNewFolderModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
          >
            <FolderPlus className="h-3.5 w-3.5 text-amber-500" />
            <span>New Folder</span>
          </button>
        </div>
      </div>

      {/* 2. Executive KPI Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Storage Used */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <HardDrive className="h-4 w-4 text-sky-500" />
              <span>Storage In Use</span>
            </span>
            <span className="text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/60 px-2 py-0.5 rounded-md border border-sky-200 dark:border-sky-800/60">
              Unlimited ∞
            </span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums font-mono">
              {storageBreakdown.formattedTotalBytes}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Zero storage limits via Telegram cloud.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Tracked: {storageBreakdown.totalFileCount} files</span>
            <span>Up to 2GB / file</span>
          </div>
        </div>

        {/* Card 2: Drive Contents & Folders */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Folder className="h-4 w-4 text-amber-500" />
              <span>Drive Contents</span>
            </span>
            <Link
              href="/app/drive"
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1"
            >
              <span>View All</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums font-mono">
              {activeFiles.length}{' '}
              <span className="text-sm font-normal text-slate-500 dark:text-slate-400 font-sans">
                files
              </span>
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Organized in {activeFolders.length} folders.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>{starredCount} starred items</span>
            <Link href="/app/starred" className="hover:text-amber-500 transition-colors">
              Starred vault →
            </Link>
          </div>
        </div>

        {/* Card 3: Storage Efficiency & Average Size */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <BarChart3 className="h-4 w-4 text-emerald-500" />
              <span>Average File Size</span>
            </span>
            <span className="text-[11px] text-slate-400 dark:text-slate-500">Telemetry</span>
          </div>

          <div className="mt-3">
            <div className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight tabular-nums font-mono">
              {storageBreakdown.formattedAverageFileSize}
            </div>
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              {storageBreakdown.largestFiles.length > 0
                ? `Largest: ${formatBytes(storageBreakdown.largestFiles[0].fileSizeBytes)}`
                : 'No files uploaded yet'}
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span>Indexed across {storageBreakdown.categories.filter((c) => c.count > 0).length} types</span>
            <span>Cloud index ready</span>
          </div>
        </div>

        {/* Card 4: Telegram Cloud Vault */}
        <div className="p-5 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs flex flex-col justify-between transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-600 dark:text-slate-400 flex items-center gap-1.5">
              <Cloud className="h-4 w-4 text-purple-500" />
              <span>Cloud Storage Node</span>
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
              <div className="inline-flex items-center gap-1.5 text-sm font-bold text-emerald-800 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/60 px-3 py-1.5 rounded-xl border border-emerald-200 dark:border-emerald-800/60 truncate max-w-full">
                <CheckCircle2 className="h-4 w-4 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <span className="truncate">@{telegramUsername}</span>
              </div>
            ) : (
              <div className="text-sm font-bold text-amber-600 dark:text-amber-400">
                Not Connected
              </div>
            )}
            <p className="mt-1.5 text-xs text-slate-500 dark:text-slate-400">
              Files stored in private Saved Messages.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1">
              <ShieldCheck className="h-3.5 w-3.5 text-emerald-500" />
              <span>MTProto TLS 1.3</span>
            </span>
            <span>Encrypted</span>
          </div>
        </div>
      </div>

      {/* 3. Detailed Storage Breakdown by File Type (The user's direct requirement!) */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 space-y-6 transition-colors">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Layers className="h-5 w-5 text-sky-600 dark:text-sky-400" />
              <h2 className="text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight">
                Storage Breakdown by File Type
              </h2>
            </div>
            <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
              Categorized breakdown of all media, documents, and archives stored in your Telegram Drive.
            </p>
          </div>

          <div className="flex items-center gap-2">
            {selectedCategory !== 'all' && (
              <button
                onClick={() => setSelectedCategory('all')}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-lg transition-colors"
              >
                <X className="h-3.5 w-3.5" />
                <span>Clear filter ({selectedCategory})</span>
              </button>
            )}
            <span className="text-xs text-slate-400 dark:text-slate-500 font-mono tabular-nums">
              Total: {storageBreakdown.formattedTotalBytes}
            </span>
          </div>
        </div>

        {/* Visual Multi-Segment Storage Distribution Bar */}
        <div className="space-y-2.5">
          <div className="h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden flex p-0.5 gap-0.5 border border-slate-200/80 dark:border-slate-700/60 shadow-inner">
            {storageBreakdown.totalBytes > 0 ? (
              storageBreakdown.categories.map((cat) => {
                if (cat.bytes <= 0) return null;
                // Minimum visual width 2% so tiny files don't vanish
                const visualWidth = Math.max(cat.percentage, 2);
                return (
                  <div
                    key={cat.key}
                    style={{ width: `${visualWidth}%`, backgroundColor: cat.color }}
                    className="h-full rounded-sm transition-all duration-300 cursor-pointer relative group"
                    onClick={() =>
                      setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)
                    }
                    title={`${cat.label}: ${cat.formattedBytes} (${cat.count} files, ${cat.percentage}%)`}
                  />
                );
              })
            ) : (
              <div className="h-full w-full bg-slate-200/60 dark:bg-slate-800 rounded-full flex items-center justify-center">
                <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500">
                  Ready for uploads · Unlimited space
                </span>
              </div>
            )}
          </div>

          {/* Scannable Legend Strip */}
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
            {storageBreakdown.categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)
                }
                className={`inline-flex items-center gap-2 py-1 px-2 rounded-lg transition-colors text-left ${
                  selectedCategory === cat.key
                    ? 'bg-slate-100 dark:bg-slate-800 font-bold text-slate-900 dark:text-slate-100 ring-1 ring-slate-300 dark:ring-slate-700'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: cat.color }}
                />
                <span className="font-medium">{cat.label}</span>
                <span className="font-mono tabular-nums text-slate-500 dark:text-slate-400">
                  {cat.formattedBytes}
                </span>
                <span className="text-[11px] text-slate-400 dark:text-slate-500 font-mono">
                  ({cat.percentage}%)
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* 6 Category Interactive Metric Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 pt-2">
          {storageBreakdown.categories.map((cat) => {
            const isSelected = selectedCategory === cat.key;
            return (
              <div
                key={cat.key}
                onClick={() =>
                  setSelectedCategory(selectedCategory === cat.key ? 'all' : cat.key)
                }
                className={`p-4 rounded-xl border transition-all cursor-pointer select-none flex flex-col justify-between ${
                  isSelected
                    ? 'bg-slate-50 dark:bg-slate-800/90 border-sky-500 dark:border-sky-400 ring-2 ring-sky-500/20 shadow-xs'
                    : 'bg-slate-50/60 dark:bg-slate-800/40 border-slate-200/80 dark:border-slate-800 hover:bg-slate-100/70 dark:hover:bg-slate-800/70 hover:border-slate-300 dark:hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div
                    className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${cat.bgLight} ${cat.bgDark} ${cat.textColor}`}
                  >
                    {getCategoryIcon(cat.iconType, 'h-4 w-4')}
                  </div>
                  {isSelected && (
                    <span className="text-[10px] font-bold text-sky-600 dark:text-sky-400 bg-sky-100 dark:bg-sky-950 px-1.5 py-0.5 rounded">
                      Active
                    </span>
                  )}
                </div>

                <div className="mt-3">
                  <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                    {cat.label}
                  </div>
                  <div className="mt-1 text-base sm:text-lg font-bold text-slate-900 dark:text-slate-100 tracking-tight font-mono tabular-nums">
                    {cat.formattedBytes}
                  </div>
                </div>

                <div className="mt-2.5 pt-2 border-t border-slate-200/60 dark:border-slate-700/60 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                  <span>{cat.count} files</span>
                  <span className="font-mono">{cat.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 4. Two-Column Dashboard Analytics & Infrastructure Strip */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Largest Files & Storage Insights */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-sky-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Largest Files in Storage
                </h3>
              </div>
              <span className="text-[11px] text-slate-400 dark:text-slate-500">Top items by size</span>
            </div>

            <div className="mt-3 divide-y divide-slate-100 dark:divide-slate-800/80">
              {storageBreakdown.largestFiles.length > 0 ? (
                storageBreakdown.largestFiles.map((file) => (
                  <div
                    key={file.id}
                    className="py-2.5 flex items-center justify-between gap-3 group hover:bg-slate-50/70 dark:hover:bg-slate-800/50 px-2 rounded-lg transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-8 w-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0 text-slate-500 dark:text-slate-400">
                        {getCategoryIcon(
                          getFileTypeCategory(file.mimeType, file.extension),
                          'h-4 w-4'
                        )}
                      </div>
                      <div className="min-w-0">
                        <p
                          className="text-xs font-semibold text-slate-800 dark:text-slate-200 truncate cursor-pointer hover:text-sky-600 dark:hover:text-sky-400"
                          onClick={() => setPreviewFile(file)}
                          title={file.name}
                        >
                          {file.name}
                        </p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500">
                          {file.extension.toUpperCase().replace('.', '')} · Added{' '}
                          {new Date(file.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <span className="text-xs font-bold text-slate-700 dark:text-slate-300 font-mono tabular-nums">
                        {formatBytes(file.fileSizeBytes)}
                      </span>
                      <button
                        onClick={() => setPreviewFile(file)}
                        title="Quick Preview"
                        className="p-1 rounded-md text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-xs text-slate-400 dark:text-slate-500">
                  No files indexed yet. Upload files to see top space consumers.
                </div>
              )}
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
            <span>Average size: {storageBreakdown.formattedAverageFileSize}</span>
            <Link
              href="/app/drive"
              className="text-sky-600 dark:text-sky-400 font-medium hover:underline inline-flex items-center gap-1"
            >
              <span>Explore My Drive</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>
        </div>

        {/* Right: Cloud Storage Specifications & Health */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs p-6 flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Cloud className="h-4 w-4 text-purple-500" />
                <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
                  Telegram Cloud Architecture
                </h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-md">
                Active Node
              </span>
            </div>

            <div className="mt-4 space-y-3 text-xs">
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Storage Backend</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  Telegram Saved Messages (Private Cloud)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Storage Quota</span>
                <span className="font-semibold text-emerald-600 dark:text-emerald-400">
                  Unlimited Space (0 byte limit)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Max Single File Size</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200 font-mono">
                  2,048 MB (2.0 GB)
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5 border-b border-slate-100 dark:border-slate-800/80">
                <span className="text-slate-500 dark:text-slate-400">Data Transfer Security</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  TLS 1.3 + MTProto Bot Protocol
                </span>
              </div>
              <div className="flex items-center justify-between py-1.5">
                <span className="text-slate-500 dark:text-slate-400">Current Session</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">
                  {telegramConnected ? `@${telegramUsername}` : 'Disconnected'}
                </span>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
            <button
              onClick={() => setShowConnectModal(true)}
              className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300"
            >
              Account Configuration →
            </button>
            <button
              onClick={() => syncTelegram()}
              disabled={telegramSyncing}
              className="text-xs font-medium text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 inline-flex items-center gap-1"
            >
              <RefreshCw className={`h-3 w-3 ${telegramSyncing ? 'animate-spin' : ''}`} />
              <span>Refresh status</span>
            </button>
          </div>
        </div>
      </div>

      {/* 5. Drag & Drop Quick Dropzone Banner */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className={`p-4 rounded-2xl border-2 border-dashed transition-all cursor-pointer flex flex-col sm:flex-row items-center justify-between gap-4 ${
          isDragging
            ? 'border-sky-500 bg-sky-50/70 dark:bg-sky-950/40 ring-4 ring-sky-500/10'
            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-850/50 hover:bg-slate-50 dark:hover:bg-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
        }`}
      >
        <div className="flex items-center gap-3.5">
          <div className="h-10 w-10 rounded-xl bg-sky-100 dark:bg-sky-950/80 text-sky-600 dark:text-sky-400 flex items-center justify-center shrink-0">
            <Upload className="h-5 w-5" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100">
              Drag & drop files here to upload directly
            </h4>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Files are immediately uploaded to your Telegram Saved Messages and indexed in One Cloud.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            fileInputRef.current?.click();
          }}
          className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-sky-700 dark:text-sky-300 bg-sky-100 dark:bg-sky-900/60 hover:bg-sky-200 dark:hover:bg-sky-800/70 rounded-xl transition-colors shrink-0"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Select Files</span>
        </button>
      </div>

      {/* 6. Recent Files Section with Category Filter Tabs & Toolbar */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs overflow-hidden transition-colors">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40">
          <div className="flex items-center gap-2">
            <Clock className="h-4 w-4 text-slate-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">
              {searchQuery.trim()
                ? `Search Results for "${searchQuery}"`
                : selectedCategory !== 'all'
                ? `${storageBreakdown.byKey[selectedCategory]?.label || selectedCategory} Files (${filteredRecentFiles.length})`
                : 'Recent Files'}
            </h3>
          </div>

          {/* Category Filter Tabs */}
          <div className="flex items-center gap-1 overflow-x-auto py-1">
            <button
              onClick={() => setSelectedCategory('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap ${
                selectedCategory === 'all'
                  ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              All ({activeFiles.length})
            </button>
            {storageBreakdown.categories.map((cat) => (
              <button
                key={cat.key}
                onClick={() => setSelectedCategory(cat.key)}
                className={`px-2.5 py-1 text-xs font-medium rounded-lg transition-colors whitespace-nowrap flex items-center gap-1.5 ${
                  selectedCategory === cat.key
                    ? 'bg-slate-900 text-white dark:bg-sky-600 dark:text-white shadow-2xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <span
                  className="h-1.5 w-1.5 rounded-full"
                  style={{ backgroundColor: cat.color }}
                />
                <span>{cat.label}</span>
                <span className="text-[11px] opacity-75 font-mono">({cat.count})</span>
              </button>
            ))}
          </div>

          <Link
            href="/app/drive"
            className="text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 dark:hover:text-sky-300 inline-flex items-center gap-1 shrink-0"
          >
            <span>Open Full Drive</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* File List Component */}
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
              ? 'Try adjusting your search keywords.'
              : selectedCategory !== 'all'
              ? `Upload ${selectedCategory} files or select a different category filter.`
              : 'Use the "+ Upload Files" button above to upload files into your Telegram cloud.'
          }
        />
      </div>

      {/* Modals */}
      {showNewFolderModal && <NewFolderModal onClose={() => setShowNewFolderModal(false)} />}
      {showConnectModal && <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />}
      {previewFile && <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />}
    </div>
  );
}
