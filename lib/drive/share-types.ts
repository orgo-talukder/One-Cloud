export type ShareAccessLevel = 'viewer' | 'editor';
export type ShareStatus = 'active' | 'revoked' | 'expired';

export interface ShareLinkDocument {
  shareToken: string;
  fileId: string;
  folderId?: string | null;
  ownerUid: string;
  ownerEmail: string;
  ownerDisplayName?: string;

  // Telegram streaming linkage (server proxy uses this to stream to guest safely)
  telegramMessageId: number;
  telegramChatId: string;
  ownerSessionToken: string;

  // Cached file metadata for instant preview rendering
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;
  thumbnailUrl?: string;

  // Access & Permissions
  accessLevel: ShareAccessLevel;
  isPublic: boolean; // true = anyone with link

  // Security Guards
  hasPassword: boolean;
  passwordHash?: string | null; // SHA-256 hex string
  passwordSalt?: string | null;
  expiresAt?: string | null; // ISO 8601 string or null for never
  allowDownload: boolean; // true = user can download; false = preview-only DLP mode

  // Metrics & Lifecycle
  status: ShareStatus;
  viewCount: number;
  downloadCount: number;
  lastViewedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface PublicShareFileMetadata {
  shareToken: string;
  fileId: string;
  fileName: string;
  fileSizeBytes: number;
  mimeType: string;
  extension: string;
  thumbnailUrl?: string;
  accessLevel: ShareAccessLevel;
  allowDownload: boolean;
  expiresAt?: string | null;
  hasPassword: boolean;
  isPasswordVerified?: boolean;
  ownerDisplayName?: string;
  viewCount: number;
  downloadCount: number;
  createdAt: string;
}

export interface CreateSharePayload {
  fileId: string;
  accessLevel: ShareAccessLevel;
  password?: string;
  expiresInDays?: number | null; // e.g. 1, 7, 30, or null for never
  allowDownload: boolean;
  isPublic?: boolean;
}

export interface VerifyShareResult {
  valid: boolean;
  error?: string;
  errorCode?: 'NOT_FOUND' | 'EXPIRED' | 'REVOKED' | 'PASSWORD_REQUIRED' | 'INVALID_PASSWORD';
  requiresPassword?: boolean;
  file?: PublicShareFileMetadata;
}
