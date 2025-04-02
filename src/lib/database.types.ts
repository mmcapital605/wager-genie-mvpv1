export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
        }
      }
      user_profiles: {
        Row: {
          id: string
          user_id: string
          first_name: string | null
          last_name: string | null
          email: string
          phone_number: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          first_name?: string | null
          last_name?: string | null
          email: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          first_name?: string | null
          last_name?: string | null
          email?: string
          phone_number?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan: 'free' | 'basic' | 'unlimited'
          status: 'active' | 'inactive' | 'cancelled'
          current_period_start: string
          current_period_end: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan?: 'free' | 'basic' | 'unlimited'
          status?: 'active' | 'inactive' | 'cancelled'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan?: 'free' | 'basic' | 'unlimited'
          status?: 'active' | 'inactive' | 'cancelled'
          current_period_start?: string
          current_period_end?: string
          created_at?: string
          updated_at?: string
        }
      }
      picks: {
        Row: {
          id: string
          user_id: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event: string
          prediction: string
          odds: number | null
          confidence: number | null
          result: 'win' | 'loss' | 'pending'
          source: 'odds_api' | 'scraper'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event: string
          prediction: string
          odds?: number | null
          confidence?: number | null
          result?: 'win' | 'loss' | 'pending'
          source: 'odds_api' | 'scraper'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          sport?: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event?: string
          prediction?: string
          odds?: number | null
          confidence?: number | null
          result?: 'win' | 'loss' | 'pending'
          source?: 'odds_api' | 'scraper'
          created_at?: string
        }
      }
      chat_messages: {
        Row: {
          id: string
          user_id: string
          content: string
          pick_id: string | null
          role: 'user' | 'assistant'
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          pick_id?: string | null
          role: 'user' | 'assistant'
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          pick_id?: string | null
          role?: 'user' | 'assistant'
          created_at?: string
        }
      }
      odds_data: {
        Row: {
          id: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event_id: string
          home_team: string
          away_team: string
          commence_time: string
          odds_data: Json
          created_at: string
        }
        Insert: {
          id?: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event_id: string
          home_team: string
          away_team: string
          commence_time: string
          odds_data: Json
          created_at?: string
        }
        Update: {
          id?: string
          sport?: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event_id?: string
          home_team?: string
          away_team?: string
          commence_time?: string
          odds_data?: Json
          created_at?: string
        }
      }
      scraped_picks: {
        Row: {
          id: string
          source_url: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event: string
          prediction: string
          confidence: string | null
          analysis: string | null
          raw_data: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          source_url: string
          sport: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event: string
          prediction: string
          confidence?: string | null
          analysis?: string | null
          raw_data?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          source_url?: string
          sport?: 'NBA' | 'NFL' | 'MLB' | 'NHL' | 'NCAAB' | 'NCAAF'
          event?: string
          prediction?: string
          confidence?: string | null
          analysis?: string | null
          raw_data?: Json | null
          created_at?: string
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
  }
} 