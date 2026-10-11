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
export function getFileTypeCategory(mimeType: string, extension: string): string {
  const ext = extension.toLowerCase().replace('.', '');
  const mime = mimeType.toLowerCase();

  if (mime.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'].includes(ext)) {
    return 'image';
  }
  if (mime.startsWith('video/') || ['mp4', 'webm', 'mkv', 'mov', 'avi'].includes(ext)) {
    return 'video';
  }
  if (mime.startsWith('audio/') || ['mp3', 'wav', 'ogg', 'm4a', 'flac'].includes(ext)) {
    return 'audio';
  }
  if (mime === 'application/pdf' || ext === 'pdf') {
    return 'pdf';
  }
  if (
    ['zip', 'rar', '7z', 'tar', 'gz'].includes(ext) ||
    mime.includes('zip') ||
    mime.includes('compressed')
  ) {
    return 'archive';
  }
  if (
    ['doc', 'docx', 'txt', 'rtf', 'odt', 'csv', 'xlsx', 'pptx'].includes(ext) ||
    mime.includes('text') ||
    mime.includes('document')
  ) {
    return 'document';
  }
  return 'file';
}
