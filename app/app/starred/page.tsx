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
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-amber-50 text-amber-500 border border-amber-100">
            <Star className="h-4 w-4 fill-amber-400" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Starred</h2>
            <p className="text-xs text-slate-500">Quickly access important files and folders</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FileList
          files={starredFiles}
          folders={starredFolders}
          showFolders={true}
          emptyTitle="No starred items"
          emptySubtitle="Add stars to items you want to easily find later by clicking the star icon."
        />
      </div>
    </div>
  );
}
