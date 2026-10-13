import type { FolderItem } from './types';

export const DEFAULT_SYSTEM_FOLDERS = [
  {
    key: 'documents',
    name: 'Documents',
    iconPath: '/icons/folders/documents_folder_icon.png',
  },
  {
    key: 'photos',
    name: 'Photos',
    iconPath: '/icons/folders/photo_folder_icon.png',
  },
  {
    key: 'videos',
    name: 'Videos',
    iconPath: '/icons/folders/video_folder_icon.png',
  },
  {
    key: 'music',
    name: 'Music',
    iconPath: '/icons/folders/music_folder_icon.png',
  },
  {
    key: 'downloads',
    name: 'Downloads',
    iconPath: '/icons/folders/download_folder_icon.png',
  },
  {
    key: 'archives',
    name: 'Archives',
    iconPath: '/icons/folders/archive_folder_icon.png',
  },
  {
    key: 'files',
    name: 'Other Files',
    iconPath: '/icons/folders/files_folder_icon.png',
  },
] as const;

export type SystemFolderType = (typeof DEFAULT_SYSTEM_FOLDERS)[number]['key'];

// File extension to PNG icon mapping
const EXTENSION_ICON_MAP: Record<string, string> = {
  // Archives & Compressed
  '7z': '/icons/files/7-zip_icon.png',
  '7-zip': '/icons/files/7-zip_icon.png',
  'zip': '/icons/files/zip_icon.png',
  'rar': '/icons/files/rar_icon.png',
  'tar': '/icons/files/archive_icon.png',
  'gz': '/icons/files/archive_icon.png',
  'tgz': '/icons/files/archive_icon.png',
  'bz2': '/icons/files/archive_icon.png',
  'xz': '/icons/files/archive_icon.png',
  'iso': '/icons/files/archive_icon.png',

  // Apps & Executables
  'apk': '/icons/files/apk_icon.png',
  'xapk': '/icons/files/apk_icon.png',
  'jar': '/icons/files/jar_icon.png',

  // Documents & Office
  'pdf': '/icons/files/pdf_icon.png',
  'doc': '/icons/files/doc_icon.png',
  'dot': '/icons/files/doc_icon.png',
  'rtf': '/icons/files/doc_icon.png',
  'docx': '/icons/files/docx_icon.png',
  'odt': '/icons/files/docx_icon.png',
  'ppt': '/icons/files/pptx_icon.png',
  'pptx': '/icons/files/pptx_icon.png',
  'pps': '/icons/files/pptx_icon.png',
  'ppsx': '/icons/files/pptx_icon.png',
  'csv': '/icons/files/csv_icon.png',
  'tsv': '/icons/files/csv_icon.png',
  'txt': '/icons/files/txt_icon.png',
  'log': '/icons/files/txt_icon.png',
  'md': '/icons/files/markdown_icon.png',
  'markdown': '/icons/files/markdown_icon.png',
  'mdx': '/icons/files/markdown_icon.png',

  // Code & Web
  'html': '/icons/files/html_icon.png',
  'htm': '/icons/files/html_icon.png',
  'css': '/icons/files/css_icon.png',
  'scss': '/icons/files/css_icon.png',
  'sass': '/icons/files/css_icon.png',
  'js': '/icons/files/js_icon.png',
  'jsx': '/icons/files/js_icon.png',
  'ts': '/icons/files/js_icon.png',
  'tsx': '/icons/files/js_icon.png',
  'mjs': '/icons/files/js_icon.png',
  'cjs': '/icons/files/js_icon.png',
  'json': '/icons/files/json_icon.png',
  'json5': '/icons/files/json_icon.png',
  'xml': '/icons/files/xml_icon.png',
  'py': '/icons/files/python_icon.png',
  'pyw': '/icons/files/python_icon.png',
  'java': '/icons/files/java_icon.png',
  'kt': '/icons/files/java_icon.png',

  // Media
  'jpg': '/icons/files/image_icon.png',
  'jpeg': '/icons/files/image_icon.png',
  'png': '/icons/files/image_icon.png',
  'gif': '/icons/files/image_icon.png',
  'webp': '/icons/files/image_icon.png',
  'svg': '/icons/files/image_icon.png',
  'bmp': '/icons/files/image_icon.png',
  'ico': '/icons/files/image_icon.png',
  'tiff': '/icons/files/image_icon.png',
  'tif': '/icons/files/image_icon.png',
  'avif': '/icons/files/image_icon.png',
  'heic': '/icons/files/image_icon.png',

  // Audio
  'mp3': '/icons/files/music_icon.png',
  'wav': '/icons/files/music_icon.png',
  'flac': '/icons/files/music_icon.png',
  'aac': '/icons/files/music_icon.png',
  'ogg': '/icons/files/music_icon.png',
  'm4a': '/icons/files/music_icon.png',
  'opus': '/icons/files/music_icon.png',
  'wma': '/icons/files/music_icon.png',
  'mid': '/icons/files/music_icon.png',
  'midi': '/icons/files/music_icon.png',

  // Video
  'mp4': '/icons/files/video_icon.png',
  'mkv': '/icons/files/video_icon.png',
  'webm': '/icons/files/video_icon.png',
  'avi': '/icons/files/video_icon.png',
  'mov': '/icons/files/video_icon.png',
  'wmv': '/icons/files/video_icon.png',
  'flv': '/icons/files/video_icon.png',
  'm4v': '/icons/files/video_icon.png',
  '3gp': '/icons/files/video_icon.png',
  'm2ts': '/icons/files/video_icon.png',
};

/**
 * Returns the appropriate folder icon URL.
 * - System protected folders use their dedicated PNG icon.
 * - Custom user-created folders use normal_folder_icon2.png.
 */
export function getFolderIconPath(folder: FolderItem | { name: string; isSystem?: boolean; systemType?: string | null }): string {
  // If explicitly flagged as system or matches one of the 7 default system folders
  if (folder.isSystem || folder.systemType) {
    const sysDef = DEFAULT_SYSTEM_FOLDERS.find(
      (d) => d.key === folder.systemType || d.name.toLowerCase() === folder.name.trim().toLowerCase()
    );
    if (sysDef) {
      return sysDef.iconPath;
    }
  }

  // Check by name match in case system flag wasn't persisted previously
  const nameMatch = DEFAULT_SYSTEM_FOLDERS.find(
    (d) => d.name.toLowerCase() === folder.name.trim().toLowerCase()
  );
  if (nameMatch) {
    return nameMatch.iconPath;
  }

  // Custom user-created folder: ALWAYS normal_folder_icon2.png (never normal_folder_icon.png)
  return '/icons/folders/normal_folder_icon2.png';
}

/**
 * Resolves the PNG icon path for a file by extension or mimeType.
 * Returns null if the format is unknown (to trigger default vector icon rendering).
 */
export function getFileIconPath(fileName: string, mimeType?: string, extension?: string): string | null {
  const cleanExt = (extension || fileName.split('.').pop() || '').toLowerCase().replace(/^\./, '');

  if (cleanExt && EXTENSION_ICON_MAP[cleanExt]) {
    return EXTENSION_ICON_MAP[cleanExt];
  }

  // Fallbacks by mimeType if extension is generic
  if (mimeType) {
    if (mimeType.startsWith('image/')) return '/icons/files/image_icon.png';
    if (mimeType.startsWith('video/')) return '/icons/files/video_icon.png';
    if (mimeType.startsWith('audio/')) return '/icons/files/music_icon.png';
    if (mimeType === 'application/pdf') return '/icons/files/pdf_icon.png';
    if (mimeType.includes('zip') || mimeType.includes('compressed')) return '/icons/files/zip_icon.png';
    if (mimeType.includes('word') || mimeType.includes('document')) return '/icons/files/docx_icon.png';
    if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return '/icons/files/pptx_icon.png';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel') || mimeType.includes('csv')) return '/icons/files/csv_icon.png';
    if (mimeType.startsWith('text/')) return '/icons/files/txt_icon.png';
  }

  // Unknown format: return null to trigger vector icon rendering
  return null;
}
