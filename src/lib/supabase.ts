import { createClient } from '@supabase/supabase-js'

// Substitua pelas suas credenciais do Supabase
const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      expenses: {
        Row: {
          id: string
          title: string
          description: string | null
          amount: number
          category: string
          date: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          title: string
          description?: string | null
          amount: number
          category: string
          date: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          title?: string
          description?: string | null
          amount?: number
          category?: string
          date?: string
          created_at?: string
          user_id?: string
        }
      }
      categories: {
        Row: {
          id: string
          name: string
          color: string
          icon: string
          created_at: string
          user_id: string
        }
        Insert: {
          id?: string
          name: string
          color: string
          icon: string
          created_at?: string
          user_id: string
        }
        Update: {
          id?: string
          name?: string
          color?: string
          icon?: string
          created_at?: string
          user_id?: string
        }
      }
    }
  }
}
