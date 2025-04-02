import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types based on our schema
export type Pick = {
  id: string
  created_at: string
  sport: string
  event: string
  prediction: string
  odds: number
  confidence: number
  result?: 'win' | 'loss' | 'pending'
  source: 'odds_api' | 'scraper'
}

export type ChatMessage = {
  id: string
  created_at: string
  user_id: string
  content: string
  pick_id?: string
  role: 'user' | 'assistant'
}

export type Subscription = {
  id: string
  user_id: string
  plan: 'free' | 'basic' | 'unlimited'
  active: boolean
  current_period_end: string
} 