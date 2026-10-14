'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import {
  List,
  LayoutGrid,
  Filter,
  Star,
  Download,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  File,
  RotateCw,
  Send,
  ArrowRight,
  Folder,
  History,
  Edit2,
  Eye,
  Trash2,
  AlertTriangle,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { RenameModal } from '@/components/modals/RenameModal';
import { DeleteConfirmModal, type DeleteTargetItem } from '@/components/modals/DeleteConfirmModal';
import type { FileItem } from '@/lib/drive/types';
import { ItemIcon } from '@/components/drive/ItemIcon';

export default function RecentPage() {
  const { files, folders, searchQuery, toggleStarFile, downloadFile, viewMode, setViewMode } = useDrive();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedTimeFilter, setSelectedTimeFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');
  const [selectedTypeFilter, setSelectedTypeFilter] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [isClearing, setIsClearing] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetItem | null>(null);

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.drive-menu-container')) {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    return () => document.removeEventListener('click', handleOutsideClick);
  }, []);

  const activeFiles = useMemo(
    () => files.filter((f) => f.status === 'active'),
    [files]
  );

  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  const filteredFiles = useMemo(() => {
    let list = activeFiles;

    // Time filter
    if (selectedTimeFilter !== 'all') {
      const now = new Date();
      list = list.filter((f) => {
        const d = new Date(f.uploadedAt);
        const diffHours = (now.getTime() - d.getTime()) / (1000 * 60 * 60);
        if (selectedTimeFilter === 'today') return diffHours <= 24;
        if (selectedTimeFilter === 'week') return diffHours <= 24 * 7;
        if (selectedTimeFilter === 'month') return diffHours <= 24 * 30;
        return true;
      });
    }

    // Type filter
    if (selectedTypeFilter !== 'all') {
      list = list.filter((f) => {
        const cat = getFileTypeCategory(f.mimeType, f.extension);
        if (selectedTypeFilter === 'document') return cat === 'document' || cat === 'pdf';
        if (selectedTypeFilter === 'image') return cat === 'image';
        if (selectedTypeFilter === 'video') return cat === 'video';
        return true;
      });
    }

    const q = (localSearch || searchQuery).trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [activeFiles, selectedTimeFilter, selectedTypeFilter, localSearch, searchQuery]);

  // Group files into Today vs Earlier
  const { todayFiles, earlierFiles } = useMemo(() => {
    const today: FileItem[] = [];
    const earlier: FileItem[] = [];
    const now = new Date();

    filteredFiles.forEach((file) => {
      const d = new Date(file.uploadedAt);
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        today.push(file);
      } else {
        earlier.push(file);
      }
    });

    return { todayFiles: today, earlierFiles: earlier };
  }, [filteredFiles]);

  const getFileCategoryMeta = (mimeType: string, extension: string) => {
    const cat = getFileTypeCategory(mimeType, extension);
    switch (cat) {
      case 'document':
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-file-document" />,
          colorClass: 'text-file-document',
          label: 'Documents',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-file-image" />,
          colorClass: 'text-file-image',
          label: 'Images',
        };
      case 'video':
        return {
          icon: <VideoIcon className="w-5 h-5 text-file-video" />,
          colorClass: 'text-file-video',
          label: 'Videos',
        };
      case 'audio':
        return {
          icon: <Headphones className="w-5 h-5 text-file-audio" />,
          colorClass: 'text-file-audio',
          label: 'Audio',
        };
      case 'archive':
        return {
          icon: <Archive className="w-5 h-5 text-file-archive" />,
          colorClass: 'text-file-archive',
          label: 'Archives',
        };
      default:
        return {
          icon: <File className="w-5 h-5 text-text-muted" />,
          colorClass: 'text-text-muted',
          label: 'File',
        };
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return 'Recently';
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return `${mins} minutes ago`;
    }
    if (diffHours < 24) {
      return `${Math.round(diffHours)} hours ago`;
    }
    if (diffHours < 48) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDownload = (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    downloadFile(file);
  };

  const handleClearHistory = () => {
    setIsClearing(true);
    setTimeout(() => {
      setIsClearing(false);
    }, 600);
  };

  const handleForceRefresh = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 800);
  };

  const renderFileRow = (file: FileItem) => {
    const meta = getFileCategoryMeta(file.mimeType, file.extension);
    const folderName = file.parentFolderId ? folderMap.get(file.parentFolderId) || 'Projects' : 'My Drive';
    const isMenuOpen = activeMenuId === `recent-${file.id}`;

    return (
      <div key={file.id}>
        {/* Mobile Row (< md) */}
        <div
          onClick={() => setPreviewFile(file)}
          className="md:hidden p-3.5 flex items-center justify-between gap-3 bg-surface hover:bg-surface-hover transition-colors cursor-pointer border-b border-border/40 last:border-b-0"
        >
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarFile(file.id);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 transition-colors cursor-pointer ${
                file.isStarred ? 'text-warning' : 'text-text-muted hover:text-warning'
              }`}
              type="button"
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'fill-warning' : ''}`} />
            </button>
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
              <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-6 h-6" size={24} />
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-medium text-text-primary truncate">
                {file.name}
              </span>
              <span className="text-[11px] text-text-muted mt-0.5 truncate">
                {formatBytes(file.fileSizeBytes)} · {folderName} · {formatDateDisplay(file.uploadedAt)}
              </span>
            </div>
          </div>

          <div
            className="drive-menu-container relative flex items-center gap-1 shrink-0"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => handleDownload(e, file)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
              type="button"
              aria-label="Download"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isMenuOpen ? null : `recent-${file.id}`);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
              type="button"
              aria-label="More options"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-9 w-48 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewFile(file);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRenameTarget({ id: file.id, name: file.name, isFolder: false });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleStarFile(file.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-warning text-warning' : 'text-text-muted'}`} />
                  <span>{file.isStarred ? 'Remove Star' : 'Star'}</span>
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: file.id,
                      name: file.name,
                      isFolder: false,
                      defaultAction: 'trash',
                    });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: file.id,
                      name: file.name,
                      isFolder: false,
                      defaultAction: 'permanent',
                    });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Desktop Row (>= md) */}
        <div
          onClick={() => setPreviewFile(file)}
          className="file-row hidden md:grid grid-cols-12 items-center h-14 px-4 bg-surface hover:bg-surface-hover transition-colors group cursor-pointer border-b border-border/40 last:border-b-0"
        >
          <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center flex-shrink-0 p-1">
              <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
            </div>
            <div className="flex flex-col min-w-0">
              <span className="font-label-md text-label-md text-text-primary truncate group-hover:text-primary transition-colors font-medium">
                {file.name}
              </span>
              <span className="font-label-sm text-label-sm text-text-muted truncate md:hidden">
                {folderName}
              </span>
            </div>
          </div>

          <div className="col-span-2 hidden md:flex items-center gap-1.5 min-w-0 pr-2">
            <Folder className="w-4 h-4 text-text-muted shrink-0" />
            <span className="font-body-sm text-body-sm text-text-secondary truncate hover:text-text-primary">
              {folderName}
            </span>
          </div>

          <div className="col-span-2 flex items-center min-w-0">
            <span className="font-body-sm text-body-sm text-text-muted">
              {formatDateDisplay(file.uploadedAt)}
            </span>
          </div>

          <div className="col-span-2 hidden sm:flex items-center justify-end font-body-sm text-body-sm text-text-secondary pr-2 font-mono">
            {formatBytes(file.fileSizeBytes)}
          </div>

          <div
            className="drive-menu-container relative col-span-1 flex items-center justify-end gap-1"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleStarFile(file.id);
              }}
              className={`w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                file.isStarred
                  ? 'text-warning hover:bg-surface-raised'
                  : 'text-text-muted hover:text-warning hover:bg-surface-raised'
              }`}
              title={file.isStarred ? 'Starred' : 'Star file'}
              type="button"
            >
              <Star className={`w-4 h-4 ${file.isStarred ? 'fill-warning' : ''}`} />
            </button>
            <button
              onClick={(e) => handleDownload(e, file)}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
              title="Download from Telegram CDN"
              type="button"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setActiveMenuId(isMenuOpen ? null : `recent-${file.id}`);
              }}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
              title="More options"
              type="button"
            >
              <MoreVertical className="w-4 h-4" />
            </button>

            {isMenuOpen && (
              <div className="absolute right-0 top-9 w-48 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 text-left">
                <button
                  type="button"
                  onClick={() => {
                    setPreviewFile(file);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Eye className="w-3.5 h-3.5 text-primary" />
                  <span>Preview</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRenameTarget({ id: file.id, name: file.name, isFolder: false });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                  <span>Rename</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    toggleStarFile(file.id);
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                >
                  <Star className={`w-3.5 h-3.5 ${file.isStarred ? 'fill-warning text-warning' : 'text-text-muted'}`} />
                  <span>{file.isStarred ? 'Remove Star' : 'Star'}</span>
                </button>
                <div className="my-1 border-t border-border" />
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: file.id,
                      name: file.name,
                      isFolder: false,
                      defaultAction: 'trash',
                    });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Move to Trash</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setDeleteTarget({
                      id: file.id,
                      name: file.name,
                      isFolder: false,
                      defaultAction: 'permanent',
                    });
                    setActiveMenuId(null);
                  }}
                  className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                >
                  <AlertTriangle className="w-3.5 h-3.5" />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const renderFileGrid = (file: FileItem) => {
    const folderName = file.parentFolderId ? folderMap.get(file.parentFolderId) || 'Projects' : 'My Drive';

    return (
      <div
        key={file.id}
        onClick={() => setPreviewFile(file)}
        className="group bg-surface hover:bg-surface-raised border border-border hover:border-primary-container/40 rounded-xl p-3 sm:p-3.5 flex flex-col justify-between transition-all cursor-pointer shadow-xs min-h-[130px] sm:min-h-[140px]"
      >
        <div className="flex items-start justify-between mb-2">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center p-1.5 shrink-0">
            <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-6 h-6 sm:w-7 sm:h-7" size={26} />
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file.id);
            }}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              file.isStarred ? 'text-warning' : 'text-text-muted hover:text-warning'
            }`}
            type="button"
            title={file.isStarred ? 'Remove star' : 'Add to starred'}
          >
            <Star className={`w-4 h-4 ${file.isStarred ? 'fill-warning' : ''}`} />
          </button>
        </div>

        <div className="flex flex-col min-w-0">
          <span className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors" title={file.name}>
            {file.name}
          </span>
          <div className="flex items-center justify-between text-[11px] text-text-muted mt-1">
            <span className="truncate">{folderName}</span>
            <span className="font-mono tabular-nums">{formatBytes(file.fileSizeBytes)}</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col w-full px-6 lg:px-8 py-6 max-w-7xl mx-auto gap-6 pb-20">
      {/* Top Workspace Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-0.5">
          <div className="flex items-center gap-2">
            <h1 className="font-headline-md text-headline-md text-text-primary font-bold">
              Recent files
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-primary font-label-sm text-xs font-semibold">
              Live sync
            </span>
          </div>
          <p className="font-body-sm text-body-sm text-text-secondary text-xs sm:text-sm">
            Files you opened, modified, or uploaded recently in One Cloud.
          </p>
        </div>

        {/* Secondary Utilities */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative flex items-center min-w-[220px]">
            <Filter className="w-4 h-4 absolute left-2.5 text-text-muted pointer-events-none" />
            <input
              id="recent-search"
              type="text"
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter recent files..."
              className="w-full h-9 pl-8 pr-3 bg-surface rounded-lg text-text-primary placeholder:text-text-muted font-body-sm text-xs border border-border focus:outline-none focus:ring-1 focus:ring-focus-ring transition-all"
            />
          </div>
          <button
            id="clear-history-btn"
            type="button"
            onClick={handleClearHistory}
            disabled={isClearing}
            title="Clear cached activity log without deleting original telegram files"
            className="h-9 px-3 bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary font-label-sm text-xs rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer border border-border shadow-xs"
          >
            <History className={`w-4 h-4 ${isClearing ? 'animate-spin' : ''}`} />
            <span>{isClearing ? 'Clearing...' : 'Clear history'}</span>
          </button>
        </div>
      </div>

      {/* Filter Chips Toolbar */}
      <div className="flex items-center justify-between gap-4 overflow-x-auto pb-1 select-none">
        <div className="flex items-center gap-1.5 min-w-max">
          <button
            type="button"
            onClick={() => {
              setSelectedTimeFilter('all');
              setSelectedTypeFilter('all');
            }}
            className={`h-8 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs ${
              selectedTimeFilter === 'all' && selectedTypeFilter === 'all'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <History className="w-3.5 h-3.5 text-primary shrink-0" />
            <span className="whitespace-nowrap">All Recent</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums leading-none border ${
                selectedTimeFilter === 'all' && selectedTypeFilter === 'all'
                  ? 'bg-primary-container/20 text-primary border-primary-container/30'
                  : 'bg-surface-raised text-text-muted border-border/60'
              }`}
            >
              {filteredFiles.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTimeFilter(selectedTimeFilter === 'today' ? 'all' : 'today')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              selectedTimeFilter === 'today'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setSelectedTimeFilter(selectedTimeFilter === 'week' ? 'all' : 'week')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              selectedTimeFilter === 'week'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            This Week
          </button>
          <button
            type="button"
            onClick={() => setSelectedTimeFilter(selectedTimeFilter === 'month' ? 'all' : 'month')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer border ${
              selectedTimeFilter === 'month'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            This Month
          </button>

          <div className="w-px h-4 bg-border mx-1" />

          <button
            type="button"
            onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'document' ? 'all' : 'document')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
              selectedTypeFilter === 'document'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-file-document shrink-0" />
            <span>Documents</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'image' ? 'all' : 'image')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
              selectedTypeFilter === 'image'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            <ImageIcon className="w-3.5 h-3.5 text-file-image shrink-0" />
            <span>Images</span>
          </button>
          <button
            type="button"
            onClick={() => setSelectedTypeFilter(selectedTypeFilter === 'video' ? 'all' : 'video')}
            className={`h-8 px-3 rounded-full text-xs font-medium transition-colors cursor-pointer inline-flex items-center gap-1.5 border ${
              selectedTypeFilter === 'video'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border-border'
            }`}
          >
            <VideoIcon className="w-3.5 h-3.5 text-file-video shrink-0" />
            <span>Videos</span>
          </button>
        </div>

        {/* View Mode Switch */}
        <div className="flex items-center gap-1 p-0.5 bg-surface border border-border rounded-lg">
          <button
            onClick={() => setViewMode('list')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
              viewMode === 'list' ? 'bg-surface-raised text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
            title="List View"
            type="button"
          >
            <List className="w-4 h-4" />
          </button>
          <button
            onClick={() => setViewMode('grid')}
            className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
              viewMode === 'grid' ? 'bg-surface-raised text-primary' : 'text-text-muted hover:text-text-primary'
            }`}
            title="Grid View"
            type="button"
          >
            <LayoutGrid className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* SECTION: Today */}
      {todayFiles.length > 0 && (
        <div className="flex flex-col gap-2 mt-1">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-primary-container" />
              <span className="font-label-sm text-xs text-text-secondary font-semibold uppercase tracking-wider">
                Today
              </span>
            </div>
            <span className="font-label-sm text-xs text-text-muted">
              {todayFiles.length} {todayFiles.length === 1 ? 'file' : 'files'} modified
            </span>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-surface rounded-xl overflow-hidden shadow-xs border border-border">
              {/* Table Header */}
              <div className="hidden md:grid bg-sidebar px-4 grid-cols-12 items-center h-10 select-none border-b border-border/40">
                <div className="col-span-5 flex items-center gap-2 font-label-sm text-xs text-text-muted font-medium">
                  <span>Name</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center font-label-sm text-xs text-text-muted font-medium">
                  <span>Original Folder</span>
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center font-label-sm text-xs text-text-muted font-medium">
                  <span>Last Opened</span>
                </div>
                <div className="col-span-2 hidden sm:flex items-center justify-end font-label-sm text-xs text-text-muted pr-2 font-medium">
                  <span>Size</span>
                </div>
                <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-center justify-end font-label-sm text-xs text-text-muted font-medium">
                  <span>Actions</span>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {todayFiles.map(renderFileRow)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {todayFiles.map(renderFileGrid)}
            </div>
          )}
        </div>
      )}

      {/* SECTION: Yesterday & Earlier this week */}
      {earlierFiles.length > 0 && (
        <div className="flex flex-col gap-2 mt-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-text-muted" />
              <span className="font-label-sm text-xs text-text-secondary font-semibold uppercase tracking-wider">
                Yesterday &amp; Earlier this week
              </span>
            </div>
            <span className="font-label-sm text-xs text-text-muted">
              {earlierFiles.length} {earlierFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {viewMode === 'list' ? (
            <div className="bg-surface rounded-xl overflow-hidden shadow-xs border border-border">
              {/* Table Header */}
              <div className="hidden md:grid bg-sidebar px-4 grid-cols-12 items-center h-10 select-none border-b border-border/40">
                <div className="col-span-5 flex items-center gap-2 font-label-sm text-xs text-text-muted font-medium">
                  <span>Name</span>
                </div>
                <div className="col-span-2 hidden md:flex items-center font-label-sm text-xs text-text-muted font-medium">
                  <span>Original Folder</span>
                </div>
                <div className="col-span-3 md:col-span-2 flex items-center font-label-sm text-xs text-text-muted font-medium">
                  <span>Last Opened</span>
                </div>
                <div className="col-span-2 hidden sm:flex items-center justify-end font-label-sm text-xs text-text-muted pr-2 font-medium">
                  <span>Size</span>
                </div>
                <div className="col-span-4 sm:col-span-2 md:col-span-1 flex items-center justify-end font-label-sm text-xs text-text-muted font-medium">
                  <span>Actions</span>
                </div>
              </div>
              <div className="divide-y divide-border/30">
                {earlierFiles.map(renderFileRow)}
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {earlierFiles.map(renderFileGrid)}
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {filteredFiles.length === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center flex flex-col items-center justify-center">
          <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-primary mb-3">
            <History className="w-6 h-6" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No recent files found</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            Files uploaded to your Telegram Saved Messages will appear automatically in this feed.
          </p>
        </div>
      )}

      {/* Telegram Sync Informational Reminder Banner */}
      <div className="mt-4 p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[#36AEEA]/15 text-[#36AEEA] flex items-center justify-center flex-shrink-0">
            <Send className="w-5 h-5" />
          </div>
          <div className="flex flex-col">
            <span className="font-label-md text-sm text-text-primary font-medium">
              Automatic Telegram Channel Indexing
            </span>
            <span className="font-body-sm text-xs text-text-secondary">
              Files modified in Telegram automatically appear at the top of your Recent list.
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 self-end sm:self-center">
          <button
            type="button"
            onClick={handleForceRefresh}
            className="px-3 py-1.5 rounded-lg bg-surface-raised hover:bg-surface-hover text-text-secondary hover:text-text-primary font-label-sm text-xs transition-colors flex items-center gap-1.5 border border-border cursor-pointer"
          >
            <RotateCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Force Refresh</span>
          </button>
          <Link
            href="/app/settings"
            className="px-3 py-1.5 rounded-lg bg-brand-subtle text-primary hover:bg-primary-container hover:text-text-primary font-label-sm text-xs transition-colors flex items-center gap-1"
          >
            <span>Channel settings</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {renameTarget && (
        <RenameModal item={renameTarget} onClose={() => setRenameTarget(null)} />
      )}
      {deleteTarget && (
        <DeleteConfirmModal item={deleteTarget} onClose={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
