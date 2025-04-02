"use client"

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { ChatService, ChatMessageWithPick } from '@/lib/chat-service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'

export function Chat() {
  const user = useUser()
  const [messages, setMessages] = useState<ChatMessageWithPick[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)

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

      setMessages(prev => [message, ...prev])
      setInput('')

      // Simulate AI response (replace with actual AI integration)
      setTimeout(async () => {
        const aiResponse = await ChatService.sendMessage({
          content: 'This is a simulated AI response. Replace with actual AI integration.',
          user_id: user.id,
          role: 'assistant'
        })
        setMessages(prev => [aiResponse, ...prev])
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
      <Card className="w-full max-w-2xl mx-auto">
        <CardContent className="p-6">
          <p className="text-center text-gray-500">Please sign in to use the chat.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardContent className="p-4">
        <ScrollArea className="h-[600px] pr-4" ref={scrollAreaRef}>
          <div className="flex flex-col-reverse gap-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.role === 'assistant' ? 'flex-row' : 'flex-row-reverse'
                }`}
              >
                <Avatar className="w-8 h-8">
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
                  <p className="text-sm">{message.content}</p>
                  {message.picks && (
                    <div className="mt-2 text-xs border-t pt-2">
                      <p className="font-semibold">Related Pick:</p>
                      <p>{message.picks.event} - {message.picks.prediction}</p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>
        <div className="flex gap-2 mt-4">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
          >
            Send
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 