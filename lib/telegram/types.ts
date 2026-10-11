export type TelegramConnectionStatus =
  | 'not_connected'
  | 'authorizing'
  | 'connected'
  | 'reauth_required'
  | 'error';

export interface TelegramSessionPayload {
  apiId: number;
  apiHash: string;
  sessionString: string;
  telegramUserId: string;
  telegramUsername: string;
  phone: string;
  connectedAt: string;
}

export interface TelegramAuthRequest {
  action: 'send_code' | 'verify_code' | 'disconnect';
  phone?: string;
  apiId?: string | number;
  apiHash?: string;
  code?: string;
  password?: string;
  phoneCodeHash?: string;
  pendingSession?: string;
}

export interface TelegramAuthResponse {
  success: boolean;
  phoneCodeHash?: string;
  pendingSession?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  sessionToken?: string;
  requires2FA?: boolean;
  message?: string;
  error?: string;
}

export interface TelegramUploadedFile {
  messageId: number;
  chatId: string;
  fileSizeBytes: number;
  fileName: string;
  mimeType: string;
  uploadedAt: string;
}
