import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

// Previene le istanze multiple di GoTrueClient durante l'hot-reload di Next.js (Fast Refresh)
const globalForSupabase = globalThis as unknown as { supabase: any }

export const supabase = globalForSupabase.supabase || (supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null)

if (process.env.NODE_ENV !== 'production') globalForSupabase.supabase = supabase
