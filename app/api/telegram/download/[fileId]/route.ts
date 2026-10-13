import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const url = new URL(req.url);
    const messageId = parseInt(url.searchParams.get('messageId') || '0', 10);
    const sessionToken =
      url.searchParams.get('sessionToken') || req.headers.get('x-session-token') || '';
    const offsetParam = url.searchParams.get('offset');
    const limitParam = url.searchParams.get('limit');

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Valid Telegram messageId is required.' },
        { status: 400 }
      );
    }

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Telegram session token is required to download.' },
        { status: 401 }
      );
    }

    // Mode 1: High-Speed Parallel Chunk Download (?offset=X&limit=Y)
    if (offsetParam !== null && limitParam !== null) {
      const offset = Math.max(0, parseInt(offsetParam, 10) || 0);
      const limit = Math.min(4 * 1024 * 1024, Math.max(512 * 1024, parseInt(limitParam, 10) || 4 * 1024 * 1024));

      const chunkResult = await TelegramService.downloadChunkFromSavedMessages({
        sessionToken,
        messageId,
        offset,
        limit,
      });

      if (!chunkResult) {
        return NextResponse.json(
          { success: false, error: `File not found in Telegram Saved Messages (ID: ${fileId}).` },
          { status: 404 }
        );
      }

      const safeFilename = encodeURIComponent(chunkResult.fileName);

      return new NextResponse(new Uint8Array(chunkResult.chunkBuffer), {
        status: 200,
        headers: {
          'Content-Type': 'application/octet-stream',
          'Content-Length': chunkResult.chunkBuffer.length.toString(),
          'X-Total-Size': chunkResult.totalSize.toString(),
          'X-File-Name': safeFilename,
          'X-Mime-Type': chunkResult.mimeType || 'application/octet-stream',
          'Cache-Control': 'private, max-age=300',
        },
      });
    }

    // Mode 2: Zero-Wait Direct HTTP ReadableStream (for IDM, browser download, and video streaming)
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

    const streamResult = await TelegramService.streamFromSavedMessages({
      sessionToken,
      messageId,
      startByte,
      endByte,
    });

    if (!streamResult) {
      return NextResponse.json(
        { success: false, error: `File not found in Telegram Saved Messages (ID: ${fileId}).` },
        { status: 404 }
      );
    }

    const safeFilename = encodeURIComponent(streamResult.fileName);
    const headers: Record<string, string> = {
      'Content-Type': streamResult.mimeType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${safeFilename}"; filename*=UTF-8''${safeFilename}`,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'private, no-transform, max-age=3600',
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
    console.error('Download route error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to download file from Telegram.';
    return NextResponse.json(
      { success: false, error: msg },
      { status: 500 }
    );
  }
}
