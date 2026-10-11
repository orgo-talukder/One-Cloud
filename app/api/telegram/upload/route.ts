import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const sessionToken = (formData.get('sessionToken') as string) || '';
    const parentFolderId = (formData.get('parentFolderId') as string) || null;

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file uploaded.' }, { status: 400 });
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Upload to user's Telegram Saved Messages
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
        isSandbox: uploaded.isSandbox,
      },
    });
  } catch (err: unknown) {
    console.error('Upload route error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to process file upload to Telegram.' },
      { status: 500 }
    );
  }
}
