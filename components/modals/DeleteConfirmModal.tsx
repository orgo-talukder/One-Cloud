'use client';

import React, { useState } from 'react';
import {
  Trash2,
  AlertTriangle,
  X,
  Folder,
  FileText,
  RotateCcw,
  Loader2,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

export interface DeleteTargetItem {
  id: string;
  name: string;
  isFolder?: boolean;
  defaultAction?: 'trash' | 'permanent';
}

interface DeleteConfirmModalProps {
  item: DeleteTargetItem;
  onClose: () => void;
}

export function DeleteConfirmModal({ item, onClose }: DeleteConfirmModalProps) {
  const {
    files,
    trashFile,
    trashFolder,
    permanentlyDeleteFile,
    permanentlyDeleteFolder,
  } = useDrive();

  const [selectedMode, setSelectedMode] = useState<'trash' | 'permanent'>(
    item.defaultAction || 'trash'
  );
  const [isSubmitting, setIsSubmitting] = useState<'trash' | 'permanent' | null>(null);

  const nestedFilesCount = item.isFolder
    ? files.filter((f) => f.parentFolderId === item.id && f.status === 'active').length
    : 0;

  const handleMoveToTrash = async () => {
    setIsSubmitting('trash');
    try {
      if (item.isFolder) {
        await trashFolder(item.id);
      } else {
        await trashFile(item.id);
      }
      onClose();
    } finally {
      setIsSubmitting(null);
    }
  };

  const handleDeleteForever = async () => {
    setIsSubmitting('permanent');
    try {
      if (item.isFolder) {
        await permanentlyDeleteFolder(item.id);
      } else {
        await permanentlyDeleteFile(item.id);
      }
      onClose();
    } finally {
      setIsSubmitting(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-md rounded-2xl bg-surface-raised border border-border-strong p-6 shadow-2xl flex flex-col gap-5 text-text-primary"
      >
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isSubmitting !== null}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1.5 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer disabled:opacity-50"
        >
          <X className="h-4 w-4" />
        </button>

        {/* Modal Header */}
        <div className="flex items-start gap-3.5 pr-6">
          <div
            className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
              selectedMode === 'permanent'
                ? 'bg-danger/10 border-danger/30 text-danger'
                : 'bg-warning/10 border-warning/30 text-warning'
            }`}
          >
            {selectedMode === 'permanent' ? (
              <AlertTriangle className="h-5 w-5" />
            ) : (
              <Trash2 className="h-5 w-5" />
            )}
          </div>
          <div className="flex flex-col min-w-0">
            <h3 className="text-base font-semibold text-text-primary">
              Delete {item.isFolder ? 'Folder' : 'File'}?
            </h3>
            <p className="text-xs text-text-secondary mt-0.5">
              Choose whether to move this {item.isFolder ? 'folder' : 'file'} to Trash or delete it
              permanently.
            </p>
          </div>
        </div>

        {/* Target Item Summary Card */}
        <div className="flex items-center gap-3 p-3 rounded-xl bg-surface border border-border">
          <div className="w-9 h-9 rounded-lg bg-brand-subtle flex items-center justify-center text-primary shrink-0">
            {item.isFolder ? (
              <Folder className="h-4 w-4 text-primary" />
            ) : (
              <FileText className="h-4 w-4 text-primary" />
            )}
          </div>
          <div className="flex flex-col min-w-0 flex-1">
            <span className="text-xs sm:text-sm font-semibold text-text-primary truncate">
              {item.name}
            </span>
            <span className="text-[11px] text-text-muted">
              {item.isFolder
                ? nestedFilesCount > 0
                  ? `Folder • Contains ${nestedFilesCount} active ${
                      nestedFilesCount === 1 ? 'file' : 'files'
                    }`
                  : 'Folder • Empty directory'
                : 'File • Stored in Telegram Saved Messages'}
            </span>
          </div>
        </div>

        {/* Two Action Mode Cards */}
        <div className="flex flex-col gap-2.5">
          {/* Option 1: Move to Trash */}
          <div
            onClick={() => setSelectedMode('trash')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              selectedMode === 'trash'
                ? 'bg-brand-subtle/60 border-primary-container ring-1 ring-primary-container'
                : 'bg-surface hover:bg-surface-hover border-border'
            }`}
          >
            <div className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 border-primary">
              {selectedMode === 'trash' && (
                <div className="w-2 h-2 rounded-full bg-primary" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-text-primary flex items-center gap-1.5">
                  <RotateCcw className="w-3.5 h-3.5 text-primary" />
                  Move to Trash (Recommended)
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Moves the {item.isFolder ? 'folder' : 'file'} to Trash. You can restore it anytime
                from the Trash section.
              </p>
            </div>
          </div>

          {/* Option 2: Delete Forever */}
          <div
            onClick={() => setSelectedMode('permanent')}
            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-3 ${
              selectedMode === 'permanent'
                ? 'bg-danger/10 border-danger ring-1 ring-danger'
                : 'bg-surface hover:bg-surface-hover border-border'
            }`}
          >
            <div className="mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 border-danger">
              {selectedMode === 'permanent' && (
                <div className="w-2 h-2 rounded-full bg-danger" />
              )}
            </div>
            <div className="flex flex-col gap-0.5 min-w-0 flex-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-danger flex items-center gap-1.5">
                  <Trash2 className="w-3.5 h-3.5 text-danger" />
                  Delete Forever
                </span>
              </div>
              <p className="text-[11px] text-text-secondary leading-relaxed">
                Permanently deletes this {item.isFolder ? 'folder and its files' : 'file'} from One
                Cloud and Telegram Saved Messages. This cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Footer Buttons */}
        <div className="flex flex-wrap items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting !== null}
            className="h-9 px-3.5 rounded-lg bg-surface hover:bg-surface-hover border border-border text-text-secondary hover:text-text-primary text-xs font-medium transition-colors cursor-pointer disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={handleMoveToTrash}
            disabled={isSubmitting !== null}
            className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 ${
              selectedMode === 'trash'
                ? 'bg-primary-container hover:bg-brand-hover text-text-primary shadow-xs'
                : 'bg-surface hover:bg-surface-hover border border-border text-text-primary'
            }`}
          >
            {isSubmitting === 'trash' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
            <span>Move to Trash</span>
          </button>

          <button
            type="button"
            onClick={handleDeleteForever}
            disabled={isSubmitting !== null}
            className={`h-9 px-3.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-60 ${
              selectedMode === 'permanent'
                ? 'bg-danger hover:bg-danger/90 text-text-primary shadow-xs'
                : 'bg-danger/15 hover:bg-danger text-danger hover:text-text-primary border border-danger/30'
            }`}
          >
            {isSubmitting === 'permanent' ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <AlertTriangle className="h-3.5 w-3.5" />
            )}
            <span>Delete Forever</span>
          </button>
        </div>
      </div>
    </div>
  );
}
