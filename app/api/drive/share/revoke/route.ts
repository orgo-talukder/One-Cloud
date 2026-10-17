import { NextRequest, NextResponse } from 'next/server';
import { ShareService } from '@/lib/drive/share-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const { shareToken, fileId, ownerUid } = await req.json();

    if (!shareToken || !fileId || !ownerUid) {
      return NextResponse.json(
        { success: false, error: 'shareToken, fileId, and ownerUid are required' },
        { status: 400 }
      );
    }

    const success = await ShareService.revokeShareLink(shareToken, fileId, ownerUid);

    return NextResponse.json({ success });
  } catch (err: unknown) {
    console.error('Error revoking share:', err);
    const msg = err instanceof Error ? err.message : 'Failed to revoke share link';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
