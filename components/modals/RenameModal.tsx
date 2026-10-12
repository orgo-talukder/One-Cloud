'use client';

import React, { useState } from 'react';
import { Edit2, X } from 'lucide-react';

interface RenameModalProps {
  currentName: string;
  onRename: (newName: string) => void;
  onClose: () => void;
}

export function RenameModal({ currentName, onRename, onClose }: RenameModalProps) {
  const [name, setName] = useState(currentName);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim()) {
      onRename(name.trim());
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
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-subtle text-primary border border-border">
            <Edit2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-text-primary">Rename</h3>
            <p className="text-[11px] text-text-muted">Update display name in Drive metadata</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <input
              type="text"
              required
              autoFocus
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-border bg-surface-raised rounded-lg focus:outline-none focus:border-focus-ring text-text-primary font-medium transition-colors"
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
              Save
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
