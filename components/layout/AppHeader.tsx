'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  User,
  LogOut,
  LogIn,
  Menu,
  ShieldCheck,
  Sun,
  Moon,
  Laptop,
  Check,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  Music,
  Folder,
  ArrowRight,
  X,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import Link from 'next/link';

interface AppHeaderProps {
  onToggleMobileMenu?: () => void;
}

export function AppHeader({ onToggleMobileMenu }: AppHeaderProps) {
  const {
    files,
    folders,
    searchQuery,
    setSearchQuery,
    telegramSyncing,
    syncTelegram,
    telegramConnected,
    navigateToFolder,
  } = useDrive();
  const { user, signOut } = useAuth();
  const { theme, resolvedTheme, setTheme } = useTheme();

  const [profileOpen, setProfileOpen] = useState(false);
  const [themeMenuOpen, setThemeMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter matching files and folders in real time
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = React.useMemo(() => {
    if (!trimmedQuery) return { matchingFiles: [], matchingFolders: [] };

    const matchingFolders = folders
      .filter((f) => f.status === 'active' && f.name.toLowerCase().includes(trimmedQuery))
      .slice(0, 4);

    const matchingFiles = files
      .filter(
        (f) =>
          f.status === 'active' &&
          (f.name.toLowerCase().includes(trimmedQuery) ||
            f.extension.toLowerCase().includes(trimmedQuery))
      )
      .slice(0, 6);

    return { matchingFiles, matchingFolders };
  }, [trimmedQuery, files, folders]);

  const totalResultsCount =
    searchResults.matchingFolders.length + searchResults.matchingFiles.length;

  // Flattened results for keyboard navigation
  const allResults = React.useMemo(() => {
    const list: Array<{ type: 'folder' | 'file'; item: FolderItem | FileItem }> = [];
    searchResults.matchingFolders.forEach((f) => list.push({ type: 'folder', item: f }));
    searchResults.matchingFiles.forEach((f) => list.push({ type: 'file', item: f }));
    return list;
  }, [searchResults]);

  // Click outside listener for search dropdown and theme menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(e.target as Node)
      ) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < totalResultsCount - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : totalResultsCount - 1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        e.preventDefault();
        const selected = allResults[selectedIndex];
        handleSelectItem(selected);
      } else {
        // Just keep the search query active to filter file list
        setIsSearchFocused(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      inputRef.current?.blur();
    }
  };

  const handleSelectItem = (selected: { type: 'folder' | 'file'; item: FolderItem | FileItem }) => {
    if (selected.type === 'file') {
      setPreviewFile(selected.item as FileItem);
      setIsSearchFocused(false);
    } else {
      navigateToFolder(selected.item.id);
      setSearchQuery('');
      setIsSearchFocused(false);
    }
  };

  const getItemIcon = (file: FileItem) => {
    const cat = getFileTypeCategory(file.mimeType, file.extension);
    if (cat === 'image') return <ImageIcon className="h-4 w-4 text-sky-500" />;
    if (cat === 'video') return <VideoIcon className="h-4 w-4 text-purple-500" />;
    if (cat === 'audio') return <Music className="h-4 w-4 text-emerald-500" />;
    return <FileText className="h-4 w-4 text-slate-400" />;
  };

  return (
    <>
      <header className="h-[68px] shrink-0 border-b border-border bg-canvas flex items-center justify-between px-4 sm:px-6 z-20 transition-colors">
        <div className="flex items-center gap-3 flex-1 max-w-xl my-auto">
          {onToggleMobileMenu && (
            <button
              onClick={onToggleMobileMenu}
              className="md:hidden p-2 text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover"
              aria-label="Toggle Navigation"
            >
              <Menu className="h-5 w-5" />
            </button>
          )}

          {/* YouTube / Google Drive Style Live Auto-Suggest Search Bar */}
          <div ref={searchContainerRef} className="relative w-full flex items-center">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
            <input
              ref={inputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setIsSearchFocused(true);
                setSelectedIndex(-1);
              }}
              onFocus={() => setIsSearchFocused(true)}
              onKeyDown={handleKeyDown}
              placeholder="Search files and folders"
              className="w-full h-10 pl-9 pr-14 bg-surface hover:bg-surface/90 focus:bg-surface text-xs sm:text-sm text-text-primary placeholder:text-text-muted rounded-[10px] border border-border focus:border-focus-ring focus:outline-none transition-colors"
            />
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedIndex(-1);
                  inputRef.current?.focus();
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md"
                title="Clear search"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            )}

            {/* Live Auto-Suggest Results Dropdown */}
            {isSearchFocused && trimmedQuery.length > 0 && (
              <div className="absolute top-12 left-0 right-0 bg-surface-raised border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary">
                <div className="p-2.5 border-b border-border bg-surface flex items-center justify-between text-[11px] text-text-muted px-3.5">
                  <span>Search suggestions for &quot;{trimmedQuery}&quot;</span>
                  <span>{totalResultsCount} found</span>
                </div>

                <div className="max-h-[380px] overflow-y-auto p-1.5 space-y-1 divide-y divide-border/40">
                  {totalResultsCount === 0 ? (
                    <div className="py-8 text-center text-xs text-text-muted">
                      No files or folders matching &quot;{trimmedQuery}&quot;
                    </div>
                  ) : (
                    <>
                      {/* Folders matches */}
                      {searchResults.matchingFolders.length > 0 && (
                        <div className="space-y-0.5 pb-1">
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            Folders
                          </div>
                          {searchResults.matchingFolders.map((folder, idx) => {
                            const isCurrent = selectedIndex === idx;
                            return (
                              <div
                                key={folder.id}
                                onClick={() => handleSelectItem({ type: 'folder', item: folder })}
                                onMouseEnter={() => setSelectedIndex(idx)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'bg-brand-subtle text-primary font-semibold'
                                    : 'hover:bg-surface-hover text-text-primary'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <Folder className="h-4 w-4 text-primary shrink-0" />
                                  <span className="truncate">{folder.name}</span>
                                </div>
                                <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0 ml-2">
                                  <span>Open Folder</span>
                                  <ArrowRight className="h-3 w-3" />
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}

                      {/* Files matches */}
                      {searchResults.matchingFiles.length > 0 && (
                        <div className="space-y-0.5 pt-1">
                          <div className="px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-text-muted">
                            Files
                          </div>
                          {searchResults.matchingFiles.map((file, idx) => {
                            const actualIdx = searchResults.matchingFolders.length + idx;
                            const isCurrent = selectedIndex === actualIdx;
                            return (
                              <div
                                key={file.id}
                                onClick={() => handleSelectItem({ type: 'file', item: file })}
                                onMouseEnter={() => setSelectedIndex(actualIdx)}
                                className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                                  isCurrent
                                    ? 'bg-brand-subtle text-primary font-semibold'
                                    : 'hover:bg-surface-hover text-text-primary'
                                }`}
                              >
                                <div className="flex items-center gap-2.5 min-w-0">
                                  <div className="shrink-0">{getItemIcon(file)}</div>
                                  <div className="min-w-0">
                                    <p className="truncate font-medium">{file.name}</p>
                                    <p className="text-[10px] text-text-muted font-mono">
                                      {formatBytes(file.fileSizeBytes)} · {file.extension.toUpperCase()}
                                    </p>
                                  </div>
                                </div>
                                <span className="text-[10px] font-medium text-primary bg-brand-subtle border border-primary-container/30 px-2 py-0.5 rounded-lg shrink-0 ml-2">
                                  Preview File
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-4">
          {/* Synced with Telegram Pill */}
          {telegramConnected && (
            <div className="hidden sm:flex items-center gap-1.5 text-tertiary text-xs px-2.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
              <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
              <span>All files synced</span>
            </div>
          )}

          {/* Theme Switcher in Header (Light / Dark / System) */}
          <div className="relative">
            <button
              onClick={() => setThemeMenuOpen(!themeMenuOpen)}
              className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
              title={`Current Theme: ${theme}`}
              aria-label="Toggle theme"
            >
              {resolvedTheme === 'dark' ? (
                <Moon className="h-4 w-4 text-primary" />
              ) : (
                <Sun className="h-4 w-4 text-warning" />
              )}
            </button>

            {themeMenuOpen && (
              <div
                className="absolute right-0 top-11 w-40 bg-surface-raised border border-border rounded-xl shadow-xl p-1.5 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setThemeMenuOpen(false)}
              >
                <div className="px-2 py-1 text-[10px] font-bold text-text-muted uppercase">
                  Theme Mode
                </div>
                <button
                  onClick={() => {
                    setTheme('light');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    theme === 'light'
                      ? 'bg-brand-subtle text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Sun className="h-3.5 w-3.5 text-warning" />
                    <span>Light</span>
                  </span>
                  {theme === 'light' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setTheme('dark');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    theme === 'dark'
                      ? 'bg-brand-subtle text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Moon className="h-3.5 w-3.5 text-primary" />
                    <span>Dark</span>
                  </span>
                  {theme === 'dark' && <Check className="h-3.5 w-3.5" />}
                </button>
                <button
                  onClick={() => {
                    setTheme('system');
                    setThemeMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 text-xs rounded-lg transition-colors text-left cursor-pointer ${
                    theme === 'system'
                      ? 'bg-brand-subtle text-primary font-medium'
                      : 'text-text-secondary hover:bg-surface-hover hover:text-text-primary'
                  }`}
                >
                  <span className="flex items-center gap-2">
                    <Laptop className="h-3.5 w-3.5 text-text-muted" />
                    <span>System</span>
                  </span>
                  {theme === 'system' && <Check className="h-3.5 w-3.5" />}
                </button>
              </div>
            )}
          </div>

          {/* Help Button */}
          <Link
            href="/help"
            className="w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
            title="Help & Knowledge Base"
            aria-label="Help"
          >
            <HelpCircle className="h-4 w-4" />
          </Link>

          {/* Sync with Telegram Button */}
          {telegramConnected && (
            <button
              onClick={syncTelegram}
              disabled={telegramSyncing}
              title="Reconcile metadata with Telegram Saved Messages"
              className="inline-flex items-center gap-1.5 h-9 px-3 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border rounded-lg transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw
                className={`h-3.5 w-3.5 text-text-muted ${
                  telegramSyncing ? 'animate-spin text-primary' : ''
                }`}
              />
              <span className="hidden sm:inline">
                {telegramSyncing ? 'Syncing...' : 'Sync'}
              </span>
            </button>
          )}

          {/* Account Menu */}
          <div className="relative">
            <button
              onClick={() => setProfileOpen(!profileOpen)}
              className="relative p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
            >
              <div className="h-8 w-8 rounded-full bg-primary-container border border-primary/40 text-text-primary flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0) : 'U'}
              </div>
              <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-canvas" />
            </button>

            {profileOpen && (
              <div
                className="absolute right-0 top-11 w-56 bg-surface-raised border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in duration-100"
                onMouseLeave={() => setProfileOpen(false)}
              >
                <div className="px-3 py-2 border-b border-border/50">
                  <div className="flex items-center gap-1.5">
                    <p className="text-xs font-semibold text-text-primary truncate">
                      {user?.displayName || (user ? 'Authenticated User' : 'Guest')}
                    </p>
                    {user && (
                      <span title="Firebase Verified" className="inline-flex items-center">
                        <ShieldCheck className="h-3.5 w-3.5 text-tertiary shrink-0" />
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-text-muted truncate mt-0.5">
                    {user?.email || (user?.isAnonymous ? 'Guest Firebase Session' : 'Not signed in')}
                  </p>
                </div>

                <div className="py-1">
                  <Link
                    href="/app/settings"
                    onClick={() => setProfileOpen(false)}
                    className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                  >
                    <User className="h-3.5 w-3.5 text-text-muted" />
                    <span>Account & Settings</span>
                  </Link>

                  {!user ? (
                    <Link
                      href="/login"
                      onClick={() => setProfileOpen(false)}
                      className="flex items-center gap-2 px-3 py-2 text-xs text-primary hover:bg-brand-subtle rounded-lg transition-colors"
                    >
                      <LogIn className="h-3.5 w-3.5" />
                      <span>Sign In</span>
                    </Link>
                  ) : (
                    <button
                      onClick={() => {
                        signOut();
                        setProfileOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-xs text-danger hover:bg-danger/10 rounded-lg transition-colors text-left cursor-pointer"
                    >
                      <LogOut className="h-3.5 w-3.5 text-danger" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Preview modal if clicked directly from live auto-suggest */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}
    </>
  );
}
