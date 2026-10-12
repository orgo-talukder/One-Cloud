'use client';

import React, { useMemo } from 'react';
import { Star } from 'lucide-react';
import { FileList } from '@/components/drive/FileList';
import { useDrive } from '@/lib/drive/drive-context';

export default function StarredPage() {
  const { files, folders, searchQuery } = useDrive();

  const starredFolders = useMemo(() => {
    return folders
      .filter((f) => f.status === 'active' && f.isStarred)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  }, [folders, searchQuery]);

  const starredFiles = useMemo(() => {
    return files
      .filter((f) => f.status === 'active' && f.isStarred)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-canvas text-text-primary transition-colors">
      <div className="px-6 py-4 border-b border-border bg-canvas flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-brand-subtle text-warning border border-warning/20 flex items-center justify-center">
            <Star className="h-4.5 w-4.5 fill-warning text-warning" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-text-primary">Starred</h1>
            <p className="text-xs text-text-secondary">Quickly access important files and folders</p>
          </div>
        </div>
        <div className="text-xs font-medium text-text-muted">
          {starredFolders.length + starredFiles.length} starred items
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FileList
          files={starredFiles}
          folders={starredFolders}
          showFolders={true}
          emptyTitle="No starred items"
          emptySubtitle="Add stars to items you want to easily find later by clicking the star icon in the menu."
        />
      </div>
    </div>
  );
}
