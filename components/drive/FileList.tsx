'use client';

import React, { useState } from 'react';
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
  Send,
  Upload,
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

  // Active dropdown
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null);

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
        return <FileText className="h-4 w-4 text-slate-500" />;
    }
  };

  const hasContent = (showFolders && folders.length > 0) || files.length > 0;

  if (!hasContent) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="h-16 w-16 rounded-2xl bg-sky-50 border border-sky-100 text-sky-600 flex items-center justify-center mb-4">
          <Upload className="h-8 w-8 text-sky-500" />
        </div>
        <h3 className="text-base font-bold text-slate-900">{emptyTitle}</h3>
        <p className="mt-1 text-xs text-slate-500 max-w-sm leading-relaxed">
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
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Folders
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
              {folders.map((folder) => (
                <div
                  key={folder.id}
                  onDoubleClick={() => navigateToFolder(folder.id)}
                  className="group relative flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-white hover:border-sky-300 hover:shadow-xs transition-all cursor-pointer"
                >
                  <div
                    onClick={() => navigateToFolder(folder.id)}
                    className="flex items-center gap-2.5 min-w-0 flex-1"
                  >
                    <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                    <span className="text-xs font-medium text-slate-800 truncate" title={folder.name}>
                      {folder.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStarFolder(folder.id);
                      }}
                      className="p-1 text-slate-400 hover:text-amber-500"
                    >
                      <Star
                        className={`h-3.5 w-3.5 ${
                          folder.isStarred ? 'fill-amber-400 text-amber-400' : ''
                        }`}
                      />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        trashFolder(folder.id);
                      }}
                      className="p-1 text-slate-400 hover:text-rose-600"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Files Section */}
        {files.length > 0 && (
          <div>
            {showFolders && folders.length > 0 && (
              <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                Files
              </h4>
            )}

            {/* Grid View */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
                {files.map((file) => {
                  const isSelected = selectedFileIds.includes(file.id);
                  const downloadUrl = `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
                    sessionToken
                  )}`;

                  return (
                    <div
                      key={file.id}
                      onClick={() => toggleSelectFile(file.id)}
                      onDoubleClick={() => setPreviewFile(file)}
                      className={`group relative flex flex-col rounded-xl border bg-white overflow-hidden transition-all cursor-pointer ${
                        isSelected
                          ? 'border-sky-500 ring-2 ring-sky-500/20 shadow-xs'
                          : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
                      }`}
                    >
                      {/* Thumbnail Header Area */}
                      <div className="h-28 bg-slate-50/70 border-b border-slate-100 flex items-center justify-center p-3 relative">
                        {/* Checkbox indicator */}
                        <div
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSelectFile(file.id);
                          }}
                          className={`absolute top-2 left-2 h-5 w-5 rounded-md border flex items-center justify-center transition-opacity ${
                            isSelected
                              ? 'bg-sky-600 border-sky-600 text-white opacity-100'
                              : 'bg-white border-slate-300 opacity-0 group-hover:opacity-100'
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
                          className={`absolute top-2 right-2 p-1 rounded-md transition-all ${
                            file.isStarred
                              ? 'text-amber-500 opacity-100'
                              : 'text-slate-400 opacity-0 group-hover:opacity-100 hover:text-amber-500'
                          }`}
                        >
                          <Star
                            className={`h-3.5 w-3.5 ${
                              file.isStarred ? 'fill-amber-400 text-amber-400' : ''
                            }`}
                          />
                        </button>

                        <div className="h-12 w-12 rounded-xl bg-white border border-slate-200 flex items-center justify-center shadow-2xs">
                          {getIcon(file.mimeType, file.extension)}
                        </div>
                      </div>

                      {/* File Details */}
                      <div className="p-3">
                        <p className="text-xs font-semibold text-slate-900 truncate" title={file.name}>
                          {file.name}
                        </p>
                        <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono tabular-nums">
                          <span>{formatBytes(file.fileSizeBytes)}</span>
                          <span className="text-[10px] uppercase font-sans text-slate-400">
                            {file.extension || 'FILE'}
                          </span>
                        </div>

                        {/* Quick hover menu button */}
                        <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setPreviewFile(file);
                            }}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="Preview"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </button>
                          <a
                            href={downloadUrl}
                            download={file.name}
                            onClick={(e) => e.stopPropagation()}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="Download"
                          >
                            <Download className="h-3.5 w-3.5" />
                          </a>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setRenameTarget({ id: file.id, name: file.name });
                            }}
                            className="p-1 text-slate-500 hover:text-slate-900 rounded"
                            title="Rename"
                          >
                            <Edit2 className="h-3.5 w-3.5" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              trashFile(file.id);
                            }}
                            className="p-1 text-slate-500 hover:text-rose-600 rounded"
                            title="Trash"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              /* List View */
              <div className="border border-slate-200 rounded-xl bg-white overflow-hidden shadow-2xs">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                      <th className="py-2.5 pl-4 pr-2 w-8">
                        <span className="sr-only">Select</span>
                      </th>
                      <th className="py-2.5 px-3">Name</th>
                      <th className="py-2.5 px-3">Size</th>
                      <th className="py-2.5 px-3">Type</th>
                      <th className="py-2.5 px-3">Uploaded</th>
                      <th className="py-2.5 pr-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {files.map((file) => {
                      const isSelected = selectedFileIds.includes(file.id);
                      const downloadUrl = `/api/telegram/download/${file.id}?messageId=${file.telegramMessageId}&sessionToken=${encodeURIComponent(
                        sessionToken
                      )}`;

                      return (
                        <tr
                          key={file.id}
                          onClick={() => toggleSelectFile(file.id)}
                          onDoubleClick={() => setPreviewFile(file)}
                          className={`hover:bg-slate-50 transition-colors cursor-pointer ${
                            isSelected ? 'bg-sky-50/50' : ''
                          }`}
                        >
                          <td className="py-2.5 pl-4 pr-2">
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={() => toggleSelectFile(file.id)}
                              className="rounded border-slate-300 text-sky-600 focus:ring-sky-500 h-3.5 w-3.5"
                            />
                          </td>
                          <td className="py-2.5 px-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              {getIcon(file.mimeType, file.extension)}
                              <span className="font-semibold text-slate-800 truncate max-w-xs" title={file.name}>
                                {file.name}
                              </span>
                              {file.isStarred && (
                                <Star className="h-3 w-3 fill-amber-400 text-amber-400 shrink-0" />
                              )}
                            </div>
                          </td>
                          <td className="py-2.5 px-3 font-mono tabular-nums text-slate-500">
                            {formatBytes(file.fileSizeBytes)}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400 uppercase text-[11px]">
                            {file.extension || 'FILE'}
                          </td>
                          <td className="py-2.5 px-3 text-slate-400">
                            {new Date(file.uploadedAt).toLocaleDateString()}
                          </td>
                          <td className="py-2.5 pr-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPreviewFile(file);
                                }}
                                className="p-1 text-slate-400 hover:text-slate-900 rounded"
                                title="Preview"
                              >
                                <Eye className="h-3.5 w-3.5" />
                              </button>
                              <a
                                href={downloadUrl}
                                download={file.name}
                                onClick={(e) => e.stopPropagation()}
                                className="p-1 text-slate-400 hover:text-slate-900 rounded"
                                title="Download"
                              >
                                <Download className="h-3.5 w-3.5" />
                              </a>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setRenameTarget({ id: file.id, name: file.name });
                                }}
                                className="p-1 text-slate-400 hover:text-slate-900 rounded"
                                title="Rename"
                              >
                                <Edit2 className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setMoveTarget({ id: file.id, name: file.name });
                                }}
                                className="p-1 text-slate-400 hover:text-slate-900 rounded"
                                title="Move"
                              >
                                <FolderInput className="h-3.5 w-3.5" />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  trashFile(file.id);
                                }}
                                className="p-1 text-slate-400 hover:text-rose-600 rounded"
                                title="Move to Trash"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
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
