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
  ArrowLeft,
  X,
  Sparkles,
  Clock,
} from 'lucide-react';
import { useDrive } from '@/lib/drive/drive-context';
import { useAuth } from '@/lib/firebase/auth-context';
import { useTheme } from '@/lib/theme-context';
import { formatBytes, getFileTypeCategory } from '@/lib/drive/storage-calc';
import { FilePreviewModal } from '@/components/modals/FilePreviewModal';
import { SpotlightSearchModal } from '@/components/search/SpotlightSearchModal';
import {
  executeDriveSearch,
  getRecentSearches,
  saveRecentSearch,
  SearchMatchResult,
} from '@/lib/drive/search-engine';
import type { FileItem, FolderItem } from '@/lib/drive/types';
import { ItemIcon } from '@/components/drive/ItemIcon';
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
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false);
  const [isSpotlightOpen, setIsSpotlightOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number>(-1);
  const [previewFile, setPreviewFile] = useState<FileItem | null>(null);

  const searchContainerRef = useRef<HTMLDivElement>(null);
  const mobileSearchContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  // Load recent searches when search is focused
  useEffect(() => {
    if (isSearchFocused) {
      setRecentSearches(getRecentSearches());
    }
  }, [isSearchFocused]);

  // Global Ctrl+K / Cmd+K listener to trigger Spotlight Palette
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSpotlightOpen((prev) => !prev);
        setIsSearchFocused(false);
      }
    };
    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, []);

  // Filter matching files and folders using multi-layer AI search engine
  const trimmedQuery = searchQuery.trim().toLowerCase();
  const searchResults = React.useMemo(() => {
    if (!trimmedQuery) return { matchingFiles: [], matchingFolders: [], totalCount: 0, aiMatchCount: 0 };
    return executeDriveSearch(trimmedQuery, files, folders);
  }, [trimmedQuery, files, folders]);

  const totalResultsCount = searchResults.totalCount;

  // Flattened results for keyboard navigation
  const allResults = React.useMemo(() => {
    const list: Array<{
      type: 'folder' | 'file';
      item: FolderItem | FileItem;
      isAiMatch?: boolean;
      matchedTag?: string;
    }> = [];
    searchResults.matchingFolders.slice(0, 4).forEach((f) => list.push({ type: 'folder', item: f }));
    searchResults.matchingFiles.slice(0, 8).forEach((f) =>
      list.push({
        type: 'file',
        item: f.item,
        isAiMatch: f.isAiMatch,
        matchedTag: f.matchedTag,
      })
    );
    return list;
  }, [searchResults]);

  // Click outside listener for search dropdown and theme menu
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const clickedDesktopSearch =
        searchContainerRef.current && searchContainerRef.current.contains(e.target as Node);
      const clickedMobileSearch =
        mobileSearchContainerRef.current &&
        mobileSearchContainerRef.current.contains(e.target as Node);

      if (!clickedDesktopSearch && !clickedMobileSearch) {
        setIsSearchFocused(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev < allResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : allResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedIndex >= 0 && selectedIndex < allResults.length) {
        handleSelectItem(allResults[selectedIndex]);
      } else if (trimmedQuery) {
        saveRecentSearch(trimmedQuery);
        setIsSearchFocused(false);
        setIsMobileSearchOpen(false);
      }
    } else if (e.key === 'Escape') {
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
      inputRef.current?.blur();
      mobileInputRef.current?.blur();
    }
  };

  const handleSelectItem = (selected: {
    type: 'folder' | 'file';
    item: FolderItem | FileItem;
    isAiMatch?: boolean;
    matchedTag?: string;
  }) => {
    if (trimmedQuery) {
      saveRecentSearch(trimmedQuery);
      setRecentSearches(getRecentSearches());
    }
    if (selected.type === 'file') {
      setPreviewFile(selected.item as FileItem);
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
    } else {
      navigateToFolder(selected.item.id);
      setSearchQuery('');
      setIsSearchFocused(false);
      setIsMobileSearchOpen(false);
    }
  };

  const getItemIcon = (file: FileItem) => {
    const cat = getFileTypeCategory(file.mimeType, file.extension);
    if (cat === 'image') return <ImageIcon className="h-4 w-4 text-sky-500" />;
    if (cat === 'video') return <VideoIcon className="h-4 w-4 text-purple-500" />;
    if (cat === 'audio') return <Music className="h-4 w-4 text-emerald-500" />;
    return <FileText className="h-4 w-4 text-slate-400" />;
  };

  // Render the search suggestions list
  const renderSearchSuggestions = () => {
    if (!isSearchFocused) return null;

    // When query is empty: show recent searches and shortcut hint
    if (trimmedQuery.length === 0) {
      return (
        <div className="absolute top-12 left-0 right-0 bg-surface-raised border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary p-2">
          {recentSearches.length > 0 && (
            <div className="mb-2 p-1.5">
              <div className="flex items-center justify-between text-[11px] font-semibold text-text-muted mb-2">
                <span className="flex items-center gap-1.5">
                  <Clock className="h-3 w-3" />
                  <span>Recent Searches</span>
                </span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {recentSearches.slice(0, 5).map((term) => (
                  <button
                    key={term}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      setSearchQuery(term);
                    }}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs bg-surface border border-border hover:border-focus-ring text-text-primary transition-all cursor-pointer"
                  >
                    <Clock className="h-2.5 w-2.5 text-text-muted" />
                    <span>{term}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            onMouseDown={(e) => {
              e.preventDefault();
              setIsSpotlightOpen(true);
              setIsSearchFocused(false);
            }}
            className="w-full p-2.5 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-700 dark:text-purple-300 text-xs flex items-center justify-between hover:bg-purple-500/15 transition-colors cursor-pointer"
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
              <span className="font-semibold">Open Spotlight Command Palette</span>
            </span>
            <kbd className="px-1.5 py-0.5 rounded bg-surface border border-border text-[10px] font-mono text-text-muted">
              Ctrl+K
            </kbd>
          </button>
        </div>
      );
    }

    return (
      <div className="absolute top-12 left-0 right-0 bg-surface-raised border border-border rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-150 text-text-primary">
        <div className="p-2.5 border-b border-border bg-surface flex items-center justify-between text-[11px] text-text-muted px-3.5">
          <span>Search results for &quot;{trimmedQuery}&quot;</span>
          <div className="flex items-center gap-2">
            {searchResults.aiMatchCount > 0 && (
              <span className="text-purple-600 dark:text-purple-400 font-semibold flex items-center gap-1">
                <Sparkles className="h-3 w-3" />
                {searchResults.aiMatchCount} AI Match{searchResults.aiMatchCount > 1 ? 'es' : ''}
              </span>
            )}
            <span>{totalResultsCount} found</span>
          </div>
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
                  {searchResults.matchingFolders.slice(0, 4).map((folder, idx) => {
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
                          <ItemIcon type="folder" folder={folder} className="h-4 w-4" size={16} />
                          <span className="truncate">{folder.name}</span>
                        </div>
                        <span className="text-[10px] text-text-muted flex items-center gap-1 shrink-0 ml-2">
                          <span>Open</span>
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
                  {searchResults.matchingFiles.slice(0, 8).map((fileMatch, idx) => {
                    const file = fileMatch.item;
                    const actualIdx = searchResults.matchingFolders.length + idx;
                    const isCurrent = selectedIndex === actualIdx;
                    return (
                      <div
                        key={file.id}
                        onClick={() =>
                          handleSelectItem({
                            type: 'file',
                            item: file,
                            isAiMatch: fileMatch.isAiMatch,
                            matchedTag: fileMatch.matchedTag,
                          })
                        }
                        onMouseEnter={() => setSelectedIndex(actualIdx)}
                        className={`flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                          isCurrent
                            ? 'bg-brand-subtle text-primary font-semibold'
                            : 'hover:bg-surface-hover text-text-primary'
                        }`}
                      >
                        <div className="flex items-center gap-2.5 min-w-0 flex-1 mr-2">
                          <div className="shrink-0">
                            <ItemIcon
                              type="file"
                              fileName={file.name}
                              mimeType={file.mimeType}
                              extension={file.extension}
                              className="h-4 w-4"
                              size={16}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap">
                              <p className="truncate font-medium">{file.name}</p>
                              {fileMatch.isAiMatch && (
                                <span className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded bg-purple-500/15 border border-purple-500/30 text-purple-700 dark:text-purple-300 text-[10px] font-semibold shrink-0">
                                  <Sparkles className="h-2.5 w-2.5" />
                                  <span>AI: {fileMatch.matchedTag}</span>
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-text-muted font-mono">
                              {formatBytes(file.fileSizeBytes)} · {file.extension.toUpperCase()}
                            </p>
                          </div>
                        </div>
                        <span className="text-[10px] font-medium text-primary bg-brand-subtle border border-primary-container/30 px-2 py-0.5 rounded-lg shrink-0">
                          Preview
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </div>

        <button
          type="button"
          onClick={() => {
            setIsSpotlightOpen(true);
            setIsSearchFocused(false);
          }}
          className="w-full py-2 px-3.5 border-t border-border bg-surface hover:bg-surface-hover flex items-center justify-between text-xs text-primary font-medium cursor-pointer transition-colors"
        >
          <span>Open Spotlight Palette for advanced filters</span>
          <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-surface-raised border border-border rounded text-text-muted">
            Ctrl+K
          </kbd>
        </button>
      </div>
    );
  };

  return (
    <>
      <header className="h-[64px] sm:h-[68px] shrink-0 border-b border-border bg-canvas flex items-center justify-between px-3 sm:px-6 z-20 transition-colors">
        {isMobileSearchOpen ? (
          /* Mobile Full-Width Expanded Search Header */
          <div className="flex items-center w-full gap-2 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setIsMobileSearchOpen(false);
                setIsSearchFocused(false);
              }}
              className="w-9 h-9 rounded-lg flex items-center justify-center text-text-secondary hover:text-text-primary hover:bg-surface-hover shrink-0 cursor-pointer"
              aria-label="Back / Close search"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div ref={mobileSearchContainerRef} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-text-muted pointer-events-none" />
              <input
                ref={mobileInputRef}
                type="text"
                autoFocus
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setIsSearchFocused(true);
                  setSelectedIndex(-1);
                }}
                onFocus={() => setIsSearchFocused(true)}
                onKeyDown={handleKeyDown}
                placeholder="Search files and folders..."
                className="w-full h-10 pl-9 pr-9 bg-surface text-xs sm:text-sm text-text-primary placeholder:text-text-muted rounded-xl border border-border focus:border-focus-ring focus:outline-none transition-colors"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedIndex(-1);
                    mobileInputRef.current?.focus();
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary p-1 rounded-md"
                  title="Clear search"
                >
                  <X className="h-4 w-4" />
                </button>
              )}

              {renderSearchSuggestions()}
            </div>
          </div>
        ) : (
          /* Standard Header: Mobile Logo is completely removed per user request */
          <>
            <div className="flex items-center gap-2 sm:gap-3 flex-1 max-w-xl my-auto">
              {onToggleMobileMenu && (
                <button
                  onClick={onToggleMobileMenu}
                  className="md:hidden w-9 h-9 flex items-center justify-center text-text-secondary hover:text-text-primary rounded-lg hover:bg-surface-hover shrink-0 cursor-pointer"
                  aria-label="Toggle Navigation"
                >
                  <Menu className="h-5 w-5" />
                </button>
              )}

              {/* Desktop Live Auto-Suggest Search Bar */}
              <div ref={searchContainerRef} className="relative w-full hidden md:flex items-center">
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
                  placeholder="Search files, folders, or image objects (e.g. 'dog')..."
                  className="w-full h-10 pl-9 pr-24 bg-surface hover:bg-surface/90 focus:bg-surface text-xs sm:text-sm text-text-primary placeholder:text-text-muted rounded-[10px] border border-border focus:border-focus-ring focus:outline-none transition-colors"
                />
                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
                  {searchQuery && (
                    <button
                      onClick={() => {
                        setSearchQuery('');
                        setSelectedIndex(-1);
                        inputRef.current?.focus();
                      }}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded-md cursor-pointer"
                      title="Clear search"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setIsSpotlightOpen(true);
                      setIsSearchFocused(false);
                    }}
                    className="flex items-center gap-0.5 text-[10px] font-mono font-medium text-text-muted bg-surface-raised border border-border px-1.5 py-0.5 rounded-md hover:border-focus-ring hover:text-text-primary transition-colors cursor-pointer"
                    title="Open Spotlight Command Palette (Ctrl+K)"
                  >
                    <span>Ctrl</span>
                    <span>K</span>
                  </button>
                </div>

                {renderSearchSuggestions()}
              </div>
            </div>

            {/* Right Action Icons with clean professional spacing */}
            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-auto">
              {/* Mobile Search Icon Button */}
              <button
                onClick={() => {
                  setIsMobileSearchOpen(true);
                  setIsSearchFocused(true);
                  setTimeout(() => mobileInputRef.current?.focus(), 50);
                }}
                className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Search files"
                aria-label="Open search"
              >
                <Search className="h-4 w-4" />
              </button>

              {/* Synced with Telegram Pill (Desktop only) */}
              {telegramConnected && (
                <div className="hidden sm:flex items-center gap-1.5 text-tertiary text-xs px-2.5 py-1 rounded-full bg-tertiary/10 border border-tertiary/20">
                  <span className="w-1.5 h-1.5 rounded-full bg-tertiary animate-pulse" />
                  <span>All files synced</span>
                </div>
              )}

              {/* Sync with Telegram Button (Compact Icon on Mobile, Pill on Desktop) */}
              {telegramConnected && (
                <button
                  onClick={syncTelegram}
                  disabled={telegramSyncing}
                  title="Reconcile metadata with Telegram Saved Messages"
                  className="w-9 h-9 sm:w-auto sm:px-3 rounded-lg flex items-center justify-center gap-1.5 text-xs font-medium text-text-secondary hover:text-text-primary bg-surface hover:bg-surface-hover border border-border transition-colors disabled:opacity-50 cursor-pointer shrink-0"
                  aria-label="Sync Telegram files"
                >
                  <RefreshCw
                    className={`h-4 w-4 sm:h-3.5 sm:w-3.5 text-text-muted ${
                      telegramSyncing ? 'animate-spin text-primary' : ''
                    }`}
                  />
                  <span className="hidden sm:inline">
                    {telegramSyncing ? 'Syncing...' : 'Sync'}
                  </span>
                </button>
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

              {/* Help Button (Desktop only to prevent mobile clutter) */}
              <Link
                href="/help"
                className="hidden sm:flex w-9 h-9 rounded-lg items-center justify-center hover:bg-surface-hover text-text-secondary hover:text-text-primary transition-colors cursor-pointer"
                title="Help & Knowledge Base"
                aria-label="Help"
              >
                <HelpCircle className="h-4 w-4" />
              </Link>

              {/* Account Menu */}
              <div className="relative">
                <button
                  onClick={() => setProfileOpen(!profileOpen)}
                  className="relative p-0.5 rounded-full hover:ring-2 hover:ring-primary/40 transition-all cursor-pointer"
                  aria-label="Account profile"
                >
                  {user?.photoURL ? (
                    <img
                      src={user.photoURL}
                      alt={user.displayName || 'User'}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover border border-primary/40 shadow-xs"
                    />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-primary-container border border-primary/40 text-text-primary flex items-center justify-center font-bold text-xs uppercase shadow-xs">
                      {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0) : 'U'}
                    </div>
                  )}
                  <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-tertiary border-2 border-canvas" />
                </button>

                {profileOpen && (
                  <div
                    className="absolute right-0 top-11 w-60 bg-surface-raised border border-border rounded-xl shadow-xl p-2 z-50 animate-in fade-in duration-100"
                    onMouseLeave={() => setProfileOpen(false)}
                  >
                    <div className="px-3 py-2 border-b border-border/50">
                      <div className="flex items-center gap-2">
                        {user?.photoURL ? (
                          <img
                            src={user.photoURL}
                            alt={user.displayName || 'Profile'}
                            referrerPolicy="no-referrer"
                            className="h-7 w-7 rounded-full object-cover border border-primary/30 shrink-0"
                          />
                        ) : (
                          <div className="h-7 w-7 rounded-full bg-brand-subtle text-primary border border-primary/30 flex items-center justify-center font-bold text-xs uppercase shrink-0">
                            {user?.displayName ? user.displayName.charAt(0) : user?.email ? user.email.charAt(0) : 'U'}
                          </div>
                        )}
                        <div className="flex flex-col min-w-0 flex-1">
                          <div className="flex items-center gap-1.5">
                            <p className="text-xs font-semibold text-text-primary truncate">
                              {user?.displayName || (user ? 'Authenticated User' : 'Guest')}
                            </p>
                            {user && (
                              <span title="Verified" className="inline-flex items-center">
                                <ShieldCheck className="h-3.5 w-3.5 text-tertiary shrink-0" />
                              </span>
                            )}
                          </div>
                          <p className="text-[11px] text-text-muted truncate">
                            {user?.email || (user?.isAnonymous ? 'Guest Firebase Session' : 'Not signed in')}
                          </p>
                        </div>
                      </div>

                      {user && (
                        <div className="mt-2 flex items-center">
                          {user.providerId === 'google.com' ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-brand-subtle text-primary border border-primary/20 text-[10px] font-medium">
                              <svg className="w-2.5 h-2.5 shrink-0" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                                />
                              </svg>
                              <span>Google Account</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-surface text-text-secondary border border-border text-[10px] font-medium">
                              <span>Email Account</span>
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="py-1">
                      <Link
                        href="/app/settings?tab=account"
                        onClick={() => setProfileOpen(false)}
                        className="flex items-center gap-2 px-3 py-2 text-xs text-text-secondary hover:text-text-primary hover:bg-surface-hover rounded-lg transition-colors"
                      >
                        <User className="h-3.5 w-3.5 text-text-muted" />
                        <span>Account & Profile</span>
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
          </>
        )}
      </header>

      {/* Preview modal if clicked directly from live auto-suggest */}
      {previewFile && (
        <FilePreviewModal file={previewFile} onClose={() => setPreviewFile(null)} />
      )}

      {/* Global Spotlight Omnibar Command Palette */}
      <SpotlightSearchModal
        isOpen={isSpotlightOpen}
        onClose={() => setIsSpotlightOpen(false)}
      />
    </>
  );
}
