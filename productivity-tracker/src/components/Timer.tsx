import { useState, useEffect } from "react"
import { Task } from "../types"
import { supabase } from "../lib/supabase"

export default function Timer({ activeTask, onStop }: { activeTask: Task | null, onStop: () => void }) {
  const [seconds, setSeconds] = useState(0)
  const [isRunning, setIsRunning] = useState(false)
  const [startTime, setStartTime] = useState<Date | null>(null)

  useEffect(() => {
    let interval: any
    if (isRunning) interval = setInterval(() => setSeconds(s => s + 1), 1000)
    return () => clearInterval(interval)
  }, [isRunning])

  const toggleTimer = () => {
    if (!isRunning) {
      setStartTime(new Date())
      setIsRunning(true)
    } else {
      stopAndSave()
    }
  }

  const stopAndSave = async () => {
    setIsRunning(false)
    if (activeTask && startTime) {
      await supabase.from("time_logs").insert({
        task_id: activeTask.id,
        start_time: startTime.toISOString(),
        end_time: new Date().toISOString(),
        duration_seconds: seconds
      })
    }
    setSeconds(0)
    setStartTime(null)
    onStop()
  }

  if (!activeTask) return null

  const m = Math.floor(seconds / 60).toString().padStart(2, "0")
  const s = (seconds % 60).toString().padStart(2, "0")

  return (
    <div className="bg-brand-900/40 border border-brand-500/30 p-5 rounded-xl shadow-lg flex items-center justify-between">
      <div>
        <p className="text-xs text-brand-500 font-bold uppercase tracking-widest mb-1 flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse"></span> Active Focus
        </p>
        <p className="font-medium text-brand-light">{activeTask.title}</p>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="text-3xl font-mono font-light text-brand-light w-24 text-right tracking-tight">
          {m}:{s}
        </div>
        <button 
          onClick={toggleTimer}
          className={`w-14 h-14 rounded-full flex items-center justify-center text-white font-bold transition-all shadow-lg ${isRunning ? 'bg-brand-900 hover:bg-brand-darker border border-brand-500' : 'bg-brand-500 hover:bg-brand-700'}`}
        >
          {isRunning ? "¦" : "?"}
        </button>
      </div>
    </div>
  )
}
