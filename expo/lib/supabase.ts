import { createClient } from '@supabase/supabase-js'
import AsyncStorage from '@react-native-async-storage/async-storage'

const supabaseUrl = 'https://your-project-url.supabase.co'
const supabaseAnonKey = 'your-anon-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
})

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          username: string
          full_name: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          username: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          username?: string
          full_name?: string | null
          avatar_url?: string | null
          bio?: string | null
          updated_at?: string
        }
      }
      posts: {
        Row: {
          id: string
          user_id: string
          content: string
          image_url: string | null
          likes_count: number
          comments_count: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          content: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          content?: string
          image_url?: string | null
          likes_count?: number
          comments_count?: number
          updated_at?: string
        }
      }
      stories: {
        Row: {
          id: string
          user_id: string
          image_url: string
          created_at: string
          expires_at: string
        }
        Insert: {
          id?: string
          user_id: string
          image_url: string
          created_at?: string
          expires_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          image_url?: string
          expires_at?: string
        }
      }
      chats: {
        Row: {
          id: string
          name: string | null
          is_group: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name?: string | null
          is_group?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string | null
          is_group?: boolean
          updated_at?: string
        }
      }
      chat_participants: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          joined_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          joined_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
        }
      }
      messages: {
        Row: {
          id: string
          chat_id: string
          user_id: string
          content: string
          message_type: 'text' | 'image' | 'file'
          created_at: string
        }
        Insert: {
          id?: string
          chat_id: string
          user_id: string
          content: string
          message_type?: 'text' | 'image' | 'file'
          created_at?: string
        }
        Update: {
          id?: string
          chat_id?: string
          user_id?: string
          content?: string
          message_type?: 'text' | 'image' | 'file'
        }
      }
      friendships: {
        Row: {
          id: string
          user_id: string
          friend_id: string
          status: 'pending' | 'accepted' | 'blocked'
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          friend_id: string
          status?: 'pending' | 'accepted' | 'blocked'
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          friend_id?: string
          status?: 'pending' | 'accepted' | 'blocked'
          updated_at?: string
        }
      }
      game_sessions: {
        Row: {
          id: string
          game_type: string
          host_id: string
          players: string[]
          status: 'waiting' | 'playing' | 'finished'
          game_data: any
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          game_type: string
          host_id: string
          players?: string[]
          status?: 'waiting' | 'playing' | 'finished'
          game_data?: any
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          game_type?: string
          host_id?: string
          players?: string[]
          status?: 'waiting' | 'playing' | 'finished'
          game_data?: any
          updated_at?: string
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          plan_type: 'basic' | 'premium' | 'pro'
          status: 'active' | 'cancelled' | 'expired'
          started_at: string
          expires_at: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          plan_type: 'basic' | 'premium' | 'pro'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          plan_type?: 'basic' | 'premium' | 'pro'
          status?: 'active' | 'cancelled' | 'expired'
          started_at?: string
          expires_at?: string
        }
      }
      payments: {
        Row: {
          id: string
          user_id: string
          subscription_id: string
          amount: number
          currency: string
          payment_method: 'visa' | 'mastercard' | 'bankily'
          status: 'pending' | 'completed' | 'failed'
          transaction_id: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          subscription_id: string
          amount: number
          currency?: string
          payment_method: 'visa' | 'mastercard' | 'bankily'
          status?: 'pending' | 'completed' | 'failed'
          transaction_id?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          subscription_id?: string
          amount?: number
          currency?: string
          payment_method?: 'visa' | 'mastercard' | 'bankily'
          status?: 'pending' | 'completed' | 'failed'
          transaction_id?: string | null
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