'use client';

import React, { useState, useEffect } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  Star,
  Download,
  Trash2,
  MoreVertical,
  Edit2,
  FolderInput,
  Eye,
  Check,
  Upload,
  Link as LinkIcon,
  CheckCircle2,
  File,
  Zap,
} from 'lucide-react';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { useDrive } from '@/lib/drive/drive-context';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { RenameModal } from '@/components/modals/RenameModal';
import { MoveFileModal } from '@/components/modals/MoveFileModal';
import { DeleteConfirmModal, type DeleteTargetItem } from '@/components/modals/DeleteConfirmModal';
import { AlertTriangle } from 'lucide-react';
import { ItemIcon } from './ItemIcon';

interface FileListProps {
  files: FileItem[];
  folders?: FolderItem[];
  showFolders?: boolean;
  emptyTitle?: string;
  emptySubtitle?: string;
}

export function FileList({
  files,
  folders = [],
  showFolders = true,
  emptyTitle = 'No files found',
  emptySubtitle = 'Upload files or drag and drop to start storing in your Telegram cloud.',
}: FileListProps) {
  const {
    viewMode,
    navigateToFolder,
    toggleStarFile,
    toggleStarFolder,
    trashFile,
    trashFolder,
    renameFile,
    renameFolder,
    selectedFileIds,
    toggleSelectFile,
    sessionToken,
    downloadFile,
  } = useDrive();

  // Modal states
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);
  const [renameTarget, setRenameTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);
  const [moveTarget, setMoveTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<DeleteTargetItem | null>(null);

  // Active 3-dot dropdown ID
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);
  const [copiedNotice, setCopiedNotice] = useState<string | null>(null);

  // Close dropdown on click outside
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

  const getIcon = (mimeType: string, extension: string) => {
    const category = getFileTypeCategory(mimeType, extension);
    switch (category) {
      case 'image':
        return <ImageIcon className="h-4 w-4 text-file-image" />;
      case 'video':
        return <VideoIcon className="h-4 w-4 text-file-video" />;
      case 'audio':
        return <Headphones className="h-4 w-4 text-file-audio" />;
      case 'archive':
        return <Archive className="h-4 w-4 text-file-archive" />;
      case 'document':
      case 'pdf':
        return <FileText className="h-4 w-4 text-file-document" />;
      default:
        return <File className="h-4 w-4 text-text-secondary" />;
    }
  };

  const handleCopyLink = (file: FileItem) => {
    const url = `${window.location.origin}/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}`;
    navigator.clipboard.writeText(url);
    setCopiedNotice(file.id);
    setTimeout(() => setCopiedNotice(null), 2000);
    setActiveMenuId(null);
  };

  const hasContent = (showFolders && folders.length > 0) || files.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center bg-canvas">
        <div className="h-16 w-16 rounded-2xl bg-brand-subtle border border-border text-primary flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-primary" />
        </div>
        <h3 className="text-base font-semibold text-text-primary tracking-tight">{emptyTitle}</h3>
        <p className="mt-1.5 text-xs text-text-secondary max-w-sm leading-relaxed">
          {emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6 bg-canvas">
        {/* Folders Section */}
        {showFolders && folders.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Folders
              </h4>
              <span className="text-xs text-text-muted">{folders.length} directories</span>
            </div>
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5 sm:gap-3.5">
                {folders.map((folder) => {
                  const isMenuOpen = activeMenuId === `folder-${folder.id}`;

                  return (
                    <div
                      key={folder.id}
                      onDoubleClick={() => navigateToFolder(folder.id)}
                      className="group relative flex flex-col justify-between p-3 sm:p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-raised hover:border-primary-container/40 transition-all cursor-pointer shadow-xs min-h-[105px] sm:min-h-[115px]"
                    >
                      <div className="flex items-start justify-between gap-1 mb-2">
                        <div
                          onClick={() => navigateToFolder(folder.id)}
                          className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1"
                        >
                          <ItemIcon type="folder" folder={folder} className="w-7 h-7 sm:w-8 sm:h-8" size={30} />
                        </div>
                        <div className="drive-menu-container relative flex items-center gap-0.5 shrink-0">
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleStarFolder(folder.id);
                            }}
                            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-warning transition-colors cursor-pointer"
                            title={folder.isStarred ? 'Remove Star' : 'Add to Starred'}
                          >
                            <Star
                              className={`w-3.5 h-3.5 ${
                                folder.isStarred ? 'fill-warning text-warning' : ''
                              }`}
                            />
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
                            title="Folder options"
                          >
                            <MoreVertical className="w-3.5 h-3.5" />
                          </button>

                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 top-8 w-44 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-30 animate-in fade-in duration-100 text-left"
                            >
                              <button
                                onClick={() => {
                                  navigateToFolder(folder.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Folder className="h-3.5 w-3.5 text-primary" />
                                <span>Open Folder</span>
                              </button>
                              <button
                                onClick={() => {
                                  toggleStarFolder(folder.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    folder.isStarred
                                      ? 'fill-warning text-warning'
                                      : 'text-text-muted'
                                  }`}
                                />
                                <span>{folder.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                              </button>

                              {!folder.isSystem && (
                                <>
                                  <button
                                    onClick={() => {
                                      setRenameTarget({ id: folder.id, name: folder.name, isFolder: true });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 text-text-muted" />
                                    <span>Rename</span>
                                  </button>
                                  <div className="my-1 border-t border-border" />
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({
                                        id: folder.id,
                                        name: folder.name,
                                        isFolder: true,
                                        defaultAction: 'trash',
                                      });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Move to Trash</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({
                                        id: folder.id,
                                        name: folder.name,
                                        isFolder: true,
                                        defaultAction: 'permanent',
                                      });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </>
                              )}
                            </div>
                          )}
                        </div>
                      </div>

                      <div
                        onClick={() => navigateToFolder(folder.id)}
                        className="flex flex-col min-w-0"
                      >
                        <span
                          className="text-xs sm:text-sm font-semibold text-text-primary group-hover:text-primary transition-colors truncate"
                          title={folder.name}
                        >
                          {folder.name}
                        </span>
                        <div className="flex items-center gap-1.5 mt-0.5 text-[11px] text-text-muted">
                          <span>Folder</span>
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
              /* Folders List View */
              <div className="bg-surface border border-border rounded-xl shadow-xs overflow-hidden divide-y divide-border/60">
                {folders.map((folder) => {
                  const isMenuOpen = activeMenuId === `folder-${folder.id}`;

                  return (
                    <div
                      key={folder.id}
                      onClick={() => navigateToFolder(folder.id)}
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
                            {folder.isStarred && (
                              <Star className="w-3.5 h-3.5 fill-warning text-warning shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-[11px] sm:text-xs text-text-muted sm:ml-auto">
                            <span>Folder</span>
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
                          onClick={() => toggleStarFolder(folder.id)}
                          title={folder.isStarred ? 'Remove Star' : 'Add to Starred'}
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-warning transition-colors cursor-pointer"
                        >
                          <Star
                            className={`w-4 h-4 ${folder.isStarred ? 'fill-warning text-warning' : ''}`}
                          />
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveMenuId(isMenuOpen ? null : `folder-${folder.id}`)}
                          title="Folder options"
                          className={`w-8 h-8 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                            isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                          }`}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </button>

                        {isMenuOpen && (
                          <div
                            onClick={(e) => e.stopPropagation()}
                            className="absolute right-0 top-8 w-44 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-30 animate-in fade-in duration-100 text-left"
                          >
                            <button
                              onClick={() => {
                                navigateToFolder(folder.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                            >
                              <Folder className="h-3.5 w-3.5 text-primary" />
                              <span>Open Folder</span>
                            </button>
                            <button
                              onClick={() => {
                                toggleStarFolder(folder.id);
                                setActiveMenuId(null);
                              }}
                              className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                            >
                              <Star
                                className={`h-3.5 w-3.5 ${
                                  folder.isStarred
                                    ? 'fill-warning text-warning'
                                    : 'text-text-muted'
                                }`}
                              />
                              <span>{folder.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                            </button>

                            {!folder.isSystem && (
                              <>
                                <button
                                  onClick={() => {
                                    setRenameTarget({ id: folder.id, name: folder.name, isFolder: true });
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                >
                                  <Edit2 className="h-3.5 w-3.5 text-text-muted" />
                                  <span>Rename</span>
                                </button>
                                <div className="my-1 border-t border-border" />
                                <button
                                  onClick={() => {
                                    setDeleteTarget({
                                      id: folder.id,
                                      name: folder.name,
                                      isFolder: true,
                                      defaultAction: 'trash',
                                    });
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                  <span>Move to Trash</span>
                                </button>
                                <button
                                  onClick={() => {
                                    setDeleteTarget({
                                      id: folder.id,
                                      name: folder.name,
                                      isFolder: true,
                                      defaultAction: 'permanent',
                                    });
                                    setActiveMenuId(null);
                                  }}
                                  className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                >
                                  <AlertTriangle className="h-3.5 w-3.5" />
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
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-text-muted">
                Files
              </h4>
              <span className="text-xs text-text-muted">{files.length} items</span>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3.5">
                {files.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  const isMenuOpen = activeMenuId === file.id;
                  const category = getFileTypeCategory(file.mimeType, file.extension);
                  const isImage = category === 'image';
                  const downloadUrl = `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
                    sessionToken
                  )}`;
                  const previewUrl = file.downloadUrl || downloadUrl;

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleSelectFile(file.id)}
                      onDoubleClick={() => setPreviewFile(file)}
                      className={`group relative flex flex-col rounded-xl border bg-surface overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? 'border-focus-ring ring-1 ring-focus-ring shadow-xs'
                          : 'border-border hover:border-border-strong hover:bg-surface-raised hover:shadow-xs'
                      }`}
                    >
                      {/* Thumbnail Header Area */}
                      <div className="h-28 bg-surface-raised border-b border-border flex items-center justify-center relative overflow-hidden group/thumb">
                        {/* Checkbox indicator */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectFile(file.id);
                          }}
                          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded-md border flex items-center justify-center transition-opacity ${
                            isSelected
                              ? 'bg-primary-container border-primary-container text-text-primary opacity-100'
                              : 'bg-surface border-border text-text-primary opacity-0 group-hover:opacity-100 shadow-xs'
                          }`}
                        >
                          {isSelected && <Check className="h-3 w-3 stroke-[3]" />}
                        </div>

                        {/* Star Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleStarFile(file.id);
                          }}
                          className={`absolute top-2 right-2 z-10 p-1 rounded-md transition-all cursor-pointer ${
                            file.isStarred
                              ? 'text-warning opacity-100'
                              : 'text-text-muted opacity-0 group-hover:opacity-100 hover:text-warning bg-surface/80 backdrop-blur-xs'
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              file.isStarred ? 'fill-warning' : ''
                            }`}
                          />
                        </button>

                        {/* Real Image Preview or File Icon */}
                        {isImage ? (
                          <>
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={previewUrl}
                              alt={file.name}
                              loading="lazy"
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover transition-transform duration-300 group-hover/thumb:scale-105"
                              onError={(e) => {
                                const target = e.currentTarget as HTMLElement;
                                target.style.display = 'none';
                                const fallback = target.parentElement?.querySelector(
                                  '.img-fallback-icon'
                                ) as HTMLElement;
                                if (fallback) fallback.style.display = 'flex';
                              }}
                            />
                            <div className="img-fallback-icon hidden h-11 w-11 rounded-xl bg-surface-raised border border-border items-center justify-center p-1.5 shadow-xs">
                              <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-8 h-8" size={32} />
                            </div>
                          </>
                        ) : (
                          <div className="h-11 w-11 rounded-xl bg-surface-raised border border-border flex items-center justify-center p-1.5 shadow-xs">
                            <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-8 h-8" size={32} />
                          </div>
                        )}
                      </div>

                      {/* File Details & 3-Dot Options Button */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold text-text-primary truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-text-muted tabular-nums">
                            <span>{formatBytes(file.fileSizeBytes)}</span>
                            <span>•</span>
                            <span className="uppercase text-[10px] text-text-secondary">
                              {file.extension || 'FILE'}
                            </span>
                          </div>
                        </div>

                        {/* 3-Dot Options Button */}
                        <div className="drive-menu-container relative shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : file.id);
                            }}
                            className={`p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                              isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                            }`}
                            title="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* 3-Dot Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-8 sm:bottom-auto sm:top-8 w-48 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-40 animate-in fade-in duration-100 text-left"
                            >
                              <button
                                onClick={() => {
                                  setPreviewFile(file);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Eye className="h-3.5 w-3.5 text-primary" />
                                <span>Preview</span>
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  downloadFile(file);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Download className="h-3.5 w-3.5 text-text-muted" />
                                <span>Download</span>
                              </button>
                              <a
                                href={`/api/telegram/download/${encodeURIComponent(
                                  file.id
                                )}?messageId=${encodeURIComponent(
                                  String(file.telegramMessageId)
                                )}&sessionToken=${encodeURIComponent(sessionToken)}`}
                                download={file.name}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={() => setActiveMenuId(null)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Zap className="h-3.5 w-3.5 text-warning" />
                                <span>Direct IDM / Stream</span>
                              </a>
                              <button
                                onClick={() => {
                                  toggleStarFile(file.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    file.isStarred
                                      ? 'fill-warning text-warning'
                                      : 'text-text-muted'
                                  }`}
                                />
                                <span>{file.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRenameTarget({ id: file.id, name: file.name });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-text-muted" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => {
                                  setMoveTarget({ id: file.id, name: file.name });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                <FolderInput className="h-3.5 w-3.5 text-text-muted" />
                                <span>Move</span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(file)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                              >
                                {copiedNotice === file.id ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-tertiary" />
                                    <span className="text-tertiary">Link Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon className="h-3.5 w-3.5 text-text-muted" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                              <div className="my-1 border-t border-border" />
                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    id: file.id,
                                    name: file.name,
                                    isFolder: false,
                                    defaultAction: 'trash',
                                  });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                <span>Move to Trash</span>
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteTarget({
                                    id: file.id,
                                    name: file.name,
                                    isFolder: false,
                                    defaultAction: 'permanent',
                                  });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                              >
                                <AlertTriangle className="h-3.5 w-3.5" />
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
            ) : (
              /* List View (Table) */
              <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-border bg-surface-raised text-text-muted font-medium select-none">
                      <th className="py-2.5 pl-4 pr-2 w-8">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">File Size</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Date Modified</th>
                      <th className="py-2.5 pr-4 text-right w-12">
                        <span className="sr-only">Actions</span>
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/60">
                    {files.map((file) => {
                      const isSelected = selectedFileIds.includes(file.id);
                      const isMenuOpen = activeMenuId === file.id;
                      const category = getFileTypeCategory(file.mimeType, file.extension);
                      const isImage = category === 'image';
                      const downloadUrl = `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
                        sessionToken
                      )}`;
                      const previewUrl = file.downloadUrl || downloadUrl;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => toggleSelectFile(file.id)}
                          onDoubleClick={() => setPreviewFile(file)}
                          className={`group transition-colors cursor-pointer ${
                            isSelected
                              ? 'bg-brand-subtle/50'
                              : 'hover:bg-surface-hover/60'
                          }`}
                        >
                          <td className="py-2.5 pl-4 pr-2">
                            <div
                              onClick={(e) => {
                                e.stopPropagation();
                                toggleSelectFile(file.id);
                              }}
                              className={`h-4 w-4 rounded border flex items-center justify-center transition-colors ${
                                isSelected
                                  ? 'bg-primary-container border-primary-container text-text-primary'
                                  : 'border-border group-hover:border-border-strong bg-surface'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail in List View */}
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-brand-subtle border border-border flex items-center justify-center shrink-0">
                                {isImage ? (
                                  <>
                                    {/* eslint-disable-next-line @next/next/no-img-element */}
                                    <img
                                      src={previewUrl}
                                      alt={file.name}
                                      loading="lazy"
                                      referrerPolicy="no-referrer"
                                      className="h-full w-full object-cover"
                                      onError={(e) => {
                                        (e.currentTarget as HTMLElement).style.display = 'none';
                                        const fb = e.currentTarget.parentElement?.querySelector('.list-fallback-icon') as HTMLElement;
                                        if (fb) fb.style.display = 'flex';
                                      }}
                                    />
                                    <div className="list-fallback-icon hidden items-center justify-center">
                                      <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
                                    </div>
                                  </>
                                ) : (
                                  <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
                                )}
                              </div>
                              <span
                                className="font-semibold text-text-primary truncate max-w-xs md:max-w-md group-hover:text-primary transition-colors"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                              {file.isStarred && (
                                <Star className="h-3.5 w-3.5 fill-warning text-warning shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 tabular-nums text-text-secondary">
                            {formatBytes(file.fileSizeBytes)}
                          </td>
                          <td className="py-2.5 px-3 text-text-muted uppercase text-[11px]">
                            {file.extension || 'FILE'}
                          </td>
                          <td className="py-2.5 px-3 text-text-muted">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            <div className="drive-menu-container relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : file.id);
                                }}
                                className={`p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors cursor-pointer ${
                                  isMenuOpen ? 'bg-surface-hover text-text-primary' : ''
                                }`}
                                title="File options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 bottom-6 sm:bottom-auto sm:top-6 w-48 bg-surface-raised border border-border rounded-xl shadow-xl p-1 z-40 animate-in fade-in duration-100 text-left"
                                >
                                  <button
                                    onClick={() => {
                                      setPreviewFile(file);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-primary" />
                                    <span>Preview</span>
                                  </button>
                                  <button
                                    type="button"
                                    onClick={() => {
                                      downloadFile(file);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Download className="h-3.5 w-3.5 text-text-muted" />
                                    <span>Download</span>
                                  </button>
                                  <a
                                    href={`/api/telegram/download/${encodeURIComponent(
                                      file.id
                                    )}?messageId=${encodeURIComponent(
                                      String(file.telegramMessageId)
                                    )}&sessionToken=${encodeURIComponent(sessionToken)}`}
                                    download={file.name}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Zap className="h-3.5 w-3.5 text-warning" />
                                    <span>Direct IDM / Stream</span>
                                  </a>
                                  <button
                                    onClick={() => {
                                      toggleStarFile(file.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Star
                                      className={`h-3.5 w-3.5 ${
                                        file.isStarred
                                          ? 'fill-warning text-warning'
                                          : 'text-text-muted'
                                      }`}
                                    />
                                    <span>{file.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRenameTarget({ id: file.id, name: file.name });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 text-text-muted" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMoveTarget({ id: file.id, name: file.name });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    <FolderInput className="h-3.5 w-3.5 text-text-muted" />
                                    <span>Move</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyLink(file)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
                                  >
                                    {copiedNotice === file.id ? (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-tertiary" />
                                        <span className="text-tertiary">Link Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <LinkIcon className="h-3.5 w-3.5 text-text-muted" />
                                        <span>Copy Link</span>
                                      </>
                                    )}
                                  </button>
                                  <div className="my-1 border-t border-border" />
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({
                                        id: file.id,
                                        name: file.name,
                                        isFolder: false,
                                        defaultAction: 'trash',
                                      });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-text-secondary hover:text-warning hover:bg-warning/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <Trash2 className="h-3.5 w-3.5" />
                                    <span>Move to Trash</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setDeleteTarget({
                                        id: file.id,
                                        name: file.name,
                                        isFolder: false,
                                        defaultAction: 'permanent',
                                      });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors cursor-pointer"
                                  >
                                    <AlertTriangle className="h-3.5 w-3.5" />
                                    <span>Delete</span>
                                  </button>
                                </div>
                              )}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
      {renameTarget && (
        <RenameModal
          currentName={renameTarget.name}
          onRename={(newName) => {
            if (renameTarget.isFolder) {
              renameFolder(renameTarget.id, newName);
            } else {
              renameFile(renameTarget.id, newName);
            }
          }}
          onClose={() => setRenameTarget(null)}
        />
      )}
      {moveTarget && (
        <MoveFileModal
          itemId={moveTarget.id}
          itemName={moveTarget.name}
          isFolder={moveTarget.isFolder}
          onClose={() => setMoveTarget(null)}
        />
      )}
      {deleteTarget && (
        <DeleteConfirmModal
          item={deleteTarget}
          onClose={() => setDeleteTarget(null)}
        />
      )}
    </>
  );
}
