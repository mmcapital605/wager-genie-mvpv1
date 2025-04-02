import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from "@/components/theme-provider"
import { Navigation } from '@/components/Navigation'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Wager Genie - Your Magical Sports Betting Assistant',
  description: 'Get winning sports picks from your personal betting Genie! One free pick daily, with premium plans for more magical insights.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <header className="border-b">
            <div className="flex h-16 items-center px-4">
              <Navigation />
            </div>
          </header>
          {children}
        </ThemeProvider>
      </body>
    </html>
  )
} 