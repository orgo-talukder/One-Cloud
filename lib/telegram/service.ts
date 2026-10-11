import { TelegramClient, Api } from 'telegram';
import { StringSession } from 'telegram/sessions';
import { CustomFile } from 'telegram/client/uploads';
import { computeCheck } from 'telegram/Password';
import { encryptSession, decryptSession } from './crypto';
import type { TelegramUploadedFile, TelegramSessionPayload, TelegramAuthResponse } from './types';

export class TelegramService {
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
      return 'The provided Telegram API ID or API Hash is invalid. Please verify them on my.telegram.org.';
    }
    if (msg.includes('PHONE_CODE_INVALID')) {
      return 'The Telegram verification code entered is incorrect. Please recheck your Telegram app.';
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
    return msg || 'An unknown error occurred during Telegram communication.';
  }

  /**
   * Request a real authentication code from Telegram via MTProto
   */
  static async sendAuthCode(params: {
    phone: string;
    apiId: string | number;
    apiHash: string;
  }): Promise<TelegramAuthResponse> {
    const { phone, apiHash } = params;
    const numApiId = Number(params.apiId);

    if (!phone || !phone.trim()) {
      return { success: false, error: 'Phone number is required.' };
    }
    if (!numApiId || isNaN(numApiId)) {
      return { success: false, error: 'Valid numeric Telegram API ID is required.' };
    }
    if (!apiHash || !apiHash.trim()) {
      return { success: false, error: 'Telegram API Hash is required.' };
    }

    const client = this.createClient('', numApiId, apiHash.trim());

    try {
      await client.connect();

      const sendResult = await client.sendCode(
        {
          apiId: numApiId,
          apiHash: apiHash.trim(),
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
    apiId: string | number;
    apiHash: string;
    pendingSession?: string;
  }): Promise<TelegramAuthResponse> {
    const { phone, code, password, phoneCodeHash, apiHash, pendingSession } = params;
    const numApiId = Number(params.apiId);

    if (!code || !code.trim()) {
      return { success: false, error: 'Verification code is required.' };
    }
    if (!numApiId || isNaN(numApiId) || !apiHash) {
      return { success: false, error: 'Telegram API ID and API Hash are required.' };
    }

    const client = this.createClient(pendingSession || '', numApiId, apiHash.trim());

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
              error: 'Your Telegram account has 2-Step Verification (Cloud Password) enabled. Please enter your password.',
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

      // If user wasn't returned directly, fetch through getMe()
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
        apiId: numApiId,
        apiHash: apiHash.trim(),
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
      // Wrap file buffer in CustomFile
      const customFile = new CustomFile(fileName, fileBuffer.length, '', fileBuffer);

      // Upload file chunks to Telegram DC
      const uploadedFileHandle = await client.uploadFile({
        file: customFile,
        workers: 1,
      });

      // Send document to personal 'me' (Saved Messages)
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

      // Extract filename from message document attributes if available
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
