'use client';

import React, { useState, useMemo } from 'react';
import {
  Trash2,
  RotateCcw,
  AlertTriangle,
  FileText,
  Folder,
  Shield,
  Search,
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

  const [activeTab, setActiveTab] = useState<'all' | 'folders' | 'files'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [confirmEmptyOpen, setConfirmEmptyOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{
    id: string;
    name: string;
    isFolder?: boolean;
  } | null>(null);

  const trashedFiles = useMemo(() => {
    return files
      .filter((f) => f.status === 'trashed')
      .filter((f) => (searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));
  }, [files, searchQuery]);

  const trashedFolders = useMemo(() => {
    return folders
      .filter((f) => f.status === 'trashed')
      .filter((f) => (searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true));
  }, [folders, searchQuery]);

  const totalTrashedCount = trashedFiles.length + trashedFolders.length;
  const hasTrashedItems = totalTrashedCount > 0;

  return (
    <div className="flex flex-col h-full bg-canvas text-text-primary transition-colors overflow-hidden">
      {/* Top Header */}
      <div className="px-6 py-4 border-b border-border bg-canvas flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-danger/10 text-danger border border-danger/20 flex items-center justify-center">
            <Trash2 className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-base font-semibold text-text-primary">Trash</h1>
            <p className="text-xs text-text-secondary">
              Items in Trash do not count toward your Drive storage
            </p>
          </div>
        </div>

        {hasTrashedItems && (
          <button
            onClick={() => setConfirmEmptyOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-danger bg-danger/10 hover:bg-danger/20 border border-danger/30 rounded-lg transition-colors cursor-pointer"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>Empty Entire Trash</span>
          </button>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-5">
        {/* Retention Policy Banner */}
        <div className="bg-surface rounded-xl border border-border p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 text-text-secondary">
              <Shield className="h-4.5 w-4.5 text-text-secondary" />
            </div>
            <div>
              <span className="text-xs font-semibold text-text-primary mr-2">
                Safe Telegram Retention
              </span>
              <span className="text-xs text-text-secondary">
                Items remain safely recoverable until permanently deleted. Restoring returns them to your drive.
              </span>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised text-[11px] font-medium text-text-secondary border border-border">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary"></span>
              Encrypted Payload
            </span>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
          {/* Tabs */}
          <div className="inline-flex p-1 bg-surface rounded-lg border border-border self-start">
            <button
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'all'
                  ? 'bg-brand-subtle text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              All Trash ({totalTrashedCount})
            </button>
            <button
              onClick={() => setActiveTab('folders')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'folders'
                  ? 'bg-brand-subtle text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Folders ({trashedFolders.length})
            </button>
            <button
              onClick={() => setActiveTab('files')}
              className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer ${
                activeTab === 'files'
                  ? 'bg-brand-subtle text-primary'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              Files ({trashedFiles.length})
            </button>
          </div>

          {/* Search inside trash */}
          <div className="relative w-full sm:w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-text-muted pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search in trash..."
              className="w-full h-9 pl-8 pr-3 bg-surface rounded-lg border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-focus-ring transition-colors"
            />
          </div>
        </div>

        {/* Empty State */}
        {!hasTrashedItems ? (
          <div className="flex flex-col items-center justify-center py-20 text-center bg-surface rounded-xl border border-border">
            <div className="h-16 w-16 rounded-2xl bg-brand-subtle border border-border text-text-muted flex items-center justify-center mb-4">
              <Trash2 className="h-8 w-8 text-text-muted" />
            </div>
            <h3 className="text-base font-semibold text-text-primary">Trash is empty</h3>
            <p className="mt-1 text-xs text-text-secondary max-w-sm">
              Items you remove will be held here. Trashed files can be restored anytime or
              permanently deleted.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Trashed Folders */}
            {(activeTab === 'all' || activeTab === 'folders') && trashedFolders.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Folders ({trashedFolders.length})
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {trashedFolders.map((f) => (
                    <div
                      key={f.id}
                      className="flex items-center justify-between p-3.5 rounded-xl border border-border bg-surface hover:bg-surface-raised transition-colors shadow-xs"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 text-text-secondary">
                          <Folder className="h-5 w-5 text-text-secondary" />
                        </div>
                        <span className="text-xs font-medium text-text-primary truncate">
                          {f.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => restoreFolder(f.id)}
                          className="p-1.5 text-text-muted hover:text-text-primary rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
                          title="Restore folder"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() =>
                            setDeleteTarget({ id: f.id, name: f.name, isFolder: true })
                          }
                          className="p-1.5 text-text-muted hover:text-danger rounded-lg hover:bg-danger/10 transition-colors cursor-pointer"
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
            {(activeTab === 'all' || activeTab === 'files') && trashedFiles.length > 0 && (
              <div>
                <h3 className="text-xs font-semibold uppercase tracking-wider text-text-muted mb-3">
                  Files ({trashedFiles.length})
                </h3>
                <div className="border border-border rounded-xl bg-surface overflow-hidden shadow-xs">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="border-b border-border bg-surface-raised text-text-muted font-medium select-none">
                        <th className="py-2.5 px-4">Name</th>
                        <th className="py-2.5 px-4">Size</th>
                        <th className="py-2.5 px-4">Type</th>
                        <th className="py-2.5 px-4 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/60">
                      {trashedFiles.map((file) => (
                        <tr key={file.id} className="hover:bg-surface-hover/60 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <FileText className="h-4 w-4 text-text-muted shrink-0" />
                              <span className="font-semibold text-text-primary truncate max-w-sm">
                                {file.name}
                              </span>
                            </div>
                          </td>
                          <td className="py-3 px-4 tabular-nums text-text-secondary">
                            {formatBytes(file.fileSizeBytes)}
                          </td>
                          <td className="py-3 px-4 text-text-muted uppercase text-[11px]">
                            {file.extension || 'FILE'}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => restoreFile(file.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
                              >
                                <RotateCcw className="h-3 w-3" />
                                <span>Restore</span>
                              </button>
                              <button
                                onClick={() =>
                                  setDeleteTarget({ id: file.id, name: file.name, isFolder: false })
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-danger hover:bg-danger/10 border border-danger/20 rounded-lg transition-colors cursor-pointer"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-raised p-5 shadow-2xl border border-border text-text-primary">
            <div className="flex items-center gap-3 text-danger mb-3">
              <div className="p-2 bg-danger/10 rounded-xl border border-danger/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Permanently Delete?</h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              Are you sure you want to delete &ldquo;{deleteTarget.name}&rdquo;? This will remove
              the record and delete the message from your Telegram Saved Messages. This action cannot be undone.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setDeleteTarget(null)}
                className="px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
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
                className="px-4 py-1.5 text-xs font-medium text-white bg-danger hover:opacity-90 rounded-lg transition-opacity cursor-pointer shadow-xs"
              >
                Delete Forever
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Empty Trash Confirmation Dialog */}
      {confirmEmptyOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm rounded-2xl bg-surface-raised p-5 shadow-2xl border border-border text-text-primary">
            <div className="flex items-center gap-3 text-danger mb-3">
              <div className="p-2 bg-danger/10 rounded-xl border border-danger/20">
                <AlertTriangle className="h-5 w-5" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Empty Trash?</h3>
            </div>

            <p className="text-xs text-text-secondary leading-relaxed">
              All items in Trash will be permanently deleted from both One Cloud and Telegram Saved
              Messages. This operation cannot be reversed.
            </p>

            <div className="mt-5 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setConfirmEmptyOpen(false)}
                className="px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => {
                  emptyTrash();
                  setConfirmEmptyOpen(false);
                }}
                className="px-4 py-1.5 text-xs font-medium text-white bg-danger hover:opacity-90 rounded-lg transition-opacity cursor-pointer shadow-xs"
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
