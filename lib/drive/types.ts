export interface FileItem {
  id: string;
  name: string;
  mimeType: string;
  extension: string;
  fileSizeBytes: number;
  parentFolderId: string | null; // null represents Root (My Drive)
  isStarred: boolean;
  status: 'active' | 'trashed' | 'deleted';
  telegramChatId: string;
  telegramMessageId: number;
  uploadedAt: string;
  updatedAt: string;
  trashedAt?: string | null;
  downloadUrl?: string;
  thumbnailUrl?: string;
}

export interface FolderItem {
  id: string;
  name: string;
  parentFolderId: string | null;
  isStarred: boolean;
  status: 'active' | 'trashed';
  createdAt: string;
  updatedAt: string;
}

export interface UploadTask {
  id: string;
  file: File;
  name: string;
  size: number;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
}

export interface DriveStorageSummary {
  trackedBytes: number;
  trackedFileCount: number;
  folderCount: number;
  lastCalculatedAt: string;
}

export type ViewMode = 'grid' | 'list';
export type SortOption = 'name_asc' | 'date_desc' | 'size_desc' | 'size_asc';
export type FileTypeFilter = 'all' | 'image' | 'video' | 'audio' | 'pdf' | 'document' | 'archive' | 'other';
