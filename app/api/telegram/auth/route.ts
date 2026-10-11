import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, phone, code, password, phoneCodeHash, apiId, apiHash, pendingSession } = body;

    if (action === 'send_code') {
      const result = await TelegramService.sendAuthCode({
        phone,
        apiId,
        apiHash,
      });

      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        phoneCodeHash: result.phoneCodeHash,
        pendingSession: result.pendingSession,
        message: result.message || 'Telegram verification code has been dispatched.',
      });
    }

    if (action === 'verify_code') {
      const result = await TelegramService.verifyAuthCode({
        phone,
        code,
        password,
        phoneCodeHash,
        apiId,
        apiHash,
        pendingSession,
      });

      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            requires2FA: result.requires2FA,
            error: result.error,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        telegramUserId: result.telegramUserId,
        telegramUsername: result.telegramUsername,
        sessionToken: result.sessionToken,
        message: 'Successfully connected to your Telegram Saved Messages storage!',
      });
    }

    if (action === 'qr_init') {
      const result = await TelegramService.initQrCodeLogin();
      if (!result.success) {
        return NextResponse.json({ success: false, error: result.error }, { status: 400 });
      }

      return NextResponse.json({
        success: true,
        qrId: result.qrId,
        qrCodeDataUrl: result.qrCodeDataUrl,
        message: result.message,
      });
    }

    if (action === 'qr_status') {
      const { qrId } = body;
      const result = await TelegramService.checkQrCodeLogin(qrId);
      if (!result.success) {
        return NextResponse.json(
          {
            success: false,
            requires2FA: result.requires2FA,
            error: result.error,
          },
          { status: 400 }
        );
      }

      return NextResponse.json({
        success: true,
        authorized: result.authorized,
        telegramUserId: result.telegramUserId,
        telegramUsername: result.telegramUsername,
        sessionToken: result.sessionToken,
        message: result.message,
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
