import { useState } from "react"
import { supabase } from "../lib/supabase"

export default function Auth() {
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) {
      setError(error.message)
    }
    setLoading(false)
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-brand-darker shadow-neo-input">
      <div className="w-full max-w-md p-8 space-y-4 bg-brand-dark rounded shadow shadow-neo-input">
        <h2 className="text-2xl font-bold text-center">Productivity Tracker</h2>
        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block mb-1 text-sm font-medium">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-3 py-2 bg-brand-darker border-brand-900 rounded focus:outline-none focus:ring focus:ring-brand-500/50 text-brand-light border shadow-neo"
              required
            />
          </div>
          <div>
            <label className="block mb-1 text-sm font-medium">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 bg-brand-darker border-brand-900 rounded focus:outline-none focus:ring focus:ring-brand-500/50 text-brand-light border shadow-neo"
              required
            />
          </div>
          {error && <p className="text-sm text-red-500">{error}</p>}
          <button type="submit" disabled={loading} className="w-full px-4 py-2 font-medium text-brand-light bg-brand-500 rounded hover:bg-brand-700 disabled:opacity-50 border-2 border-brand-900 shadow-neo active:translate-x-[2px] active:translate-y-[2px] active:shadow-neo-sm font-bold "
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  )
}



