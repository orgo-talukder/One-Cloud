'use client';

import type { FileItem, FolderItem } from './types';
import { CATEGORY_EXPANSIONS } from '../ai/vision-scanner';

export interface SearchMatchResult {
  item: FileItem;
  score: number;
  isAiMatch: boolean;
  matchedTag?: string;
  matchedField: 'name' | 'extension' | 'aiTag';
  aiConfidence?: number;
  folderPath?: string;
}

export interface DriveSearchResults {
  matchingFolders: FolderItem[];
  matchingFiles: SearchMatchResult[];
  totalCount: number;
  aiMatchCount: number;
}

/**
 * Common query synonyms and cross-language expansions (English <-> Bengali <-> Hinglish)
 */
const QUERY_SYNONYM_MAP: Record<string, string[]> = {
  car: ['car', 'sports car', 'convertible', 'limousine', 'taxi', 'cab', 'minivan', 'jeep', 'suv', 'wagon', 'sedan', 'vehicle', 'automobile', 'pickup', 'truck', 'grille', 'gadi', 'gaadi', 'গাড়ি', 'গাড়ী'],
  gadi: ['car', 'sports car', 'convertible', 'limousine', 'taxi', 'cab', 'minivan', 'jeep', 'suv', 'wagon', 'sedan', 'vehicle', 'automobile', 'gadi', 'gaadi', 'গাড়ি'],
  gaadi: ['car', 'sports car', 'convertible', 'limousine', 'taxi', 'cab', 'minivan', 'jeep', 'suv', 'wagon', 'sedan', 'vehicle', 'automobile', 'gadi', 'gaadi', 'গাড়ি'],
  'গাড়ি': ['car', 'sports car', 'convertible', 'minivan', 'jeep', 'suv', 'sedan', 'vehicle', 'automobile', 'gadi', 'গাড়ি'],
  'গাড়ী': ['car', 'sports car', 'convertible', 'minivan', 'jeep', 'suv', 'sedan', 'vehicle', 'automobile', 'gadi', 'গাড়ী'],
  dog: ['dog', 'puppy', 'retriever', 'hound', 'bulldog', 'terrier', 'shepherd', 'canine', 'kutta', 'কুকুর'],
  kutta: ['dog', 'puppy', 'retriever', 'hound', 'bulldog', 'terrier', 'shepherd', 'canine', 'kutta', 'কুকুর'],
  'কুকুর': ['dog', 'puppy', 'retriever', 'hound', 'bulldog', 'terrier', 'shepherd', 'canine', 'kutta', 'কুকুর'],
  cat: ['cat', 'kitten', 'tabby', 'persian', 'siamese', 'feline', 'biral', 'বিড়াল'],
  biral: ['cat', 'kitten', 'tabby', 'persian', 'siamese', 'feline', 'biral', 'বিড়াল'],
  'বিড়াল': ['cat', 'kitten', 'tabby', 'persian', 'siamese', 'feline', 'biral', 'বিড়াল'],
  flower: ['flower', 'rose', 'daisy', 'sunflower', 'tulip', 'orchid', 'blossom', 'ful', 'ফুল'],
  ful: ['flower', 'rose', 'daisy', 'sunflower', 'tulip', 'orchid', 'blossom', 'ful', 'ফুল'],
  'ফুল': ['flower', 'rose', 'daisy', 'sunflower', 'tulip', 'orchid', 'blossom', 'ful', 'ফুল'],
  food: ['food', 'pizza', 'burger', 'sandwich', 'salad', 'cake', 'soup', 'coffee', 'fruit', 'snack', 'khabar', 'খাবার'],
  khabar: ['food', 'pizza', 'burger', 'sandwich', 'salad', 'cake', 'soup', 'coffee', 'fruit', 'snack', 'khabar', 'খাবার'],
  'খাবার': ['food', 'pizza', 'burger', 'sandwich', 'salad', 'cake', 'soup', 'coffee', 'fruit', 'snack', 'khabar', 'খাবার'],
  photo: ['image', 'photo', 'picture', 'wallpaper', 'shot', 'chobi', 'ছবি'],
  picture: ['image', 'photo', 'picture', 'wallpaper', 'shot', 'chobi', 'ছবি'],
  chobi: ['image', 'photo', 'picture', 'wallpaper', 'shot', 'chobi', 'ছবি'],
  'ছবি': ['image', 'photo', 'picture', 'wallpaper', 'shot', 'chobi', 'ছবি'],
  phone: ['phone', 'cellphone', 'mobile phone', 'smartphone', 'mobile', 'telephone', 'iphone', 'android'],
  mobile: ['phone', 'cellphone', 'mobile phone', 'smartphone', 'mobile', 'telephone', 'iphone', 'android'],
};

/**
 * Builds a human-readable folder breadcrumb string for a given folderId
 * e.g. "My Drive / Projects / Photos"
 */
export function buildFolderPath(
  folderId: string | null | undefined,
  folders: FolderItem[]
): string {
  if (!folderId) return 'My Drive';

  const parts: string[] = [];
  let currentId: string | null = folderId;
  const visited = new Set<string>();

  while (currentId && !visited.has(currentId)) {
    visited.add(currentId);
    const folder = folders.find((f) => f.id === currentId);
    if (!folder) break;
    parts.unshift(folder.name);
    currentId = folder.parentFolderId;
  }

  return parts.length > 0 ? `My Drive / ${parts.join(' / ')}` : 'My Drive';
}

/**
 * Perform intelligent Google Drive-style multi-layer search across all files and folders
 */
export function executeDriveSearch(
  query: string,
  files: FileItem[],
  folders: FolderItem[],
  options?: {
    categoryFilter?: string; // 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'ai'
    folderIdScope?: string | null; // null for global search
    scope?: 'global' | 'current_folder';
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

  // Derive expanded search terms based on query synonyms
  const queryTokens = trimmed.split(/\s+/).filter(Boolean);
  const searchTermsSet = new Set<string>([trimmed, ...queryTokens]);

  // Check synonym mapping
  if (QUERY_SYNONYM_MAP[trimmed]) {
    QUERY_SYNONYM_MAP[trimmed].forEach((t) => searchTermsSet.add(t));
  }
  for (const token of queryTokens) {
    if (QUERY_SYNONYM_MAP[token]) {
      QUERY_SYNONYM_MAP[token].forEach((t) => searchTermsSet.add(t));
    }
  }

  // Check category taxonomy
  for (const [category, keywords] of Object.entries(CATEGORY_EXPANSIONS)) {
    if (category === trimmed || keywords.includes(trimmed)) {
      searchTermsSet.add(category);
      keywords.slice(0, 15).forEach((kw) => searchTermsSet.add(kw));
    }
  }

  const expandedSearchTerms = Array.from(searchTermsSet);

  // 1. Filter matching folders
  const matchingFolders = folders
    .filter((f) => {
      if (f.status !== 'active') return false;
      if (options?.scope === 'current_folder' && options?.folderIdScope !== undefined) {
        if (f.parentFolderId !== options.folderIdScope) return false;
      }
      const fNameLower = f.name.toLowerCase();
      return fNameLower.includes(trimmed) || expandedSearchTerms.some((t) => fNameLower.includes(t));
    })
    .sort((a, b) => {
      const aStarts = a.name.toLowerCase().startsWith(trimmed);
      const bStarts = b.name.toLowerCase().startsWith(trimmed);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.name.localeCompare(b.name);
    });

  // 2. Filter files with intelligent scoring (Title > Extension > On-Device AI Vision Tags)
  const matchedFilesList: SearchMatchResult[] = [];

  for (const file of files) {
    if (file.status !== 'active') continue;

    // Apply folder scope if requested (default is global across all folders, like Google Drive)
    if (options?.scope === 'current_folder' && options?.folderIdScope !== undefined) {
      if (file.parentFolderId !== options.folderIdScope) continue;
    }

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
        if (!['doc', 'docx', 'txt', 'rtf', 'odt', 'xls', 'xlsx', 'ppt', 'pptx'].includes(file.extension.toLowerCase())) {
          continue;
        }
      }
    }

    const nameLower = file.name.toLowerCase();
    const extLower = (file.extension || '').toLowerCase();

    let score = 0;
    let matchedField: 'name' | 'extension' | 'aiTag' = 'name';
    let isAiMatch = false;
    let matchedTag: string | undefined = undefined;

    // A. Check exact & substring filename matches
    const nameIndex = nameLower.indexOf(trimmed);
    if (nameIndex === 0) {
      score = 100; // Starts with exact query
      matchedField = 'name';
    } else if (nameIndex > 0) {
      score = 80; // Contains exact query
      matchedField = 'name';
    } else {
      // Check query tokens in filename
      const matchedToken = queryTokens.find((t) => t.length > 2 && nameLower.includes(t));
      if (matchedToken) {
        score = 70;
        matchedField = 'name';
      }
    }

    // B. Check On-Device AI Vision Tags
    if (file.aiTags && file.aiTags.length > 0) {
      const lowerTags = file.aiTags.map((t) => t.toLowerCase());

      // 1. Exact primary tag or exact tag match with user query
      const primaryTagLower = (file.aiPrimaryTag || '').toLowerCase();
      if (primaryTagLower === trimmed || expandedSearchTerms.includes(primaryTagLower)) {
        score = Math.max(score, 98);
        isAiMatch = true;
        matchedTag = file.aiPrimaryTag;
        matchedField = 'aiTag';
      } else {
        // 2. Check all AI tags against expanded search terms
        for (const term of expandedSearchTerms) {
          const directTag = lowerTags.find((t) => t === term);
          if (directTag) {
            score = Math.max(score, 94);
            isAiMatch = true;
            matchedTag = directTag;
            matchedField = 'aiTag';
            break;
          }

          const partialTag = lowerTags.find((t) => t.includes(term) || (term.length > 3 && term.includes(t)));
          if (partialTag) {
            score = Math.max(score, 88);
            isAiMatch = true;
            matchedTag = partialTag;
            matchedField = 'aiTag';
            break;
          }
        }
      }
    }

    // C. Check extension match (e.g. searched "png", "pdf", "jpg")
    if (score === 0 && extLower === trimmed) {
      score = 45;
      matchedField = 'extension';
    }

    if (score > 0) {
      const folderPath = buildFolderPath(file.parentFolderId, folders);
      matchedFilesList.push({
        item: file,
        score,
        isAiMatch,
        matchedTag: matchedTag
          ? matchedTag.charAt(0).toUpperCase() + matchedTag.slice(1)
          : file.aiPrimaryTag,
        matchedField,
        aiConfidence: file.aiConfidence,
        folderPath,
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
    if (!raw) return ['car', 'photos', 'documents', 'dog', 'presentation'];
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
