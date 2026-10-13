'use client';

import React, { useState } from 'react';
import { FolderPlus, X } from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';

interface NewFolderModalProps {
  onClose: () => void;
}

export function NewFolderModal({ onClose }: NewFolderModalProps) {
  const { createFolder } = useDrive();
  const [name, setName] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      createFolder(name.trim());
      onClose();
    }
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
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-surface-raised border border-border/50 p-1 shrink-0">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/icons/folders/normal_folder_icon2.png" alt="New Folder" className="w-8 h-8 object-contain" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">New Folder</h3>
            <p className="text-[11px] text-text-muted">Organize your Telegram Drive files</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-text-secondary mb-1">
              Folder Name
            </label>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Work Documents"
              className="w-full px-3 py-2 text-xs border border-border bg-surface-raised rounded-lg focus:outline-none focus:border-focus-ring text-text-primary transition-colors"
            />
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface-raised hover:bg-surface-hover border border-border rounded-lg transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-1.5 text-xs font-semibold text-text-primary bg-primary-container hover:bg-brand-hover rounded-lg transition-colors shadow-xs cursor-pointer"
            >
              Create Folder
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
