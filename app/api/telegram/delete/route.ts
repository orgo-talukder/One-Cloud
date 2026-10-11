import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { messageId, sessionToken } = body;

    if (!messageId) {
      return NextResponse.json(
        { success: false, error: 'Telegram messageId is required.' },
        { status: 400 }
      );
    }

    const deleted = await TelegramService.deleteFromSavedMessages({
      sessionToken: sessionToken || '',
      messageId: Number(messageId),
    });

    return NextResponse.json({
      success: true,
      deleted,
      message: 'File successfully deleted from Telegram Saved Messages.',
    });
  } catch (err: unknown) {
    console.error('Delete route error:', err);
    return NextResponse.json(
      { success: false, error: 'Failed to delete file from Telegram.' },
      { status: 500 }
    );
  }
}
