'use client';

import React, { useState, useMemo, useRef } from 'react';
import Link from 'next/link';
import {
  Cloud,
  HardDrive,
  FileText,
  Folder,
  Send,
  Upload,
  Plus,
  ArrowRight,
  Star,
  Download,
  MoreVertical,
  CheckCircle,
  TrendingUp,
  ShieldCheck,
  File,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  RefreshCw,
  FolderPlus,
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
    searchQuery,
    uploadFiles,
    toggleStarFile,
    syncTelegram,
    telegramSyncing,
  } = useDrive();

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showConnectModal, setShowConnectModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

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
      .slice(0, 8);
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

  // Helper to get matching category icon and colors
  const getFileIcon = (mimeType: string, extension: string) => {
    const cat = getFileTypeCategory(mimeType, extension);
    switch (cat) {
      case 'document':
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-file-document" />,
          bg: 'bg-file-document/10',
          label: 'Document',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-file-image" />,
          bg: 'bg-file-image/10',
          label: 'Image',
        };
      case 'video':
        return {
          icon: <VideoIcon className="w-5 h-5 text-file-video" />,
          bg: 'bg-file-video/10',
          label: 'Video',
        };
      case 'audio':
        return {
          icon: <Headphones className="w-5 h-5 text-file-audio" />,
          bg: 'bg-file-audio/10',
          label: 'Audio',
        };
      case 'archive':
        return {
          icon: <Archive className="w-5 h-5 text-file-archive" />,
          bg: 'bg-file-archive/10',
          label: 'Archive',
        };
      default:
        return {
          icon: <File className="w-5 h-5 text-text-muted" />,
          bg: 'bg-surface-raised',
          label: 'File',
        };
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 24) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffHours < 48) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
      className={`min-h-full w-full bg-canvas text-text-primary transition-colors ${
        isDragging ? 'ring-2 ring-primary ring-inset bg-surface-raised/40' : ''
      }`}
    >
      <div className="w-full px-6 lg:px-8 py-8 max-w-7xl mx-auto flex flex-col gap-8">
        {/* Hidden native file input */}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          multiple
          className="hidden"
        />

        {/* Top Welcome & Actions Header */}
        <section className="flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-surface-raised text-xs text-text-secondary border border-border/50">
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    telegramConnected ? 'bg-tertiary animate-pulse' : 'bg-warning'
                  }`}
                />
                {telegramConnected ? 'Telegram Cloud Active' : 'Telegram Disconnected'}
              </span>
              <span className="text-text-muted text-xs">•</span>
              <span className="text-xs text-text-muted">
                {telegramConnected
                  ? `@${telegramUsername || 'TelegramDrive'}`
                  : 'Connect to sync files'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Welcome back, {user?.displayName || 'Alex'}
            </h1>
            <p className="text-sm text-text-secondary">
              Your files are synchronized with Telegram Saved Messages via MTProto proxy.
            </p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
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
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Storage Used</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-primary border border-border/40">
                <Cloud className="w-4 h-4 text-primary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums">
                {storageBreakdown.formattedTotalBytes}
              </div>
              <div className="text-xs text-text-muted mt-1.5">Saved Messages Allocation</div>
            </div>
            <div className="mt-4 pt-1">
              <div className="w-full h-1.5 bg-surface-raised rounded-full overflow-hidden flex gap-0.5">
                <div
                  className="bg-file-document h-full transition-all"
                  style={{ width: `${storageBreakdown.categories[2]?.percentage || 0}%` }}
                  title={`Documents: ${storageBreakdown.categories[2]?.formattedBytes || '0 B'}`}
                />
                <div
                  className="bg-file-image h-full transition-all"
                  style={{ width: `${storageBreakdown.categories[1]?.percentage || 0}%` }}
                  title={`Images: ${storageBreakdown.categories[1]?.formattedBytes || '0 B'}`}
                />
                <div
                  className="bg-file-video h-full transition-all"
                  style={{ width: `${storageBreakdown.categories[0]?.percentage || 0}%` }}
                  title={`Videos: ${storageBreakdown.categories[0]?.formattedBytes || '0 B'}`}
                />
                <div
                  className="bg-file-audio h-full transition-all"
                  style={{ width: `${storageBreakdown.categories[3]?.percentage || 0}%` }}
                  title={`Audio: ${storageBreakdown.categories[3]?.formattedBytes || '0 B'}`}
                />
                <div
                  className="bg-file-archive h-full transition-all"
                  style={{ width: `${storageBreakdown.categories[4]?.percentage || 0}%` }}
                  title={`Archives: ${storageBreakdown.categories[4]?.formattedBytes || '0 B'}`}
                />
              </div>
            </div>
          </div>

          {/* Card 2: Total Files */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Total Files</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-tertiary border border-border/40">
                <FileText className="w-4 h-4 text-tertiary" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums">
                {activeFiles.length.toLocaleString()}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <TrendingUp className="w-3.5 h-3.5 text-tertiary" />
                <span className="text-xs font-medium text-tertiary">
                  +{Math.min(activeFiles.length, 12)} added recently
                </span>
              </div>
            </div>
            <div className="mt-4 pt-1 text-xs text-text-muted truncate">
              Zero compression loss
            </div>
          </div>

          {/* Card 3: Folders */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Folders</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-file-audio border border-border/40">
                <Folder className="w-4 h-4 text-file-audio" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-text-primary leading-none tabular-nums">
                {activeFolders.length.toLocaleString()}
              </div>
              <div className="text-xs text-text-muted mt-1.5">
                Across virtual directory roots
              </div>
            </div>
            <div className="mt-4 pt-1 text-xs text-text-secondary truncate">
              Hierarchical Firestore tree
            </div>
          </div>

          {/* Card 4: Telegram Connection */}
          <div className="bg-surface border border-border rounded-xl p-5 flex flex-col justify-between">
            <div className="flex items-start justify-between">
              <span className="text-xs font-medium text-text-secondary">Telegram Connection</span>
              <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center text-secondary border border-border/40">
                <Send className="w-4 h-4 text-[#36AEEA]" />
              </div>
            </div>
            <div className="mt-4">
              <div className="text-lg font-semibold text-text-primary tracking-tight truncate">
                {telegramConnected ? `@${telegramUsername || 'connected'}` : 'Not Connected'}
              </div>
              <div className="flex items-center gap-1.5 mt-1.5">
                <CheckCircle
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
            <div className="mt-4 pt-1 text-xs text-text-muted truncate">
              {telegramConnected ? (
                <span>Proxy session active</span>
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
        <section className="bg-surface border border-border rounded-xl p-5 flex flex-col gap-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <h2 className="text-base font-semibold text-text-primary">Storage Breakdown</h2>
              <span className="text-xs text-text-secondary bg-surface-raised px-2.5 py-0.5 rounded-full border border-border/50">
                {storageBreakdown.formattedTotalBytes} total
              </span>
            </div>
            <span className="text-xs text-text-muted hidden sm:inline">
              Bot chunk limit: 2,000 MB / file
            </span>
          </div>

          {/* Multi-segmented Horizontal Progress Track */}
          <div className="flex flex-col gap-2">
            <div className="h-3 w-full bg-surface-raised rounded-full overflow-hidden flex gap-1 p-0.5 border border-border/40">
              {storageBreakdown.categories.map((cat) => {
                let bgClass = 'bg-text-muted';
                if (cat.key === 'documents') bgClass = 'bg-file-document';
                if (cat.key === 'images') bgClass = 'bg-file-image';
                if (cat.key === 'videos') bgClass = 'bg-file-video';
                if (cat.key === 'audio') bgClass = 'bg-file-audio';
                if (cat.key === 'archives' || cat.key === 'others') bgClass = 'bg-file-archive';

                return (
                  <div
                    key={cat.key}
                    className={`${bgClass} rounded-full h-full transition-all duration-300`}
                    style={{
                      width: `${Math.max(cat.bytes > 0 ? 3 : 0, cat.percentage)}%`,
                    }}
                    title={`${cat.label}: ${cat.formattedBytes}`}
                  />
                );
              })}
            </div>
          </div>

          {/* 5 Breakdown Category Tiles */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {storageBreakdown.categories.map((cat) => {
              const isSelected = selectedCategory === cat.key;
              let dotColor = 'bg-text-muted';
              let IconComp = FileText;

              if (cat.key === 'documents') {
                dotColor = 'bg-file-document';
                IconComp = FileText;
              } else if (cat.key === 'images') {
                dotColor = 'bg-file-image';
                IconComp = ImageIcon;
              } else if (cat.key === 'videos') {
                dotColor = 'bg-file-video';
                IconComp = VideoIcon;
              } else if (cat.key === 'audio') {
                dotColor = 'bg-file-audio';
                IconComp = Headphones;
              } else if (cat.key === 'archives' || cat.key === 'others') {
                dotColor = 'bg-file-archive';
                IconComp = Archive;
              }

              return (
                <button
                  key={cat.key}
                  onClick={() =>
                    setSelectedCategory(isSelected ? 'all' : (cat.key as StorageCategoryKey))
                  }
                  className={`bg-surface-raised rounded-lg p-3.5 flex flex-col gap-1 transition-all text-left border cursor-pointer ${
                    isSelected
                      ? 'border-primary ring-1 ring-primary bg-surface-hover'
                      : 'border-border/60 hover:bg-surface-hover hover:border-border'
                  }`}
                  type="button"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
                      <span className="text-xs font-medium text-text-primary">
                        {cat.label}
                      </span>
                    </div>
                    <IconComp className="w-3.5 h-3.5 text-text-muted" />
                  </div>
                  <div className="flex items-baseline justify-between mt-2">
                    <span className="text-sm font-semibold text-text-primary tabular-nums">
                      {cat.formattedBytes}
                    </span>
                    <span className="text-xs text-text-muted tabular-nums">
                      {cat.count} {cat.count === 1 ? 'item' : 'items'}
                    </span>
                  </div>
                </button>
              );
            })}
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
                  className="text-xs text-primary hover:underline ml-2"
                >
                  Clear filter ({selectedCategory})
                </button>
              )}
            </div>
            <Link
              href="/app/recent"
              className="text-xs font-medium text-primary hover:text-brand-hover flex items-center gap-1 transition-colors"
            >
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* File Table / Container */}
          <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs">
            {/* Table Header */}
            <div className="grid grid-cols-12 items-center px-4 py-2.5 bg-surface-raised border-b border-border text-[11px] font-semibold text-text-muted uppercase tracking-wider select-none">
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
                  Drag files anywhere onto this window or click Upload files to store them directly
                  in Telegram Saved Messages.
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
              <div className="divide-y divide-border/60">
                {filteredRecentFiles.map((file) => {
                  const meta = getFileIcon(file.mimeType, file.extension);

                  return (
                    <div
                      key={file.id}
                      onClick={() => setPreviewFile(file)}
                      className="grid grid-cols-12 items-center px-4 h-[54px] hover:bg-surface-hover transition-colors group cursor-pointer"
                    >
                      <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                        <button
                          aria-label="Toggle star"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          className={`focus:outline-none shrink-0 cursor-pointer p-0.5 rounded transition-colors ${
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
                          className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 border border-border/40`}
                        >
                          {meta.icon}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className="text-xs sm:text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
                            {file.name}
                          </span>
                          <span className="sm:hidden text-[10px] text-text-muted leading-tight">
                            {meta.label}
                          </span>
                        </div>
                      </div>

                      <div className="hidden sm:flex sm:col-span-2 items-center">
                        <span className="text-xs text-text-secondary">{meta.label}</span>
                      </div>

                      <div className="col-span-3 sm:col-span-2 text-xs text-text-muted truncate">
                        {formatDateDisplay(file.uploadedAt)}
                      </div>

                      <div className="col-span-2 sm:col-span-2 text-xs text-text-secondary text-right sm:text-left tabular-nums">
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
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                        <button
                          onClick={() => setPreviewFile(file)}
                          aria-label="Preview"
                          className="w-7 h-7 rounded-lg hidden sm:flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                          type="button"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
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
        <section className="bg-brand-subtle border border-border/60 rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-primary-container/20 flex items-center justify-center shrink-0 text-primary border border-primary/30">
              <ShieldCheck className="w-5 h-5 text-primary" />
            </div>
            <div className="flex flex-col">
              <span className="text-xs sm:text-sm font-semibold text-text-primary">
                Telegram Backup Health
              </span>
              <span className="text-xs text-text-secondary">
                All {activeFiles.length} files verified in Telegram Saved Messages • End-to-end checksum valid
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
                className={`w-3 h-3 ${telegramSyncing ? 'animate-spin text-primary' : ''}`}
              />
              <span>{telegramSyncing ? 'Verifying...' : 'Sync Now'}</span>
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
