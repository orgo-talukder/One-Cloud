import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  try {
    const { fileId } = await params;
    const url = new URL(req.url);
    const messageId = parseInt(url.searchParams.get('messageId') || '0', 10);
    const sessionToken = url.searchParams.get('sessionToken') || '';

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Valid Telegram messageId is required.' },
        { status: 400 }
      );
    }

    const result = await TelegramService.downloadFromSavedMessages({
      sessionToken,
      messageId,
    });

    if (!result) {
      return NextResponse.json(
        { success: false, error: 'File not found in Telegram Saved Messages.' },
        { status: 404 }
      );
    }

    const safeFilename = encodeURIComponent(result.fileName);

    return new NextResponse(new Uint8Array(result.fileBuffer), {
      status: 200,
      headers: {
        'Content-Type': result.mimeType || 'application/octet-stream',
        'Content-Disposition': `attachment; filename="${result.fileName}"; filename*=UTF-8''${safeFilename}`,
        'Content-Length': result.fileBuffer.length.toString(),
      },
    });
  } catch (err: unknown) {
    console.error('Download route error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to download file from Telegram.' },
      { status: 500 }
    );
  }
}
