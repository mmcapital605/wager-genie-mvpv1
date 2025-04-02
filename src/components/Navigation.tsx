"use client"

import { usePathname } from 'next/navigation'
import Link from 'next/link'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-4">
      <Link 
        href="/chat" 
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/chat' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Chat
      </Link>
      <Link 
        href="/picks" 
        className={`text-sm font-medium transition-colors hover:text-primary ${
          pathname === '/picks' ? 'text-primary' : 'text-muted-foreground'
        }`}
      >
        Picks
      </Link>
    </nav>
  )
} 