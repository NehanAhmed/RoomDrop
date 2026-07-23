import { NextRequest, NextResponse } from 'next/server';
import { getUploadAuthParams } from '@imagekit/next/server';
import { checkUploadSignRateLimit } from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(req: NextRequest) {
  const rateLimit = await checkUploadSignRateLimit(req);
  if (rateLimit) return rateLimit;

  try {
    const { token, expire, signature } = getUploadAuthParams({
      privateKey: process.env.IMAGEKIT_PRIVATE_KEY!,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY!,
    })

    return NextResponse.json({
      token,
      expire,
      signature,
      publicKey: process.env.NEXT_PUBLIC_IMAGEKIT_PUBLIC_KEY,
      urlEndpoint: process.env.NEXT_PUBLIC_IMAGEKIT_URL_ENDPOINT,
    }, {
      headers: { 'Cache-Control': 'private, max-age=30' },
    });
  } catch (error) {
    console.error('Error generating upload auth:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload credentials' },
      { status: 500 }
    );
  }
}
