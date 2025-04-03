"use client"

import { createBrowserClient } from '@supabase/ssr'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'

export default function SignIn() {
  const router = useRouter()
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const handleSignIn = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    })

    if (error) {
      console.error('Error signing in:', error.message)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="mx-auto max-w-sm space-y-6 p-4">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Welcome to WagerGenie</h1>
          <p className="text-gray-500 dark:text-gray-400">
            Sign in to access your personalized sports betting insights
          </p>
        </div>
        <Button 
          className="w-full"
          onClick={handleSignIn}
        >
          Sign in with Google
        </Button>
      </div>
    </div>
  )
} 