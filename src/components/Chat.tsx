"use client"

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { ChatService, ChatMessageWithPick } from '@/lib/chat-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { useTheme } from 'next-themes'

export function Chat() {
  const user = useUser()
  const [messages, setMessages] = useState<ChatMessageWithPick[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const { theme } = useTheme()

  useEffect(() => {
    if (user) {
      loadMessages()
    }
  }, [user])

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const loadMessages = async () => {
    if (!user) return
    try {
      const messages = await ChatService.getMessages(user.id)
      setMessages(messages)
    } catch (error) {
      console.error('Failed to load messages:', error)
    }
  }

  const scrollToBottom = () => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }

  const handleSend = async () => {
    if (!user || !input.trim() || isLoading) return

    setIsLoading(true)
    try {
      const message = await ChatService.sendMessage({
        content: input.trim(),
        user_id: user.id,
        role: 'user'
      })

      setMessages(prev => [...prev, message])
      setInput('')

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse = await ChatService.sendMessage({
          content: 'This is a simulated AI response. Replace with actual AI integration.',
          user_id: user.id,
          role: 'assistant'
        })
        setMessages(prev => [...prev, aiResponse])
      }, 1000)

    } catch (error) {
      console.error('Failed to send message:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  if (!user) {
    return (
      <Card className="mx-auto max-w-2xl">
        <CardContent className="p-6">
          <div className="flex flex-col items-center gap-4 text-center">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/genie-avatar.png" alt="Genie" />
              <AvatarFallback>WG</AvatarFallback>
            </Avatar>
            <h2 className="text-2xl font-bold">Welcome to Wager Genie</h2>
            <p className="text-muted-foreground">Please sign in to start chatting with the Genie.</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mx-auto max-w-2xl">
      <CardContent className="p-4">
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          <div className="flex flex-col space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex items-start gap-3 ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <Avatar className="h-8 w-8 shrink-0">
                  {message.role === 'assistant' ? (
                    <>
                      <AvatarImage src="/genie-avatar.png" alt="Genie" />
                      <AvatarFallback>WG</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={user.user_metadata?.avatar_url} alt={user.user_metadata?.full_name} />
                      <AvatarFallback>{user.email?.[0].toUpperCase()}</AvatarFallback>
                    </>
                  )}
                </Avatar>
                <div
                  className={`rounded-lg p-4 max-w-[80%] ${
                    message.role === 'assistant'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.content}</p>
                  {message.picks && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs font-medium mb-1">Related Pick:</p>
                      <div className="text-xs">
                        <p className="font-semibold">{message.picks.event}</p>
                        <p>{message.picks.prediction}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="mt-4 flex items-center gap-2 border-t pt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask the Genie..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            {isLoading ? "Sending..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 