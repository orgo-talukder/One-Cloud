import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { CustomFile } from 'telegram/client/uploads';
import { returnBigInt } from 'telegram/Helpers';
import { getFileInfo } from 'telegram/Utils';
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

interface PooledTelegramClient {
  client: TelegramClient;
  session: TelegramSessionPayload;
  connectPromise: Promise<TelegramClient> | null;
  lastUsedAt: number;
  idleTimer?: ReturnType<typeof setTimeout>;
}

interface CachedFileLocation {
  location: Api.TypeInputFileLocation;
  dcId?: number;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  media: Api.TypeMessageMedia;
  cachedAt: number;
}

const CLIENT_IDLE_TTL_MS = 90_000; // Keep MTProto connection warm for 90s across parallel chunks
const FILE_LOCATION_TTL_MS = 5 * 60_000; // Cache file location for 5 minutes across parallel download chunks

const globalForQr = globalThis as unknown as {
  qrSessions?: Map<string, PendingQrSession>;
  tgClientPool?: Map<string, PooledTelegramClient>;
  tgFileLocationCache?: Map<string, CachedFileLocation>;
};

if (!globalForQr.qrSessions) {
  globalForQr.qrSessions = new Map<string, PendingQrSession>();
}
if (!globalForQr.tgClientPool) {
  globalForQr.tgClientPool = new Map<string, PooledTelegramClient>();
}
if (!globalForQr.tgFileLocationCache) {
  globalForQr.tgFileLocationCache = new Map<string, CachedFileLocation>();
}

const qrStore = globalForQr.qrSessions;
const clientPool = globalForQr.tgClientPool;
const fileLocationCache = globalForQr.tgFileLocationCache;

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
   * Helper to get or reuse a warm connected TelegramClient from the keep-alive pool.
   * Prevents 2-3s TCP+MTProto handshake overhead on every parallel chunk and ensures
   * concurrent workers never disconnect each other mid-upload.
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
    const poolKey = `${session.apiId}:${session.sessionString.slice(-32)}`;

    const scheduleIdleCleanup = (entry: PooledTelegramClient) => {
      if (entry.idleTimer) {
        clearTimeout(entry.idleTimer);
      }
      entry.idleTimer = setTimeout(() => {
        const current = clientPool.get(poolKey);
        if (current && Date.now() - current.lastUsedAt >= CLIENT_IDLE_TTL_MS - 1000) {
          clientPool.delete(poolKey);
          current.client.disconnect().catch(() => {});
        }
      }, CLIENT_IDLE_TTL_MS);
    };

    const existing = clientPool.get(poolKey);
    if (existing) {
      existing.lastUsedAt = Date.now();
      scheduleIdleCleanup(existing);

      if (existing.connectPromise) {
        await existing.connectPromise;
      }

      if (existing.client.connected) {
        return { client: existing.client, session: existing.session };
      }

      // Reconnect if socket dropped
      existing.connectPromise = existing.client.connect().then(() => existing.client);
      try {
        await existing.connectPromise;
        existing.connectPromise = null;
        return { client: existing.client, session: existing.session };
      } catch (err) {
        clientPool.delete(poolKey);
        throw err;
      }
    }

    const client = this.createClient(session.sessionString, session.apiId, session.apiHash);
    const connectPromise = client.connect().then(() => client);

    const newEntry: PooledTelegramClient = {
      client,
      session,
      connectPromise,
      lastUsedAt: Date.now(),
    };
    clientPool.set(poolKey, newEntry);
    scheduleIdleCleanup(newEntry);

    try {
      await connectPromise;
      newEntry.connectPromise = null;
      return { client, session };
    } catch (err) {
      if (newEntry.idleTimer) clearTimeout(newEntry.idleTimer);
      clientPool.delete(poolKey);
      throw err;
    }
  }

  /**
   * Helper to invoke an MTProto request with automatic per-part retry on transient errors
   */
  private static async invokeWithRetry<T>(
    client: TelegramClient,
    requestFactory: () => Api.AnyRequest,
    maxAttempts = 3
  ): Promise<T> {
    let attempt = 0;
    let lastErr: unknown = null;

    while (attempt < maxAttempts) {
      try {
        if (!client.connected) {
          await client.connect();
        }
        return (await client.invoke(requestFactory())) as T;
      } catch (err: unknown) {
        lastErr = err;
        attempt++;
        const msg = err instanceof Error ? err.message : String(err);

        // Respect Telegram FLOOD_WAIT if present
        if (msg.includes('FLOOD_WAIT_')) {
          const waitSec = Number(msg.split('FLOOD_WAIT_')[1]?.split(/[^0-9]/)[0] || 2);
          if (waitSec <= 15 && attempt < maxAttempts) {
            await new Promise((r) => setTimeout(r, waitSec * 1000 + 250));
            continue;
          }
        }

        if (attempt < maxAttempts) {
          await new Promise((r) => setTimeout(r, 400 * attempt));
        }
      }
    }

    throw lastErr;
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
        workers: 4,
      });

      const sentMessage = await client.sendFile('me', {
        file: uploadedFileHandle,
        caption: fileName,
        forceDocument: true,
      });

      return {
        messageId: sentMessage.id,
        chatId: 'me',
        fileName,
        mimeType,
        fileSizeBytes: fileBuffer.length,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      console.error('Upload to Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Upload a high-speed MTProto-aligned chunk (up to 8 × 512KB = 4.2MB) to Telegram.
   * Uses 4x sub-part concurrency (Promise.all) and warm connection pooling.
   */
  static async uploadChunkToSavedMessages(params: {
    sessionToken: string;
    telegramFileId: string;
    fileName: string;
    mimeType: string;
    totalSize: number;
    totalParts: number;
    partOffset: number;
    chunkBuffer: Buffer;
    isLastChunk: boolean;
  }): Promise<{
    completed: boolean;
    uploadedParts: number;
    uploaded?: TelegramUploadedFile;
  }> {
    const {
      sessionToken,
      telegramFileId,
      fileName,
      mimeType,
      totalSize,
      totalParts,
      partOffset,
      chunkBuffer,
      isLastChunk,
    } = params;

    const { client } = await this.getConnectedClient(sessionToken);
    const PART_SIZE = 512 * 1024; // 524,288 bytes (MTProto max part size)
    const SUB_PART_CONCURRENCY = 8; // 8x Sub-Part Burst: send all 8 × 512KB parts (4.2MB) simultaneously in 1 batch
    const isLarge = totalSize > 10 * 1024 * 1024;
    const fileIdBigInt = returnBigInt(telegramFileId);

    try {
      const numSubParts = Math.max(1, Math.ceil(chunkBuffer.length / PART_SIZE));

      // Dispatch 512KB sub-parts in parallel bursts of up to 8
      for (let batchStart = 0; batchStart < numSubParts; batchStart += SUB_PART_CONCURRENCY) {
        const batchEnd = Math.min(batchStart + SUB_PART_CONCURRENCY, numSubParts);
        const batchPromises: Promise<unknown>[] = [];

        for (let i = batchStart; i < batchEnd; i++) {
          const start = i * PART_SIZE;
          const end = Math.min(start + PART_SIZE, chunkBuffer.length);
          const partBytes = Buffer.from(chunkBuffer.subarray(start, end));
          const currentPartIndex = partOffset + i;

          if (isLarge) {
            batchPromises.push(
              this.invokeWithRetry(client, () =>
                new Api.upload.SaveBigFilePart({
                  fileId: fileIdBigInt,
                  filePart: currentPartIndex,
                  fileTotalParts: totalParts,
                  bytes: partBytes,
                })
              )
            );
          } else {
            batchPromises.push(
              this.invokeWithRetry(client, () =>
                new Api.upload.SaveFilePart({
                  fileId: fileIdBigInt,
                  filePart: currentPartIndex,
                  bytes: partBytes,
                })
              )
            );
          }
        }

        await Promise.all(batchPromises);
      }

      if (!isLastChunk) {
        return {
          completed: false,
          uploadedParts: partOffset + numSubParts,
        };
      }

      // If sequential mode explicitly requested finalization on last chunk:
      const uploaded = await this.commitChunkedUploadToSavedMessages({
        sessionToken,
        telegramFileId,
        fileName,
        mimeType,
        totalSize,
        totalParts,
      });

      return {
        completed: true,
        uploadedParts: totalParts,
        uploaded,
      };
    } catch (err: unknown) {
      console.error('Chunked upload to Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Phase 2 of Parallel Upload: Commits all uploaded MTProto file parts as a document in Saved Messages ('me').
   */
  static async commitChunkedUploadToSavedMessages(params: {
    sessionToken: string;
    telegramFileId: string;
    fileName: string;
    mimeType: string;
    totalSize: number;
    totalParts: number;
  }): Promise<TelegramUploadedFile> {
    const { sessionToken, telegramFileId, fileName, mimeType, totalSize, totalParts } = params;
    const { client } = await this.getConnectedClient(sessionToken);
    const isLarge = totalSize > 10 * 1024 * 1024;
    const fileIdBigInt = returnBigInt(telegramFileId);

    try {
      const inputFile = isLarge
        ? new Api.InputFileBig({
            id: fileIdBigInt,
            parts: totalParts,
            name: fileName,
          })
        : new Api.InputFile({
            id: fileIdBigInt,
            parts: totalParts,
            name: fileName,
            md5Checksum: '',
          });

      const sentMessage = await client.sendFile('me', {
        file: inputFile,
        caption: fileName,
        forceDocument: true,
      });

      return {
        messageId: sentMessage.id,
        chatId: 'me',
        fileName,
        mimeType,
        fileSizeBytes: totalSize,
        uploadedAt: new Date().toISOString(),
      };
    } catch (err: unknown) {
      console.error('Commit chunked upload to Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Resolves and caches Telegram message media location & metadata so parallel download chunks
   * don't repeat getMessages('me') calls on every chunk.
   */
  private static async resolveFileLocation(
    client: TelegramClient,
    session: TelegramSessionPayload,
    messageId: number,
    forceRefresh = false
  ): Promise<CachedFileLocation | null> {
    const cacheKey = `${session.apiId}:${session.sessionString.slice(-24)}:${messageId}`;
    const existing = fileLocationCache.get(cacheKey);

    if (!forceRefresh && existing && Date.now() - existing.cachedAt < FILE_LOCATION_TTL_MS) {
      return existing;
    }

    const messages = await client.getMessages('me', {
      ids: [messageId],
    });

    if (!messages || messages.length === 0 || !messages[0] || !messages[0].media) {
      return null;
    }

    const message = messages[0];
    const media = message.media!;
    let resolvedName = 'telegram_download';
    let resolvedMime = 'application/octet-stream';
    let resolvedSize = 0;

    let location: Api.TypeInputFileLocation | null = null;
    let dcId: number | undefined = undefined;

    if ('document' in media && media.document && media.document instanceof Api.Document) {
      const doc = media.document;
      resolvedMime = doc.mimeType || resolvedMime;
      resolvedSize = Number(doc.size?.toString() || 0);
      dcId = doc.dcId;
      if (doc.attributes) {
        for (const attr of doc.attributes) {
          if (attr instanceof Api.DocumentAttributeFilename) {
            resolvedName = attr.fileName;
            break;
          }
        }
      }
      location = new Api.InputDocumentFileLocation({
        id: doc.id,
        accessHash: doc.accessHash,
        fileReference: doc.fileReference,
        thumbSize: '',
      });
    } else if ('photo' in media && media.photo && media.photo instanceof Api.Photo) {
      const photo = media.photo;
      dcId = photo.dcId;
      resolvedMime = 'image/jpeg';
      const sizes = photo.sizes || [];
      const largestSize = sizes[sizes.length - 1];
      const thumbType = largestSize && 'type' in largestSize ? (largestSize as any).type || '' : '';
      location = new Api.InputPhotoFileLocation({
        id: photo.id,
        accessHash: photo.accessHash,
        fileReference: photo.fileReference,
        thumbSize: thumbType,
      });
      if (largestSize && 'size' in largestSize && largestSize.size) {
        resolvedSize = Number(largestSize.size.toString());
      }
    } else {
      try {
        const info = getFileInfo(media as any);
        location = info.location;
        dcId = info.dcId;
        if (!resolvedSize && info.size) {
          resolvedSize = Number(info.size.toString());
        }
      } catch (e) {
        console.warn('Fallback getFileInfo on media notice:', e);
      }
    }

    if (message.message && (resolvedName === 'telegram_download' || !resolvedName)) {
      resolvedName = message.message.split('\n')[0].trim();
    }

    if (!location) {
      return null;
    }

    const entry: CachedFileLocation = {
      location,
      dcId,
      fileName: resolvedName,
      mimeType: resolvedMime,
      fileSizeBytes: resolvedSize,
      media,
      cachedAt: Date.now(),
    };

    fileLocationCache.set(cacheKey, entry);
    return entry;
  }

  /**
   * High-Speed Parallel Chunk Download: Downloads a specific byte range [offset, offset + limit)
   * from Telegram Saved Messages by fetching 512KB MTProto parts concurrently with Promise.all.
   */
  static async downloadChunkFromSavedMessages(params: {
    sessionToken: string;
    messageId: number;
    offset: number;
    limit: number;
  }): Promise<{
    chunkBuffer: Buffer;
    fileName: string;
    mimeType: string;
    totalSize: number;
  } | null> {
    const { sessionToken, messageId, offset, limit } = params;
    const { client, session } = await this.getConnectedClient(sessionToken);

    let fileMeta = await this.resolveFileLocation(client, session, messageId, false);
    if (!fileMeta) {
      return null;
    }

    const PART_SIZE = 512 * 1024; // 524,288 bytes (MTProto max GetFile limit)
    const totalSize = fileMeta.fileSizeBytes;
    const safeOffset = Math.max(0, offset - (offset % PART_SIZE));
    const maxRemaining = totalSize > 0 ? Math.max(0, totalSize - safeOffset) : limit;
    const targetBytes = Math.min(limit, maxRemaining || limit);

    if (targetBytes <= 0) {
      return {
        chunkBuffer: Buffer.alloc(0),
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
        totalSize,
      };
    }

    const numParts = Math.max(1, Math.ceil(targetBytes / PART_SIZE));

    const fetchPartBuffer = async (partIndex: number, retryRef = true): Promise<Buffer> => {
      const partOffset = safeOffset + partIndex * PART_SIZE;
      try {
        const res = await this.invokeWithRetry<Api.upload.TypeFile>(client, () =>
          new Api.upload.GetFile({
            location: fileMeta!.location,
            offset: returnBigInt(partOffset),
            limit: PART_SIZE,
          })
        );

        if (res && 'bytes' in res && res.bytes) {
          return Buffer.isBuffer(res.bytes) ? res.bytes : Buffer.from(res.bytes);
        }
        return Buffer.alloc(0);
      } catch (err: unknown) {
        const msg = err instanceof Error ? err.message : String(err);
        if (
          retryRef &&
          (msg.includes('FILE_REFERENCE') || msg.includes('FILEREF_UPGRADE_NEEDED'))
        ) {
          const refreshed = await this.resolveFileLocation(client, session, messageId, true);
          if (refreshed) {
            fileMeta = refreshed;
            return fetchPartBuffer(partIndex, false);
          }
        }
        throw err;
      }
    };

    try {
      // Fetch all 512KB parts in this chunk concurrently (up to 8 × 512KB = 4MB in parallel)
      const partPromises: Promise<Buffer>[] = [];
      for (let i = 0; i < numParts; i++) {
        partPromises.push(fetchPartBuffer(i));
      }

      const partBuffers = await Promise.all(partPromises);
      const combined = Buffer.concat(partBuffers);
      const chunkBuffer =
        combined.length > targetBytes ? combined.subarray(0, targetBytes) : combined;

      return {
        chunkBuffer,
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
        totalSize,
      };
    } catch (err: unknown) {
      console.error('Parallel chunk download from Telegram failed:', err);
      throw new Error(this.parseTelegramError(err));
    }
  }

  /**
   * Zero-Wait Web ReadableStream Download: Streams 512KB chunks directly from Telegram
   * to the HTTP response without buffering the entire file in serverless RAM.
   */
  static async streamFromSavedMessages(params: {
    sessionToken: string;
    messageId: number;
    startByte?: number;
    endByte?: number;
  }): Promise<{
    stream: ReadableStream<Uint8Array>;
    fileName: string;
    mimeType: string;
    fileSizeBytes: number;
    contentRange?: string;
    contentLength?: number;
    isPartial?: boolean;
  } | null> {
    const { sessionToken, messageId, startByte, endByte } = params;
    const { client, session } = await this.getConnectedClient(sessionToken);

    const fileMeta = await this.resolveFileLocation(client, session, messageId, false);
    if (!fileMeta) {
      return null;
    }

    const totalSize = fileMeta.fileSizeBytes;
    const isRange = startByte !== undefined && startByte !== null;
    const start = Math.max(0, startByte || 0);
    const end =
      endByte !== undefined && endByte !== null
        ? Math.min(totalSize > 0 ? totalSize - 1 : endByte, endByte)
        : totalSize > 0
        ? totalSize - 1
        : undefined;

    const contentLength =
      end !== undefined && end >= start
        ? end - start + 1
        : totalSize > 0
        ? totalSize
        : undefined;

    const iter = client.iterDownload({
      file: fileMeta.location,
      dcId: fileMeta.dcId,
      fileSize: returnBigInt(totalSize || 0),
      offset: returnBigInt(start),
      requestSize: 512 * 1024,
    })[Symbol.asyncIterator]();

    let bytesStreamed = 0;
    const maxToStream = contentLength !== undefined ? contentLength : Infinity;

    const stream = new ReadableStream<Uint8Array>({
      async pull(controller) {
        try {
          if (bytesStreamed >= maxToStream) {
            controller.close();
            return;
          }
          const { value, done } = await iter.next();
          if (done || !value) {
            controller.close();
            return;
          }
          let chunk = value instanceof Uint8Array ? value : new Uint8Array(value);
          if (bytesStreamed + chunk.byteLength > maxToStream) {
            chunk = chunk.subarray(0, maxToStream - bytesStreamed);
          }
          bytesStreamed += chunk.byteLength;
          controller.enqueue(chunk);
          if (bytesStreamed >= maxToStream) {
            controller.close();
          }
        } catch (err) {
          controller.error(err);
        }
      },
    });

    return {
      stream,
      fileName: fileMeta.fileName,
      mimeType: fileMeta.mimeType,
      fileSizeBytes: totalSize,
      contentLength,
      contentRange:
        isRange && totalSize > 0 && end !== undefined
          ? `bytes ${start}-${end}/${totalSize}`
          : undefined,
      isPartial: isRange,
    };
  }

  /**
   * Download a file from real Telegram Saved Messages ('me')
   */
  static async downloadFromSavedMessages(params: {
    sessionToken: string;
    messageId: number;
  }): Promise<{ fileBuffer: Buffer; fileName: string; mimeType: string } | null> {
    const { sessionToken, messageId } = params;
    const { client, session } = await this.getConnectedClient(sessionToken);

    try {
      const fileMeta = await this.resolveFileLocation(client, session, messageId, false);
      if (!fileMeta) {
        return null;
      }

      const downloaded = await client.downloadMedia(fileMeta.media);
      if (!downloaded) {
        return null;
      }

      const fileBuffer = Buffer.isBuffer(downloaded) ? downloaded : Buffer.from(downloaded);

      return {
        fileBuffer,
        fileName: fileMeta.fileName,
        mimeType: fileMeta.mimeType,
      };
    } catch (err: unknown) {
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
      return true;
    } catch (err: unknown) {
      console.error('Delete from Telegram failed:', err);
      return false;
    }
  }
}
