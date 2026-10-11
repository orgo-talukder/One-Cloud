export type TelegramConnectionStatus =
  | 'not_connected'
  | 'authorizing'
  | 'connected'
  | 'reauth_required'
  | 'error';

export interface TelegramSessionData {
  userId: string;
  telegramUserId: string;
  telegramUsername?: string;
  phone: string;
  isSandbox: boolean;
  connectedAt: string;
  sessionStringEncrypted: string;
}

export interface TelegramAuthRequest {
  action: 'send_code' | 'verify_code' | 'disconnect' | 'status';
  phone?: string;
  apiId?: string;
  apiHash?: string;
  code?: string;
  password?: string;
  phoneCodeHash?: string;
  isSandbox?: boolean;
}

export interface TelegramAuthResponse {
  success: boolean;
  status: TelegramConnectionStatus;
  phoneCodeHash?: string;
  telegramUserId?: string;
  telegramUsername?: string;
  isSandbox?: boolean;
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
  isSandbox?: boolean;
}
