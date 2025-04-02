"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'

export function Navigation() {
  const pathname = usePathname()

  return (
    <nav className="flex items-center space-x-4 lg:space-x-6 mx-6">
      <Link
        href="/"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Home
      </Link>
      <Link
        href="/chat"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/chat" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Chat
      </Link>
      <Link
        href="/picks"
        className={cn(
          "text-sm font-medium transition-colors hover:text-primary",
          pathname === "/picks" ? "text-primary" : "text-muted-foreground"
        )}
      >
        Picks
      </Link>
    </nav>
  )
} 