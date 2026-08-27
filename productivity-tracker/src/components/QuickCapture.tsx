import { useState } from "react"
import { supabase } from "../lib/supabase"

type Props = {
  onCaptured: () => void
}

export default function QuickCapture({ onCaptured }: Props) {
  const [text, setText] = useState("")
  const [type, setType] = useState<"task" | "habit" | "plan">("task")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!text.trim()) return

    setLoading(true)
    const { data: userData } = await supabase.auth.getUser()
    
    if (userData.user) {
      if (type === "task") {
        await supabase.from("tasks").insert({ user_id: userData.user.id, title: text.trim(), status: "open" })
      } else if (type === "habit") {
        await supabase.from("habits").insert({ user_id: userData.user.id, title: text.trim(), schedule: { type: "daily" } })
      } else if (type === "plan") {
        await supabase.from("long_plans").insert({ user_id: userData.user.id, title: text.trim(), status: "active" })
      }
      setText("")
      onCaptured()
    }
    setLoading(false)
  }

  return (
    <div className="bg-brand-dark p-4 rounded-xl shadow-sm border border-brand-900/30">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as any)}
          className="px-3 py-2 border border-brand-900/50 rounded-lg bg-brand-darker text-brand-light focus:ring-2 focus:ring-brand-500/50 outline-none"
        >
          <option value="task">Short Task</option>
          <option value="habit">Habit</option>
          <option value="plan">Long Plan</option>
        </select>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 bg-brand-darker text-brand-light border border-brand-900/50 rounded-lg focus:ring-2 focus:ring-brand-500/50 outline-none"
          placeholder={`Add a new ${type}...`}
          autoFocus
        />
        
        <button 
          type="submit" 
          disabled={loading || !text.trim()}
          className="px-6 py-2 bg-brand-700 text-white rounded-lg font-medium hover:bg-brand-500 disabled:opacity-50"
        >
          Capture
        </button>
      </form>
    </div>
  )
}



