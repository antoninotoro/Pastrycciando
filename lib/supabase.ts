import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Ingredient = {
  nome: string
  quantita: number
  unita: string
  percentuale?: number
}

export type Recipe = {
  id: string
  nome: string
  categoria?: string
  ingredienti: Ingredient[]
  procedimento?: string
  consigli?: string
  image_url?: string
  created_at?: string
  updated_at?: string
}
