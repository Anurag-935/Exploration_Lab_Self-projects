import { createClient } from "@supabase/supabase-js"

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.")
}

// Make sure to remove the trailing slash from the url if it exists, or just use it directly
const url = supabaseUrl?.endsWith("/") ? supabaseUrl.slice(0, -1) : supabaseUrl;

export const supabase = createClient(url || "", supabaseAnonKey || "")
