import { doc, getDoc, setDoc, updateDoc, increment, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import { generateShareToken, generateSalt, hashPasswordWithSalt, verifyPasswordHash } from './crypto-utils';
import type { ShareLinkDocument, PublicShareFileMetadata, VerifyShareResult, ShareAccessLevel } from './share-types';
import type { FileItem } from './types';

/**
 * Service to manage Google Drive-style Public Share Links
 */
export class ShareService {
  /**
   * Find existing active share link for a given file
   */
  static async getActiveShareForFile(fileId: string, ownerUid: string): Promise<ShareLinkDocument | null> {
    try {
      const sharesRef = collection(db, 'shares');
      const q = query(
        sharesRef,
        where('fileId', '==', fileId),
        where('ownerUid', '==', ownerUid),
        where('status', '==', 'active')
      );
      const snapshot = await getDocs(q);
      if (snapshot.empty) return null;
      return snapshot.docs[0].data() as ShareLinkDocument;
    } catch (err) {
      console.warn('Error fetching active share for file:', err);
      return null;
    }
  }

  /**
   * Create or update a share link for a file
   */
  static async createShareLink(params: {
    file: FileItem;
    ownerUid: string;
    ownerEmail: string;
    ownerDisplayName?: string;
    ownerSessionToken: string;
    accessLevel?: ShareAccessLevel;
    password?: string;
    expiresInDays?: number | null;
    allowDownload: boolean;
    existingToken?: string;
  }): Promise<{ shareToken: string; shareUrl: string; shareDoc: ShareLinkDocument }> {
    const {
      file,
      ownerUid,
      ownerEmail,
      ownerDisplayName,
      ownerSessionToken,
      accessLevel = 'viewer',
      password,
      expiresInDays,
      allowDownload,
      existingToken,
    } = params;

    const shareToken = existingToken || generateShareToken();

    let passwordHash: string | null = null;
    let passwordSalt: string | null = null;
    const hasPassword = Boolean(password && password.trim().length > 0);

    if (hasPassword && password) {
      passwordSalt = generateSalt();
      passwordHash = await hashPasswordWithSalt(password.trim(), passwordSalt);
    }

    let expiresAt: string | null = null;
    if (expiresInDays && expiresInDays > 0) {
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + expiresInDays);
      expiresAt = expiryDate.toISOString();
    }

    const now = new Date().toISOString();

    const shareDoc: ShareLinkDocument = {
      shareToken,
      fileId: file.id,
      folderId: file.parentFolderId,
      ownerUid,
      ownerEmail,
      ownerDisplayName: ownerDisplayName || ownerEmail.split('@')[0] || 'OneCloud User',
      telegramMessageId: file.telegramMessageId,
      telegramChatId: file.telegramChatId,
      ownerSessionToken,
      fileName: file.name,
      fileSizeBytes: file.fileSizeBytes,
      mimeType: file.mimeType,
      extension: file.extension,
      thumbnailUrl: file.thumbnailUrl,
      accessLevel,
      isPublic: true,
      hasPassword,
      passwordHash,
      passwordSalt,
      expiresAt,
      allowDownload,
      status: 'active',
      viewCount: 0,
      downloadCount: 0,
      createdAt: now,
      updatedAt: now,
    };

    // 1. Save to shares collection
    const shareRef = doc(db, 'shares', shareToken);
    await setDoc(shareRef, shareDoc, { merge: true });

    // 2. Mark file as shared in user's file record
    try {
      const fileRef = doc(db, `users/${ownerUid}/files`, file.id);
      await updateDoc(fileRef, {
        isShared: true,
        activeShareToken: shareToken,
        shareAccessLevel: accessLevel,
        updatedAt: now,
      });
    } catch (err) {
      console.warn('Could not update file record with share status:', err);
    }

    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const shareUrl = `${origin}/share/${shareToken}`;

    return { shareToken, shareUrl, shareDoc };
  }

  /**
   * Revoke an active share link
   */
  static async revokeShareLink(shareToken: string, fileId: string, ownerUid: string): Promise<boolean> {
    try {
      const now = new Date().toISOString();
      const shareRef = doc(db, 'shares', shareToken);
      await updateDoc(shareRef, {
        status: 'revoked',
        updatedAt: now,
      });

      // Update file document
      const fileRef = doc(db, `users/${ownerUid}/files`, fileId);
      await updateDoc(fileRef, {
        isShared: false,
        activeShareToken: null,
        shareAccessLevel: null,
        updatedAt: now,
      });

      return true;
    } catch (err) {
      console.error('Error revoking share link:', err);
      return false;
    }
  }

  /**
   * Verify share token for public preview
   */
  static async verifyShare(shareToken: string): Promise<VerifyShareResult> {
    try {
      const shareRef = doc(db, 'shares', shareToken);
      const snapshot = await getDoc(shareRef);

      if (!snapshot.exists()) {
        return {
          valid: false,
          error: 'This shared link does not exist or has been removed.',
          errorCode: 'NOT_FOUND',
        };
      }

      const data = snapshot.data() as ShareLinkDocument;

      if (data.status === 'revoked') {
        return {
          valid: false,
          error: 'This link has been revoked by the owner.',
          errorCode: 'REVOKED',
        };
      }

      // Check Expiration
      if (data.expiresAt) {
        const expiryTime = new Date(data.expiresAt).getTime();
        if (Date.now() > expiryTime) {
          // Auto-mark as expired in firestore
          try {
            await updateDoc(shareRef, { status: 'expired' });
          } catch {
            // ignore
          }
          return {
            valid: false,
            error: 'This share link has expired.',
            errorCode: 'EXPIRED',
          };
        }
      }

      const publicMeta: PublicShareFileMetadata = {
        shareToken: data.shareToken,
        fileId: data.fileId,
        fileName: data.fileName,
        fileSizeBytes: data.fileSizeBytes,
        mimeType: data.mimeType,
        extension: data.extension,
        thumbnailUrl: data.thumbnailUrl,
        accessLevel: data.accessLevel,
        allowDownload: data.allowDownload,
        expiresAt: data.expiresAt,
        hasPassword: data.hasPassword,
        ownerDisplayName: data.ownerDisplayName,
        viewCount: data.viewCount || 0,
        downloadCount: data.downloadCount || 0,
        createdAt: data.createdAt,
      };

      if (data.hasPassword) {
        return {
          valid: true,
          requiresPassword: true,
          file: publicMeta,
        };
      }

      // Increment view count asynchronously
      try {
        await updateDoc(shareRef, {
          viewCount: increment(1),
          lastViewedAt: new Date().toISOString(),
        });
      } catch {
        // ignore
      }

      return {
        valid: true,
        requiresPassword: false,
        file: publicMeta,
      };
    } catch (err) {
      console.error('Error verifying share token:', err);
      return {
        valid: false,
        error: 'Unable to load shared file. Please try again.',
        errorCode: 'NOT_FOUND',
      };
    }
  }

  /**
   * Verify password provided by guest
   */
  static async verifyPassword(shareToken: string, enteredPassword: string): Promise<boolean> {
    try {
      const shareRef = doc(db, 'shares', shareToken);
      const snapshot = await getDoc(shareRef);
      if (!snapshot.exists()) return false;

      const data = snapshot.data() as ShareLinkDocument;
      if (!data.hasPassword || !data.passwordHash || !data.passwordSalt) {
        return true; // no password required
      }

      const isMatch = await verifyPasswordHash(enteredPassword.trim(), data.passwordSalt, data.passwordHash);
      if (isMatch) {
        // Increment view count on unlock
        try {
          await updateDoc(shareRef, {
            viewCount: increment(1),
            lastViewedAt: new Date().toISOString(),
          });
        } catch {
          // ignore
        }
      }
      return isMatch;
    } catch (err) {
      console.error('Error verifying share password:', err);
      return false;
    }
  }

  /**
   * Increment download counter
   */
  static async recordDownload(shareToken: string): Promise<void> {
    try {
      const shareRef = doc(db, 'shares', shareToken);
      await updateDoc(shareRef, {
        downloadCount: increment(1),
      });
    } catch {
      // non-fatal
    }
  }
}
