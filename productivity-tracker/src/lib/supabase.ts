import { createClient } from "@supabase/supabase-js"

let supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase environment variables.")
}

// Fix common URL mistakes (like including /rest/v1/ at the end)
if (supabaseUrl) {
  supabaseUrl = supabaseUrl.replace(/\/rest\/v1\/?$/, "")
  if (supabaseUrl.endsWith("/")) {
    supabaseUrl = supabaseUrl.slice(0, -1)
  }
}

export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "")
