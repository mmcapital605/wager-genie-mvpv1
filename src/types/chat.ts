export interface ChatMessage {
  id?: string
  role: 'user' | 'assistant'
  content: string
  user_id?: string
  created_at?: string
} 