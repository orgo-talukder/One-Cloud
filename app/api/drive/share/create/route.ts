import { NextRequest, NextResponse } from 'next/server';
import { ShareService } from '@/lib/drive/share-service';

export const runtime = 'nodejs';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      file,
      ownerUid,
      ownerEmail,
      ownerDisplayName,
      ownerSessionToken,
      accessLevel = 'viewer',
      password,
      expiresInDays,
      allowDownload = true,
      existingToken,
    } = body;

    if (!file || !ownerUid || !ownerSessionToken) {
      return NextResponse.json(
        { success: false, error: 'Missing required file or authentication fields' },
        { status: 400 }
      );
    }

    const result = await ShareService.createShareLink({
      file,
      ownerUid,
      ownerEmail,
      ownerDisplayName,
      ownerSessionToken,
      accessLevel,
      password,
      expiresInDays,
      allowDownload,
      existingToken,
    });

    return NextResponse.json({
      success: true,
      shareToken: result.shareToken,
      shareUrl: result.shareUrl,
      shareDoc: result.shareDoc,
    });
  } catch (err: unknown) {
    console.error('Error creating share link:', err);
    const msg = err instanceof Error ? err.message : 'Failed to create share link';
    return NextResponse.json({ success: false, error: msg }, { status: 500 });
  }
}
