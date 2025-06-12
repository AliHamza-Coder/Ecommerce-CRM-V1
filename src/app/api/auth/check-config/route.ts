import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const runtime = 'edge';

export async function GET() {
  try {
    // Check if we're in a server environment
    if (typeof process === 'undefined' || !process.env) {
      return NextResponse.json({
        isConfigured: false,
        message: 'Environment variables not accessible'
      });
    }

    const isConfigured = !!process.env.MONGODB_URI;
    
    return NextResponse.json({
      isConfigured,
      message: isConfigured 
        ? 'MongoDB URI is configured' 
        : 'MongoDB URI is not configured'
    });
  } catch (error) {
    console.error('Error checking configuration:', error);
    return NextResponse.json(
      { 
        isConfigured: false,
        error: 'Failed to check configuration',
        message: 'Please check your server configuration'
      },
      { status: 500 }
    );
  }
} 