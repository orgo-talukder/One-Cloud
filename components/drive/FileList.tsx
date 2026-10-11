'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Folder,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
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
} from 'lucide-react';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { useDrive } from '@/lib/drive/drive-context';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { RenameModal } from '@/components/modals/RenameModal';
import { MoveFileModal } from '@/components/modals/MoveFileModal';

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
        return <ImageIcon className="h-4 w-4 text-sky-500" />;
      case 'video':
        return <VideoIcon className="h-4 w-4 text-purple-500" />;
      case 'audio':
        return <Music className="h-4 w-4 text-emerald-500" />;
      case 'pdf':
        return <FileText className="h-4 w-4 text-rose-500" />;
      default:
        return <FileText className="h-4 w-4 text-slate-500 dark:text-slate-400" />;
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
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-sky-50 dark:bg-sky-950/50 border border-sky-100 dark:border-sky-900 text-sky-600 dark:text-sky-400 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-sky-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900 dark:text-slate-100">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-slate-500 dark:text-slate-400 max-w-sm leading-relaxed">
          {emptySubtitle}
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="p-6 space-y-6">
        {/* Folders Section */}
        {showFolders && folders.length > 0 && (
          <div>
            <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
              Folders
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => {
                const isMenuOpen = activeMenuId === `folder-${folder.id}`;

                return (
                  <div
                    key={folder.id}
                    onDoubleClick={() => navigateToFolder(folder.id)}
                    className="group relative flex items-center justify-between p-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 hover:border-sky-300 dark:hover:border-sky-600 hover:shadow-xs transition-all cursor-pointer"
                  >
                    <div
                      onClick={() => navigateToFolder(folder.id)}
                      className="flex items-center gap-2.5 min-w-0 flex-1"
                    >
                      <Folder className="h-5 w-5 text-amber-500 fill-amber-100 dark:fill-amber-950 shrink-0" />
                      <span
                        className="text-xs font-medium text-slate-800 dark:text-slate-200 truncate"
                        title={folder.name}
                      >
                        {folder.name}
                      </span>
                    </div>

                    <div className="drive-menu-container relative flex items-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveMenuId(isMenuOpen ? null : `folder-${folder.id}`);
                        }}
                        className="p-1 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 opacity-60 group-hover:opacity-100 transition-opacity"
                        title="Folder options"
                      >
                        <MoreVertical className="h-3.5 w-3.5" />
                      </button>

                      {isMenuOpen && (
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="absolute right-0 top-7 w-44 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-30 animate-in fade-in duration-100 text-left"
                        >
                          <button
                            onClick={() => {
                              navigateToFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Folder className="h-3.5 w-3.5 text-amber-500" />
                            <span>Open Folder</span>
                          </button>
                          <button
                            onClick={() => {
                              toggleStarFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Star
                              className={`h-3.5 w-3.5 ${
                                folder.isStarred
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-slate-400'
                              }`}
                            />
                            <span>{folder.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                          </button>
                          <button
                            onClick={() => {
                              setRenameTarget({ id: folder.id, name: folder.name, isFolder: true });
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                          >
                            <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                            <span>Rename</span>
                          </button>
                          <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                          <button
                            onClick={() => {
                              trashFolder(folder.id);
                              setActiveMenuId(null);
                            }}
                            className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                          >
                            <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                            <span>Move to Trash</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div>
            {showFolders && folders.length > 0 && (
              <h4 className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider mb-3">
                Files
              </h4>
            )}

            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
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
                      className={`group relative flex flex-col rounded-xl border bg-white dark:bg-slate-900 overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 hover:shadow-xs'
                      }`}
                    >
                      {/* Thumbnail Header Area (Google Drive Style Image Preview) */}
                      <div className="h-32 bg-slate-100/70 dark:bg-slate-800/60 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-center relative overflow-hidden group/thumb">
                        {/* Checkbox indicator */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectFile(file.id);
                          }}
                          className={`absolute top-2 left-2 z-10 h-5 w-5 rounded-md border flex items-center justify-center transition-opacity ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white opacity-100'
                              : 'bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 opacity-0 group-hover:opacity-100 shadow-xs'
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
                          className={`absolute top-2 right-2 z-10 p-1 rounded-md transition-all ${
                            file.isStarred
                              ? 'text-amber-500 opacity-100'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xs'
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              file.isStarred ? 'fill-amber-400 text-amber-400' : ''
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
                            <div className="img-fallback-icon hidden h-12 w-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 items-center justify-center shadow-2xs">
                              {getIcon(file.mimeType, file.extension)}
                            </div>
                          </>
                        ) : (
                          <div className="h-12 w-12 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shadow-2xs">
                            {getIcon(file.mimeType, file.extension)}
                          </div>
                        )}
                      </div>

                      {/* File Details & Google Drive 3-Dot Options Button */}
                      <div className="p-3 flex items-center justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <p
                            className="text-xs font-semibold text-slate-900 dark:text-slate-100 truncate"
                            title={file.name}
                          >
                            {file.name}
                          </p>
                          <div className="mt-1 flex items-center gap-1.5 text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
                            <span>{formatBytes(file.fileSizeBytes)}</span>
                            <span>·</span>
                            <span className="text-[10px] uppercase font-sans text-slate-400 dark:text-slate-500">
                              {file.extension || 'FILE'}
                            </span>
                          </div>
                        </div>

                        {/* Google Drive 3-Dot Options Button */}
                        <div className="drive-menu-container relative shrink-0">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setActiveMenuId(isMenuOpen ? null : file.id);
                            }}
                            className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                              isMenuOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : ''
                            }`}
                            title="More options"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>

                          {/* 3-Dot Action Dropdown Menu */}
                          {isMenuOpen && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="absolute right-0 bottom-8 sm:bottom-auto sm:top-8 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-40 animate-in fade-in duration-100 text-left"
                            >
                              <button
                                onClick={() => {
                                  setPreviewFile(file);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Eye className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                                <span>Preview</span>
                              </button>
                              <a
                                href={downloadUrl}
                                download={file.name}
                                onClick={() => setActiveMenuId(null)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Download className="h-3.5 w-3.5 text-slate-500" />
                                <span>Download</span>
                              </a>
                              <button
                                onClick={() => {
                                  toggleStarFile(file.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Star
                                  className={`h-3.5 w-3.5 ${
                                    file.isStarred
                                      ? 'fill-amber-400 text-amber-400'
                                      : 'text-slate-400'
                                  }`}
                                />
                                <span>{file.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                              </button>
                              <button
                                onClick={() => {
                                  setRenameTarget({ id: file.id, name: file.name });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                <span>Rename</span>
                              </button>
                              <button
                                onClick={() => {
                                  setMoveTarget({ id: file.id, name: file.name });
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                <FolderInput className="h-3.5 w-3.5 text-slate-400" />
                                <span>Move</span>
                              </button>
                              <button
                                onClick={() => handleCopyLink(file)}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                              >
                                {copiedNotice === file.id ? (
                                  <>
                                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                    <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                                  </>
                                ) : (
                                  <>
                                    <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Copy Link</span>
                                  </>
                                )}
                              </button>
                              <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                              <button
                                onClick={() => {
                                  trashFile(file.id);
                                  setActiveMenuId(null);
                                }}
                                className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                <span>Move to Trash</span>
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
              /* List View (Table with Google Drive 3-Dot Menu & Thumbnails) */
              <div className="border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900 overflow-hidden shadow-2xs">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-800/50 text-slate-500 dark:text-slate-400 font-semibold select-none">
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
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
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
                              ? 'bg-sky-50/70 dark:bg-sky-950/50'
                              : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
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
                                  ? 'bg-sky-600 border-sky-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 group-hover:border-slate-400'
                              }`}
                            >
                              {isSelected && <Check className="h-2.5 w-2.5 stroke-[3]" />}
                            </div>
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-3">
                              {/* Thumbnail in List View */}
                              <div className="h-8 w-8 rounded-lg overflow-hidden bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center shrink-0">
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
                                      {getIcon(file.mimeType, file.extension)}
                                    </div>
                                  </>
                                ) : (
                                  getIcon(file.mimeType, file.extension)
                                )}
                              </div>
                              <span
                                className="font-semibold text-slate-800 dark:text-slate-200 truncate max-w-xs md:max-w-md"
                                title={file.name}
                              >
                                {file.name}
                              </span>
                              {file.isStarred && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500 dark:text-slate-400">
                            {formatBytes(file.fileSizeBytes)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500 uppercase text-[11px]">
                            {file.extension || 'FILE'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 dark:text-slate-500">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            {/* Google Drive 3-Dot Menu */}
                            <div className="drive-menu-container relative inline-block text-left">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveMenuId(isMenuOpen ? null : file.id);
                                }}
                                className={`p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors ${
                                  isMenuOpen ? 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200' : ''
                                }`}
                                title="More options"
                              >
                                <MoreVertical className="h-4 w-4" />
                              </button>

                              {isMenuOpen && (
                                <div
                                  onClick={(e) => e.stopPropagation()}
                                  className="absolute right-0 top-8 w-48 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl p-1 z-40 animate-in fade-in duration-100 text-left"
                                >
                                  <button
                                    onClick={() => {
                                      setPreviewFile(file);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <Eye className="h-3.5 w-3.5 text-sky-600 dark:text-sky-400" />
                                    <span>Preview</span>
                                  </button>
                                  <a
                                    href={downloadUrl}
                                    download={file.name}
                                    onClick={() => setActiveMenuId(null)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <Download className="h-3.5 w-3.5 text-slate-500" />
                                    <span>Download</span>
                                  </a>
                                  <button
                                    onClick={() => {
                                      toggleStarFile(file.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <Star
                                      className={`h-3.5 w-3.5 ${
                                        file.isStarred
                                          ? 'fill-amber-400 text-amber-400'
                                          : 'text-slate-400'
                                      }`}
                                    />
                                    <span>{file.isStarred ? 'Remove Star' : 'Add to Starred'}</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setRenameTarget({ id: file.id, name: file.name });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <Edit2 className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Rename</span>
                                  </button>
                                  <button
                                    onClick={() => {
                                      setMoveTarget({ id: file.id, name: file.name });
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    <FolderInput className="h-3.5 w-3.5 text-slate-400" />
                                    <span>Move</span>
                                  </button>
                                  <button
                                    onClick={() => handleCopyLink(file)}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
                                  >
                                    {copiedNotice === file.id ? (
                                      <>
                                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                                        <span className="text-emerald-600 dark:text-emerald-400">Link Copied!</span>
                                      </>
                                    ) : (
                                      <>
                                        <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                        <span>Copy Link</span>
                                      </>
                                    )}
                                  </button>
                                  <div className="my-1 border-t border-slate-100 dark:border-slate-800" />
                                  <button
                                    onClick={() => {
                                      trashFile(file.id);
                                      setActiveMenuId(null);
                                    }}
                                    className="w-full flex items-center gap-2.5 px-2.5 py-1.5 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="h-3.5 w-3.5 text-rose-500" />
                                    <span>Move to Trash</span>
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
    </>
  );
}
