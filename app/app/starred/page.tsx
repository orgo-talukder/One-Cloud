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
import { ItemIcon } from '@/components/drive/ItemIcon';

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
    viewMode,
    setViewMode,
  } = useDrive();

  const [activeFilter, setActiveFilter] = useState<'all' | 'folders' | 'files'>('all');
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
      .filter((f) => {
        if (!searchQuery) return true;
        const q = searchQuery.toLowerCase().trim();
        const matchesName = f.name.toLowerCase().includes(q) || (f.extension && f.extension.toLowerCase().includes(q));
        const matchesAi = (f.aiTags && f.aiTags.some((t) => t.toLowerCase().includes(q) || q.includes(t.toLowerCase()))) || (f.aiPrimaryTag && f.aiPrimaryTag.toLowerCase().includes(q));
        return matchesName || matchesAi;
      });
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
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 scrollbar-none select-none">
          <button
            type="button"
            onClick={() => setActiveFilter('all')}
            className={`h-8 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs ${
              activeFilter === 'all'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <Star className="w-3.5 h-3.5 fill-current" />
            <span className="whitespace-nowrap">All Starred</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums leading-none border ${
                activeFilter === 'all'
                  ? 'bg-primary-container/20 text-primary border-primary-container/30'
                  : 'bg-surface-raised text-text-muted border-border/60'
              }`}
            >
              {totalPinned}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('folders')}
            className={`h-8 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs ${
              activeFilter === 'folders'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <Folder className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="whitespace-nowrap">Starred Folders</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums leading-none border ${
                activeFilter === 'folders'
                  ? 'bg-primary-container/20 text-primary border-primary-container/30'
                  : 'bg-surface-raised text-text-muted border-border/60'
              }`}
            >
              {displayFolders.length}
            </span>
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter('files')}
            className={`h-8 px-3.5 rounded-full text-xs font-medium inline-flex items-center gap-1.5 transition-all cursor-pointer whitespace-nowrap shrink-0 border shadow-xs ${
              activeFilter === 'files'
                ? 'bg-brand-subtle text-primary border-primary/30 font-semibold'
                : 'bg-surface text-text-secondary border-border hover:bg-surface-hover hover:text-text-primary'
            }`}
          >
            <FileText className="w-3.5 h-3.5 text-text-muted shrink-0" />
            <span className="whitespace-nowrap">Starred Files</span>
            <span
              className={`text-[11px] px-1.5 py-0.5 rounded-full font-mono tabular-nums leading-none border ${
                activeFilter === 'files'
                  ? 'bg-primary-container/20 text-primary border-primary-container/30'
                  : 'bg-surface-raised text-text-muted border-border/60'
              }`}
            >
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

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
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
                    className="group relative bg-surface hover:bg-surface-raised border border-border hover:border-primary-container/40 p-3 sm:p-3.5 rounded-xl flex flex-col justify-between transition-all cursor-pointer shadow-xs min-h-[105px] sm:min-h-[115px]"
                  >
                    <div className="flex items-start justify-between gap-1 mb-2">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
                        <ItemIcon type="folder" folder={folder} className="w-7 h-7 sm:w-8 sm:h-8" size={30} />
                      </div>
                      <div
                        className="drive-menu-container relative flex items-center gap-0.5 shrink-0"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFolder(folder.id);
                          }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-warning hover:bg-surface-raised transition-colors cursor-pointer"
                          title="Remove star"
                        >
                          <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setActiveMenuId(isMenuOpen ? null : `folder-${folder.id}`);
                          }}
                          className={`w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                          }`}
                          title="Folder actions"
                        >
                          <MoreVertical className="w-3.5 h-3.5" />
                        </button>

                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 w-44 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1 z-50 animate-in fade-in duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                navigateToFolder(folder.id);
                                router.push(`/app/drive/${folder.id}`);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                            >
                              <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                              <span>Remove Star</span>
                            </button>
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
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
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
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
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

                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors"
                        title={folder.name}
                      >
                        {folder.name}
                      </span>
                      <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-muted">
                        <span>
                          {folderFilesCount} {folderFilesCount === 1 ? 'file' : 'files'}
                        </span>
                        {folder.isSystem && (
                          <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-medium">
                            Protected
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Starred Folders List View */
            <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden divide-y divide-border/60">
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
                    className="px-3.5 sm:px-4 py-3 flex items-center justify-between gap-3 text-xs hover:bg-surface-hover transition-colors group cursor-pointer"
                  >
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center p-1 shrink-0">
                        <ItemIcon type="folder" folder={folder} className="w-6 h-6 sm:w-7 sm:h-7" size={26} />
                      </div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:gap-4 min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0">
                          <span className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors">
                            {folder.name}
                          </span>
                          <Star className="w-3.5 h-3.5 fill-warning text-warning shrink-0" />
                        </div>
                        <div className="flex items-center gap-2 text-[11px] sm:text-xs text-text-muted sm:ml-auto">
                          <span>
                            {folderFilesCount} {folderFilesCount === 1 ? 'file' : 'files'}
                          </span>
                          {folder.isSystem && (
                            <span className="text-[10px] text-primary bg-primary/10 px-1.5 py-0.2 rounded font-medium shrink-0">
                              Protected
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    <div
                      className="drive-menu-container relative flex items-center gap-1 shrink-0"
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
                        className={`w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer ${
                          isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                        }`}
                        title="Folder actions"
                      >
                        <MoreVertical className="w-4 h-4" />
                      </button>

                      {isMenuOpen && (
                        <div className="absolute right-0 top-8 w-44 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1 z-50 animate-in fade-in duration-100 text-left">
                          <button
                            type="button"
                            onClick={() => {
                              navigateToFolder(folder.id);
                              router.push(`/app/drive/${folder.id}`);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 fill-warning text-warning" />
                            <span>Remove Star</span>
                          </button>
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
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
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
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
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
          )}
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

          {viewMode === 'grid' ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
              {displayFiles.map((file) => {
                const isMenuOpen = activeMenuId === `file-grid-${file.id}`;
                const folderName = file.parentFolderId
                  ? folderMap.get(file.parentFolderId) || 'Folder'
                  : 'My Drive';

                return (
                  <div
                    key={file.id}
                    onClick={() => setPreviewFile(file)}
                    className="group relative p-3 sm:p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-raised hover:border-primary-container/40 transition-all cursor-pointer flex flex-col justify-between shadow-xs min-h-[130px] sm:min-h-[140px]"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center p-1.5 shrink-0">
                        <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-6 h-6 sm:w-7 sm:h-7" size={26} />
                      </div>
                      <div
                        className="drive-menu-container relative flex items-center gap-0.5"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          title="Remove star"
                          className="p-1.5 rounded-lg text-warning hover:scale-110 transition-transform cursor-pointer"
                        >
                          <Star className="w-4 h-4 fill-warning" />
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
                        {isMenuOpen && (
                          <div className="absolute right-0 top-8 w-44 bg-surface-raised border border-border-strong rounded-xl shadow-2xl p-1 z-50 animate-in fade-in duration-100 text-left">
                            <button
                              type="button"
                              onClick={() => {
                                setPreviewFile(file);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5 text-primary" />
                              <span>Preview</span>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleDownload(e, file)}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
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
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs font-medium text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                            >
                              <AlertTriangle className="w-3.5 h-3.5" />
                              <span>Delete</span>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col min-w-0">
                      <span
                        className="text-xs sm:text-sm font-semibold text-text-primary truncate group-hover:text-primary transition-colors"
                        title={file.name}
                      >
                        {file.name}
                      </span>
                      <span className="text-[11px] text-text-muted mt-1 truncate">
                        {formatBytes(file.fileSizeBytes)} • {folderName}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            /* Table Container */
            <div className="bg-surface rounded-xl overflow-hidden shadow-xs border border-border">
            {/* Table Header */}
            <div className="hidden md:grid bg-sidebar px-4 h-10 grid-cols-12 items-center text-text-muted font-label-sm text-xs select-none border-b border-border/40">
              <div className="col-span-5 flex items-center gap-3">
                <span className="w-5 text-center">★</span>
                <span>Name</span>
              </div>
              <div className="col-span-3">Location</div>
              <div className="col-span-2">Modified</div>
              <div className="col-span-1 text-right">Size</div>
              <div className="col-span-1 text-right">Actions</div>
            </div>

            {/* File Rows Container */}
            <div className="flex flex-col divide-y divide-border/40">
              {displayFiles.map((file) => {
                const folderName = file.parentFolderId
                  ? folderMap.get(file.parentFolderId) || 'Projects / Roadmaps'
                  : 'My Drive';
                const isMenuOpen = activeMenuId === `file-${file.id}`;

                return (
                  <div key={file.id}>
                    {/* Mobile Card Row (< md) */}
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="md:hidden p-3.5 flex items-center justify-between gap-3 bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-warning hover:scale-110 transition-transform cursor-pointer shrink-0"
                          title="Unstar file"
                        >
                          <Star className="w-4 h-4 fill-warning" />
                        </button>
                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
                          <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-6 h-6" size={24} />
                        </div>
                        <div className="flex flex-col min-w-0 flex-1">
                          <span className="text-xs sm:text-sm text-text-primary font-medium truncate">
                            {file.name}
                          </span>
                          <span className="text-[11px] text-text-muted mt-0.5 truncate">
                            {formatBytes(file.fileSizeBytes)} · {folderName}
                          </span>
                        </div>
                      </div>

                      <div
                        className="drive-menu-container relative flex items-center gap-1 shrink-0"
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
                            setActiveMenuId(isMenuOpen ? null : `file-${file.id}`);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                          title="More options"
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

                    {/* Desktop Workstation Row (>= md) */}
                    <div
                      onClick={() => setPreviewFile(file)}
                      className="file-row group px-4 h-14 hidden md:grid grid-cols-12 items-center bg-surface hover:bg-surface-hover transition-colors cursor-pointer"
                    >
                      <div className="col-span-5 flex items-center gap-3 min-w-0 pr-2">
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

                        <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
                          <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
                        </div>

                        <span className="text-sm text-text-primary font-medium truncate group-hover:text-primary transition-colors">
                          {file.name}
                        </span>
                      </div>

                      <div className="col-span-3 flex items-center gap-1.5 text-text-secondary text-xs truncate">
                        <FolderOpen className="w-3.5 h-3.5 text-text-muted shrink-0" />
                        <span className="truncate hover:text-text-primary transition-colors">
                          {folderName}
                        </span>
                      </div>

                      <div className="col-span-2 text-text-muted text-xs">
                        {new Date(file.uploadedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </div>

                      <div className="col-span-1 text-text-secondary text-xs font-mono text-right">
                        {formatBytes(file.fileSizeBytes)}
                      </div>

                      <div
                        className="drive-menu-container relative col-span-1 flex items-center justify-end gap-1"
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
                            setActiveMenuId(isMenuOpen ? null : `file-${file.id}`);
                          }}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                          title="More options"
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
                  </div>
                );
              })}
            </div>
          </div>
        )}
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
