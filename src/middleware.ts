import { createMiddlewareClient } from '@supabase/auth-helpers-nextjs'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  try {
    // Ensure environment variables are available
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!supabaseUrl || !supabaseKey) {
      console.error('Missing Supabase environment variables')
      return NextResponse.next()
    }

    const res = NextResponse.next()
    const supabase = createMiddlewareClient({ req: request, res })

    const { data: { session } } = await supabase.auth.getSession()

    // If there's no session and the user is trying to access a protected route
    if (!session && (
      request.nextUrl.pathname.startsWith('/chat') ||
      request.nextUrl.pathname.startsWith('/picks')
    )) {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/sign-in'
      return NextResponse.redirect(redirectUrl)
    }

    // If there's a session and the user is on the sign-in page
    if (session && request.nextUrl.pathname === '/sign-in') {
      const redirectUrl = request.nextUrl.clone()
      redirectUrl.pathname = '/chat'
      return NextResponse.redirect(redirectUrl)
    }

    return res
  } catch (error) {
    console.error('Middleware error:', error)
    return NextResponse.next()
  }
} 