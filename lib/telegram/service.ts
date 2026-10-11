import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { CustomFile } from 'telegram/client/uploads';
import { computeCheck } from 'telegram/Password';
import QRCode from 'qrcode';
import { encryptSession, decryptSession } from './crypto';
import type { TelegramUploadedFile, TelegramSessionPayload, TelegramAuthResponse } from './types';

// In-memory cache for ongoing QR code sessions with TTL
interface PendingQrSession {
  client: TelegramClient;
  apiId: number;
  apiHash: string;
  createdAt: number;
  needs2FA?: boolean;
}

const globalForQr = globalThis as unknown as {
  qrSessions?: Map<string, PendingQrSession>;
};

if (!globalForQr.qrSessions) {
  globalForQr.qrSessions = new Map<string, PendingQrSession>();
}

const qrStore = globalForQr.qrSessions;

export class TelegramService {
  /**
   * Resolves Telegram App credentials from server environment or standard verified client credentials
   */
  static getAppCredentials(customApiId?: string | number, customApiHash?: string): {
    apiId: number;
    apiHash: string;
  } {
    const envApiId = process.env.TELEGRAM_API_ID ? Number(process.env.TELEGRAM_API_ID) : undefined;
    const envApiHash = process.env.TELEGRAM_API_HASH;

    // Use custom passed, or server env var, or official Telegram Web client credentials
    const apiId = Number(customApiId) || envApiId || 2496;
    const apiHash = customApiHash || envApiHash || '8da85b0d5bfe62527e5b244c209159c3';

    return { apiId, apiHash };
  }

  /**
   * Helper to initialize a TelegramClient instance with safe options
   */
  private static createClient(
    sessionString: string,
    apiId: number,
    apiHash: string
  ): TelegramClient {
    return new TelegramClient(new StringSession(sessionString), apiId, apiHash, {
      connectionRetries: 5,
      useWSS: false,
    });
  }

  /**
   * Translates Telegram MTProto error messages into human-friendly explanations
   */
  private static parseTelegramError(err: unknown): string {
    const msg = err instanceof Error ? err.message : String(err);
    if (msg.includes('PHONE_NUMBER_INVALID')) {
      return 'The phone number format is invalid. Please use the full international format (e.g. +8801XXXXXXXXX).';
    }
    if (msg.includes('API_ID_INVALID') || msg.includes('API_ID_PUBLISHED_FLOOD')) {
      return 'The Telegram API configuration is invalid. Please verify your server credentials.';
    }
    if (msg.includes('PHONE_CODE_INVALID')) {
      return 'The verification code entered is incorrect. Please check your Telegram app.';
    }
    if (msg.includes('PHONE_CODE_EXPIRED')) {
      return 'The verification code has expired. Please request a new code.';
    }
    if (msg.includes('PASSWORD_HASH_INVALID')) {
      return 'The 2-Step Verification password entered is incorrect.';
    }
    if (msg.includes('FLOOD_WAIT_')) {
      const seconds = msg.split('FLOOD_WAIT_')[1]?.split(' ')[0] || 'some';
      return `Telegram rate limit reached. Please wait ${seconds} seconds before trying again.`;
    }
    return msg || 'An error occurred during Telegram communication.';
  }

  /**
   * Request a real authentication code from Telegram using phone number
   */
  static async sendAuthCode(params: {
    phone: string;
    apiId?: string | number;
    apiHash?: string;
  }): Promise<TelegramAuthResponse> {
    const { phone } = params;

    if (!phone || !phone.trim()) {
      return { success: false, error: 'Phone number is required.' };
    }

    const { apiId, apiHash } = this.getAppCredentials(params.apiId, params.apiHash);
    const client = this.createClient('', apiId, apiHash);

    try {
      await client.connect();

      const sendResult = await client.sendCode(
        {
          apiId,
          apiHash,
        },
        phone.trim()
      );

      // Save the session with the created auth key and data center ID
      const pendingSession = ((client.session as unknown as StringSession).save() || '') as string;
      await client.disconnect().catch(() => {});

      return {
        success: true,
        phoneCodeHash: sendResult.phoneCodeHash,
        pendingSession,
        message: sendResult.isCodeViaApp
          ? 'Telegram verification code has been sent to your Telegram app messages.'
          : 'Telegram verification code has been sent via SMS.',
      };
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Error in sendAuthCode:', err);
      return { success: false, error: this.parseTelegramError(err) };
    }
  }

  /**
   * Verify the received authentication code (and optional 2FA password)
   */
  static async verifyAuthCode(params: {
    phone: string;
    code: string;
    password?: string;
    phoneCodeHash: string;
    pendingSession?: string;
    apiId?: string | number;
    apiHash?: string;
  }): Promise<TelegramAuthResponse> {
    const { phone, code, password, phoneCodeHash, pendingSession } = params;

    if (!code || !code.trim()) {
      return { success: false, error: 'Verification code is required.' };
    }

    const { apiId, apiHash } = this.getAppCredentials(params.apiId, params.apiHash);
    const client = this.createClient(pendingSession || '', apiId, apiHash);

    try {
      await client.connect();

      let authorizedUser: Api.User | null = null;

      try {
        const result = await client.invoke(
          new Api.auth.SignIn({
            phoneNumber: phone.trim(),
            phoneCodeHash: phoneCodeHash.trim(),
            phoneCode: code.trim(),
          })
        );

        if ('user' in result && result.user) {
          authorizedUser = result.user as Api.User;
        }
      } catch (signInErr: unknown) {
        const errorMsg = signInErr instanceof Error ? signInErr.message : String(signInErr);

        if (errorMsg.includes('SESSION_PASSWORD_NEEDED')) {
          if (!password || !password.trim()) {
            await client.disconnect().catch(() => {});
            return {
              success: false,
              requires2FA: true,
              error: 'Your Telegram account has 2-Step Verification enabled. Please enter your Cloud Password.',
            };
          }

          // Compute SRP check for 2FA password
          const passwordSrpResult = await client.invoke(new Api.account.GetPassword());
          const passwordSrpCheck = await computeCheck(passwordSrpResult, password.trim());

          const passResult = await client.invoke(
            new Api.auth.CheckPassword({
              password: passwordSrpCheck,
            })
          );

          if ('user' in passResult && passResult.user) {
            authorizedUser = passResult.user as Api.User;
          }
        } else {
          throw signInErr;
        }
      }

      if (!authorizedUser) {
        const me = await client.getMe();
        if (me instanceof Api.User) {
          authorizedUser = me;
        }
      }

      const finalSessionString = ((client.session as unknown as StringSession).save() || '') as string;
      await client.disconnect().catch(() => {});

      const telegramUserId = authorizedUser ? String(authorizedUser.id) : 'tg_user';
      const telegramUsername = authorizedUser?.username || authorizedUser?.firstName || 'TelegramUser';

      // Encrypt full session payload with AES-256-GCM
      const sessionData: TelegramSessionPayload = {
        apiId,
        apiHash,
        sessionString: finalSessionString,
        telegramUserId,
        telegramUsername,
        phone: phone.trim(),
        connectedAt: new Date().toISOString(),
      };

      const sessionToken = encryptSession(JSON.stringify(sessionData));

      return {
        success: true,
        telegramUserId,
        telegramUsername,
        sessionToken,
        message: 'Successfully connected to your Telegram Saved Messages storage!',
      };
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Error in verifyAuthCode:', err);
      return { success: false, error: this.parseTelegramError(err) };
    }
  }

  /**
   * Initializes a Telegram QR Code login session
   */
  static async initQrCodeLogin(): Promise<TelegramAuthResponse> {
    const { apiId, apiHash } = this.getAppCredentials();
    const client = this.createClient('', apiId, apiHash);

    try {
      await client.connect();

      // Export Login Token from Telegram MTProto
      const result = await client.invoke(
        new Api.auth.ExportLoginToken({
          apiId,
          apiHash,
          exceptIds: [],
        })
      );

      if (!(result instanceof Api.auth.LoginToken)) {
        await client.disconnect().catch(() => {});
        return { success: false, error: 'Failed to generate Telegram QR login token.' };
      }

      const tokenBuffer = Buffer.from(result.token);
      const tokenBase64Url = tokenBuffer
        .toString('base64')
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=+$/, '');

      const tgUrl = `tg://login?token=${tokenBase64Url}`;
      const qrCodeDataUrl = await QRCode.toDataURL(tgUrl, {
        width: 256,
        margin: 2,
        color: {
          dark: '#0f172a',
          light: '#ffffff',
        },
      });

      const qrId = 'qr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 8);

      // Clean old sessions older than 3 minutes
      const now = Date.now();
      for (const [key, val] of qrStore.entries()) {
        if (now - val.createdAt > 180000) {
          val.client.disconnect().catch(() => {});
          qrStore.delete(key);
        }
      }

      qrStore.set(qrId, {
        client,
        apiId,
        apiHash,
        createdAt: now,
      });

      return {
        success: true,
        qrId,
        qrCodeDataUrl,
        message: 'QR code generated. Scan with your Telegram app.',
      };
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Error in initQrCodeLogin:', err);
      return { success: false, error: this.parseTelegramError(err) };
    }
  }

  /**
   * Checks if user has scanned the QR code with their Telegram mobile app
   */
  /**
   * Checks if user has scanned the QR code with their Telegram mobile app
   */
  static async checkQrCodeLogin(qrId: string, password?: string): Promise<TelegramAuthResponse> {
    if (!qrId || !qrStore.has(qrId)) {
      return { success: false, error: 'QR login session has expired. Please refresh the QR code.' };
    }

    const sessionEntry = qrStore.get(qrId)!;
    const { client, apiId, apiHash } = sessionEntry;

    // If session was already marked as needing 2FA password and password is provided
    if (sessionEntry.needs2FA) {
      if (password) {
        return await this.verifyQr2FAPassword(sessionEntry, qrId, password);
      }
      return {
        success: true,
        authorized: false,
        requires2FA: true,
        message: 'Two-Step Verification (Cloud Password) required.',
      };
    }

    try {
      const result = await client.invoke(
        new Api.auth.ExportLoginToken({
          apiId,
          apiHash,
          exceptIds: [],
        })
      );

      // Scenario 1: Directly authenticated on current DC
      if (result instanceof Api.auth.LoginTokenSuccess) {
        let authorizedUser: Api.User | null = null;
        if (result.authorization instanceof Api.auth.Authorization && result.authorization.user) {
          authorizedUser = result.authorization.user as Api.User;
        }

        if (!authorizedUser) {
          const me = await client.getMe();
          if (me instanceof Api.User) {
            authorizedUser = me;
          }
        }

        const finalSessionString = ((client.session as unknown as StringSession).save() || '') as string;
        await client.disconnect().catch(() => {});
        qrStore.delete(qrId);

        const telegramUserId = authorizedUser ? String(authorizedUser.id) : 'tg_user';
        const telegramUsername = authorizedUser?.username || authorizedUser?.firstName || 'TelegramUser';

        const sessionData: TelegramSessionPayload = {
          apiId,
          apiHash,
          sessionString: finalSessionString,
          telegramUserId,
          telegramUsername,
          connectedAt: new Date().toISOString(),
        };

        const sessionToken = encryptSession(JSON.stringify(sessionData));

        return {
          success: true,
          authorized: true,
          telegramUserId,
          telegramUsername,
          sessionToken,
          message: 'Successfully authenticated via Telegram QR Code!',
        };
      }

      // Scenario 2: User scanned on mobile, Telegram requests Data Center Migration (DC Switch)
      if (result instanceof Api.auth.LoginTokenMigrateTo) {
        try {
          // Reconnect to user's assigned Data Center (e.g. DC 5 for Asia/Singapore)
          await (client as unknown as { _switchDC: (dc: number) => Promise<unknown> })._switchDC(result.dcId);

          // Import login token on the migrated DC to finalize authentication
          const migratedResult = await client.invoke(
            new Api.auth.ImportLoginToken({
              token: result.token,
            })
          );

          if (migratedResult instanceof Api.auth.LoginTokenSuccess) {
            let authorizedUser: Api.User | null = null;
            if (migratedResult.authorization instanceof Api.auth.Authorization && migratedResult.authorization.user) {
              authorizedUser = migratedResult.authorization.user as Api.User;
            }

            if (!authorizedUser) {
              const me = await client.getMe();
              if (me instanceof Api.User) {
                authorizedUser = me;
              }
            }

            const finalSessionString = ((client.session as unknown as StringSession).save() || '') as string;
            await client.disconnect().catch(() => {});
            qrStore.delete(qrId);

            const telegramUserId = authorizedUser ? String(authorizedUser.id) : 'tg_user';
            const telegramUsername = authorizedUser?.username || authorizedUser?.firstName || 'TelegramUser';

            const sessionData: TelegramSessionPayload = {
              apiId,
              apiHash,
              sessionString: finalSessionString,
              telegramUserId,
              telegramUsername,
              connectedAt: new Date().toISOString(),
            };

            const sessionToken = encryptSession(JSON.stringify(sessionData));

            return {
              success: true,
              authorized: true,
              telegramUserId,
              telegramUsername,
              sessionToken,
              message: 'Successfully authenticated via Telegram QR Code!',
            };
          }
        } catch (migErr: unknown) {
          const migErrMsg = migErr instanceof Error ? migErr.message : String(migErr);
          if (migErrMsg.includes('SESSION_PASSWORD_NEEDED')) {
            sessionEntry.needs2FA = true;
            if (password) {
              return await this.verifyQr2FAPassword(sessionEntry, qrId, password);
            }
            return {
              success: true,
              authorized: false,
              requires2FA: true,
              message: 'Mobile scanned successfully! Two-Step Verification (Cloud Password) required.',
            };
          }
          console.error('Error during Telegram QR DC Migration:', migErr);
          return { success: false, error: this.parseTelegramError(migErr) };
        }
      }

      // Scenario 3: Still waiting for scan on mobile
      return {
        success: true,
        authorized: false,
        message: 'Waiting for QR scan...',
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      if (errorMsg.includes('SESSION_PASSWORD_NEEDED')) {
        sessionEntry.needs2FA = true;
        if (password) {
          return await this.verifyQr2FAPassword(sessionEntry, qrId, password);
        }
        return {
          success: true,
          authorized: false,
          requires2FA: true,
          message: 'Mobile scanned successfully! Two-Step Verification (Cloud Password) required.',
        };
      }
      return { success: false, error: this.parseTelegramError(err) };
    }
  }

  /**
   * Helper to verify 2FA Cloud Password after QR scan
   */
  private static async verifyQr2FAPassword(
    sessionEntry: PendingQrSession,
    qrId: string,
    password: string
  ): Promise<TelegramAuthResponse> {
    const { client, apiId, apiHash } = sessionEntry;
    try {
      const passwordSrpResult = await client.invoke(new Api.account.GetPassword());
      const passwordSrpCheck = await computeCheck(passwordSrpResult, password);
      const res = await client.invoke(
        new Api.auth.CheckPassword({
          password: passwordSrpCheck,
        })
      );

      let authorizedUser: Api.User | null = null;
      if (res instanceof Api.auth.Authorization && res.user instanceof Api.User) {
        authorizedUser = res.user;
      } else {
        const me = await client.getMe();
        if (me instanceof Api.User) {
          authorizedUser = me;
        }
      }

      const finalSessionString = ((client.session as unknown as StringSession).save() || '') as string;
      await client.disconnect().catch(() => {});
      qrStore.delete(qrId);

      const telegramUserId = authorizedUser ? String(authorizedUser.id) : 'tg_user';
      const telegramUsername = authorizedUser?.username || authorizedUser?.firstName || 'TelegramUser';

      const sessionData: TelegramSessionPayload = {
        apiId,
        apiHash,
        sessionString: finalSessionString,
        telegramUserId,
        telegramUsername,
        connectedAt: new Date().toISOString(),
      };

      const sessionToken = encryptSession(JSON.stringify(sessionData));

      return {
        success: true,
        authorized: true,
        telegramUserId,
        telegramUsername,
        sessionToken,
        message: 'Successfully authenticated via Telegram QR Code and 2-Step Verification!',
      };
    } catch (err: unknown) {
      return {
        success: false,
        requires2FA: true,
        error: this.parseTelegramError(err) || 'Incorrect 2-Step Verification password.',
      };
    }
  }

  /**
   * Helper to parse and connect client from session token
   */
  private static async getConnectedClient(sessionToken: string): Promise<{
    client: TelegramClient;
    session: TelegramSessionPayload;
  }> {
    if (!sessionToken) {
      throw new Error('Telegram session token is missing. Please connect your Telegram account first.');
    }

    const decrypted = decryptSession(sessionToken);
    if (!decrypted) {
      throw new Error('Invalid or expired Telegram session token. Please reconnect.');
    }

    const session: TelegramSessionPayload = JSON.parse(decrypted);
    const client = this.createClient(session.sessionString, session.apiId, session.apiHash);
    await client.connect();

    return { client, session };
  }

  /**
   * Upload a file into the user's real Telegram Saved Messages ('me')
   */
  static async uploadToSavedMessages(params: {
    sessionToken: string;
    fileName: string;
    mimeType: string;
    fileBuffer: Buffer;
  }): Promise<TelegramUploadedFile> {
    const { sessionToken, fileName, mimeType, fileBuffer } = params;
    const { client } = await this.getConnectedClient(sessionToken);

    try {
      const customFile = new CustomFile(fileName, fileBuffer.length, '', fileBuffer);

      const uploadedFileHandle = await client.uploadFile({
        file: customFile,
        workers: 1,
      });

      const sentMessage = await client.sendFile('me', {
        file: uploadedFileHandle,
        caption: fileName,
        forceDocument: true,
      });

      await client.disconnect().catch(() => {});

      return {
        messageId: sentMessage.id,
        chatId: 'me',
        fileName,
        mimeType,
        fileSizeBytes: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Upload to Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Download a file from real Telegram Saved Messages ('me')
   */
  static async downloadFromSavedMessages(params: {
    sessionToken: string;
    messageId: number;
  }): Promise<{ fileBuffer: Buffer; fileName: string; mimeType: string } | null> {
    const { sessionToken, messageId } = params;
    const { client } = await this.getConnectedClient(sessionToken);

    try {
      const messages = await client.getMessages('me', {
        ids: [messageId],
      });

      if (!messages || messages.length === 0 || !messages[0]) {
        await client.disconnect().catch(() => {});
        return null;
      }

      const message = messages[0];
      const downloaded = await client.downloadMedia(message);

      await client.disconnect().catch(() => {});

      if (!downloaded) {
        return null;
      }

      const fileBuffer = Buffer.isBuffer(downloaded) ? downloaded : Buffer.from(downloaded);

      let resolvedName = 'telegram_download';
      let resolvedMime = 'application/octet-stream';

      if (message.media && 'document' in message.media && message.media.document) {
        const doc = message.media.document as Api.Document;
        resolvedMime = doc.mimeType || resolvedMime;
        if (doc.attributes) {
          for (const attr of doc.attributes) {
            if (attr instanceof Api.DocumentAttributeFilename) {
              resolvedName = attr.fileName;
              break;
            }
          }
        }
      }

      if (message.message && resolvedName === 'telegram_download') {
        resolvedName = message.message.split('\n')[0].trim();
      }

      return {
        fileBuffer,
        fileName: resolvedName,
        mimeType: resolvedMime,
      };
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Download from Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Delete a file message from real Telegram Saved Messages ('me')
   */
  static async deleteFromSavedMessages(params: {
    sessionToken: string;
    messageId: number;
  }): Promise<boolean> {
    const { sessionToken, messageId } = params;
    const { client } = await this.getConnectedClient(sessionToken);

    try {
      await client.deleteMessages('me', [messageId], {
        revoke: true,
      });
      await client.disconnect().catch(() => {});
      return true;
    } catch (err: unknown) {
      await client.disconnect().catch(() => {});
      console.error('Delete from Telegram failed:', err);
      return false;
    }
  }
}
