import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';
import { doc, getDoc, updateDoc, increment } from 'firebase/firestore';
import { db } from '@/lib/firebase/client';
import type { ShareLinkDocument } from '@/lib/drive/share-types';
import { verifyPasswordHash } from '@/lib/drive/crypto-utils';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ shareToken: string }> }
) {
  try {
    const { shareToken } = await params;
    const url = new URL(req.url);
    const downloadParam = url.searchParams.get('download') === 'true';
    const passwordParam = url.searchParams.get('pwd') || req.headers.get('x-share-password') || '';

    if (!shareToken) {
      return NextResponse.json(
        { success: false, error: 'Share token is required.' },
        { status: 400 }
      );
    }

    // 1. Fetch share document from Firestore
    const shareRef = doc(db, 'shares', shareToken);
    const snapshot = await getDoc(shareRef);

    if (!snapshot.exists()) {
      return NextResponse.json(
        { success: false, error: 'Shared file not found or invalid link.' },
        { status: 404 }
      );
    }

    const shareData = snapshot.data() as ShareLinkDocument;

    // 2. Validate Status
    if (shareData.status === 'revoked') {
      return NextResponse.json(
        { success: false, error: 'This share link has been revoked by the owner.' },
        { status: 403 }
      );
    }

    // 3. Validate Expiration
    if (shareData.expiresAt) {
      const expiryTime = new Date(shareData.expiresAt).getTime();
      if (Date.now() > expiryTime) {
        return NextResponse.json(
          { success: false, error: 'This share link has expired.' },
          { status: 410 }
        );
      }
    }

    // 4. Validate Password Shield
    if (shareData.hasPassword && shareData.passwordHash && shareData.passwordSalt) {
      if (!passwordParam) {
        return NextResponse.json(
          { success: false, error: 'Password required to access this file.', code: 'PASSWORD_REQUIRED' },
          { status: 401 }
        );
      }

      const isPasswordValid = await verifyPasswordHash(
        passwordParam.trim(),
        shareData.passwordSalt,
        shareData.passwordHash
      );

      if (!isPasswordValid) {
        return NextResponse.json(
          { success: false, error: 'Incorrect password provided.', code: 'INVALID_PASSWORD' },
          { status: 403 }
        );
      }
    }

    // 5. Check Download Permissions
    const canDownload = shareData.allowDownload && downloadParam;

    // 6. Support Byte-Range Streaming (essential for video/audio seek & IDM)
    const rangeHeader = req.headers.get('range');
    let startByte: number | undefined = undefined;
    let endByte: number | undefined = undefined;

    if (rangeHeader) {
      const match = rangeHeader.match(/bytes=(\d+)-(\d+)?/);
      if (match) {
        startByte = parseInt(match[1], 10);
        if (match[2]) {
          endByte = parseInt(match[2], 10);
        }
      }
    }

    // 7. Securely Stream directly from Telegram without exposing session
    const streamResult = await TelegramService.streamFromSavedMessages({
      sessionToken: shareData.ownerSessionToken,
      messageId: shareData.telegramMessageId,
      startByte,
      endByte,
    });

    if (!streamResult) {
      return NextResponse.json(
        { success: false, error: 'File content could not be retrieved from secure storage.' },
        { status: 404 }
      );
    }

    // 8. Increment metric counts
    try {
      if (canDownload) {
        await updateDoc(shareRef, { downloadCount: increment(1) });
      } else if (!startByte || startByte === 0) {
        await updateDoc(shareRef, { viewCount: increment(1), lastViewedAt: new Date().toISOString() });
      }
    } catch {
      // Non-blocking metric tracking
    }

    // 9. Format response headers
    const safeFilename = encodeURIComponent(shareData.fileName);
    const dispositionType = canDownload ? 'attachment' : 'inline';

    const headers: Record<string, string> = {
      'Content-Type': streamResult.mimeType || shareData.mimeType || 'application/octet-stream',
      'Content-Disposition': `${dispositionType}; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'public, max-age=1800',
    };

    if (streamResult.contentLength !== undefined) {
      headers['Content-Length'] = streamResult.contentLength.toString();
    } else if (streamResult.fileSizeBytes > 0 && !streamResult.isPartial) {
      headers['Content-Length'] = streamResult.fileSizeBytes.toString();
    }

    if (streamResult.contentRange) {
      headers['Content-Range'] = streamResult.contentRange;
    }

    const status = streamResult.isPartial ? 206 : 200;

    return new NextResponse(streamResult.stream, {
      status,
      headers,
    });
  } catch (err: unknown) {
    console.error('Share stream error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to stream shared file.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
