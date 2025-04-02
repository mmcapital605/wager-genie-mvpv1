import { supabase } from './supabase'
import { Database } from './database.types'

export type ChatMessage = Database['public']['Tables']['chat_messages']['Row']
export type Pick = Database['public']['Tables']['picks']['Row']

export interface ChatMessageWithPick extends ChatMessage {
  picks?: Pick | null
}

export class ChatService {
  static async getMessages(userId: string, limit = 50): Promise<ChatMessageWithPick[]> {
    const { data, error } = await supabase
      .from('chat_messages')
      .select(`
        *,
        picks (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching messages:', error)
      throw error
    }

    return data || []
  }

  static async sendMessage(message: {
    content: string
    user_id: string
    role: 'user' | 'assistant'
    pick_id?: string | null
  }): Promise<ChatMessage> {
    const { data, error } = await supabase
      .from('chat_messages')
      .insert(message)
      .select()
      .single()

    if (error) {
      console.error('Error sending message:', error)
      throw error
    }

    return data
  }

  static async getPicksByUser(userId: string, limit = 10): Promise<Pick[]> {
    const { data, error } = await supabase
      .from('picks')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching picks:', error)
      throw error
    }

    return data || []
  }

  static async createPick(pick: {
    user_id: string
    sport: string
    event: string
    prediction: string
    odds?: number
    confidence?: number
    source: 'odds_api' | 'scraper'
  }): Promise<Pick> {
    const { data, error } = await supabase
      .from('picks')
      .insert(pick)
      .select()
      .single()

    if (error) {
      console.error('Error creating pick:', error)
      throw error
    }

    return data
  }
} 