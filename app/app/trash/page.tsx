'use client';

import React, { useState } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Folder,
  X,
  HardDrive,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes } from '@/lib/drive/storage-calc';

export default function TrashPage() {
  const {
    files,
    folders,
    restoreFile,
    restoreFolder,
    permanentlyDeleteFile,
    permanentlyDeleteFolder,
    emptyTrash,
  } = useDrive();

  const trashedFiles = files.filter((f) => f.status === 'trashed');
  const trashedFolders = folders.filter((f) => f.status === 'trashed');
  const hasTrashedItems = trashedFiles.length > 0 || trashedFolders.length > 0;

  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-rose-50 text-rose-600 border border-rose-100">
            <Trash2 className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Trash</h2>
            <p className="text-xs text-slate-500">
              Items in Trash do not count toward your Drive storage
            </p>
          </div>
        </div>

        {hasTrashedItems && (
          <button
            onClick={() => setConfirmEmptyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Empty Trash</span>
          </button>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6">
        {!hasTrashedItems ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="h-16 w-16 rounded-2xl bg-slate-50 border border-slate-200 text-slate-400 flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-slate-300" />
            </div>
            <h3 className="text-base font-bold text-slate-900">Trash is empty</h3>
            <p className="mt-1 text-xs text-slate-500 max-w-sm">
              Items you remove will be held here. Trashed files can be restored anytime or
              permanently deleted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trashed Folders */}
            {trashedFolders.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Folders ({trashedFolders.length})
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {trashedFolders.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3 rounded-xl border border-slate-200 bg-slate-50/50"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Folder className="h-5 w-5 text-amber-500 shrink-0" />
                        <span className="text-xs font-medium text-slate-800 truncate">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => restoreFolder(f.id)}
                          className="p-1.5 text-slate-500 hover:text-sky-600 rounded-md hover:bg-slate-200/50"
                          title="Restore folder"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: f.id, name: f.name, isFolder: true })
                          }
                          className="p-1.5 text-slate-500 hover:text-rose-600 rounded-md hover:bg-slate-200/50"
                          title="Delete permanently"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trashed Files */}
            {trashedFiles.length > 0 && (
              <div>
                <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
                  Files ({trashedFiles.length})
                </h4>
                <div className="border border-slate-200 rounded-xl overflow-hidden shadow-2xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[10px] tracking-wider">
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">Original Size</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {trashedFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-slate-50 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-4 w-4 text-slate-400 shrink-0" />
                              <span className="font-semibold text-slate-800 truncate max-w-sm">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 font-mono tabular-nums text-slate-500">
                            {formatBytes(file.fileSizeBytes)}
                          </td>
                          <td className="py-3 px-4 text-slate-400 uppercase text-[11px]">
                            {file.extension || 'FILE'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => restoreFile(file.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({ id: file.id, name: file.name, isFolder: false })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                              >
                                <Trash2 className="h-3 w-3" />
                                <span>Delete Forever</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Permanent Delete Confirmation Dialog */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Permanently Delete?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;? This will remove
              the record from your Drive metadata and delete the message from your Telegram Saved
              Messages. This action cannot be undone.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  if (deleteTarget.isFolder) {
                    permanentlyDeleteFolder(deleteTarget.id);
                  } else {
                    permanentlyDeleteFile(deleteTarget.id);
                  }
                  setDeleteTarget(null);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-2xs transition-colors"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation Dialog */}
      {confirmEmptyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-xl border border-slate-200">
            <div className="flex items-center gap-3 text-rose-600 mb-3">
              <div className="p-2 bg-rose-50 rounded-xl border border-rose-100">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Empty Trash?</h3>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              All items in Trash will be permanently deleted from both One Cloud and Telegram Saved
              Messages. This operation cannot be reversed.
            </p>

            <div className="mt-4 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmEmptyOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-slate-600 hover:text-slate-900 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  emptyTrash();
                  setConfirmEmptyOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-rose-600 hover:bg-rose-500 rounded-lg shadow-2xs transition-colors"
              >
                Empty Entire Trash
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
