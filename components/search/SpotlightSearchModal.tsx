'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import {
  Search,
  X,
  Folder,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Headphones,
  Archive,
  ArrowRight,
  Clock,
  Sparkles,
  Command,
  CornerDownLeft,
  Eye,
  Download,
  Trash2,
  FolderOpen,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import {
  executeDriveSearch,
  getRecentSearches,
  saveRecentSearch,
  clearRecentSearches,
  SearchMatchResult,
} from '@/lib/drive/search-engine';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { ItemIcon } from '@/components/drive/ItemIcon';
import { formatBytes } from '@/lib/drive/storage-calc';

interface SpotlightSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SpotlightSearchModal({ isOpen, onClose }: SpotlightSearchModalProps) {
  const {
    files,
    folders,
    navigateToFolder,
    sessionToken,
    downloadFile,
    searchQuery,
    setSearchQuery,
  } = useDrive();

  const [localQuery, setLocalQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listContainerRef = useRef<HTMLDivElement>(null);

  // Sync recent searches on open
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      setLocalQuery(searchQuery || '');
      setSelectedIndex(0);
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    }
  }, [isOpen, searchQuery]);

  // Execute intelligent search
  const searchResults = useMemo(() => {
    return executeDriveSearch(localQuery, files, folders, {
      categoryFilter: selectedCategory,
    });
  }, [localQuery, files, folders, selectedCategory]);

  // Flattened items for unified arrow key navigation
  const flattenedItems = useMemo(() => {
    const list: Array<{ type: 'folder' | 'file'; data: FolderItem | SearchMatchResult }> = [];
    if (selectedCategory === 'all' || selectedCategory === 'folders') {
      searchResults.matchingFolders.forEach((folder) => {
        list.push({ type: 'folder', data: folder });
      });
    }
    searchResults.matchingFiles.forEach((fileMatch) => {
      list.push({ type: 'file', data: fileMatch });
    });
    return list;
  }, [searchResults, selectedCategory]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [localQuery, selectedCategory]);

  // Scroll active item into view
  useEffect(() => {
    if (listContainerRef.current) {
      const activeEl = listContainerRef.current.querySelector('[data-active="true"]') as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  const handleSelectItem = useCallback((item: { type: 'folder' | 'file'; data: FolderItem | SearchMatchResult }) => {
    if (localQuery.trim()) {
      saveRecentSearch(localQuery);
      setRecentSearches(getRecentSearches());
    }

    if (item.type === 'folder') {
      const folder = item.data as FolderItem;
      navigateToFolder(folder.id);
      setSearchQuery('');
      onClose();
    } else {
      const match = item.data as SearchMatchResult;
      setPreviewFile(match.item);
    }
  }, [localQuery, navigateToFolder, setSearchQuery, onClose]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < flattenedItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : Math.max(0, flattenedItems.length - 1)));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (flattenedItems.length > 0 && flattenedItems[selectedIndex]) {
        handleSelectItem(flattenedItems[selectedIndex]);
      } else if (localQuery.trim()) {
        saveRecentSearch(localQuery);
        setSearchQuery(localQuery);
        onClose();
      }
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    }
  };

  const handleRecentClick = (term: string) => {
    setLocalQuery(term);
    saveRecentSearch(term);
    inputRef.current?.focus();
  };

  const handleClearHistory = () => {
    clearRecentSearches();
    setRecentSearches([]);
  };

  // Find parent folder path for breadcrumb display
  const getFolderPath = (parentFolderId: string | null) => {
    if (!parentFolderId) return 'My Drive';
    const folder = folders.find((f) => f.id === parentFolderId);
    return folder ? `My Drive / ${folder.name}` : 'My Drive';
  };

  if (!isOpen) return null;

  return (
    <>
      <div
        className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 bg-black/60 backdrop-blur-md animate-in fade-in duration-200"
        onClick={onClose}
      >
        <div
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-surface-raised border border-border rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-150 text-text-primary"
        >
          {/* Top Search Input Box */}
          <div className="relative flex items-center px-4 py-3.5 border-b border-border bg-surface">
            <Search className="h-5 w-5 text-text-muted shrink-0 mr-3" />
            <input
              ref={inputRef}
              type="text"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search files, folders, or describe photo contents (e.g., 'dog', 'presentation')..."
              className="flex-1 bg-transparent text-sm sm:text-base font-medium text-text-primary placeholder:text-text-muted focus:outline-none"
            />
            {localQuery && (
              <button
                onClick={() => {
                  setLocalQuery('');
                  inputRef.current?.focus();
                }}
                className="p-1 rounded-md text-text-muted hover:text-text-primary hover:bg-surface-hover transition-colors mr-2 cursor-pointer"
                title="Clear query"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <div className="flex items-center gap-1.5 text-[11px] font-mono text-text-muted bg-surface-raised border border-border px-2 py-0.5 rounded-md shrink-0">
              <kbd>ESC</kbd>
            </div>
          </div>

          {/* Quick Filter Bar */}
          <div className="px-4 py-2 border-b border-border/70 bg-surface/50 flex items-center gap-1.5 overflow-x-auto scrollbar-none text-xs">
            <span className="text-[11px] font-semibold text-text-muted uppercase tracking-wider mr-1 shrink-0">
              Filter:
            </span>
            {[
              { id: 'all', label: 'All Results' },
              { id: 'ai', label: '✨ AI Matches' },
              { id: 'image', label: 'Images' },
              { id: 'document', label: 'Documents' },
              { id: 'video', label: 'Videos' },
              { id: 'pdf', label: 'PDFs' },
            ].map((cat) => {
              const isSelected = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-medium whitespace-nowrap transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-primary text-white shadow-xs'
                      : 'bg-surface hover:bg-surface-hover text-text-secondary border border-border'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>

          {/* Results / Suggestions Container */}
          <div
            ref={listContainerRef}
            className="flex-1 overflow-y-auto p-2 divide-y divide-border/40 space-y-1"
          >
            {/* If no query, show recent searches and AI tip */}
            {!localQuery.trim() && (
              <div className="p-3 space-y-4">
                {recentSearches.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between text-xs text-text-muted font-medium mb-2 px-1">
                      <span className="flex items-center gap-1.5">
                        <Clock className="h-3.5 w-3.5" />
                        <span>Recent Searches</span>
                      </span>
                      <button
                        onClick={handleClearHistory}
                        className="text-[11px] hover:text-danger hover:underline transition-colors cursor-pointer"
                      >
                        Clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {recentSearches.map((term) => (
                        <button
                          key={term}
                          onClick={() => handleRecentClick(term)}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs bg-surface border border-border hover:border-focus-ring hover:bg-surface-hover text-text-primary transition-all cursor-pointer"
                        >
                          <Clock className="h-3 w-3 text-text-muted" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* On-Device AI Vision Spotlight Banner */}
                <div className="p-3.5 rounded-xl bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300">
                  <div className="flex items-start gap-2.5">
                    <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 shrink-0 mt-0.5" />
                    <div className="text-xs space-y-1">
                      <p className="font-semibold text-purple-900 dark:text-purple-200">
                        Smart On-Device AI Vision Search
                      </p>
                      <p className="text-purple-800/80 dark:text-purple-300/80 text-[11px] leading-relaxed">
                        Photos are automatically analyzed directly on your device using TensorFlow.js MobileNet.
                        Search for objects like <span className="font-mono font-semibold underline">&quot;dog&quot;</span>, <span className="font-mono font-semibold underline">&quot;cat&quot;</span>, or <span className="font-mono font-semibold underline">&quot;car&quot;</span> even if the image is named <span className="font-mono">&quot;IMG_001.jpg&quot;</span>!
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* When query is present but 0 results */}
            {localQuery.trim() && flattenedItems.length === 0 && (
              <div className="py-14 text-center space-y-2">
                <Search className="h-8 w-8 text-text-muted mx-auto opacity-50" />
                <p className="text-sm font-semibold text-text-primary">
                  No matches found for &quot;{localQuery}&quot;
                </p>
                <p className="text-xs text-text-muted max-w-sm mx-auto">
                  Try checking your spelling or searching for broader terms like &quot;image&quot; or &quot;document&quot;.
                </p>
              </div>
            )}

            {/* Render Matching Folders */}
            {searchResults.matchingFolders.length > 0 && (selectedCategory === 'all' || selectedCategory === 'folders') && (
              <div className="space-y-1 pb-1">
                <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  Folders ({searchResults.matchingFolders.length})
                </div>
                {searchResults.matchingFolders.map((folder, idx) => {
                  const isCurrent = selectedIndex === idx;
                  return (
                    <div
                      key={folder.id}
                      data-active={isCurrent}
                      onClick={() => handleSelectItem({ type: 'folder', data: folder })}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-brand-subtle text-primary font-semibold ring-1 ring-primary/30'
                          : 'hover:bg-surface-hover text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Folder className="h-4 w-4 text-folder-primary shrink-0" />
                        <span className="truncate">{folder.name}</span>
                      </div>
                      <div className="flex items-center gap-2 text-text-muted shrink-0 text-[11px]">
                        <span>Open folder</span>
                        <CornerDownLeft className="h-3 w-3" />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Render Matching Files */}
            {searchResults.matchingFiles.length > 0 && (
              <div className="space-y-1 pt-1">
                <div className="flex items-center justify-between px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                  <span>Files ({searchResults.matchingFiles.length})</span>
                  {searchResults.aiMatchCount > 0 && (
                    <span className="text-purple-600 dark:text-purple-400 font-bold flex items-center gap-1">
                      <Sparkles className="h-3 w-3" />
                      {searchResults.aiMatchCount} AI Vision Match{searchResults.aiMatchCount > 1 ? 'es' : ''}
                    </span>
                  )}
                </div>

                {searchResults.matchingFiles.map((match, fileIdx) => {
                  const actualIdx =
                    (selectedCategory === 'all' || selectedCategory === 'folders'
                      ? searchResults.matchingFolders.length
                      : 0) + fileIdx;
                  const isCurrent = selectedIndex === actualIdx;
                  const file = match.item;
                  const folderPath = getFolderPath(file.parentFolderId);

                  return (
                    <div
                      key={file.id}
                      data-active={isCurrent}
                      onClick={() => handleSelectItem({ type: 'file', data: match })}
                      onMouseEnter={() => setSelectedIndex(actualIdx)}
                      className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs cursor-pointer transition-colors ${
                        isCurrent
                          ? 'bg-brand-subtle text-primary font-semibold ring-1 ring-primary/30'
                          : 'hover:bg-surface-hover text-text-primary'
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1 mr-3">
                        <div className="shrink-0">
                          <ItemIcon
                            type="file"
                            fileName={file.name}
                            mimeType={file.mimeType}
                            extension={file.extension}
                            className="h-5 w-5"
                            size={20}
                          />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="truncate font-medium text-text-primary">
                              {file.name}
                            </span>

                            {/* AI Match Badge */}
                            {match.isAiMatch && (
                              <span className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded-md bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-semibold shrink-0">
                                <Sparkles className="h-2.5 w-2.5" />
                                <span>AI Match: {match.matchedTag}</span>
                                {match.aiConfidence && (
                                  <span className="opacity-70">({match.aiConfidence}%)</span>
                                )}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2 text-[10px] text-text-muted mt-0.5 font-mono">
                            <span>{formatBytes(file.fileSizeBytes)}</span>
                            <span>•</span>
                            <span className="truncate">{folderPath}</span>
                          </div>
                        </div>
                      </div>

                      {/* Action buttons */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewFile(file);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                          title="Preview"
                        >
                          <Eye className="h-3.5 w-3.5" />
                        </button>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            downloadFile(file);
                          }}
                          className="p-1.5 rounded-lg text-text-muted hover:text-text-primary hover:bg-surface-raised transition-colors"
                          title="Download"
                        >
                          <Download className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Footer with keyboard hints and AI status */}
          <div className="px-4 py-2.5 border-t border-border bg-surface flex items-center justify-between text-[11px] text-text-muted">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">
                  ↑
                </kbd>
                <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">
                  ↓
                </kbd>
                <span className="ml-1">Navigate</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">
                  ↵
                </kbd>
                <span className="ml-1">Open</span>
              </span>
              <span className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 rounded bg-surface-raised border border-border font-mono text-[10px]">
                  esc
                </kbd>
                <span className="ml-1">Close</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-purple-600 dark:text-purple-400 font-medium">
              <Sparkles className="h-3 w-3" />
              <span>On-Device Open-Source AI (MobileNet) Active</span>
            </div>
          </div>
        </div>
      </div>

      {/* File Preview Modal */}
      {previewFile && (
        <FilePreviewModal
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
        />
      )}
    </>
  );
}
