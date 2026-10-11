'use client';

import React, { useMemo } from 'react';
import { Toolbar } from '@/components/drive/Toolbar';
import { FileList } from '@/components/drive/FileList';
import { useDrive } from '@/lib/drive/drive-context';
import { getFileTypeCategory } from '@/lib/drive/storage-calc';

export default function MyDrivePage() {
  const {
    files,
    folders,
    currentFolderId,
    searchQuery,
    fileTypeFilter,
    sortOption,
  } = useDrive();

  // Filter for active items in current folder
  const currentFolders = useMemo(() => {
    return folders
      .filter((f) => f.status === 'active' && f.parentFolderId === currentFolderId)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [folders, currentFolderId, searchQuery]);

  const currentFiles = useMemo(() => {
    let result = files
      .filter((f) => f.status === 'active' && f.parentFolderId === currentFolderId)
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      );

    if (fileTypeFilter !== 'all') {
      result = result.filter(
        (f) => getFileTypeCategory(f.mimeType, f.extension) === fileTypeFilter
      );
    }

    // Apply sorting
    result.sort((a, b) => {
      switch (sortOption) {
        case 'name_asc':
          return a.name.localeCompare(b.name);
        case 'size_desc':
          return b.fileSizeBytes - a.fileSizeBytes;
        case 'size_asc':
          return a.fileSizeBytes - b.fileSizeBytes;
        case 'date_desc':
        default:
          return new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime();
      }
    });

    return result;
  }, [files, currentFolderId, searchQuery, fileTypeFilter, sortOption]);

  return (
    <div className="flex flex-col h-full bg-white">
      <Toolbar />
      <div className="flex-1 overflow-y-auto">
        <FileList
          files={currentFiles}
          folders={currentFolders}
          showFolders={true}
          emptyTitle="This folder is empty"
          emptySubtitle="Upload files or create subfolders to organize your personal drive."
        />
      </div>
    </div>
  );
}
