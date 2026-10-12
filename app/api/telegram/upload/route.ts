import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const mode = (formData.get('mode') as string) || 'single';
    const sessionToken = (formData.get('sessionToken') as string) || '';
    const parentFolderId = (formData.get('parentFolderId') as string) || null;

    if (!sessionToken) {
      return NextResponse.json(
        {
          success: false,
          error: 'Telegram is not connected. Please connect your Telegram account first.',
        },
        { status: 401 }
      );
    }

    // Mode 1: Chunked MTProto upload (each chunk <= 2 MB, safe for Vercel 4.5 MB limit)
    if (mode === 'chunk') {
      const chunk = formData.get('chunk') as File | Blob | null;
      const telegramFileId = (formData.get('telegramFileId') as string) || '';
      const fileName = (formData.get('fileName') as string) || 'unnamed_file';
      const mimeType = (formData.get('mimeType') as string) || 'application/octet-stream';
      const totalSize = Number(formData.get('totalSize') || 0);
      const totalParts = Number(formData.get('totalParts') || 1);
      const partOffset = Number(formData.get('partOffset') || 0);
      const isLastChunk = formData.get('isLastChunk') === 'true';

      if (!chunk || !telegramFileId) {
        return NextResponse.json(
          { success: false, error: 'Missing file chunk or Telegram file identifier.' },
          { status: 400 }
        );
      }

      const arrayBuffer = await chunk.arrayBuffer();
      const chunkBuffer = Buffer.from(arrayBuffer);

      const chunkResult = await TelegramService.uploadChunkToSavedMessages({
        sessionToken,
        telegramFileId,
        fileName,
        mimeType,
        totalSize,
        totalParts,
        partOffset,
        chunkBuffer,
        isLastChunk,
      });

      if (!chunkResult.completed || !chunkResult.uploaded) {
        return NextResponse.json({
          success: true,
          completed: false,
          uploadedParts: chunkResult.uploadedParts,
        });
      }

      const uploaded = chunkResult.uploaded;
      const fileId = 'file_' + uploaded.messageId + '_' + Date.now();
      const extension = fileName.includes('.') ? fileName.split('.').pop() || '' : '';

      return NextResponse.json({
        success: true,
        completed: true,
        file: {
          id: fileId,
          name: fileName,
          normalizedName: fileName.toLowerCase(),
          mimeType,
          extension,
          fileSizeBytes: uploaded.fileSizeBytes,
          parentFolderId: parentFolderId || null,
          isStarred: false,
          status: 'active',
          telegramChatId: uploaded.chatId,
          telegramMessageId: uploaded.messageId,
          uploadedAt: uploaded.uploadedAt,
          updatedAt: uploaded.uploadedAt,
        },
      });
    }

    // Mode 2: Fast single-request upload for small files (<= 2 MB)
    const file = formData.get('file') as File | null;
    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const uploaded = await TelegramService.uploadToSavedMessages({
      sessionToken,
      fileName: file.name,
      mimeType: file.type || 'application/octet-stream',
      fileBuffer: buffer,
    });

    const fileId = 'file_' + uploaded.messageId + '_' + Date.now();
    const extension = file.name.includes('.') ? file.name.split('.').pop() || '' : '';

    return NextResponse.json({
      success: true,
      completed: true,
      file: {
        id: fileId,
        name: file.name,
        normalizedName: file.name.toLowerCase(),
        mimeType: file.type || 'application/octet-stream',
        extension: extension,
        fileSizeBytes: uploaded.fileSizeBytes,
        parentFolderId: parentFolderId || null,
        isStarred: false,
        status: 'active',
        telegramChatId: uploaded.chatId,
        telegramMessageId: uploaded.messageId,
        uploadedAt: uploaded.uploadedAt,
        updatedAt: uploaded.uploadedAt,
      },
    });
  } catch (err: unknown) {
    console.error('Upload route error:', err);
    const msg = err instanceof Error ? err.message : 'Failed to process file upload to Telegram.';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
