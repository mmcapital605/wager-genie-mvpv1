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
      return NextResponse.redirect(new URL('/sign-in', request.url))
    }

    // If there's a session and the user is on the sign-in page
    if (session && request.nextUrl.pathname === '/sign-in') {
      return NextResponse.redirect(new URL('/chat', request.url))
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
} 