"use client"

import { Chat } from "@/components/Chat"
import { Navigation } from "@/components/Navigation"

export default function ChatPage() {
  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <div className="hidden w-64 border-r bg-muted/40 lg:block">
        <div className="flex h-14 items-center border-b px-4">
          <span className="font-semibold">Wager Genie</span>
        </div>
        <Navigation />
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="sticky top-0 z-50 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
          <div className="flex flex-1 items-center gap-4">
            <h1 className="font-semibold">Chat with Genie</h1>
          </div>
        </header>
        <main className="flex-1 overflow-hidden p-4 lg:p-6">
          <Chat />
        </main>
      </div>
    </div>
  )
} 