import { NextRequest, NextResponse } from 'next/server';
import { TelegramService } from '@/lib/telegram/service';

export const runtime = 'nodejs';

// Handle GET requests (e.g. init_qr, check_qr polling)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const action = searchParams.get('action');
    const qrId = searchParams.get('qrId') || '';
    const password = searchParams.get('password') || '';

    if (action === 'init_qr' || action === 'qr_init') {
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

    if (action === 'check_qr' || action === 'qr_status') {
      if (!qrId) {
        return NextResponse.json({ success: false, error: 'qrId is required' }, { status: 400 });
      }

      const result = await TelegramService.checkQrCodeLogin(qrId, password || undefined);
      if (!result.success) {
        // Return structured expired or error state
        return NextResponse.json({
          success: false,
          status: result.error?.includes('expired') ? 'expired' : 'error',
          error: result.error,
        });
      }

      const status = result.authorized ? 'success' : result.requires2FA ? 'requires_password' : 'waiting';

      return NextResponse.json({
        success: true,
        status,
        authorized: result.authorized,
        requires2FA: result.requires2FA,
        telegramUserId: result.telegramUserId,
        telegramUsername: result.telegramUsername,
        sessionToken: result.sessionToken,
        message: result.message,
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid GET action.' }, { status: 400 });
  } catch (err: unknown) {
    console.error('Telegram auth GET error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during Telegram GET request.' },
      { status: 500 }
    );
  }
}

// Handle POST requests
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const action = body.action;

    // Support varied parameter naming for compatibility
    const phone = body.phone || body.phoneNumber || '';
    const code = body.code || body.phoneCode || '';
    const password = body.password || '';
    const phoneCodeHash = body.phoneCodeHash || '';
    const pendingSession = body.pendingSession || '';
    const apiId = body.apiId || body.customApiId;
    const apiHash = body.apiHash || body.customApiHash;
    const qrId = body.qrId || '';

    // Action 1: Send verification code to phone
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
        sessionToken: result.pendingSession,
        message: result.message || 'Telegram verification code has been dispatched.',
      });
    }

    // Action 2: Verify SMS / App Login Code (+ optional 2FA password)
    if (action === 'verify_code' || action === 'sign_in') {
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

    // Action 3: Initialize QR Code Login
    if (action === 'init_qr' || action === 'qr_init') {
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

    // Action 4: Check QR Code Login status or submit QR 2FA password
    if (action === 'check_qr' || action === 'qr_status' || action === 'submit_password') {
      if (!qrId) {
        return NextResponse.json({ success: false, error: 'qrId is required.' }, { status: 400 });
      }

      const result = await TelegramService.checkQrCodeLogin(qrId, password || undefined);
      if (!result.success) {
        return NextResponse.json({
          success: false,
          status: result.error?.includes('expired') ? 'expired' : 'error',
          requires2FA: result.requires2FA,
          error: result.error,
        });
      }

      const status = result.authorized ? 'success' : result.requires2FA ? 'requires_password' : 'waiting';

      return NextResponse.json({
        success: true,
        status,
        authorized: result.authorized,
        requires2FA: result.requires2FA,
        telegramUserId: result.telegramUserId,
        telegramUsername: result.telegramUsername,
        sessionToken: result.sessionToken,
        message: result.message,
      });
    }

    // Action 5: Disconnect
    if (action === 'disconnect') {
      return NextResponse.json({
        success: true,
        message: 'Telegram account disconnected and session revoked.',
      });
    }

    return NextResponse.json({ success: false, error: `Unknown action: ${action}` }, { status: 400 });
  } catch (err: unknown) {
    console.error('Telegram auth POST route error:', err);
    return NextResponse.json(
      { success: false, error: 'Internal server error during authentication.' },
      { status: 500 }
    );
  }
}
