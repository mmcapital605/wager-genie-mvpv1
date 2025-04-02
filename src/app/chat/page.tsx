"use client"

import { useState } from "react"
import { useTheme } from "next-themes"

export default function ChatPage() {
  const [message, setMessage] = useState("")
  const { theme, setTheme } = useTheme()

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // TODO: Implement chat message submission
    setMessage("")
  }

  return (
    <div className="flex h-screen flex-col bg-background text-foreground">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-14 items-center">
          <div className="mr-4 flex">
            <a className="mr-6 flex items-center space-x-2" href="/">
              <span className="font-bold">Wager Genie</span>
            </a>
          </div>
          <button
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
            className="ml-auto rounded-md p-2 hover:bg-accent"
          >
            {theme === "dark" ? "🌞" : "🌙"}
          </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="container h-full py-6">
          <div className="flex h-full flex-col rounded-lg border bg-card text-card-foreground">
            <div className="flex-1 overflow-y-auto p-4">
              {/* Chat messages will go here */}
            </div>
            <div className="border-t p-4">
              <form onSubmit={handleSubmit} className="flex gap-2">
                <input
                  type="text"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Ask the Genie..."
                  className="flex-1 rounded-md border bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                />
                <button
                  type="submit"
                  className="inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground ring-offset-background transition-colors hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
} 