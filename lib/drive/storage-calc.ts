import type { FileItem, DriveStorageSummary } from './types';

/**
 * Calculates truthful Drive storage metrics strictly from eligible tracked files.
 * Per PRD Section 3.1 & 3.3:
 * - Only 'active' files count towards "Storage Used in Your Drive".
 * - 'trashed' files are not counted in the active drive total until restored or purged.
 */
export function calculateDriveStorage(
  files: FileItem[],
  folderCount: number
): DriveStorageSummary {
  const activeFiles = files.filter((f) => f.status === 'active');
  const totalBytes = activeFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0);

  return {
    trackedBytes: totalBytes,
    trackedFileCount: activeFiles.length,
    folderCount: folderCount,
    lastCalculatedAt: new Date().toISOString(),
  };
}

/**
 * Format bytes into human readable string with exact decimal precision
 */
export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  if (!bytes || isNaN(bytes)) return '0 B';

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));
  const index = Math.min(i, sizes.length - 1);

  const value = parseFloat((bytes / Math.pow(k, index)).toFixed(dm));
  return `${value} ${sizes[index]}`;
}

/**
 * Map MIME type or extension to general category
 */
export type FileCategoryType = 'video' | 'image' | 'document' | 'audio' | 'archive' | 'other';

export function getFileTypeCategory(mimeType: string, extension: string): string {
  const ext = (extension || '').toLowerCase().replace('.', '');
  const mime = (mimeType || '').toLowerCase();

  // Videos
  if (
    mime.startsWith('video/') ||
    ['mp4', 'mkv', 'mov', 'avi', 'webm', 'flv', '3gp', 'wmv', 'm4v', 'ts', 'ogv'].includes(ext)
  ) {
    return 'video';
  }

  // Images
  if (
    mime.startsWith('image/') ||
    ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp', 'ico', 'heic', 'tiff', 'tif', 'avif'].includes(ext)
  ) {
    return 'image';
  }

  // Audio
  if (
    mime.startsWith('audio/') ||
    ['mp3', 'wav', 'ogg', 'm4a', 'flac', 'aac', 'wma', 'opus', 'aiff'].includes(ext)
  ) {
    return 'audio';
  }

  // PDFs & Documents
  if (
    mime === 'application/pdf' ||
    ext === 'pdf' ||
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'xls', 'ppt', 'pptx', 'ods', 'json', 'xml', 'md', 'html', 'css', 'js', 'ts', 'jsx', 'tsx', 'py', 'c', 'cpp', 'java'].includes(ext) ||
    mime.includes('text') ||
    mime.includes('document') ||
    mime.includes('spreadsheet') ||
    mime.includes('presentation')
  ) {
    if (ext === 'pdf' || mime === 'application/pdf') {
      return 'pdf';
    }
    return 'document';
  }

  // Archives
  if (
    ['zip', 'rar', '7z', 'tar', 'gz', 'bz2', 'xz', 'iso', 'dmg', 'tgz'].includes(ext) ||
    mime.includes('zip') ||
    mime.includes('compressed') ||
    mime.includes('archive') ||
    mime.includes('tar')
  ) {
    return 'archive';
  }

  return 'other';
}

export type StorageCategoryKey = 'videos' | 'images' | 'documents' | 'audio' | 'archives' | 'others';

export interface StorageCategoryItem {
  key: StorageCategoryKey;
  label: string;
  bytes: number;
  formattedBytes: string;
  count: number;
  percentage: number; // 0 - 100
  color: string;
  dotColor: string;
  bgLight: string;
  bgDark: string;
  borderClass: string;
  textColor: string;
  iconType: string;
}

export interface DetailedStorageBreakdown {
  totalBytes: number;
  formattedTotalBytes: string;
  totalFileCount: number;
  categories: StorageCategoryItem[];
  byKey: Record<StorageCategoryKey, StorageCategoryItem>;
  largestFiles: FileItem[];
  averageFileSizeBytes: number;
  formattedAverageFileSize: string;
}

/**
 * Calculates a complete, categorized breakdown of files for rich dashboard analytics.
 */
export function calculateDetailedStorage(files: FileItem[]): DetailedStorageBreakdown {
  const activeFiles = files.filter((f) => f.status === 'active');
  const totalBytes = activeFiles.reduce((acc, f) => acc + (f.fileSizeBytes || 0), 0);
  const totalCount = activeFiles.length;

  const buckets: Record<StorageCategoryKey, { bytes: number; count: number }> = {
    videos: { bytes: 0, count: 0 },
    images: { bytes: 0, count: 0 },
    documents: { bytes: 0, count: 0 },
    audio: { bytes: 0, count: 0 },
    archives: { bytes: 0, count: 0 },
    others: { bytes: 0, count: 0 },
  };

  for (const file of activeFiles) {
    const cat = getFileTypeCategory(file.mimeType, file.extension);
    const size = file.fileSizeBytes || 0;

    if (cat === 'video') {
      buckets.videos.bytes += size;
      buckets.videos.count += 1;
    } else if (cat === 'image') {
      buckets.images.bytes += size;
      buckets.images.count += 1;
    } else if (cat === 'document' || cat === 'pdf') {
      buckets.documents.bytes += size;
      buckets.documents.count += 1;
    } else if (cat === 'audio') {
      buckets.audio.bytes += size;
      buckets.audio.count += 1;
    } else if (cat === 'archive') {
      buckets.archives.bytes += size;
      buckets.archives.count += 1;
    } else {
      buckets.others.bytes += size;
      buckets.others.count += 1;
    }
  }

  const categoryConfigs: Array<{
    key: StorageCategoryKey;
    label: string;
    color: string;
    dotColor: string;
    bgLight: string;
    bgDark: string;
    borderClass: string;
    textColor: string;
    iconType: string;
  }> = [
    {
      key: 'videos',
      label: 'Videos',
      color: '#A855F7', // purple-500
      dotColor: 'bg-purple-500',
      bgLight: 'bg-purple-50',
      bgDark: 'dark:bg-purple-950/40',
      borderClass: 'border-purple-200 dark:border-purple-800/60',
      textColor: 'text-purple-600 dark:text-purple-400',
      iconType: 'video',
    },
    {
      key: 'images',
      label: 'Images & Photos',
      color: '#0284C7', // sky-600
      dotColor: 'bg-sky-500',
      bgLight: 'bg-sky-50',
      bgDark: 'dark:bg-sky-950/40',
      borderClass: 'border-sky-200 dark:border-sky-800/60',
      textColor: 'text-sky-600 dark:text-sky-400',
      iconType: 'image',
    },
    {
      key: 'documents',
      label: 'Documents & PDFs',
      color: '#10B981', // emerald-500
      dotColor: 'bg-emerald-500',
      bgLight: 'bg-emerald-50',
      bgDark: 'dark:bg-emerald-950/40',
      borderClass: 'border-emerald-200 dark:border-emerald-800/60',
      textColor: 'text-emerald-600 dark:text-emerald-400',
      iconType: 'document',
    },
    {
      key: 'audio',
      label: 'Audio & Music',
      color: '#EC4899', // pink-500
      dotColor: 'bg-pink-500',
      bgLight: 'bg-pink-50',
      bgDark: 'dark:bg-pink-950/40',
      borderClass: 'border-pink-200 dark:border-pink-800/60',
      textColor: 'text-pink-600 dark:text-pink-400',
      iconType: 'audio',
    },
    {
      key: 'archives',
      label: 'Archives & Zip',
      color: '#F59E0B', // amber-500
      dotColor: 'bg-amber-500',
      bgLight: 'bg-amber-50',
      bgDark: 'dark:bg-amber-950/40',
      borderClass: 'border-amber-200 dark:border-amber-800/60',
      textColor: 'text-amber-600 dark:text-amber-400',
      iconType: 'archive',
    },
    {
      key: 'others',
      label: 'Other Files',
      color: '#64748B', // slate-500
      dotColor: 'bg-slate-500',
      bgLight: 'bg-slate-100',
      bgDark: 'dark:bg-slate-800/60',
      borderClass: 'border-slate-200 dark:border-slate-700/60',
      textColor: 'text-slate-600 dark:text-slate-400',
      iconType: 'other',
    },
  ];

  const categories: StorageCategoryItem[] = categoryConfigs.map((cfg) => {
    const item = buckets[cfg.key];
    const percentage = totalBytes > 0 ? parseFloat(((item.bytes / totalBytes) * 100).toFixed(1)) : 0;
    return {
      key: cfg.key,
      label: cfg.label,
      bytes: item.bytes,
      formattedBytes: formatBytes(item.bytes),
      count: item.count,
      percentage,
      color: cfg.color,
      dotColor: cfg.dotColor,
      bgLight: cfg.bgLight,
      bgDark: cfg.bgDark,
      borderClass: cfg.borderClass,
      textColor: cfg.textColor,
      iconType: cfg.iconType,
    };
  });

  const byKey = categories.reduce(
    (acc, c) => {
      acc[c.key] = c;
      return acc;
    },
    {} as Record<StorageCategoryKey, StorageCategoryItem>
  );

  const largestFiles = [...activeFiles]
    .sort((a, b) => (b.fileSizeBytes || 0) - (a.fileSizeBytes || 0))
    .slice(0, 5);

  const avgBytes = totalCount > 0 ? Math.round(totalBytes / totalCount) : 0;

  return {
    totalBytes,
    formattedTotalBytes: formatBytes(totalBytes),
    totalFileCount: totalCount,
    categories,
    byKey,
    largestFiles,
    averageFileSizeBytes: avgBytes,
    formattedAverageFileSize: formatBytes(avgBytes),
  };
}

