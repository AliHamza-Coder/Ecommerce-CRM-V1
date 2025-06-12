import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'
import { getJwtSecret } from '@/lib/auth-utils'

// This function is async because we're verifying the JWT token
export async function middleware(request: NextRequest) {
  // Get the pathname of the request
  const path = request.nextUrl.pathname
  
  // Define public paths that don't require authentication
  const isPublicPath = path === '/login' || 
                      path.startsWith('/_next') || 
                      path.startsWith('/api/auth') ||
                      path.includes('.')  // Static files like images, CSS, etc.
  
  // Get token from cookies
  const token = request.cookies.get('auth_token')?.value || ''
  
  // If the path is public, no need to verify token
  if (isPublicPath) {
    // If trying to access login while already authenticated, redirect to dashboard
    if (path === '/login' && token) {
      try {
        // Verify the token with our fixed secret
        await jwtVerify(token, getJwtSecret())
        // If verification succeeds, redirect to dashboard
        return NextResponse.redirect(new URL('/dashboard', request.url))
      } catch (error) {
        // If token is invalid, let them access the login page
        // Also clear the invalid token
        const response = NextResponse.next()
        response.cookies.delete('auth_token')
        return response
      }
    }
    // For other public paths, proceed normally
    return NextResponse.next()
  }
  
  // For protected routes, verify token
  if (!token) {
    // No token, redirect to login
    const url = new URL('/login', request.url)
    url.searchParams.set('from', encodeURI(request.nextUrl.pathname))
    return NextResponse.redirect(url)
  }
  
  try {
    // Verify the token with our fixed secret
    await jwtVerify(token, getJwtSecret())
    // Token is valid, proceed
    return NextResponse.next()
  } catch (error) {
    // Token is invalid, redirect to login
    const url = new URL('/login', request.url)
    // Clear the invalid token
    const response = NextResponse.redirect(url)
    response.cookies.delete('auth_token')
    return response
  }
}

// Configure which paths should be processed by this middleware
export const config = {
  matcher: [
    /*
     * Match all paths except:
     * 1. /api routes (API routes)
     * 2. /_next (Next.js internal paths)
     * 3. /_vercel (Vercel internal paths)
     * 4. /favicon.ico, /logo.png, etc. (static files)
     */
    '/((?!api|_next|_vercel|.*\\..*|_static).*)',
  ],
}