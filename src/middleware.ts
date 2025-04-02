import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })
    const { data: { session } } = await supabase.auth.getSession()

    // If there's no session and the user is trying to access a protected route
    if (!session && (
      request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/picks')
    )) {
      const signInUrl = new URL('/sign-in', request.url)
      signInUrl.searchParams.set('redirectedFrom', request.nextUrl.pathname)
      return NextResponse.redirect(signInUrl)
    }

    // If there's a session and the user is on the sign-in page
    if (session && request.nextUrl.pathname === '/sign-in') {
      const redirectTo = request.nextUrl.searchParams.get('redirectedFrom') || '/chat'
      return NextResponse.redirect(new URL(redirectTo, request.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    // On error, allow the request to continue
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    '/((?!_next/static|_next/image|favicon.ico|public).*)',
  ],
} 