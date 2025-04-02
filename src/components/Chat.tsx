"use client"

import { useState, useEffect, useRef } from 'react'
import { useUser } from '@supabase/auth-helpers-react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ChatService, ChatMessageWithPick } from '@/lib/chat-service'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  picks?: {
    event: string
    prediction: string
    odds?: string
    source?: 'odds_api' | 'pickdawgz'
    confidence?: number
  }
  created_at: string
}

export function Chat() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const scrollAreaRef = useRef<HTMLDivElement>(null)
  const user = useUser()
  const supabase = createClientComponentClient()

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
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: true })

      if (error) throw error
      setMessages(data || [])
    } catch (error) {
      console.error('Error loading messages:', error)
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
      // Add user message to chat
      const userMessage = {
        role: 'user',
        content: input.trim(),
        user_id: user.id,
        created_at: new Date().toISOString()
      }

      const { data: savedMessage, error: saveError } = await supabase
        .from('chat_messages')
        .insert([userMessage])
        .select()
        .single()

      if (saveError) throw saveError
      setMessages(prev => [...prev, savedMessage])
      setInput('')

      // Get AI response
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input.trim(),
          userId: user.id,
        }),
      })

      if (!response.ok) throw new Error('Failed to get AI response')
      
      const aiResponse = await response.json()
      const { data: savedAiMessage, error: aiSaveError } = await supabase
        .from('chat_messages')
        .insert([{
          role: 'assistant',
          content: aiResponse.message,
          picks: aiResponse.picks,
          user_id: user.id,
          created_at: new Date().toISOString()
        }])
        .select()
        .single()

      if (aiSaveError) throw aiSaveError
      setMessages(prev => [...prev, savedAiMessage])

    } catch (error) {
      console.error('Error sending message:', error)
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
                      <AvatarImage src="/genie-avatar.svg" alt="Genie" />
                      <AvatarFallback>WG</AvatarFallback>
                    </>
                  ) : (
                    <>
                      <AvatarImage src={user?.user_metadata?.avatar_url} alt={user?.user_metadata?.full_name} />
                      <AvatarFallback>{user?.email?.[0].toUpperCase()}</AvatarFallback>
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
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  {message.picks && (
                    <div className="mt-2 pt-2 border-t border-primary/20">
                      <p className="text-xs font-medium mb-1">🎯 Pick Details:</p>
                      <div className="text-xs space-y-1">
                        <p className="font-semibold">{message.picks.event}</p>
                        <p>{message.picks.prediction}</p>
                        {message.picks.odds && (
                          <p className="text-xs opacity-80">Odds: {message.picks.odds}</p>
                        )}
                        {message.picks.source && (
                          <p className="text-xs opacity-80">Source: {message.picks.source}</p>
                        )}
                        {message.picks.confidence && (
                          <p className="text-xs opacity-80">Confidence: {message.picks.confidence}%</p>
                        )}
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
            placeholder="Ask the Genie for picks..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="shrink-0"
          >
            {isLoading ? "Thinking..." : "Send"}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
} 