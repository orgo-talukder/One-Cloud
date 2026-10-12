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
  itemCount?: number;
}

export interface UploadTask {
  id: string;
  kind?: 'upload' | 'download';
  file?: File;
  fileItem?: FileItem;
  name: string;
  size: number;
  progress: number;
  status: 'queued' | 'uploading' | 'completed' | 'failed' | 'cancelled';
  error?: string;
  uploadedBytes?: number;
  speedBytesPerSec?: number;
  etaSeconds?: number | null;
  phase?: 'uploading' | 'finalizing';
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

export interface ElectronBridge {
  isDesktop: boolean;
  platform: string;
  getDownloadsPath: () => Promise<string>;
  uploadFile: (params: {
    taskId: string;
    sessionToken: string;
    fileName: string;
    mimeType: string;
    fileBufferBase64?: string;
    filePath?: string;
    parentFolderId?: string | null;
  }) => Promise<{ success: boolean; file: FileItem }>;
  downloadFile: (params: {
    taskId: string;
    sessionToken: string;
    messageId: number;
    fileName: string;
  }) => Promise<{ success: boolean; savedPath: string }>;
  cancelTransfer: (taskId: string) => Promise<boolean>;
  onProgress: (
    callback: (data: {
      taskId: string;
      progress: number;
      uploadedBytes: number;
      totalBytes: number;
    }) => void
  ) => () => void;
  saveCredentials: (creds: { apiId: string; apiHash: string }) => Promise<{ success: boolean; error?: string }>;
  loadCredentials: () => Promise<{ apiId: string; apiHash: string }>;
  selectBackupDirectory?: () => Promise<{ canceled: boolean; selectedPath?: string }>;
  startAutoBackup?: (options: { folderPath: string; frequency: string; fileTypes: string[] }) => Promise<{ success: boolean; error?: string; config?: any }>;
  stopAutoBackup?: () => Promise<{ success: boolean; config?: any }>;
  getAutoBackupStatus?: () => Promise<{ success: boolean; config?: any }>;
  onAutoBackupEvent?: (callback: (data: { eventType: string; filename: string; folderPath: string; lastBackupTime: string; count: number }) => void) => () => void;
}

declare global {
  interface Window {
    electronBridge?: ElectronBridge;
  }
}
