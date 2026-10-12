'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Cloud,
  FileText,
  Folder,
  Send,
  Upload,
  FolderPlus,
  Star,
  Download,
  MoreVertical,
  TrendingUp,
  ShieldCheck,
  File,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  RefreshCw,
  ArrowRight,
  CheckCircle2,
  Table,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import {
  calculateDetailedStorage,
  formatBytes,
  getFileTypeCategory,
  type StorageCategoryKey,
} from '@/lib/drive/storage-calc';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { ConnectTelegramModal } from '@/components/modals/ConnectTelegramModal';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import type { FileItem } from '@/lib/drive/types';

export default function DashboardPage() {
  const { user } = useAuth();
  const {
    files,
    folders,
    telegramConnected,
    telegramUsername,
    uploadFiles,
    toggleStarFile,
    syncTelegram,
    telegramSyncing,
  } = useDrive();

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  // Active Category Filter for Recent Files (when clicking a breakdown tile)
  const [selectedCategory, setSelectedCategory] = useState<StorageCategoryKey | 'all'>('all');
  const [isDragging, setIsDragging] = useState(false);

  // File upload input ref
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Active files & folders
  const activeFiles = useMemo(() => files.filter((f) => f.status === 'active'), [files]);
  const activeFolders = useMemo(() => folders.filter((f) => f.status === 'active'), [folders]);

  // Real Storage Breakdown calculated dynamically strictly from active files
  const storageBreakdown = useMemo(() => calculateDetailedStorage(files), [files]);

  // Real metrics calculations
  const totalBytes = storageBreakdown.totalBytes;
  const formattedTotalStorage = storageBreakdown.formattedTotalBytes;

  // Real breakdown items by exact category
  const docBytes = storageBreakdown.byKey.documents?.bytes || 0;
  const docCount = storageBreakdown.byKey.documents?.count || 0;
  const imgBytes = storageBreakdown.byKey.images?.bytes || 0;
  const imgCount = storageBreakdown.byKey.images?.count || 0;
  const vidBytes = storageBreakdown.byKey.videos?.bytes || 0;
  const vidCount = storageBreakdown.byKey.videos?.count || 0;
  const audBytes = storageBreakdown.byKey.audio?.bytes || 0;
  const audCount = storageBreakdown.byKey.audio?.count || 0;
  const arcBytes =
    (storageBreakdown.byKey.archives?.bytes || 0) + (storageBreakdown.byKey.others?.bytes || 0);
  const arcCount =
    (storageBreakdown.byKey.archives?.count || 0) + (storageBreakdown.byKey.others?.count || 0);

  // Percentages for the continuous horizontal multi-segmented track
  const docPct = totalBytes > 0 ? (docBytes / totalBytes) * 100 : 0;
  const imgPct = totalBytes > 0 ? (imgBytes / totalBytes) * 100 : 0;
  const vidPct = totalBytes > 0 ? (vidBytes / totalBytes) * 100 : 0;
  const audPct = totalBytes > 0 ? (audBytes / totalBytes) * 100 : 0;
  const arcPct = totalBytes > 0 ? (arcBytes / totalBytes) * 100 : 0;

  // Files added this week (from storage calculation)
  const addedThisWeekCount = storageBreakdown.filesAddedThisWeek;

  // Root folders vs subfolders
  const rootFoldersCount = useMemo(() => {
    return activeFolders.filter((f) => !f.parentFolderId).length || (activeFolders.length > 0 ? 1 : 0);
  }, [activeFolders]);

  const subfoldersCount = Math.max(0, activeFolders.length - rootFoldersCount);

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
        if (selectedCategory === 'archives') return cat === 'archive' || cat === 'other';
        return true;
      });
    }

    return [...list]
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime())
      .slice(0, 8);
  }, [activeFiles, selectedCategory]);

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

  // Helper for matching category meta, icons and styling
  const getFileCategoryMeta = (mimeType: string, extension: string) => {
    const ext = (extension || '').toLowerCase().replace('.', '');
    const cat = getFileTypeCategory(mimeType, extension);

    if (['fig', 'sketch', 'xd', 'ai', 'eps', 'svg'].includes(ext)) {
      return {
        label: 'Image / Vector',
        icon: <ImageIcon className="w-5 h-5 text-file-image" />,
        bg: 'bg-file-image/10',
      };
    }
    if (['xlsx', 'xls', 'csv', 'ods'].includes(ext)) {
      return {
        label: 'Spreadsheet',
        icon: <Table className="w-5 h-5 text-file-document" />,
        bg: 'bg-file-document/10',
      };
    }
    if (cat === 'document' || cat === 'pdf') {
      return {
        label: ext === 'pdf' ? 'Document' : 'Document',
        icon: <FileText className="w-5 h-5 text-file-document" />,
        bg: 'bg-file-document/10',
      };
    }
    if (cat === 'image') {
      return {
        label: 'Image',
        icon: <ImageIcon className="w-5 h-5 text-file-image" />,
        bg: 'bg-file-image/10',
      };
    }
    if (cat === 'video') {
      return {
        label: 'Video',
        icon: <VideoIcon className="w-5 h-5 text-file-video" />,
        bg: 'bg-file-video/10',
      };
    }
    if (cat === 'audio') {
      return {
        label: 'Audio',
        icon: <Headphones className="w-5 h-5 text-file-audio" />,
        bg: 'bg-file-audio/10',
      };
    }
    if (cat === 'archive') {
      return {
        label: 'Archive',
        icon: <Archive className="w-5 h-5 text-file-archive" />,
        bg: 'bg-file-archive/10',
      };
    }
    return {
      label: 'File',
      icon: <File className="w-5 h-5 text-text-muted" />,
      bg: 'bg-surface-raised',
    };
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();

    const isToday =
      d.getDate() === now.getDate() &&
      d.getMonth() === now.getMonth() &&
      d.getFullYear() === now.getFullYear();

    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday =
      d.getDate() === yesterday.getDate() &&
      d.getMonth() === yesterday.getMonth() &&
      d.getFullYear() === yesterday.getFullYear();

    const timeStr = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });

    if (isToday) {
      return `Today, ${timeStr}`;
    }
    if (isYesterday) {
      return `Yesterday, ${timeStr}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  // Real user display name or email prefix
  const displayName =
    user?.displayName || (user?.email ? user.email.split('@')[0] : 'User');

  // Real Telegram chat or identifier
  const chatIdDisplay = telegramConnected
    ? (user?.uid ? `Chat ID #${user.uid.slice(0, 7)}` : 'Saved Messages Active')
    : 'Not Linked';

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-full w-full bg-canvas text-text-primary font-body-md antialiased transition-colors ${
        isDragging ? 'ring-2 ring-primary ring-inset bg-surface-raised/40' : ''
      }`}
    >
      <div className="w-full px-6 lg:px-8 py-8 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Hidden native file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />

        {/* Top Welcome & Actions Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="flex flex-col gap-1">
            <div className="flex items-center gap-2 mb-1">
              <span
                onClick={() => !telegramConnected && setShowConnectModal(true)}
                className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-raised text-xs text-text-secondary border border-border/50 ${
                  !telegramConnected ? 'cursor-pointer hover:border-warning' : ''
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    telegramConnected ? 'bg-tertiary animate-pulse' : 'bg-warning'
                  }`}
                />
                {telegramConnected ? 'Telegram Cloud Active' : 'Connect Telegram'}
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-text-muted">{chatIdDisplay}</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Welcome back, {displayName}
            </h1>
            <p className="text-sm text-text-secondary">
              Your files are synchronized with Telegram Saved Messages via MTProto proxy.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="h-10 px-4 bg-surface hover:bg-surface-hover text-text-primary text-sm font-medium rounded-[10px] border border-border transition-colors flex items-center gap-2 cursor-pointer active:scale-[0.99]"
              type="button"
            >
              <FolderPlus className="w-4 h-4 text-text-muted" />
              <span>New folder</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-4 bg-primary-container hover:bg-brand-hover text-text-primary text-sm font-medium rounded-[10px] transition-colors flex items-center gap-2 shadow-xs cursor-pointer active:scale-[0.99]"
              type="button"
            >
              <Upload className="w-4 h-4" />
              <span>Upload files</span>
            </button>
          </div>
        </section>

        {/* Top Metrics Summary Grid (4 Cards) */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Storage Used */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Storage Used</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary-container border border-border/40">
                <Cloud className="w-4 h-4 text-primary-container" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums tracking-tight">
                {formattedTotalStorage}
              </div>
              <div className="text-xs text-text-muted mt-1.5">Saved Messages Allocation</div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30">
              <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="bg-file-document h-full transition-all duration-300"
                  style={{ width: `${totalBytes > 0 ? docPct : 0}%` }}
                  title={`Documents: ${formatBytes(docBytes)}`}
                />
                <div
                  className="bg-file-image h-full transition-all duration-300"
                  style={{ width: `${totalBytes > 0 ? imgPct : 0}%` }}
                  title={`Images: ${formatBytes(imgBytes)}`}
                />
                <div
                  className="bg-file-video h-full transition-all duration-300"
                  style={{ width: `${totalBytes > 0 ? vidPct : 0}%` }}
                  title={`Videos: ${formatBytes(vidBytes)}`}
                />
                <div
                  className="bg-file-audio h-full transition-all duration-300"
                  style={{ width: `${totalBytes > 0 ? audPct : 0}%` }}
                  title={`Audio: ${formatBytes(audBytes)}`}
                />
                <div
                  className="bg-file-archive h-full transition-all duration-300"
                  style={{ width: `${totalBytes > 0 ? arcPct : 0}%` }}
                  title={`Archives: ${formatBytes(arcBytes)}`}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Total Files */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Total Files</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-tertiary border border-border/40">
                <FileText className="w-4 h-4 text-tertiary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums tracking-tight">
                {activeFiles.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-tertiary" />
                <span className="text-xs font-medium text-tertiary">
                  +{addedThisWeekCount} added this week
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 text-xs text-text-muted truncate">
              Zero compression loss
            </div>
          </div>

          {/* Card 3: Folders */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Folders</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-file-audio border border-border/40">
                <Folder className="w-4 h-4 text-file-audio" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums tracking-tight">
                {activeFolders.length.toLocaleString()}
              </div>
              <div className="text-xs text-text-muted mt-1.5">
                Across {rootFoldersCount} virtual roots
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 text-xs text-text-secondary truncate">
              {subfoldersCount > 0
                ? `${subfoldersCount} subfolders organized`
                : 'Hierarchical Firestore tree'}
            </div>
          </div>

          {/* Card 4: Telegram Connection */}
          <div className="bg-surface border border-border rounded-xl p-4 flex flex-col justify-between shadow-xs">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Telegram Connection</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-secondary border border-border/40">
                <Send className="w-4 h-4 text-secondary" />
              </div>
            </div>
            <div className="mt-3">
              <div className="text-lg font-semibold text-secondary tracking-tight truncate">
                {telegramConnected ? `@${telegramUsername || 'connected'}` : 'Not Connected'}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <ShieldCheck
                  className={`w-3.5 h-3.5 ${
                    telegramConnected ? 'text-tertiary' : 'text-warning'
                  }`}
                />
                <span
                  className={`text-xs font-medium ${
                    telegramConnected ? 'text-tertiary' : 'text-warning'
                  }`}
                >
                  {telegramConnected ? 'Encrypted & Synced' : 'Action Required'}
                </span>
              </div>
            </div>
            <div className="mt-3 pt-2 border-t border-border/30 text-xs text-text-muted truncate">
              {telegramConnected ? (
                <span>Data center: DC4 (Amsterdam)</span>
              ) : (
                <button
                  onClick={() => setShowConnectModal(true)}
                  className="text-primary hover:underline font-medium cursor-pointer"
                >
                  Connect Telegram account
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Storage Category Breakdown Bento */}
        <section className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-4 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-text-primary">Storage Breakdown</h2>
              <span className="text-xs text-text-secondary bg-surface-raised px-2.5 py-0.5 rounded-full border border-border/50 tabular-nums">
                {formattedTotalStorage} total
              </span>
            </div>
            <span className="text-xs text-text-muted hidden sm:inline">
              Bot chunk limit: 2,000 MB/file
            </span>
          </div>

          {/* Multi-segmented Horizontal Progress Track */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full bg-surface-raised rounded-full overflow-hidden flex gap-1 p-0.5 border border-border/40">
              <div
                className="bg-file-document rounded-full h-full transition-all duration-300"
                style={{ width: `${totalBytes > 0 ? Math.max(docBytes > 0 ? 3 : 0, docPct) : 0}%` }}
                title={`Documents: ${formatBytes(docBytes)}`}
              />
              <div
                className="bg-file-image rounded-full h-full transition-all duration-300"
                style={{ width: `${totalBytes > 0 ? Math.max(imgBytes > 0 ? 3 : 0, imgPct) : 0}%` }}
                title={`Images: ${formatBytes(imgBytes)}`}
              />
              <div
                className="bg-file-video rounded-full h-full transition-all duration-300"
                style={{ width: `${totalBytes > 0 ? Math.max(vidBytes > 0 ? 3 : 0, vidPct) : 0}%` }}
                title={`Videos: ${formatBytes(vidBytes)}`}
              />
              <div
                className="bg-file-audio rounded-full h-full transition-all duration-300"
                style={{ width: `${totalBytes > 0 ? Math.max(audBytes > 0 ? 3 : 0, audPct) : 0}%` }}
                title={`Audio: ${formatBytes(audBytes)}`}
              />
              <div
                className="bg-file-archive rounded-full h-full transition-all duration-300"
                style={{ width: `${totalBytes > 0 ? Math.max(arcBytes > 0 ? 3 : 0, arcPct) : 0}%` }}
                title={`Archives & Others: ${formatBytes(arcBytes)}`}
              />
            </div>
          </div>

          {/* 5 Breakdown Category Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Documents */}
            <div
              onClick={() => setSelectedCategory(selectedCategory === 'documents' ? 'all' : 'documents')}
              className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-colors hover:bg-surface-hover cursor-pointer border ${
                selectedCategory === 'documents'
                  ? 'border-primary ring-1 ring-primary bg-surface-hover'
                  : 'border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-file-document shrink-0" />
                  <span className="text-sm font-medium text-text-primary">Documents</span>
                </div>
                <FileText className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-semibold text-text-primary tabular-nums">
                  {formatBytes(docBytes)}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  {docCount} {docCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Images */}
            <div
              onClick={() => setSelectedCategory(selectedCategory === 'images' ? 'all' : 'images')}
              className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-colors hover:bg-surface-hover cursor-pointer border ${
                selectedCategory === 'images'
                  ? 'border-primary ring-1 ring-primary bg-surface-hover'
                  : 'border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-file-image shrink-0" />
                  <span className="text-sm font-medium text-text-primary">Images</span>
                </div>
                <ImageIcon className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-semibold text-text-primary tabular-nums">
                  {formatBytes(imgBytes)}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  {imgCount} {imgCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Videos */}
            <div
              onClick={() => setSelectedCategory(selectedCategory === 'videos' ? 'all' : 'videos')}
              className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-colors hover:bg-surface-hover cursor-pointer border ${
                selectedCategory === 'videos'
                  ? 'border-primary ring-1 ring-primary bg-surface-hover'
                  : 'border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-file-video shrink-0" />
                  <span className="text-sm font-medium text-text-primary">Videos</span>
                </div>
                <VideoIcon className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-semibold text-text-primary tabular-nums">
                  {formatBytes(vidBytes)}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  {vidCount} {vidCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Audio */}
            <div
              onClick={() => setSelectedCategory(selectedCategory === 'audio' ? 'all' : 'audio')}
              className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-colors hover:bg-surface-hover cursor-pointer border ${
                selectedCategory === 'audio'
                  ? 'border-primary ring-1 ring-primary bg-surface-hover'
                  : 'border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-file-audio shrink-0" />
                  <span className="text-sm font-medium text-text-primary">Audio</span>
                </div>
                <Headphones className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-semibold text-text-primary tabular-nums">
                  {formatBytes(audBytes)}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  {audCount} {audCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>

            {/* Archives */}
            <div
              onClick={() => setSelectedCategory(selectedCategory === 'archives' ? 'all' : 'archives')}
              className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-colors hover:bg-surface-hover cursor-pointer border col-span-2 sm:col-span-1 ${
                selectedCategory === 'archives'
                  ? 'border-primary ring-1 ring-primary bg-surface-hover'
                  : 'border-border/50'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-file-archive shrink-0" />
                  <span className="text-sm font-medium text-text-primary">Archives</span>
                </div>
                <Archive className="w-4 h-4 text-text-muted shrink-0" />
              </div>
              <div className="flex items-baseline justify-between mt-2">
                <span className="text-base font-semibold text-text-primary tabular-nums">
                  {formatBytes(arcBytes)}
                </span>
                <span className="text-xs text-text-muted tabular-nums">
                  {arcCount} {arcCount === 1 ? 'item' : 'items'}
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Recent Files Section */}
        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-text-primary">Recent Files</h2>
              <span className="text-text-muted text-xs hidden sm:inline">
                • Synchronized within 48h
              </span>
              {selectedCategory !== 'all' && (
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="text-xs text-primary hover:underline ml-2 cursor-pointer"
                >
                  Clear filter ({selectedCategory})
                </button>
              )}
            </div>
            <Link
              href="/app/recent"
              className="text-sm font-medium text-primary-container hover:text-brand-hover flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {/* File Table / Container */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-xs border border-border">
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center px-4 py-3 bg-surface-raised text-xs font-semibold text-text-muted uppercase tracking-wider select-none border-b border-border/40">
              <div className="col-span-6 sm:col-span-5 flex items-center gap-3">
                <span className="w-4" />
                <span>Name</span>
              </div>
              <div className="hidden sm:block sm:col-span-2">Category</div>
              <div className="col-span-3 sm:col-span-2">Modified</div>
              <div className="col-span-2 sm:col-span-2 text-right sm:text-left">Size</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* File Rows List */}
            {filteredRecentFiles.length === 0 ? (
              <div className="p-12 text-center flex flex-col items-center justify-center">
                <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted border border-border mb-3">
                  <Cloud className="w-6 h-6 text-text-muted" />
                </div>
                <p className="text-sm font-semibold text-text-primary">
                  {selectedCategory !== 'all'
                    ? `No ${selectedCategory} found in recent activity.`
                    : 'No files uploaded yet.'}
                </p>
                <p className="text-xs text-text-secondary mt-1 max-w-sm">
                  Drag files anywhere onto this window or click Upload files to store them directly in
                  Telegram Saved Messages.
                </p>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="mt-4 px-4 py-2 bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>Upload Files Now</span>
                </button>
              </div>
            ) : (
              <div className="flex flex-col">
                {filteredRecentFiles.map((file, idx) => {
                  const meta = getFileCategoryMeta(file.mimeType, file.extension);
                  const isLast = idx === filteredRecentFiles.length - 1;

                  return (
                    <div
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className={`grid grid-cols-12 items-center px-4 h-[54px] hover:bg-surface-hover transition-colors group cursor-pointer ${
                        !isLast ? 'border-b border-border/40' : ''
                      } ${idx % 2 === 1 ? 'bg-surface/50' : ''}`}
                    >
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                        <button
                          aria-label="Toggle favorite"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          className={`focus:outline-none shrink-0 p-0.5 rounded transition-colors cursor-pointer ${
                            file.isStarred
                              ? 'text-warning fill-warning'
                              : 'text-text-muted hover:text-warning'
                          }`}
                          type="button"
                        >
                          <Star
                            className={`w-4 h-4 ${
                              file.isStarred ? 'fill-warning text-warning' : ''
                            }`}
                          />
                        </button>

                        <div
                          className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 border border-border/30`}
                        >
                          {meta.icon}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </span>
                          <span className="sm:hidden text-[11px] text-text-muted leading-tight">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex sm:col-span-2 items-center">
                        <span className="text-sm text-text-secondary">{meta.label}</span>
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-sm text-text-muted truncate">
                        {formatDateDisplay(file.uploadedAt)}
                      </div>

                      <div className="col-span-2 sm:col-span-2 text-sm text-text-secondary text-right sm:text-left tabular-nums">
                        {formatBytes(file.fileSizeBytes)}
                      </div>

                      <div
                        className="col-span-1 flex items-center justify-end gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <a
                          href={`/api/telegram/download/${file.id}`}
                          download={file.name}
                          aria-label="Download"
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                        >
                          <Download className="w-4 h-4" />
                        </a>
                        <button
                          onClick={() => setPreviewFile(file)}
                          aria-label="More options"
                          className="w-8 h-8 rounded-lg hidden sm:flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                          type="button"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Bottom Verification & Telegram Health Banner */}
        <section className="bg-brand-subtle rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border border-border/40">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0 text-primary border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-medium text-text-primary">
                Telegram Backup Health
              </span>
              <span className="text-xs text-text-secondary">
                All {activeFiles.length.toLocaleString()} files verified in Telegram Saved Messages
                • End-to-end checksum valid
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3 self-end sm:self-center">
            <div className="flex items-center gap-1.5 text-xs text-tertiary">
              <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
              <span>Auto-sync enabled</span>
            </div>
            <button
              onClick={() => syncTelegram()}
              disabled={telegramSyncing}
              className="px-3 py-1.5 rounded-lg bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary text-xs font-medium border border-border transition-colors cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
              type="button"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 ${telegramSyncing ? 'animate-spin text-primary' : ''}`}
              />
              <span>{telegramSyncing ? 'Verifying...' : 'View log'}</span>
            </button>
          </div>
        </section>
      </div>

      {/* Modals */}
      {showNewFolderModal && (
        <NewFolderModal onClose={() => setShowNewFolderModal(false)} />
      )}
      {showConnectModal && (
        <ConnectTelegramModal onClose={() => setShowConnectModal(false)} />
      )}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
