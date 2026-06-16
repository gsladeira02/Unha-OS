import { createClient } from '@supabase/supabase-js'
import { APP_CONFIG } from './config.js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || APP_CONFIG.supabase.url
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || APP_CONFIG.supabase.publishableKey

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
export const SUPABASE_INFO = {
  url: supabaseUrl,
  restUrl: APP_CONFIG.supabase.restUrl,
  hasKey: Boolean(supabaseAnonKey)
}
