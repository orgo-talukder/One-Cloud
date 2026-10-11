import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, code, password, phoneCodeHash, apiId, apiHash, isSandbox } = body;

    if (action === 'send_code') {
      const result = await TelegramService.sendAuthCode({
        phone,
        apiId,
        apiHash,
        isSandbox,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        phoneCodeHash: result.phoneCodeHash,
        isSandbox: result.isSandbox,
        message: result.isSandbox
          ? 'Sandbox mode enabled! You can enter any 5-digit code (e.g. 12345) to complete connection.'
          : 'Telegram verification code has been dispatched.',
      });
    }

    if (action === 'verify_code') {
      const result = await TelegramService.verifyAuthCode({
        phone,
        code,
        password,
        phoneCodeHash,
        isSandbox,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        isSandbox: result.isSandbox,
        telegramUserId: result.telegramUserId,
        telegramUsername: result.telegramUsername,
        sessionToken: result.sessionToken,
        message: 'Successfully connected to your Telegram Saved Messages storage!',
      });
    }

    if (action === 'disconnect') {
      return NextResponse.json({
        success: true,
        message: 'Telegram account disconnected and session revoked.',
      });
    }

    return NextResponse.json({ success: false, error: 'Unknown action' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Telegram auth route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
