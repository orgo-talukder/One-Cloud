'use client';

import React, { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Star,
  Folder,
  FolderOpen,
  Download,
  MoreVertical,
  List,
  LayoutGrid,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Archive,
  File,
  ArrowRight,
  X,
  Zap,
  Check,
  ChevronDown,
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
import type { FileItem, FolderItem } from '@/lib/drive/types';

export default function StarredPage() {
  const router = useRouter();
  const {
    files,
    folders,
    searchQuery,
    toggleStarFile,
    toggleStarFolder,
    navigateToFolder,
    downloadFile,
  } = useDrive();

  const [activeFilter, setActiveFilter] = useState<'all' | 'folders' | 'files'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [sortOption, setSortOption] = useState<'Date starred' | 'Name' | 'Size'>('Date starred');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [tipDismissed, setTipDismissed] = useState(false);
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

  // Real starred folders & files
  const realStarredFolders = useMemo(() => {
    return folders
      .filter((f) => f.status === 'active' && f.isStarred)
      .filter((f) => (searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));
  }, [folders, searchQuery]);

  const realStarredFiles = useMemo(() => {
    return files
      .filter((f) => f.status === 'active' && f.isStarred)
      .filter((f) => (searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));
  }, [files, searchQuery]);

  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

  // If user has no starred items yet, provide default presentation items
  const displayFolders = realStarredFolders;
  const displayFiles = realStarredFiles;

  const totalPinned = displayFolders.length + displayFiles.length;

  const getFileCategoryIcon = (mimeType: string, extension: string) => {
    const cat = getFileTypeCategory(mimeType, extension);
    switch (cat) {
      case 'document':
      case 'pdf':
        return <FileText className="w-5 h-5 text-file-document shrink-0" />;
      case 'image':
        return <ImageIcon className="w-5 h-5 text-file-image shrink-0" />;
      case 'video':
        return <VideoIcon className="w-5 h-5 text-file-video shrink-0" />;
      case 'archive':
        return <Archive className="w-5 h-5 text-file-archive shrink-0" />;
      default:
        return <File className="w-5 h-5 text-text-muted shrink-0" />;
    }
  };

  const handleDownload = (e: React.MouseEvent, file: FileItem) => {
    e.stopPropagation();
    downloadFile(file);
  };

  return (
    <div className="w-full px-6 lg:px-8 py-6 max-w-7xl mx-auto flex flex-col pb-24 text-text-primary">
      {/* Top Heading & Filter Controls */}
      <div className="flex flex-col gap-6 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-headline-md text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
                Starred
              </h1>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full bg-warning/10 text-warning text-xs font-semibold">
                {totalPinned} pinned
              </span>
            </div>
            <p className="font-body-sm text-xs sm:text-sm text-text-secondary mt-1">
              Items you have marked with a star for quick, priority access.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Sort Control */}
            <div className="relative inline-block text-left">
              <button
                type="button"
                onClick={() => setSortMenuOpen(!sortMenuOpen)}
                className="h-9 px-3 bg-surface hover:bg-surface-hover text-text-primary text-xs font-medium rounded-lg flex items-center gap-2 transition-colors cursor-pointer shadow-xs border border-border"
              >
                <ChevronDown className="w-3.5 h-3.5 text-text-muted" />
                <span>{sortOption}</span>
              </button>

              {sortMenuOpen && (
                <div className="absolute right-0 mt-1 w-44 rounded-lg bg-surface-raised shadow-xl p-1 z-30 border border-border text-xs">
                  {(['Date starred', 'Name', 'Size'] as const).map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => {
                        setSortOption(opt);
                        setSortMenuOpen(false);
                      }}
                      className={`w-full text-left px-3 py-1.5 rounded text-xs flex items-center justify-between cursor-pointer ${
                        sortOption === opt
                          ? 'text-text-primary bg-surface-hover font-semibold'
                          : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                      }`}
                    >
                      <span>{opt}</span>
                      {sortOption === opt && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* View Switcher */}
            <div className="flex items-center bg-surface p-0.5 rounded-lg border border-border">
              <button
                type="button"
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'list'
                    ? 'bg-brand-subtle text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="List View"
              >
                <List className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded-md flex items-center justify-center transition-colors cursor-pointer ${
                  viewMode === 'grid'
                    ? 'bg-brand-subtle text-primary'
                    : 'text-text-muted hover:text-text-primary'
                }`}
                title="Grid View"
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Filter Pills Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer shadow-xs border ${
              activeFilter === 'all'
                ? 'bg-brand-subtle text-primary border-primary/20'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary border-border bg-surface'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span>All Starred</span>
            <span className="ml-1 px-1.5 py-0.2 bg-primary/20 rounded-full text-[11px] leading-tight">
              {totalPinned}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('folders')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeFilter === 'folders'
                ? 'bg-brand-subtle text-primary border-primary/20'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary border-border bg-surface'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-text-muted" />
            <span>Starred Folders</span>
            <span className="px-1.5 py-0.2 bg-surface-raised rounded-full text-[11px] text-text-muted">
              {displayFolders.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('files')}
            className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all flex items-center gap-1.5 cursor-pointer border ${
              activeFilter === 'files'
                ? 'bg-brand-subtle text-primary border-primary/20'
                : 'text-text-secondary hover:bg-surface hover:text-text-primary border-border bg-surface'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-text-muted" />
            <span>Starred Files</span>
            <span className="px-1.5 py-0.2 bg-surface-raised rounded-full text-[11px] text-text-muted">
              {displayFiles.length}
            </span>
          </button>
        </div>
      </div>

      {/* Starred Folders Section */}
      {(activeFilter === 'all' || activeFilter === 'folders') && displayFolders.length > 0 && (
        <section className="flex flex-col mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Starred Folders
              </h2>
            </div>
            <span className="text-xs text-text-muted">
              {displayFolders.length} {displayFolders.length === 1 ? 'folder' : 'folders'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {displayFolders.map((folder) => {
              const isMenuOpen = activeMenuId === `folder-${folder.id}`;
              const folderFilesCount = files.filter(
                (f) => f.status === 'active' && f.parentFolderId === folder.id
              ).length;

              return (
                <div
                  key={folder.id}
                  onClick={() => {
                    navigateToFolder(folder.id);
                    router.push(`/app/drive/${folder.id}`);
                  }}
                  className="group relative bg-surface hover:bg-surface-hover rounded-xl p-4 transition-all duration-150 flex flex-col justify-between h-[112px] cursor-pointer shadow-xs border border-border"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-10 h-10 rounded-lg bg-brand-subtle flex items-center justify-center shrink-0 text-primary-container">
                        <Folder className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex flex-col min-w-0">
                        <span className="font-label-md text-sm text-text-primary truncate font-semibold group-hover:text-primary transition-colors">
                          {folder.name}
                        </span>
                        <span className="text-xs text-text-muted">
                          {folderFilesCount} {folderFilesCount === 1 ? 'file' : 'files'}
                        </span>
                      </div>
                    </div>

                    <div
                      className="drive-menu-container relative flex items-center gap-1 -mr-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarFolder(folder.id);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-warning hover:bg-surface-raised transition-colors cursor-pointer"
                        title="Remove star"
                      >
                        <Star className="w-4 h-4 fill-warning" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : `folder-${folder.id}`);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                        title="Folder actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-9 w-48 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1.5 z-50 animate-in fade-in duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              navigateToFolder(folder.id);
                              router.push(`/app/drive/${folder.id}`);
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
                          <button
                            type="button"
                            onClick={() => {
                              toggleStarFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-2 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span>Remove Star</span>
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
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[11px] text-text-muted flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
                      Synced to Telegram
                    </span>
                    <span className="text-[11px] text-text-secondary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5">
                      Open <ArrowRight className="w-3 h-3" />
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Starred Files Section */}
      {(activeFilter === 'all' || activeFilter === 'files') && displayFiles.length > 0 && (
        <section className="flex flex-col mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Star className="w-4 h-4 text-warning fill-warning" />
              <h2 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Starred Files
              </h2>
            </div>
            <span className="text-xs text-text-muted">
              {displayFiles.length} {displayFiles.length === 1 ? 'file' : 'files'}
            </span>
          </div>

          {/* Table Container */}
          <div className="bg-surface rounded-xl overflow-hidden shadow-xs border border-border">
            {/* Table Header */}
            <div className="bg-sidebar px-4 h-10 grid grid-cols-12 items-center text-text-muted font-label-sm text-xs select-none border-b border-border/40">
              <div className="col-span-12 sm:col-span-6 md:col-span-5 flex items-center gap-3">
                <span className="w-5 text-center">★</span>
                <span>Name</span>
              </div>
              <div className="hidden md:block md:col-span-3">Location</div>
              <div className="hidden sm:block sm:col-span-3 md:col-span-2">Modified</div>
              <div className="hidden sm:block sm:col-span-1 md:col-span-1 text-right sm:text-left">
                Size
              </div>
              <div className="col-span-12 sm:col-span-2 md:col-span-1 text-right">Actions</div>
            </div>

            {/* File Rows Container */}
            <div className="flex flex-col divide-y divide-border/40">
              {displayFiles.map((file) => {
                const folderName = file.parentFolderId
                  ? folderMap.get(file.parentFolderId) || 'Projects / Roadmaps'
                  : 'My Drive';

                return (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(file)}
                    className="file-row group px-4 h-14 grid grid-cols-12 items-center bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                  >
                    <div className="col-span-12 sm:col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleStarFile(file.id);
                        }}
                        className="w-6 h-6 flex items-center justify-center text-warning hover:scale-110 transition-transform cursor-pointer shrink-0"
                        title="Unstar file"
                      >
                        <Star className="w-4 h-4 fill-warning" />
                      </button>

                      <div className="w-8 h-8 rounded-lg bg-surface-raised flex items-center justify-center shrink-0">
                        {getFileCategoryIcon(file.mimeType, file.extension)}
                      </div>

                      <div className="flex flex-col min-w-0">
                        <span className="text-xs sm:text-sm text-text-primary font-medium truncate group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                        <span className="sm:hidden text-[11px] text-text-muted truncate">
                          {folderName} • {formatBytes(file.fileSizeBytes)}
                        </span>
                      </div>
                    </div>

                    <div className="hidden md:flex md:col-span-3 items-center gap-1.5 text-text-secondary text-xs truncate">
                      <FolderOpen className="w-3.5 h-3.5 text-text-muted shrink-0" />
                      <span className="truncate hover:text-text-primary transition-colors">
                        {folderName}
                      </span>
                    </div>

                    <div className="hidden sm:block sm:col-span-3 md:col-span-2 text-text-muted text-xs">
                      {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </div>

                    <div className="hidden sm:block sm:col-span-1 md:col-span-1 text-text-secondary text-xs font-mono">
                      {formatBytes(file.fileSizeBytes)}
                    </div>

                    <div
                      className="drive-menu-container relative col-span-12 sm:col-span-2 md:col-span-1 flex items-center justify-end gap-1"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <button
                        type="button"
                        onClick={(e) => handleDownload(e, file)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                        title="Download"
                      >
                        <Download className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(activeMenuId === `file-${file.id}` ? null : `file-${file.id}`);
                        }}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                        title="More options"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {activeMenuId === `file-${file.id}` && (
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
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span>Remove Star</span>
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
                );
              })}
            </div>
          </div>
        </section>
      )}

      {/* Empty State */}
      {totalPinned === 0 && (
        <div className="bg-surface rounded-xl border border-border p-12 text-center flex flex-col items-center justify-center my-4">
          <div className="w-12 h-12 rounded-xl bg-brand-subtle flex items-center justify-center text-warning mb-3">
            <Star className="w-6 h-6 fill-warning" />
          </div>
          <h3 className="text-base font-semibold text-text-primary">No starred items yet</h3>
          <p className="text-xs text-text-secondary mt-1 max-w-sm">
            Click the star icon next to any file or folder to pin it here for instant one-click access.
          </p>
        </div>
      )}

      {/* Helpful Tip Callout */}
      {!tipDismissed && (
        <aside className="w-full bg-surface-raised rounded-xl p-4 flex items-center gap-3 border border-border shadow-xs mb-4">
          <div className="w-9 h-9 rounded-lg bg-surface flex items-center justify-center shrink-0 text-warning">
            <Star className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-xs font-semibold text-text-primary">Pro tip:</span>
            <span className="text-xs text-text-secondary ml-1">
              Click the star icon on any file or folder in My Drive or Recent to pin it here for
              instant one-click access.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setTipDismissed(true)}
            className="text-text-muted hover:text-text-primary p-1 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </aside>
      )}

      {/* Visual Asset: Storage & Quick Sync Summary Banner */}
      <div className="p-6 rounded-xl bg-surface flex flex-col md:flex-row items-center justify-between gap-4 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-tertiary/10 text-tertiary flex items-center justify-center shrink-0 border border-tertiary/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Priority Telegram Cache</h3>
            <p className="text-xs text-text-muted">
              Starred files are cached in priority bot channels for instant zero-latency retrieval.
            </p>
          </div>
        </div>

        {/* Mini SVG Data Sparkline */}
        <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
          <div className="flex flex-col text-right">
            <span className="text-xs font-semibold text-text-primary">101.2 MB</span>
            <span className="text-[11px] text-text-muted">Priority Cached</span>
          </div>
          <div className="h-8 w-28 text-primary flex items-center">
            <svg
              className="w-full h-full fill-none stroke-current"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 100 24"
            >
              <polyline points="0,18 20,16 40,8 60,12 80,4 100,6" />
            </svg>
          </div>
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
