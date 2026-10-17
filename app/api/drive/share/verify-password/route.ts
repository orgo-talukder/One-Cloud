import { NextRequest, NextResponse } from 'next/server';
import { ShareService } from '@/lib/drive/share-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { token, password } = await req.json();

    if (!token || !password) {
      return NextResponse.json(
        { success: false, error: 'Token and password are required' },
        { status: 400 }
      );
    }

    const isValid = await ShareService.verifyPassword(token, password);

    if (!isValid) {
      return NextResponse.json(
        { success: false, error: 'Incorrect password' },
        { status: 401 }
      );
    }

    // Get the file metadata
    const verifyResult = await ShareService.verifyShare(token);

    return NextResponse.json({
      success: true,
      file: verifyResult.file,
    });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error validating password';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
