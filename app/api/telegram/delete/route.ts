import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';

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

    if (!sessionToken) {
      return NextResponse.json(
        { success: false, error: 'Telegram session token is required to delete.' },
        { status: 401 }
      );
    }

    const deleted = await TelegramService.deleteFromSavedMessages({
      sessionToken,
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
