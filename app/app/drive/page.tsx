'use client';

import React, { useState, useMemo, useRef, useEffect } from 'react';
import {
  Home,
  ChevronRight,
  Lock,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Archive,
  ArrowUpDown,
  List,
  LayoutGrid,
  FolderPlus,
  Upload,
  Folder,
  FolderOpen,
  MoreVertical,
  Star,
  Download,
  Send,
  Trash2,
  FolderInput,
  X,
  Cloud,
  Check,
  Edit2,
  Eye,
  AlertTriangle,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { NewFolderModal } from '@/components/modals/NewFolderModal';
import { MoveFileModal } from '@/components/modals/MoveFileModal';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { RenameModal } from '@/components/modals/RenameModal';
import { DeleteConfirmModal, type DeleteTargetItem } from '@/components/modals/DeleteConfirmModal';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { ItemIcon } from '@/components/drive/ItemIcon';

export default function MyDrivePage() {
  const {
    files,
    folders,
    currentFolderId,
    navigateToFolder,
    searchQuery,
    fileTypeFilter,
    setFileTypeFilter,
    sortOption,
    setSortOption,
    viewMode,
    setViewMode,
    selectedFileIds,
    setSelectedFileIds,
    toggleSelectFile,
    clearSelection,
    toggleStarFile,
    toggleStarFolder,
    trashFile,
    uploadFiles,
    telegramUsername,
    storageSummary,
    sessionToken,
    downloadFile,
  } = useDrive();

  // Modals state
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [moveFileTarget, setMoveFileTarget] = useState<FileItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetItem | null>(null);

  // Active 3-dot dropdown ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [mobileActionFile, setMobileActionFile] = useState<FileItem | null>(null);

  // Sort dropdown
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Close 3-dot dropdown when clicking outside or pressing Escape
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.drive-menu-container')) {
        setActiveMenuId(null);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setActiveMenuId(null);
      }
    };
    document.addEventListener('click', handleOutsideClick);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('click', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Active items for current folder
  const currentFolders = useMemo(() => {
    return folders
      .filter((f) => f.status === 'active' && f.parentFolderId === currentFolderId)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [folders, currentFolderId, searchQuery]);

  const currentFiles = useMemo(() => {
    let result = files
      .filter((f) => f.status === 'active' && f.parentFolderId === currentFolderId)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );

    if (fileTypeFilter !== 'all') {
      result = result.filter(
        (f) => getFileTypeCategory(f.mimeType, f.extension) === fileTypeFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'size_desc':
          return b.fileSizeBytes - a.fileSizeBytes;
        case 'size_asc':
          return a.fileSizeBytes - b.fileSizeBytes;
        case 'date_desc':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    return result;
  }, [files, currentFolderId, searchQuery, fileTypeFilter, sortOption]);

  // Current folder entity
  const currentFolder = useMemo(() => {
    if (!currentFolderId) return null;
    return folders.find((f) => f.id === currentFolderId) || null;
  }, [folders, currentFolderId]);

  // Master selection handler
  const allCurrentSelected =
    currentFiles.length > 0 &&
    currentFiles.every((f) => selectedFileIds.includes(f.id));

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      const allIds = Array.from(new Set([...selectedFileIds, ...currentFiles.map((f) => f.id)]));
      setSelectedFileIds(allIds);
    } else {
      setSelectedFileIds([]);
    }
  };

  // Selected files metrics for Floating Action Bar
  const selectedFiles = useMemo(() => {
    return files.filter((f) => selectedFileIds.includes(f.id));
  }, [files, selectedFileIds]);

  const totalSelectedBytes = useMemo(() => {
    return selectedFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0);
  }, [selectedFiles]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  // Batch delete selected files
  const handleBatchTrash = async () => {
    if (selectedFiles.length === 1) {
      setDeleteTarget({
        id: selectedFiles[0].id,
        name: selectedFiles[0].name,
        isFolder: false,
        defaultAction: 'trash',
      });
      return;
    }
    for (const f of selectedFiles) {
      await trashFile(f.id);
    }
    clearSelection();
  };

  // Batch star selected files
  const handleBatchStar = async () => {
    for (const f of selectedFiles) {
      await toggleStarFile(f.id);
    }
  };

  // Format date helper
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

    if (isToday) return `Today, ${timeStr}`;
    if (isYesterday) return `Yesterday, ${timeStr}`;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getFileCategoryIcon = (mimeType: string, extension: string) => {
    const cat = getFileTypeCategory(mimeType, extension);
    if (cat === 'document' || cat === 'pdf') {
      return <FileText className="w-5 h-5 text-file-document shrink-0" />;
    }
    if (cat === 'image') {
      return <ImageIcon className="w-5 h-5 text-file-image shrink-0" />;
    }
    if (cat === 'video') {
      return <VideoIcon className="w-5 h-5 text-file-video shrink-0" />;
    }
    if (cat === 'archive') {
      return <Archive className="w-5 h-5 text-file-archive shrink-0" />;
    }
    return <FileText className="w-5 h-5 text-text-muted shrink-0" />;
  };

  const getDownloadUrl = (file: FileItem) => {
    return `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
      sessionToken
    )}`;
  };

  const renderFileDropdownMenu = (file: FileItem) => {
    return (
      <div
        onClick={(e) => e.stopPropagation()}
        onDoubleClick={(e) => e.stopPropagation()}
        className="absolute right-0 top-9 w-48 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 text-left"
      >
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
            downloadFile(file);
            setActiveMenuId(null);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
        >
          <Download className="w-3.5 h-3.5 text-text-muted" />
          <span>Download</span>
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
            setMoveFileTarget(file);
            setActiveMenuId(null);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
        >
          <FolderInput className="w-3.5 h-3.5 text-text-muted" />
          <span>Move to Folder</span>
        </button>

        <button
          type="button"
          onClick={() => {
            toggleStarFile(file.id);
            setActiveMenuId(null);
          }}
          className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
        >
          <Star
            className={`w-3.5 h-3.5 ${
              file.isStarred ? 'fill-warning text-warning' : 'text-text-muted'
            }`}
          />
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
    );
  };

  return (
    <div className="flex flex-col h-full bg-canvas text-text-primary font-body-md transition-colors overflow-y-auto">
      {/* Hidden file input */}
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        multiple
        className="hidden"
      />

      <div className="w-full px-6 lg:px-8 py-6 max-w-7xl mx-auto flex flex-col relative pb-24">
        {/* Top Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div className="flex flex-col">
            <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
              My Drive
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Manage and organize all your files backed by Telegram.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setShowNewFolderModal(true)}
              className="h-10 px-3.5 bg-surface hover:bg-surface-hover text-text-primary border border-border rounded-[10px] text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              type="button"
            >
              <FolderPlus className="w-4 h-4 text-text-secondary" />
              <span>New folder</span>
            </button>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="h-10 px-3.5 bg-primary-container hover:bg-brand-hover text-text-primary rounded-[10px] text-xs sm:text-sm font-medium flex items-center gap-2 transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
              type="button"
            >
              <Upload className="w-4 h-4" />
              <span>Upload</span>
            </button>
          </div>
        </div>

        {/* Breadcrumbs & Navigation Path */}
        <div className="flex items-center justify-between py-2 px-3.5 bg-surface rounded-lg border border-border/60 mb-6">
          <div className="flex items-center gap-1.5 text-xs sm:text-sm min-w-0">
            <button
              onClick={() => navigateToFolder(null)}
              className="flex items-center gap-1 text-primary-container hover:underline font-medium cursor-pointer"
            >
              <Home className="w-4 h-4" />
              <span>My Drive</span>
            </button>
            {currentFolder && (
              <>
                <ChevronRight className="w-4 h-4 text-text-muted shrink-0" />
                <span className="text-text-primary font-semibold truncate">
                  {currentFolder.name}
                </span>
              </>
            )}
            <span className="text-xs text-text-muted ml-1">
              ({currentFolders.length + currentFiles.length} items)
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="hidden sm:flex items-center gap-1.5 px-2 py-0.5 rounded bg-brand-subtle text-primary text-xs font-medium border border-border/40">
              <Lock className="w-3.5 h-3.5" />
              <span>Telegram Private Storage</span>
            </div>
          </div>
        </div>

        {/* Action & Filter Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          {/* Left Pill Filters */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none w-full sm:w-auto min-w-0">
            <button
              onClick={() => setFileTypeFilter('all')}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                fileTypeFilter === 'all'
                  ? 'bg-brand-subtle text-primary border border-primary-container/30'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
              }`}
              type="button"
            >
              <span>All files</span>
              <span className="text-[11px] opacity-75">{currentFiles.length}</span>
            </button>
            <button
              onClick={() => setFileTypeFilter('document')}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                fileTypeFilter === 'document'
                  ? 'bg-brand-subtle text-primary border border-primary-container/30'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
              }`}
              type="button"
            >
              <FileText className="w-3.5 h-3.5 text-file-document" />
              <span>Documents</span>
            </button>
            <button
              onClick={() => setFileTypeFilter('image')}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                fileTypeFilter === 'image'
                  ? 'bg-brand-subtle text-primary border border-primary-container/30'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
              }`}
              type="button"
            >
              <ImageIcon className="w-3.5 h-3.5 text-file-image" />
              <span>Images</span>
            </button>
            <button
              onClick={() => setFileTypeFilter('video')}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                fileTypeFilter === 'video'
                  ? 'bg-brand-subtle text-primary border border-primary-container/30'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
              }`}
              type="button"
            >
              <VideoIcon className="w-3.5 h-3.5 text-file-video" />
              <span>Videos</span>
            </button>
            <button
              onClick={() => setFileTypeFilter('archive')}
              className={`h-8 px-3 rounded-full text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer ${
                fileTypeFilter === 'archive'
                  ? 'bg-brand-subtle text-primary border border-primary-container/30'
                  : 'bg-surface text-text-secondary border border-border hover:bg-surface-hover hover:text-text-primary'
              }`}
              type="button"
            >
              <Archive className="w-3.5 h-3.5 text-file-archive" />
              <span>Archives</span>
            </button>
          </div>

          {/* Right Controls: Sort, Layout Toggle, Bulk Select */}
          <div className="flex items-center gap-2.5 ml-auto">
            <div className="relative">
              <button
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="h-8 px-2.5 rounded-lg bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                type="button"
              >
                <ArrowUpDown className="w-3.5 h-3.5" />
                <span className="hidden md:inline">
                  {sortOption === 'name_asc'
                    ? 'Name'
                    : sortOption === 'size_desc'
                    ? 'Size (Desc)'
                    : sortOption === 'size_asc'
                    ? 'Size (Asc)'
                    : 'Last modified'}
                </span>
              </button>

              {sortMenuOpen && (
                <div
                  className="absolute right-0 top-10 w-40 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-50 animate-in fade-in duration-100"
                  onMouseLeave={() => setSortMenuOpen(false)}
                >
                  <button
                    onClick={() => {
                      setSortOption('date_desc');
                      setSortMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Last modified</span>
                    {sortOption === 'date_desc' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('name_asc');
                      setSortMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Name</span>
                    {sortOption === 'name_asc' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                  <button
                    onClick={() => {
                      setSortOption('size_desc');
                      setSortMenuOpen(false);
                    }}
                    className="w-full text-left px-2.5 py-1.5 text-xs text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Size (Largest)</span>
                    {sortOption === 'size_desc' && <Check className="w-3.5 h-3.5 text-primary" />}
                  </button>
                </div>
              )}
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-surface border border-border rounded-lg p-0.5">
              <button
                onClick={() => setViewMode('list')}
                aria-label="List view"
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-brand-subtle text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                aria-label="Grid view"
                className={`w-7 h-7 flex items-center justify-center rounded transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-brand-subtle text-primary'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
                type="button"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>

            <div className="h-4 w-[1px] bg-border mx-0.5" />

            {/* Quick Checkbox Indicator */}
            <label className="flex items-center gap-1.5 cursor-pointer text-text-secondary hover:text-text-primary text-xs">
              <input
                type="checkbox"
                checked={allCurrentSelected}
                onChange={handleSelectAll}
                className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer accent-[#528dff]"
              />
              <span className="hidden lg:inline text-text-muted">Select all</span>
            </label>
          </div>
        </div>

        {/* Folders Section */}
        {currentFolders.length > 0 && (
          <section className="mb-8">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Folders
              </h2>
              <span className="text-xs text-text-muted">
                {currentFolders.length} {currentFolders.length === 1 ? 'directory' : 'directories'}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {currentFolders.map((folder) => {
                const folderFiles = files.filter(
                  (f) => f.status === 'active' && f.parentFolderId === folder.id
                );
                const folderSize = folderFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0);
                const isMenuOpen = activeMenuId === `folder-${folder.id}`;

                return (
                  <div
                    key={folder.id}
                    onClick={() => navigateToFolder(folder.id)}
                    className="group relative bg-surface hover:bg-surface-raised border border-border hover:border-primary-container/40 p-4 rounded-xl flex items-center justify-between transition-all cursor-pointer shadow-xs"
                  >
                    <div className="flex items-center gap-3 min-w-0 pr-2">
                      <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center flex-shrink-0 p-1">
                        <ItemIcon type="folder" folder={folder} className="w-8 h-8" size={32} />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                            {folder.name}
                          </span>
                          {folder.isStarred && (
                            <Star className="w-3.5 h-3.5 fill-warning text-warning shrink-0" />
                          )}
                        </div>
                        <div className="flex items-center gap-1.5 mt-0.5">
                          <span className="text-xs text-text-muted truncate">
                            {folderFiles.length} {folderFiles.length === 1 ? 'file' : 'files'} •{' '}
                            {formatBytes(folderSize)}
                          </span>
                          {folder.isSystem && (
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-medium shrink-0">
                              Protected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Folder 3-Dot Menu Container */}
                    <div
                      className="drive-menu-container relative shrink-0"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : `folder-${folder.id}`);
                        }}
                        aria-label="Folder options"
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                          isMenuOpen
                            ? 'bg-surface-hover text-text-primary opacity-100'
                            : 'opacity-80 group-hover:opacity-100'
                        }`}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-9 w-48 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              navigateToFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                          >
                            <FolderOpen className="w-3.5 h-3.5 text-primary" />
                            <span>Open folder</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              toggleStarFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                folder.isStarred ? 'fill-warning text-warning' : 'text-text-muted'
                              }`}
                            />
                            <span>{folder.isStarred ? 'Remove Star' : 'Star'}</span>
                          </button>

                          {/* Only allow Rename, Trash, and Delete for custom user-created folders */}
                          {!folder.isSystem && (
                            <>
                              <button
                                type="button"
                                onClick={() => {
                                  setRenameTarget({
                                    id: folder.id,
                                    name: folder.name,
                                    isFolder: true,
                                  });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="w-3.5 h-3.5 text-text-muted" />
                                <span>Rename</span>
                              </button>

                              <div className="my-1 border-t border-border" />

                              <button
                                type="button"
                                onClick={() => {
                                  setDeleteTarget({
                                    id: folder.id,
                                    name: folder.name,
                                    isFolder: true,
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
                                    id: folder.id,
                                    name: folder.name,
                                    isFolder: true,
                                    defaultAction: 'permanent',
                                  });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <AlertTriangle className="w-3.5 h-3.5" />
                                <span>Delete</span>
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}

        {/* Files Section */}
        <section className="flex flex-col">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
              Files
            </h2>
            <span className="text-xs text-text-muted">
              {currentFiles.length} items in view
            </span>
          </div>

          {currentFiles.length === 0 && currentFolders.length === 0 ? (
            <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted border border-border mb-3">
                <Cloud className="w-6 h-6 text-text-muted" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">This folder is empty</h3>
              <p className="text-xs text-text-secondary mt-1 max-w-sm">
                Upload files or create subfolders to organize your personal drive.
              </p>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="mt-4 px-4 py-2 bg-primary-container hover:bg-brand-hover text-text-primary text-xs font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              >
                <Upload className="w-3.5 h-3.5" />
                <span>Upload Files</span>
              </button>
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {currentFiles.map((file) => {
                const isSelected = selectedFileIds.includes(file.id);
                const isMenuOpen = activeMenuId === `file-grid-${file.id}`;
                return (
                  <div
                    key={file.id}
                    onClick={() => toggleSelectFile(file.id)}
                    onDoubleClick={() => setPreviewFile(file)}
                    className={`relative p-4 rounded-xl border transition-all cursor-pointer flex flex-col justify-between group shadow-xs ${
                      isSelected
                        ? 'bg-brand-subtle/50 border-primary-container ring-1 ring-primary-container'
                        : 'bg-surface hover:bg-surface-raised border-border'
                    }`}
                  >
                    <div className="flex items-start justify-between mb-3">
                      <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center p-1.5 shrink-0">
                        <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-7 h-7" size={28} />
                      </div>
                      <div
                        className="drive-menu-container relative flex items-center gap-1"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          title={file.isStarred ? 'Remove Star' : 'Star'}
                          className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
                            file.isStarred
                              ? 'text-warning'
                              : 'text-text-muted hover:text-warning hover:bg-surface-hover'
                          }`}
                        >
                          <Star
                            className={`w-4 h-4 ${file.isStarred ? 'fill-warning' : ''}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : `file-grid-${file.id}`);
                          }}
                          title="File options"
                          className={`p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && renderFileDropdownMenu(file)}
                      </div>
                    </div>
                    <div className="flex flex-col">
                      <span
                        className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="text-xs text-text-muted mt-1">
                        {formatBytes(file.fileSizeBytes)} • {formatDateDisplay(file.uploadedAt)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden">
              {/* MOBILE CARD LIST (< md) */}
              <div className="md:hidden divide-y divide-border/60">
                {currentFiles.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleSelectFile(file.id)}
                      className={`p-3.5 flex items-center justify-between gap-3 text-xs transition-colors cursor-pointer ${
                        isSelected
                          ? 'bg-brand-subtle/40 border-l-2 border-l-primary-container'
                          : 'hover:bg-surface-hover'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleSelectFile(file.id);
                          }}
                          className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer accent-[#528dff] shrink-0"
                        />
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center p-1 shrink-0 cursor-pointer"
                        >
                          <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-6 h-6" size={24} />
                        </div>
                        <div
                          className="flex flex-col min-w-0 flex-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                        >
                          <span className="text-text-primary font-medium text-xs sm:text-sm truncate">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 truncate">
                            {formatBytes(file.fileSizeBytes)} · {formatDateDisplay(file.uploadedAt)}
                          </span>
                        </div>
                      </div>

                      {/* Mobile Quick Action Buttons (Touch friendly >= 40px) */}
                      <div
                        className="flex items-center gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={() => toggleStarFile(file.id)}
                          className={`w-9 h-9 rounded-lg flex items-center justify-center transition-colors cursor-pointer ${
                            file.isStarred
                              ? 'text-warning fill-warning'
                              : 'text-text-muted hover:text-warning'
                          }`}
                          aria-label="Star file"
                        >
                          <Star className={`w-4 h-4 ${file.isStarred ? 'fill-warning text-warning' : ''}`} />
                        </button>
                        <button
                          type="button"
                          onClick={() => downloadFile(file)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          aria-label="Download file"
                        >
                          <Download className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => setMobileActionFile(file)}
                          className="w-9 h-9 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
                          aria-label="More options"
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* DESKTOP / TABLET WORKSTATION TABLE (>= md) */}
              <div className="hidden md:block">
                {/* Table Header */}
                <div className="h-10 bg-sidebar border-b border-border text-xs font-semibold text-text-muted px-4 grid grid-cols-12 items-center select-none rounded-t-xl">
                  <div className="col-span-5 flex items-center gap-3">
                    <div className="w-4 flex items-center justify-center">
                      <input
                        type="checkbox"
                        checked={allCurrentSelected}
                        onChange={handleSelectAll}
                        className="w-3.5 h-3.5 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer accent-[#528dff]"
                      />
                    </div>
                    <div className="flex items-center gap-1 cursor-pointer hover:text-text-primary transition-colors">
                      <span>Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </div>
                  </div>
                  <div className="col-span-2">Location</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-1 text-right pr-2">Size</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                {/* File Rows Container */}
                <div className="divide-y divide-border/60">
                  {currentFiles.map((file) => {
                    const isSelected = selectedFileIds.includes(file.id);
                    const isMenuOpen = activeMenuId === `file-list-${file.id}`;

                    return (
                      <div
                        key={file.id}
                        onClick={() => toggleSelectFile(file.id)}
                        onDoubleClick={() => setPreviewFile(file)}
                        className={`px-4 py-3 grid grid-cols-12 items-center text-xs transition-colors group cursor-pointer ${
                          isSelected
                            ? 'bg-brand-subtle/40 border-l-2 border-l-primary-container'
                            : 'hover:bg-surface-hover'
                        }`}
                      >
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          <input
                            type="checkbox"
                            checked={isSelected}
                            onChange={(e) => {
                              e.stopPropagation();
                              toggleSelectFile(file.id);
                            }}
                            className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer accent-[#528dff] flex-shrink-0"
                          />
                          <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
                          <span
                            className="text-text-primary font-medium truncate flex-1 group-hover:text-primary transition-colors text-xs sm:text-sm"
                            title={file.name}
                          >
                            {file.name}
                          </span>
                          <button
                            type="button"
                            aria-label="Toggle star"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarFile(file.id);
                            }}
                            className={`flex-shrink-0 cursor-pointer p-0.5 rounded transition-transform ${
                              file.isStarred
                                ? 'text-warning fill-warning'
                                : 'text-text-muted hover:text-warning'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${file.isStarred ? 'fill-warning text-warning' : ''}`}
                            />
                          </button>
                        </div>

                        <div className="col-span-2 flex items-center text-text-secondary truncate pr-2">
                          <span className="truncate">
                            {currentFolder ? currentFolder.name : 'My Drive'}
                          </span>
                        </div>

                        <div className="col-span-2 text-text-secondary truncate">
                          {formatDateDisplay(file.uploadedAt)}
                        </div>

                        <div className="col-span-1 text-right pr-2 text-text-secondary font-mono tabular-nums">
                          {formatBytes(file.fileSizeBytes)}
                        </div>

                        <div
                          className="drive-menu-container relative col-span-2 flex items-center justify-end gap-1 text-text-muted"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <button
                            type="button"
                            onClick={() => downloadFile(file)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => setPreviewFile(file)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover hover:text-[#36AEEA] transition-colors cursor-pointer"
                            title="View / Stream"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : `file-list-${file.id}`);
                            }}
                            className={`w-8 h-8 rounded-lg flex items-center justify-center hover:bg-surface-hover hover:text-text-primary transition-colors cursor-pointer ${
                              isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                            }`}
                            title="More options"
                          >
                            <MoreVertical className="w-4 h-4" />
                          </button>

                          {isMenuOpen && renderFileDropdownMenu(file)}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}
        </section>

        {/* Telegram Channel Storage Bot Banner */}
        <div className="mt-8 p-4 rounded-xl bg-surface border border-border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-[#36AEEA]/15 text-[#36AEEA] flex items-center justify-center shrink-0">
              <Cloud className="w-4 h-4" />
            </div>
            <div className="flex flex-col">
              <span className="text-text-primary font-medium">
                Telegram Channel Storage Bot
              </span>
              <span className="text-text-muted text-[11px]">
                Files are encrypted and stored in chunked messages under channel @
                {telegramUsername || 'personal_vault'}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="w-2 h-2 rounded-full bg-tertiary animate-pulse" />
            <span className="text-text-secondary font-mono text-[11px]">
              Connected • {formatBytes(storageSummary.trackedBytes)} tracked
            </span>
          </div>
        </div>

        {/* Floating Selection Action Bar */}
        {selectedFileIds.length > 0 && (
          <div className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 max-w-[calc(100vw-24px)] bg-surface-raised border border-border-strong shadow-2xl rounded-2xl px-3 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 sm:gap-4 z-40 animate-in fade-in slide-in-from-bottom-4 duration-200 overflow-x-auto">
            <div className="flex items-center gap-2 pr-3 sm:pr-4 border-r border-border shrink-0">
              <div className="w-5 h-5 rounded bg-primary-container text-text-primary flex items-center justify-center text-xs font-bold">
                {selectedFileIds.length}
              </div>
              <span className="text-xs sm:text-sm font-medium text-text-primary">
                item{selectedFileIds.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  for (const f of selectedFiles) {
                    downloadFile(f);
                  }
                }}
                className="h-8 px-3 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-primary" />
                <span>Download ({formatBytes(totalSelectedBytes)})</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  if (selectedFiles.length > 0) {
                    setMoveFileTarget(selectedFiles[0]);
                  }
                }}
                className="h-8 px-3 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <FolderInput className="w-3.5 h-3.5 text-text-secondary" />
                <span>Move</span>
              </button>
              <button
                type="button"
                onClick={handleBatchStar}
                className="h-8 px-3 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Star className="w-3.5 h-3.5 text-warning fill-warning" />
                <span>Star</span>
              </button>
              <button
                type="button"
                onClick={handleBatchTrash}
                className="h-8 px-3 rounded-lg bg-surface hover:bg-surface-hover border border-border text-danger hover:border-danger/40 text-xs font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
            <div className="pl-2 border-l border-border">
              <button
                type="button"
                onClick={clearSelection}
                aria-label="Clear selection"
                className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modals & Mobile Action Sheet */}
      {mobileActionFile && (
        <div
          className="fixed inset-0 z-50 flex flex-col justify-end bg-black/60 backdrop-blur-xs md:hidden animate-in fade-in duration-150"
          onClick={() => setMobileActionFile(null)}
        >
          <div
            className="bg-surface-raised border-t border-border rounded-t-2xl p-4 space-y-2 shadow-2xl animate-in slide-in-from-bottom duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header info */}
            <div className="flex items-center justify-between pb-3 border-b border-border/50">
              <div className="flex items-center gap-2.5 min-w-0 pr-2">
                {getFileCategoryIcon(mobileActionFile.mimeType, mobileActionFile.extension)}
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-text-primary truncate">
                    {mobileActionFile.name}
                  </p>
                  <p className="text-[11px] text-text-muted font-mono">
                    {formatBytes(mobileActionFile.fileSizeBytes)} · {mobileActionFile.extension.toUpperCase()}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileActionFile(null)}
                className="w-8 h-8 rounded-full flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover shrink-0"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Action rows */}
            <div className="grid grid-cols-1 divide-y divide-border/30 pt-1">
              <button
                type="button"
                onClick={() => {
                  setPreviewFile(mobileActionFile);
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
              >
                <Send className="w-4 h-4 text-primary" />
                <span>Preview / Stream file</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  downloadFile(mobileActionFile);
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
              >
                <Download className="w-4 h-4 text-text-muted" />
                <span>Download file</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  toggleStarFile(mobileActionFile.id);
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
              >
                <Star className={`w-4 h-4 ${mobileActionFile.isStarred ? 'fill-warning text-warning' : 'text-text-muted'}`} />
                <span>{mobileActionFile.isStarred ? 'Remove from Starred' : 'Add to Starred'}</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setRenameTarget({ id: mobileActionFile.id, name: mobileActionFile.name, isFolder: false });
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
              >
                <Edit2 className="w-4 h-4 text-text-muted" />
                <span>Rename file</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setMoveFileTarget(mobileActionFile);
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-text-primary hover:bg-surface-hover rounded-lg transition-colors text-left cursor-pointer"
              >
                <FolderInput className="w-4 h-4 text-text-muted" />
                <span>Move to another folder</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget({
                    id: mobileActionFile.id,
                    name: mobileActionFile.name,
                    isFolder: false,
                    defaultAction: 'trash',
                  });
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-warning hover:bg-warning/10 rounded-lg transition-colors text-left cursor-pointer"
              >
                <Trash2 className="w-4 h-4" />
                <span>Move to Trash</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setDeleteTarget({
                    id: mobileActionFile.id,
                    name: mobileActionFile.name,
                    isFolder: false,
                    defaultAction: 'permanent',
                  });
                  setMobileActionFile(null);
                }}
                className="w-full flex items-center gap-3 py-3 px-2 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors text-left cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                <span>Permanently Delete</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <NewFolderModal onClose={() => setShowNewFolderModal(false)} />
      )}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {moveFileTarget && (
        <MoveFileModal
          file={moveFileTarget}
          onClose={() => setMoveFileTarget(null)}
        />
      )}
      {renameTarget && (
        <RenameModal
          item={renameTarget}
          onClose={() => setRenameTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </div>
  );
}
