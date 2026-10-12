'use client';

import React, { useState, useMemo } from 'react';
import {
  Clock,
  Filter,
  Star,
  Download,
  MoreVertical,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  File,
  Search,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import type { FileItem } from '@/lib/drive/types';

export default function RecentPage() {
  const { files, searchQuery, toggleStarFile } = useDrive();

  const [localSearch, setLocalSearch] = useState('');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const activeFiles = useMemo(
    () => files.filter((f) => f.status === 'active'),
    [files]
  );

  const filteredFiles = useMemo(() => {
    let list = activeFiles;

    if (selectedType !== 'all') {
      list = list.filter((f) => {
        const cat = getFileTypeCategory(f.mimeType, f.extension);
        if (selectedType === 'document') return cat === 'document' || cat === 'pdf';
        if (selectedType === 'image') return cat === 'image';
        if (selectedType === 'video') return cat === 'video';
        if (selectedType === 'audio') return cat === 'audio';
        if (selectedType === 'archive') return cat === 'archive';
        return true;
      });
    }

    const q = (localSearch || searchQuery).trim().toLowerCase();
    if (q) {
      list = list.filter(
        (f) => f.name.toLowerCase().includes(q) || f.extension.toLowerCase().includes(q)
      );
    }

    return [...list].sort(
      (a, b) => new Date(b.uploadedAt).getTime() - new Date(a.uploadedAt).getTime()
    );
  }, [activeFiles, selectedType, localSearch, searchQuery]);

  // Group files into Today vs Earlier
  const { todayFiles, earlierFiles } = useMemo(() => {
    const today: FileItem[] = [];
    const earlier: FileItem[] = [];
    const now = new Date();

    filteredFiles.forEach((file) => {
      const d = new Date(file.uploadedAt);
      const isToday =
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear();

      if (isToday) {
        today.push(file);
      } else {
        earlier.push(file);
      }
    });

    return { todayFiles: today, earlierFiles: earlier };
  }, [filteredFiles]);

  const getFileIcon = (mimeType: string, extension: string) => {
    const cat = getFileTypeCategory(mimeType, extension);
    switch (cat) {
      case 'document':
      case 'pdf':
        return {
          icon: <FileText className="w-5 h-5 text-file-document" />,
          bg: 'bg-file-document/10',
          label: 'Document',
        };
      case 'image':
        return {
          icon: <ImageIcon className="w-5 h-5 text-file-image" />,
          bg: 'bg-file-image/10',
          label: 'Image',
        };
      case 'video':
        return {
          icon: <VideoIcon className="w-5 h-5 text-file-video" />,
          bg: 'bg-file-video/10',
          label: 'Video',
        };
      case 'audio':
        return {
          icon: <Headphones className="w-5 h-5 text-file-audio" />,
          bg: 'bg-file-audio/10',
          label: 'Audio',
        };
      case 'archive':
        return {
          icon: <Archive className="w-5 h-5 text-file-archive" />,
          bg: 'bg-file-archive/10',
          label: 'Archive',
        };
      default:
        return {
          icon: <File className="w-5 h-5 text-text-muted" />,
          bg: 'bg-surface-raised',
          label: 'File',
        };
    }
  };

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffHours = diffMs / (1000 * 60 * 60);

    if (diffHours < 1) {
      const mins = Math.max(1, Math.round(diffMs / (1000 * 60)));
      return `${mins} minutes ago`;
    }
    if (diffHours < 24) {
      return `Today, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    if (diffHours < 48) {
      return `Yesterday, ${d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    }
    return d.toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const renderFileRow = (file: FileItem) => {
    const meta = getFileIcon(file.mimeType, file.extension);

    return (
      <div
        key={file.id}
        onClick={() => setPreviewFile(file)}
        className="grid grid-cols-12 items-center h-14 px-4 bg-surface hover:bg-surface-hover transition-colors group cursor-pointer border-b border-border/40"
      >
        <div className="col-span-6 sm:col-span-5 flex items-center gap-3 min-w-0 pr-2">
          <button
            aria-label="Toggle favorite"
            onClick={(e) => {
              e.stopPropagation();
              toggleStarFile(file.id);
            }}
            className={`focus:outline-none shrink-0 p-0.5 rounded transition-colors cursor-pointer ${
              file.isStarred
                ? 'text-warning fill-warning'
                : 'text-text-muted hover:text-warning'
            }`}
            type="button"
          >
            <Star
              className={`w-4 h-4 ${file.isStarred ? 'fill-warning text-warning' : ''}`}
            />
          </button>

          <div
            className={`w-8 h-8 rounded-lg ${meta.bg} flex items-center justify-center shrink-0 border border-border/40`}
          >
            {meta.icon}
          </div>

          <div className="flex flex-col min-w-0">
            <span className="text-xs sm:text-sm font-medium text-text-primary truncate group-hover:text-primary transition-colors">
              {file.name}
            </span>
            <span className="sm:hidden text-[10px] text-text-muted leading-tight">
              {meta.label}
            </span>
          </div>
        </div>

        <div className="hidden sm:flex sm:col-span-2 items-center">
          <span className="text-xs text-text-secondary">{meta.label}</span>
        </div>

        <div className="col-span-3 sm:col-span-2 text-xs text-text-muted truncate">
          {formatDateDisplay(file.uploadedAt)}
        </div>

        <div className="col-span-2 sm:col-span-2 text-xs text-text-secondary text-right sm:text-left tabular-nums">
          {formatBytes(file.fileSizeBytes)}
        </div>

        <div
          className="col-span-1 flex items-center justify-end gap-1"
          onClick={(e) => e.stopPropagation()}
        >
          <a
            href={`/api/telegram/download/${file.id}`}
            download={file.name}
            aria-label="Download"
            className="w-7 h-7 rounded-lg flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
          </a>
          <button
            onClick={() => setPreviewFile(file)}
            aria-label="More options"
            className="w-7 h-7 rounded-lg hidden sm:flex items-center justify-center text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors cursor-pointer"
            type="button"
          >
            <MoreVertical className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-full w-full bg-canvas text-text-primary transition-colors">
      <div className="w-full px-6 lg:px-8 py-8 max-w-7xl mx-auto flex flex-col gap-6">
        {/* Top Workspace Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex flex-col gap-0.5">
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-bold text-text-primary tracking-tight">
                Recent files
              </h1>
              <span className="px-2 py-0.5 rounded-full bg-brand-subtle text-primary text-[11px] font-semibold border border-primary/20">
                Live sync
              </span>
            </div>
            <p className="text-xs sm:text-sm text-text-secondary">
              Files you uploaded, opened, or synchronized recently in One Cloud.
            </p>
          </div>

          {/* Secondary Utilities */}
          <div className="flex items-center gap-2">
            <div className="relative flex items-center min-w-[220px]">
              <Search className="w-3.5 h-3.5 text-text-muted absolute left-3 pointer-events-none" />
              <input
                value={localSearch}
                onChange={(e) => setLocalSearch(e.target.value)}
                placeholder="Filter recent files..."
                className="w-full h-9 pl-8 pr-3 bg-surface border border-border rounded-lg text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-focus-ring transition-all"
                type="text"
              />
            </div>
          </div>
        </div>

        {/* Filter Chips Toolbar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 select-none">
          <button
            onClick={() => setSelectedType('all')}
            className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 border ${
              selectedType === 'all'
                ? 'bg-brand-subtle text-primary border-primary/40 font-medium'
                : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
            }`}
            type="button"
          >
            <span>All Recent</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-surface-raised font-mono">
              {filteredFiles.length}
            </span>
          </button>

          <div className="w-px h-4 bg-border mx-1 shrink-0" />

          <button
            onClick={() => setSelectedType(selectedType === 'document' ? 'all' : 'document')}
            className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 border ${
              selectedType === 'document'
                ? 'bg-brand-subtle text-primary border-primary/40 font-medium'
                : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
            }`}
            type="button"
          >
            <FileText className="w-3.5 h-3.5 text-file-document" />
            <span>Documents</span>
          </button>

          <button
            onClick={() => setSelectedType(selectedType === 'image' ? 'all' : 'image')}
            className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 border ${
              selectedType === 'image'
                ? 'bg-brand-subtle text-primary border-primary/40 font-medium'
                : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
            }`}
            type="button"
          >
            <ImageIcon className="w-3.5 h-3.5 text-file-image" />
            <span>Images</span>
          </button>

          <button
            onClick={() => setSelectedType(selectedType === 'video' ? 'all' : 'video')}
            className={`px-3 py-1 rounded-full text-xs transition-colors cursor-pointer flex items-center gap-1.5 border ${
              selectedType === 'video'
                ? 'bg-brand-subtle text-primary border-primary/40 font-medium'
                : 'bg-surface hover:bg-surface-hover text-text-secondary border-border'
            }`}
            type="button"
          >
            <VideoIcon className="w-3.5 h-3.5 text-file-video" />
            <span>Videos</span>
          </button>
        </div>

        {/* Files Content */}
        {filteredFiles.length === 0 ? (
          <div className="bg-surface border border-border rounded-xl p-12 text-center flex flex-col items-center justify-center">
            <Clock className="w-8 h-8 text-text-muted mb-3" />
            <p className="text-sm font-semibold text-text-primary">No recent files found</p>
            <p className="text-xs text-text-secondary mt-1">
              {localSearch
                ? `No files matching "${localSearch}".`
                : 'Upload files to your Telegram cloud to see them listed here.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {/* Today Group */}
            {todayFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      Today
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {todayFiles.length} {todayFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs divide-y divide-border/60">
                  {todayFiles.map(renderFileRow)}
                </div>
              </div>
            )}

            {/* Earlier Group */}
            {earlierFiles.length > 0 && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between px-1">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-text-muted" />
                    <span className="text-[11px] font-semibold text-text-secondary uppercase tracking-wider">
                      Earlier
                    </span>
                  </div>
                  <span className="text-[11px] text-text-muted">
                    {earlierFiles.length} {earlierFiles.length === 1 ? 'file' : 'files'}
                  </span>
                </div>
                <div className="bg-surface border border-border rounded-xl overflow-hidden shadow-xs divide-y divide-border/60">
                  {earlierFiles.map(renderFileRow)}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </div>
  );
}
