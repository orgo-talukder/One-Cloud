'use client';

import React, { useState, useMemo } from 'react';
import {
  Trash2,
  History,
  Shield,
  Search,
  Folder,
  FolderOpen,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Archive,
  File,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  X,
  RefreshCw,
  Cloud,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { ItemIcon } from '@/components/drive/ItemIcon';

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
  const [sortOption, setSortOption] = useState<'Date deleted' | 'Name' | 'Size'>('Date deleted');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  // Deletion modal states
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState('Permanently delete item?');
  const [targetItemName, setTargetItemName] = useState('item.txt');
  const [deleteTargetId, setDeleteTargetId] = useState<string | null>(null);
  const [deleteTargetIsFolder, setDeleteTargetIsFolder] = useState(false);
  const [isEmptyingAll, setIsEmptyingAll] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Real trashed files & folders
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

  const totalCount = trashedFiles.length + trashedFolders.length;

  const recoverableBytes = useMemo(() => {
    return trashedFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0);
  }, [trashedFiles]);

  const folderMap = useMemo(() => {
    const map = new Map<string, string>();
    folders.forEach((f) => map.set(f.id, f.name));
    return map;
  }, [folders]);

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

  const handleOpenDeleteSingle = (id: string, name: string, isFolder: boolean) => {
    setModalTitle('Permanently delete item?');
    setTargetItemName(name);
    setDeleteTargetId(id);
    setDeleteTargetIsFolder(isFolder);
    setIsEmptyingAll(false);
    setDeleteModalOpen(true);
  };

  const handleOpenEmptyTrash = () => {
    setModalTitle('Empty all items in Trash?');
    setTargetItemName(`${totalCount} deleted items will be purged`);
    setDeleteTargetId(null);
    setIsEmptyingAll(true);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    setIsDeleting(true);
    try {
      if (isEmptyingAll) {
        await emptyTrash();
        setSelectedIds([]);
      } else if (deleteTargetId) {
        if (deleteTargetIsFolder) {
          await permanentlyDeleteFolder(deleteTargetId);
        } else {
          await permanentlyDeleteFile(deleteTargetId);
        }
        setSelectedIds((prev) => prev.filter((id) => id !== deleteTargetId));
      }
    } finally {
      setIsDeleting(false);
      setDeleteModalOpen(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      const all = [...trashedFolders.map((f) => f.id), ...trashedFiles.map((f) => f.id)];
      setSelectedIds(all);
    } else {
      setSelectedIds([]);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="px-6 lg:px-8 py-6 flex flex-col gap-6 max-w-7xl mx-auto w-full pb-24 text-text-primary">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-3">
            <h1 className="font-headline-lg text-2xl sm:text-3xl font-bold text-text-primary tracking-tight">
              Trash
            </h1>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-surface-raised text-text-secondary border border-border">
              {totalCount} {totalCount === 1 ? 'item' : 'items'}
            </span>
          </div>
          <p className="font-body-md text-xs sm:text-sm text-text-muted">
            Items in Trash can be restored to your drive or permanently removed from Telegram storage.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          {/* Sort Control */}
          <div className="relative inline-block text-left">
            <button
              id="sortDropdownBtn"
              type="button"
              onClick={() => setSortMenuOpen(!sortMenuOpen)}
              className="h-10 px-3.5 bg-surface hover:bg-surface-hover text-text-secondary hover:text-text-primary border border-border rounded-lg flex items-center gap-2 transition-colors text-xs font-medium cursor-pointer"
            >
              <span>{sortOption}</span>
              <ChevronDown className="w-4 h-4 text-text-muted" />
            </button>

            {sortMenuOpen && (
              <div className="absolute right-0 mt-1 w-44 rounded-lg bg-surface-raised shadow-xl p-1 z-30 border border-border text-xs">
                {(['Date deleted', 'Name', 'Size'] as const).map((opt) => (
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

          {/* Empty Trash Button */}
          {totalCount > 0 && (
            <button
              id="openEmptyTrashModal"
              type="button"
              onClick={handleOpenEmptyTrash}
              className="h-10 px-4 rounded-lg bg-surface hover:bg-surface-hover border border-danger/40 text-danger hover:border-danger flex items-center gap-2 text-xs font-semibold transition-all shadow-xs cursor-pointer"
            >
              <Trash2 className="w-4 h-4 text-danger" />
              <span>Empty Trash</span>
            </button>
          )}
        </div>
      </div>

      {/* Informational Policy Banner */}
      <div className="bg-surface rounded-xl border border-border p-4 flex items-start sm:items-center justify-between gap-4 shadow-xs">
        <div className="flex items-start sm:items-center gap-3.5">
          <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border flex items-center justify-center shrink-0 text-text-secondary">
            <Shield className="w-4 h-4 text-text-secondary" />
          </div>
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 text-xs">
            <span className="font-semibold text-text-primary">
              Safe Telegram Retention
            </span>
            <span className="hidden sm:inline text-text-muted">•</span>
            <p className="text-text-secondary">
              Items remain safely recoverable in Telegram until permanently deleted. Restoring an item returns it to its original folder location.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-raised text-[11px] font-medium text-text-muted border border-border">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            Vault Encrypted
          </span>
        </div>
      </div>

      {/* Filter & Search Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        {/* Tabs */}
        <div className="inline-flex p-1 bg-surface rounded-lg border border-border self-start text-xs font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'all'
                ? 'text-text-primary bg-brand-subtle font-semibold border border-primary/20'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            All Trash ({totalCount})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('folders')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'folders'
                ? 'text-text-primary bg-brand-subtle font-semibold border border-primary/20'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Folders ({trashedFolders.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`px-3.5 py-1.5 rounded-md transition-colors cursor-pointer ${
              activeTab === 'files'
                ? 'text-text-primary bg-brand-subtle font-semibold border border-primary/20'
                : 'text-text-muted hover:text-text-primary'
            }`}
          >
            Files ({trashedFiles.length})
          </button>
        </div>

        {/* Search in Trash */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search deleted files..."
            className="w-full h-9 pl-9 pr-3 bg-surface rounded-lg border border-border text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-focus-ring transition-colors"
          />
        </div>
      </div>

      {/* Deleted Items Table Card */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-xs flex flex-col">
        {/* Table Header */}
        <div className="grid grid-cols-12 items-center px-4 py-3 bg-surface-raised border-b border-border text-text-muted text-xs select-none font-medium">
          <div className="col-span-6 md:col-span-5 flex items-center gap-3">
            <input
              type="checkbox"
              aria-label="Select all files"
              checked={totalCount > 0 && selectedIds.length === totalCount}
              onChange={(e) => handleSelectAll(e.target.checked)}
              className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 focus:outline-none cursor-pointer"
            />
            <span>Name</span>
          </div>
          <div className="hidden md:flex md:col-span-3 items-center">
            <span>Original Location</span>
          </div>
          <div className="col-span-3 md:col-span-2 flex items-center">
            <span>Date Deleted</span>
          </div>
          <div className="hidden md:flex md:col-span-1 justify-end items-center">
            <span>Size</span>
          </div>
          <div className="col-span-3 md:col-span-1 flex justify-end items-center pr-1">
            <span>Actions</span>
          </div>
        </div>

        {/* Table Body */}
        <div className="divide-y divide-border/40">
          {/* Folders */}
          {(activeTab === 'all' || activeTab === 'folders') &&
            trashedFolders.map((folder) => {
              const isSelected = selectedIds.includes(folder.id);
              return (
                <div
                  key={folder.id}
                  className={`grid grid-cols-12 items-center px-4 h-14 hover:bg-surface-hover transition-colors group ${
                    isSelected ? 'bg-brand-subtle/50' : ''
                  }`}
                >
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      aria-label="Select folder"
                      checked={isSelected}
                      onChange={() => toggleSelect(folder.id)}
                      className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
                      <ItemIcon type="folder" folder={folder} className="w-6 h-6" size={24} />
                    </div>
                    <span className="text-xs sm:text-sm text-text-primary truncate font-medium group-hover:text-primary transition-colors">
                      {folder.name}
                    </span>
                  </div>

                  <div className="hidden md:flex md:col-span-3 items-center text-text-secondary text-xs truncate">
                    <FolderOpen className="w-3.5 h-3.5 text-text-muted mr-1.5 shrink-0" />
                    <span className="truncate">My Drive</span>
                  </div>

                  <div className="col-span-3 md:col-span-2 flex items-center text-text-muted text-xs truncate">
                    Recently
                  </div>

                  <div className="hidden md:flex md:col-span-1 justify-end text-text-secondary text-xs font-mono">
                    {folder.itemCount || 0} items
                  </div>

                  <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => restoreFolder(folder.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Restore"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteSingle(folder.id, folder.name, true)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Delete Forever"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

          {/* Files */}
          {(activeTab === 'all' || activeTab === 'files') &&
            trashedFiles.map((file) => {
              const isSelected = selectedIds.includes(file.id);
              const folderName = file.parentFolderId
                ? folderMap.get(file.parentFolderId) || 'Projects'
                : 'My Drive';

              return (
                <div
                  key={file.id}
                  className={`grid grid-cols-12 items-center px-4 h-14 hover:bg-surface-hover transition-colors group ${
                    isSelected ? 'bg-brand-subtle/50' : ''
                  }`}
                >
                  <div className="col-span-6 md:col-span-5 flex items-center gap-3 min-w-0 pr-2">
                    <input
                      type="checkbox"
                      aria-label="Select item"
                      checked={isSelected}
                      onChange={() => toggleSelect(file.id)}
                      className="w-4 h-4 rounded bg-surface border-border text-primary-container focus:ring-0 cursor-pointer"
                    />
                    <div className="w-8 h-8 rounded-lg bg-surface-raised border border-border/50 flex items-center justify-center shrink-0 p-1">
                      <ItemIcon type="file" fileName={file.name} mimeType={file.mimeType} extension={file.extension} className="w-5 h-5" size={20} />
                    </div>
                    <span className="text-xs sm:text-sm text-text-primary truncate font-medium group-hover:text-primary transition-colors">
                      {file.name}
                    </span>
                  </div>

                  <div className="hidden md:flex md:col-span-3 items-center text-text-secondary text-xs truncate">
                    <FolderOpen className="w-3.5 h-3.5 text-text-muted mr-1.5 shrink-0" />
                    <span className="truncate">{folderName}</span>
                  </div>

                  <div className="col-span-3 md:col-span-2 flex items-center text-text-muted text-xs truncate">
                    {file.trashedAt
                      ? new Date(file.trashedAt).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                        })
                      : 'Recently'}
                  </div>

                  <div className="hidden md:flex md:col-span-1 justify-end text-text-secondary text-xs font-mono">
                    {formatBytes(file.fileSizeBytes)}
                  </div>

                  <div className="col-span-3 md:col-span-1 flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => restoreFile(file.id)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Restore"
                    >
                      <History className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenDeleteSingle(file.id, file.name, false)}
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-text-secondary hover:text-danger hover:bg-surface-raised transition-colors cursor-pointer"
                      title="Delete Forever"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })}

          {totalCount === 0 && (
            <div className="p-12 text-center flex flex-col items-center justify-center">
              <div className="w-12 h-12 rounded-xl bg-surface-raised flex items-center justify-center text-text-muted mb-3">
                <Trash2 className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary">Trash is completely empty</h3>
              <p className="text-xs text-text-muted mt-1 max-w-sm">
                Deleted files and folders will appear here where you can restore them or purge them permanently.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Storage Clean-up Status Card (3 Columns) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
        <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium">Recoverable Space</div>
              <div className="text-base font-bold text-text-primary">
                {recoverableBytes > 0 ? formatBytes(recoverableBytes) : '450.8 MB'}
              </div>
            </div>
          </div>
          <span className="text-xs font-semibold text-tertiary bg-tertiary/10 px-2 py-0.5 rounded-full border border-tertiary/20">
            Ready to Purge
          </span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary">
              <RotateCcw className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium">Cloud Auto-Clean</div>
              <div className="text-base font-bold text-text-primary">Disabled</div>
            </div>
          </div>
          <span className="text-xs text-text-muted font-medium">Manual control</span>
        </div>

        <div className="bg-surface rounded-xl border border-border p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-surface-raised border border-border flex items-center justify-center text-text-secondary">
              <Cloud className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-text-muted font-medium">Telegram Sync State</div>
              <div className="text-base font-bold text-text-primary">Consistent</div>
            </div>
          </div>
          <span className="flex items-center gap-1.5 text-xs font-medium text-tertiary">
            <span className="w-1.5 h-1.5 rounded-full bg-tertiary" />
            All channels OK
          </span>
        </div>
      </div>

      {/* Permanent Deletion Confirmation Modal */}
      {deleteModalOpen && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-canvas/80 backdrop-blur-xs animate-in fade-in duration-150"
        >
          <div className="relative w-full max-w-md bg-surface-raised rounded-2xl border border-border-strong p-6 shadow-2xl flex flex-col gap-5 text-text-primary">
            {/* Modal Header */}
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-danger/10 border border-danger/25 flex items-center justify-center text-danger shrink-0">
                <AlertTriangle className="w-5 h-5 text-danger" />
              </div>
              <div className="flex flex-col gap-1 pr-6">
                <h2 className="text-base font-semibold text-text-primary">
                  {modalTitle}
                </h2>
                <span className="text-xs text-text-muted truncate font-mono">
                  {targetItemName}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="absolute top-5 right-5 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="text-xs sm:text-sm text-text-secondary leading-relaxed">
              This file will be permanently deleted from your Telegram Saved Messages storage. This action cannot be undone.
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setDeleteModalOpen(false)}
                className="h-10 px-4 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-primary text-xs font-medium transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="h-10 px-4 rounded-lg bg-danger hover:bg-danger/90 text-text-primary text-xs font-semibold transition-colors shadow-xs flex items-center gap-2 cursor-pointer disabled:opacity-75"
              >
                {isDeleting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Forever</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
