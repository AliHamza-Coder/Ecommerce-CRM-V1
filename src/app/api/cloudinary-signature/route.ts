import { NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: Request) {
  const { timestamp, folder = 'products' } = await req.json();
  const apiSecret = process.env.CLOUDINARY_API_SECRET || '';

  const stringToSign = `folder=${folder}&timestamp=${timestamp}`;
  const signature = crypto
    .createHash('sha256')
    .update(stringToSign + apiSecret)
    .digest('hex');

  return NextResponse.json({ signature });
}
