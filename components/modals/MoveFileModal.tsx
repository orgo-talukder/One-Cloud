'use client';

import React, { useState } from 'react';
import { Folder, FolderInput, X, HardDrive } from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

import type { FileItem, FolderItem } from '@/lib/drive/types';
import { ItemIcon } from '@/components/drive/ItemIcon';

interface MoveFileModalProps {
  itemId?: string;
  itemName?: string;
  file?: FileItem | FolderItem | null;
  isFolder?: boolean;
  onClose: () => void;
}

export function MoveFileModal({ itemId, itemName, file, isFolder, onClose }: MoveFileModalProps) {
  const { folders, moveFile } = useDrive();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  const effectiveId = itemId || file?.id || '';
  const effectiveName = itemName || file?.name || 'Item';
  const effectiveIsFolder = isFolder ?? (file ? 'itemCount' in file : false);

  // Exclude self if moving a folder
  const availableFolders = folders.filter((f) => (effectiveIsFolder ? f.id !== effectiveId : true));

  const handleMove = () => {
    if (effectiveId) {
      moveFile(effectiveId, selectedFolderId);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-surface p-5 shadow-2xl border border-border text-text-primary transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-surface-hover transition-colors cursor-pointer"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-subtle text-primary border border-border">
            <FolderInput className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Move Item</h3>
            <p className="text-[11px] text-text-muted truncate max-w-[200px]">
              Move &ldquo;{effectiveName}&rdquo; to folder
            </p>
          </div>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto border border-border rounded-xl p-2 mb-4 bg-surface-raised">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left cursor-pointer ${
              selectedFolderId === null
                ? 'bg-brand-subtle text-primary font-semibold border border-primary-container/30'
                : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
            }`}
          >
            <HardDrive className="h-4 w-4 text-primary" />
            <span>My Drive (Root)</span>
          </button>

          {availableFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left truncate cursor-pointer ${
                selectedFolderId === f.id
                  ? 'bg-brand-subtle text-primary font-semibold border border-primary-container/30'
                  : 'text-text-secondary hover:text-text-primary hover:bg-surface-hover'
              }`}
            >
              <ItemIcon type="folder" folder={f} className="h-4 w-4 shrink-0" size={16} />
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-1.5 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-lg transition-colors shadow-xs cursor-pointer"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
