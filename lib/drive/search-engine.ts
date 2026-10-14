'use client';

import type { FileItem, FolderItem } from './types';

export interface SearchMatchResult {
  item: FileItem;
  score: number;
  isAiMatch: boolean;
  matchedTag?: string;
  matchedField: 'name' | 'extension' | 'aiTag';
  aiConfidence?: number;
}

export interface DriveSearchResults {
  matchingFolders: FolderItem[];
  matchingFiles: SearchMatchResult[];
  totalCount: number;
  aiMatchCount: number;
}

/**
 * Perform intelligent multi-layer search across files and folders
 */
export function executeDriveSearch(
  query: string,
  files: FileItem[],
  folders: FolderItem[],
  options?: {
    categoryFilter?: string; // 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'ai'
    folderIdScope?: string | null;
  }
): DriveSearchResults {
  const trimmed = query.trim().toLowerCase();
  if (!trimmed) {
    return {
      matchingFolders: [],
      matchingFiles: [],
      totalCount: 0,
      aiMatchCount: 0,
    };
  }

  // 1. Filter folders
  const matchingFolders = folders
    .filter((f) => {
      if (f.status !== 'active') return false;
      return f.name.toLowerCase().includes(trimmed);
    })
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(trimmed);
      const bStarts = b.name.toLowerCase().startsWith(trimmed);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

  // 2. Filter files with multi-tier scoring (Title > Extension > On-Device AI Vision Tags)
  const matchedFilesList: SearchMatchResult[] = [];

  for (const file of files) {
    if (file.status !== 'active') continue;

    // Apply optional category filter
    if (options?.categoryFilter && options.categoryFilter !== 'all') {
      if (options.categoryFilter === 'ai') {
        if (!file.aiTags || file.aiTags.length === 0) continue;
      } else if (options.categoryFilter === 'image') {
        if (!file.mimeType.startsWith('image/')) continue;
      } else if (options.categoryFilter === 'video') {
        if (!file.mimeType.startsWith('video/')) continue;
      } else if (options.categoryFilter === 'audio') {
        if (!file.mimeType.startsWith('audio/')) continue;
      } else if (options.categoryFilter === 'pdf') {
        if (file.extension.toLowerCase() !== 'pdf') continue;
      } else if (options.categoryFilter === 'document') {
        if (!['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(file.extension.toLowerCase())) continue;
      }
    }

    const nameLower = file.name.toLowerCase();
    const extLower = (file.extension || '').toLowerCase();

    // Check title match
    const nameIndex = nameLower.indexOf(trimmed);
    let score = 0;
    let matchedField: 'name' | 'extension' | 'aiTag' = 'name';
    let isAiMatch = false;
    let matchedTag: string | undefined = undefined;

    if (nameIndex === 0) {
      // Starts with query in filename
      score = 100;
      matchedField = 'name';
    } else if (nameIndex > 0) {
      // Contains query in filename
      score = 80;
      matchedField = 'name';
    }

    // Check On-Device AI Vision Tags
    if (file.aiTags && file.aiTags.length > 0) {
      for (const tag of file.aiTags) {
        const tagLower = tag.toLowerCase();
        if (tagLower === trimmed) {
          // Exact tag match (e.g. searched "dog" and image was scanned as "dog")
          score = Math.max(score, 95);
          isAiMatch = true;
          matchedTag = tag;
          matchedField = 'aiTag';
          break;
        } else if (tagLower.includes(trimmed) || trimmed.includes(tagLower)) {
          // Substring tag match (e.g. searched "golden" or "retriever")
          score = Math.max(score, 85);
          isAiMatch = true;
          matchedTag = tag;
          matchedField = 'aiTag';
          break;
        }
      }
    }

    // Check extension match (e.g. searched "png" or "pdf")
    if (score === 0 && extLower === trimmed) {
      score = 40;
      matchedField = 'extension';
    }

    if (score > 0) {
      matchedFilesList.push({
        item: file,
        score,
        isAiMatch,
        matchedTag,
        matchedField,
        aiConfidence: file.aiConfidence,
      });
    }
  }

  // Sort files by relevance score, then recent date
  matchedFilesList.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    return new Date(b.item.uploadedAt).getTime() - new Date(a.item.uploadedAt).getTime();
  });

  const aiMatchCount = matchedFilesList.filter((m) => m.isAiMatch).length;

  return {
    matchingFolders,
    matchingFiles: matchedFilesList,
    totalCount: matchingFolders.length + matchedFilesList.length,
    aiMatchCount,
  };
}

const RECENT_SEARCHES_KEY = 'onecloud_recent_searches_v2';
const MAX_RECENT_SEARCHES = 6;

export function getRecentSearches(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (!raw) return ['photos', 'documents', 'dog', 'presentation'];
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

export function saveRecentSearch(term: string): void {
  if (typeof window === 'undefined' || !term.trim()) return;
  try {
    const clean = term.trim();
    const existing = getRecentSearches().filter((t) => t.toLowerCase() !== clean.toLowerCase());
    const updated = [clean, ...existing].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {}
}

export function clearRecentSearches(): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(RECENT_SEARCHES_KEY);
  } catch {}
}
