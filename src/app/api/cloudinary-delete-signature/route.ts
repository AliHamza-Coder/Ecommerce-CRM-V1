import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { public_id, timestamp } = await request.json();

    if (!public_id || !timestamp) {
      return NextResponse.json(
        { error: 'public_id and timestamp are required' },
        { status: 400 }
      );
    }

    const apiSecret = process.env.CLOUDINARY_API_SECRET;
    if (!apiSecret) {
      return NextResponse.json(
        { error: 'Cloudinary API secret is not configured' },
        { status: 500 }
      );
    }

    // Create the signature
    const signature = crypto
      .createHash('sha1')
      .update(`public_id=${public_id}&timestamp=${timestamp}${apiSecret}`)
      .digest('hex');

    return NextResponse.json({ signature });
  } catch (error) {
    console.error('Error generating delete signature:', error);
    return NextResponse.json(
      { error: 'Failed to generate delete signature' },
      { status: 500 }
    );
  }
}
