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
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
      <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
        <select 
          value={type} 
          onChange={(e) => setType(e.target.value as any)}
          className="px-3 py-2 border rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-100 outline-none"
        >
          <option value="task">Short Task</option>
          <option value="habit">Habit</option>
          <option value="plan">Long Plan</option>
        </select>
        
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="flex-1 px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-100 outline-none"
          placeholder={`Add a new ${type}...`}
          autoFocus
        />
        
        <button 
          type="submit" 
          disabled={loading || !text.trim()}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
        >
          Capture
        </button>
      </form>
    </div>
  )
}
