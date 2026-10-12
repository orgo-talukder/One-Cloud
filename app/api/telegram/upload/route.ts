import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';
export const maxDuration = 60;

export async function POST(req: NextRequest) {
  try {
    const contentType = req.headers.get('content-type') || '';

    // Fast Path 1: Raw binary chunk stream (zero multipart/form-data body overhead)
    if (contentType.includes('application/octet-stream')) {
      const sessionToken = req.headers.get('x-session-token') || '';
      const telegramFileId = req.headers.get('x-telegram-file-id') || '';
      const fileName = decodeURIComponent(req.headers.get('x-file-name') || 'unnamed_file');
      const mimeType = req.headers.get('x-mime-type') || 'application/octet-stream';
      const totalSize = Number(req.headers.get('x-total-size') || 0);
      const totalParts = Number(req.headers.get('x-total-parts') || 1);
      const partOffset = Number(req.headers.get('x-part-offset') || 0);
      const isLastChunk = req.headers.get('x-is-last-chunk') === 'true';
      const parentFolderId = req.headers.get('x-parent-folder-id') || null;

      if (!sessionToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Telegram is not connected. Please connect your Telegram account first.',
          },
          { status: 401 }
        );
      }

      const arrayBuffer = await req.arrayBuffer();
      const chunkBuffer = Buffer.from(arrayBuffer);

      if (!chunkBuffer.length || !telegramFileId) {
        return NextResponse.json(
          { success: false, error: 'Missing binary chunk or Telegram file identifier.' },
          { status: 400 }
        );
      }

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

    // Fast Path 2: JSON payload for Phase 2 ('commit') of parallel chunked upload
    if (contentType.includes('application/json')) {
      const body = await req.json();
      const mode = body.mode || 'commit';
      const sessionToken = body.sessionToken || '';
      const parentFolderId = body.parentFolderId || null;

      if (!sessionToken) {
        return NextResponse.json(
          {
            success: false,
            error: 'Telegram is not connected. Please connect your Telegram account first.',
          },
          { status: 401 }
        );
      }

      if (mode === 'commit') {
        const telegramFileId = String(body.telegramFileId || '');
        const fileName = String(body.fileName || 'unnamed_file');
        const mimeType = String(body.mimeType || 'application/octet-stream');
        const totalSize = Number(body.totalSize || 0);
        const totalParts = Number(body.totalParts || 1);

        if (!telegramFileId) {
          return NextResponse.json(
            { success: false, error: 'Missing Telegram file identifier for commit.' },
            { status: 400 }
          );
        }

        const uploaded = await TelegramService.commitChunkedUploadToSavedMessages({
          sessionToken,
          telegramFileId,
          fileName,
          mimeType,
          totalSize,
          totalParts,
        });

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
    }

    // Path 3: Multipart FormData (supports 'single', 'chunk', and 'commit')
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

    if (mode === 'commit') {
      const telegramFileId = (formData.get('telegramFileId') as string) || '';
      const fileName = (formData.get('fileName') as string) || 'unnamed_file';
      const mimeType = (formData.get('mimeType') as string) || 'application/octet-stream';
      const totalSize = Number(formData.get('totalSize') || 0);
      const totalParts = Number(formData.get('totalParts') || 1);

      const uploaded = await TelegramService.commitChunkedUploadToSavedMessages({
        sessionToken,
        telegramFileId,
        fileName,
        mimeType,
        totalSize,
        totalParts,
      });

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

    // Mode 'single': Fast single-request upload for small files
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
