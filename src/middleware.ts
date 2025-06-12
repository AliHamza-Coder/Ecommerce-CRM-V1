import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Check if MongoDB URI is missing
  if (!process.env.MONGODB_URI) {
    // Allow access to login page and its API route
    if (request.nextUrl.pathname === '/login' || request.nextUrl.pathname === '/api/auth/login') {
      return NextResponse.next()
    }
    
    // Redirect all other routes to login page
    return NextResponse.redirect(new URL('/login', request.url))
  }

  return NextResponse.next()
}

// Configure which routes to run middleware on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|public/).*)',
  ],
} 