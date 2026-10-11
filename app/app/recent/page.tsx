'use client';

import React, { useMemo } from 'react';
import { Clock } from 'lucide-react';
import { FileList } from '@/components/drive/FileList';
import { useDrive } from '@/lib/drive/drive-context';

export default function RecentPage() {
  const { files, searchQuery } = useDrive();

  const recentFiles = useMemo(() => {
    return files
      .filter((f) => f.status === 'active')
      .filter((f) =>
        searchQuery ? f.name.toLowerCase().includes(searchQuery.toLowerCase()) : true
      )
      .sort((a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime());
  }, [files, searchQuery]);

  return (
    <div className="flex flex-col h-full bg-white">
      <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-1.5 rounded-lg bg-sky-50 text-sky-600 border border-sky-100">
            <Clock className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900">Recent Files</h2>
            <p className="text-xs text-slate-500">Files ordered by most recent upload date</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        <FileList
          files={recentFiles}
          showFolders={false}
          emptyTitle="No recent files"
          emptySubtitle="Files you upload to your Telegram Saved Messages will appear here."
        />
      </div>
    </div>
  );
}
