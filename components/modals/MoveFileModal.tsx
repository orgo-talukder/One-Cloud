'use client';

import React, { useState } from 'react';
import { Folder, FolderInput, X, HardDrive } from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

interface MoveFileModalProps {
  itemId: string;
  itemName: string;
  isFolder?: boolean;
  onClose: () => void;
}

export function MoveFileModal({ itemId, itemName, isFolder, onClose }: MoveFileModalProps) {
  const { folders, moveFile } = useDrive();
  const [selectedFolderId, setSelectedFolderId] = useState<string | null>(null);

  // Exclude self if moving a folder
  const availableFolders = folders.filter((f) => (isFolder ? f.id !== itemId : true));

  const handleMove = () => {
    moveFile(itemId, selectedFolderId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 dark:bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div className="relative w-full max-w-sm rounded-2xl bg-white dark:bg-slate-900 p-5 shadow-xl border border-slate-200 dark:border-slate-800 transition-colors">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-lg"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2.5 mb-4">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-50 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-800">
            <FolderInput className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-slate-100">Move Item</h3>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
              Move &ldquo;{itemName}&rdquo; to folder
            </p>
          </div>
        </div>

        <div className="space-y-1 max-h-60 overflow-y-auto border border-slate-200 dark:border-slate-700 rounded-xl p-2 mb-4 bg-slate-50/50 dark:bg-slate-800/40">
          <button
            onClick={() => setSelectedFolderId(null)}
            className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left ${
              selectedFolderId === null
                ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            <HardDrive className="h-4 w-4 text-sky-600 dark:text-sky-400" />
            <span>My Drive (Root)</span>
          </button>

          {availableFolders.map((f) => (
            <button
              key={f.id}
              onClick={() => setSelectedFolderId(f.id)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-colors text-left truncate ${
                selectedFolderId === f.id
                  ? 'bg-sky-50 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <Folder className="h-4 w-4 text-amber-500 shrink-0" />
              <span className="truncate">{f.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-3.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 rounded-lg"
          >
            Cancel
          </button>
          <button
            onClick={handleMove}
            className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 rounded-lg transition-colors shadow-2xs"
          >
            Move Here
          </button>
        </div>
      </div>
    </div>
  );
}
