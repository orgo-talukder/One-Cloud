import { NextRequest, NextResponse } from 'next/server';
import { ShareService } from '@/lib/drive/share-service';

export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');

    if (!token) {
      return NextResponse.json(
        { valid: false, error: 'Share token is required' },
        { status: 400 }
      );
    }

    const result = await ShareService.verifyShare(token);
    return NextResponse.json(result);
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Error verifying share';
    return NextResponse.json({ valid: false, error: msg }, { status: 500 });
  }
}
